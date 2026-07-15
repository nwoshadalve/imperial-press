from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class BlogPostCreate(BaseModel):
    title: str
    slug: str
    body: str
    is_published: bool = False


class BlogPostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    body: str | None = None
    is_published: bool | None = None


class BlogPostPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    body: str
    is_published: bool
    author_id: uuid.UUID
    published_at: datetime | None
    created_at: datetime


class ServicePageCreate(BaseModel):
    title: str
    slug: str


class ServicePagePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    created_at: datetime


class ServiceBlockCreate(BaseModel):
    page_id: uuid.UUID
    block_type: str
    data: dict[str, Any]
    order: int = 0


class ServiceBlockPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    page_id: uuid.UUID
    block_type: str
    data: dict[str, Any]
    order: int


class StaticPageCreate(BaseModel):
    slug: str
    title: str
    body: str


class StaticPageUpdate(BaseModel):
    title: str | None = None
    body: str | None = None


class StaticPagePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    body: str
    updated_at: datetime


class AnnouncementCreate(BaseModel):
    title: str
    body: str
    is_active: bool = True


class AnnouncementPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    body: str
    is_active: bool
    created_at: datetime


class CallForPapersCreate(BaseModel):
    title: str
    body: str
    deadline: datetime | None = None
    journal_id: uuid.UUID | None = None
    is_active: bool = True


class CallForPapersPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    body: str
    deadline: datetime | None
    journal_id: uuid.UUID | None
    is_active: bool
    created_at: datetime


class PartnerCreate(BaseModel):
    name: str
    logo_key: str | None = None
    url: str | None = None
    order: int = 0


class PartnerPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    logo_key: str | None
    url: str | None
    order: int
