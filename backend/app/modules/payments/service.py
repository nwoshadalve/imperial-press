from __future__ import annotations

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.modules.payments import repository as payment_repo
from app.modules.payments.models import PaymentStatus
from app.modules.payments.schemas import PaymentCreate, PaymentPublic
from app.modules.users.models import User

logger = logging.getLogger(__name__)


async def create_payment(
    session: AsyncSession, data: PaymentCreate, admin: User
) -> PaymentPublic:
    existing = await payment_repo.get_by_submission(session, data.submission_id)
    if existing is not None:
        raise ConflictError("Payment already exists for this submission")
    payment = await payment_repo.create(
        session,
        submission_id=data.submission_id,
        amount=data.amount,
        currency=data.currency,
        status=PaymentStatus.pending,
    )
    logger.info("Created payment %s for submission %s", payment.id, data.submission_id)
    return PaymentPublic.model_validate(payment)


async def get_payment(
    session: AsyncSession, payment_id: uuid.UUID, requesting_user: User
) -> PaymentPublic:
    payment = await payment_repo.get_by_id(session, payment_id)
    if payment is None:
        raise NotFoundError("Payment not found")
    if "admin" not in requesting_user.roles:
        from app.modules.submissions import repository as submission_repo

        submission = await submission_repo.get_by_id(session, payment.submission_id)
        if submission is None or submission.author_id != requesting_user.id:
            raise ForbiddenError("Access denied")
    return PaymentPublic.model_validate(payment)


async def upload_proof(
    session: AsyncSession,
    payment_id: uuid.UUID,
    storage_key: str,
    note: str | None,
    requesting_user: User,
) -> PaymentPublic:
    payment = await payment_repo.get_by_id(session, payment_id)
    if payment is None:
        raise NotFoundError("Payment not found")
    if "admin" not in requesting_user.roles:
        from app.modules.submissions import repository as submission_repo

        submission = await submission_repo.get_by_id(session, payment.submission_id)
        if submission is None or submission.author_id != requesting_user.id:
            raise ForbiddenError("Access denied")
    await payment_repo.add_proof(
        session, payment_id=payment_id, storage_key=storage_key, note=note
    )
    payment = await payment_repo.update(session, payment, status=PaymentStatus.proof_submitted)
    return PaymentPublic.model_validate(payment)


async def confirm_payment(
    session: AsyncSession, payment_id: uuid.UUID, admin: User
) -> PaymentPublic:
    payment = await payment_repo.get_by_id(session, payment_id)
    if payment is None:
        raise NotFoundError("Payment not found")
    if payment.status != PaymentStatus.proof_submitted:
        raise ConflictError("Payment has no submitted proof to confirm")
    payment = await payment_repo.update(session, payment, status=PaymentStatus.confirmed)
    logger.info("Payment %s confirmed by admin %s", payment.id, admin.id)
    return PaymentPublic.model_validate(payment)


async def reject_payment(
    session: AsyncSession, payment_id: uuid.UUID, admin: User
) -> PaymentPublic:
    payment = await payment_repo.get_by_id(session, payment_id)
    if payment is None:
        raise NotFoundError("Payment not found")
    if payment.status != PaymentStatus.proof_submitted:
        raise ConflictError("Only proof-submitted payments can be rejected")
    payment = await payment_repo.update(session, payment, status=PaymentStatus.rejected)
    logger.info("Payment %s rejected by admin %s", payment.id, admin.id)
    return PaymentPublic.model_validate(payment)
