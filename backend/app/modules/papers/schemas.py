from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PaperAuthorPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    paper_id: uuid.UUID
    user_id: uuid.UUID | None
    name: str
    affiliation: str | None
    order: int


class PaperCreate(BaseModel):
    title: str
    abstract: str
    issue_id: uuid.UUID | None = None
    doi: str | None = None


class PaperUpdate(BaseModel):
    title: str | None = None
    abstract: str | None = None
    doi: str | None = None
    issue_id: uuid.UUID | None = None
    is_published: bool | None = None


class PaperPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    abstract: str
    doi: str | None
    is_published: bool
    view_count: int
    download_count: int
    issue_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
