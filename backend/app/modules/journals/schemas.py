from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SubjectCreate(BaseModel):
    name: str
    slug: str


class SubjectPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str


class JournalCreate(BaseModel):
    title: str
    slug: str
    description: str | None = None
    subject_id: uuid.UUID
    is_active: bool = True
    issn: str | None = None


class JournalUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    is_active: bool | None = None
    issn: str | None = None


class JournalPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    description: str | None
    subject_id: uuid.UUID
    is_active: bool
    issn: str | None
    created_at: datetime


class VolumeCreate(BaseModel):
    journal_id: uuid.UUID
    number: int
    year: int


class VolumePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    journal_id: uuid.UUID
    number: int
    year: int


class IssueCreate(BaseModel):
    volume_id: uuid.UUID
    number: int
    title: str | None = None
    published_at: datetime | None = None


class IssueUpdate(BaseModel):
    title: str | None = None
    published_at: datetime | None = None


class IssuePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    volume_id: uuid.UUID
    number: int
    title: str | None
    published_at: datetime | None
