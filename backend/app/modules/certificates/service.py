from __future__ import annotations

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.modules.certificates import repository as cert_repo
from app.modules.certificates.generator import generate_certificate
from app.modules.certificates.models import CertificateType
from app.modules.certificates.schemas import CertVerifyResponse, CertificatePublic
from app.modules.users.models import User

logger = logging.getLogger(__name__)


async def issue_certificate(
    session: AsyncSession,
    cert_type: CertificateType,
    user_id: uuid.UUID,
    submission_id: uuid.UUID | None = None,
    paper_id: uuid.UUID | None = None,
) -> CertificatePublic:
    cert = await cert_repo.create(
        session,
        type=cert_type,
        user_id=user_id,
        submission_id=submission_id,
        paper_id=paper_id,
    )
    # Commit the record before generating the PDF so the ID exists in the DB.
    await session.commit()
    storage_key = await generate_certificate(cert)
    cert = await cert_repo.update(session, cert, storage_key=storage_key)
    logger.info("Issued %s certificate %s for user %s", cert_type, cert.id, user_id)
    return CertificatePublic.model_validate(cert)


async def get_certificate(
    session: AsyncSession, cert_id: uuid.UUID, requesting_user: User
) -> CertificatePublic:
    cert = await cert_repo.get_by_id(session, cert_id)
    if cert is None:
        raise NotFoundError("Certificate not found")
    if cert.user_id != requesting_user.id and "admin" not in requesting_user.roles:
        raise ForbiddenError("Access denied")
    return CertificatePublic.model_validate(cert)


async def verify_certificate(
    session: AsyncSession, cert_id: uuid.UUID
) -> CertVerifyResponse:
    cert = await cert_repo.get_by_id(session, cert_id)
    if cert is None:
        return CertVerifyResponse(valid=False)
    return CertVerifyResponse(valid=True, certificate=CertificatePublic.model_validate(cert))


async def list_user_certificates(
    session: AsyncSession, requesting_user: User
) -> list[CertificatePublic]:
    certs = await cert_repo.list_by_user(session, requesting_user.id)
    return [CertificatePublic.model_validate(c) for c in certs]
