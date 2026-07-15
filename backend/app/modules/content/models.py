from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), unique=True, nullable=False, index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class ServicePage(Base):
    __tablename__ = "service_pages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )

    blocks: Mapped[list[ServiceBlock]] = relationship(
        "ServiceBlock", back_populates="page", lazy="raise"
    )


class ServiceBlock(Base):
    __tablename__ = "service_blocks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    page_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("service_pages.id"), nullable=False)
    block_type: Mapped[str] = mapped_column(String(100), nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    page: Mapped[ServicePage] = relationship(
        "ServicePage", back_populates="blocks", lazy="raise"
    )


class StaticPage(Base):
    __tablename__ = "static_pages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    slug: Mapped[str] = mapped_column(String(500), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class CallForPapers(Base):
    __tablename__ = "calls_for_papers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    journal_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("journals.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False
    )


class Partner(Base):
    __tablename__ = "partners"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    logo_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
