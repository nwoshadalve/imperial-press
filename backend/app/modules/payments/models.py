from __future__ import annotations

import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    proof_submitted = "proof_submitted"
    confirmed = "confirmed"
    rejected = "rejected"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("submissions.id"), unique=True, nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus), default=PaymentStatus.pending, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    # String reference to Submission to avoid circular import.
    submission: Mapped["Submission"] = relationship(
        "Submission", back_populates="payment", lazy="raise"
    )
    proofs: Mapped[list["PaymentProof"]] = relationship(
        "PaymentProof", back_populates="payment", lazy="raise"
    )


class PaymentProof(Base):
    __tablename__ = "payment_proofs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    payment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("payments.id"), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    payment: Mapped["Payment"] = relationship("Payment", back_populates="proofs", lazy="raise")
