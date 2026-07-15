from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.payments.models import Payment, PaymentProof, PaymentStatus


async def get_by_id(session: AsyncSession, payment_id: uuid.UUID) -> Payment | None:
    result = await session.execute(
        select(Payment)
        .options(selectinload(Payment.proofs))
        .where(Payment.id == payment_id)
    )
    return result.scalar_one_or_none()


async def get_by_submission(
    session: AsyncSession, submission_id: uuid.UUID
) -> Payment | None:
    result = await session.execute(
        select(Payment)
        .options(selectinload(Payment.proofs))
        .where(Payment.submission_id == submission_id)
    )
    return result.scalar_one_or_none()


async def create(session: AsyncSession, **kwargs: object) -> Payment:
    payment = Payment(**kwargs)
    session.add(payment)
    await session.flush()
    return payment


async def update(session: AsyncSession, payment: Payment, **kwargs: object) -> Payment:
    for key, value in kwargs.items():
        setattr(payment, key, value)
    await session.flush()
    return payment


async def list_pending_proofs(session: AsyncSession) -> list[Payment]:
    result = await session.execute(
        select(Payment)
        .options(selectinload(Payment.proofs))
        .where(Payment.status == PaymentStatus.proof_submitted)
    )
    return list(result.scalars())


async def add_proof(session: AsyncSession, **kwargs: object) -> PaymentProof:
    proof = PaymentProof(**kwargs)
    session.add(proof)
    await session.flush()
    return proof
