from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.certificates.models import Certificate


async def get_by_id(session: AsyncSession, cert_id: uuid.UUID) -> Certificate | None:
    result = await session.execute(
        select(Certificate).where(Certificate.id == cert_id)
    )
    return result.scalar_one_or_none()


async def create(session: AsyncSession, **kwargs: object) -> Certificate:
    cert = Certificate(**kwargs)
    session.add(cert)
    await session.flush()
    return cert


async def update(session: AsyncSession, cert: Certificate, **kwargs: object) -> Certificate:
    for key, value in kwargs.items():
        setattr(cert, key, value)
    await session.flush()
    return cert


async def list_by_user(session: AsyncSession, user_id: uuid.UUID) -> list[Certificate]:
    result = await session.execute(
        select(Certificate).where(Certificate.user_id == user_id)
    )
    return list(result.scalars())
