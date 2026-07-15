from __future__ import annotations

import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CertificateType(str, enum.Enum):
    authorship = "authorship"
    peer_review = "peer_review"
    acceptance = "acceptance"


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    type: Mapped[CertificateType] = mapped_column(
        Enum(CertificateType), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    submission_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("submissions.id"), nullable=True
    )
    paper_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("papers.id"), nullable=True
    )
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    storage_key: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # String references to avoid circular imports.
    user: Mapped["User"] = relationship("User", back_populates="certificates", lazy="raise")
    submission: Mapped["Submission | None"] = relationship(
        "Submission", back_populates="certificates", lazy="raise"
    )
    paper: Mapped["Paper | None"] = relationship(
        "Paper", back_populates="certificates", lazy="raise"
    )
