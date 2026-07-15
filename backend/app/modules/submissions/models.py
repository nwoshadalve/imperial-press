from __future__ import annotations

import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SubmissionStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    under_review = "under_review"
    revision_requested = "revision_requested"
    accepted = "accepted"
    rejected = "rejected"
    published = "published"


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    abstract: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus), default=SubmissionStatus.draft, nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    journal_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("journals.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # String references to avoid circular imports.
    author: Mapped["User"] = relationship("User", back_populates="submissions", lazy="raise")
    contributors: Mapped[list["Contributor"]] = relationship(
        "Contributor", back_populates="submission", lazy="raise"
    )
    files: Mapped[list["SubmissionFile"]] = relationship(
        "SubmissionFile", back_populates="submission", lazy="raise"
    )
    status_history: Mapped[list["SubmissionStatusHistory"]] = relationship(
        "SubmissionStatusHistory", back_populates="submission", lazy="raise"
    )
    review_assignments: Mapped[list["ReviewAssignment"]] = relationship(
        "ReviewAssignment", back_populates="submission", lazy="raise"
    )
    payment: Mapped["Payment | None"] = relationship(
        "Payment", back_populates="submission", lazy="raise", uselist=False
    )
    certificates: Mapped[list["Certificate"]] = relationship(
        "Certificate", back_populates="submission", lazy="raise"
    )


class Contributor(Base):
    __tablename__ = "contributors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("submissions.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    affiliation: Mapped[str | None] = mapped_column(String(500), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    submission: Mapped["Submission"] = relationship(
        "Submission", back_populates="contributors", lazy="raise"
    )


class SubmissionFile(Base):
    __tablename__ = "submission_files"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("submissions.id"), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    submission: Mapped["Submission"] = relationship(
        "Submission", back_populates="files", lazy="raise"
    )


class SubmissionStatusHistory(Base):
    __tablename__ = "submission_status_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("submissions.id"), nullable=False
    )
    from_status: Mapped[SubmissionStatus | None] = mapped_column(
        Enum(SubmissionStatus), nullable=True
    )
    to_status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus), nullable=False
    )
    changed_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    submission: Mapped["Submission"] = relationship(
        "Submission", back_populates="status_history", lazy="raise"
    )
