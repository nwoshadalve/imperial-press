from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.modules.submissions.models import SubmissionStatus


class ContributorPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    submission_id: uuid.UUID
    name: str
    email: str | None
    affiliation: str | None
    order: int


class SubmissionCreate(BaseModel):
    title: str
    abstract: str
    journal_id: uuid.UUID


class SubmissionUpdate(BaseModel):
    title: str | None = None
    abstract: str | None = None
    journal_id: uuid.UUID | None = None


class SubmissionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    abstract: str
    status: SubmissionStatus
    author_id: uuid.UUID
    journal_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class SubmissionStatusHistoryPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    submission_id: uuid.UUID
    from_status: SubmissionStatus | None
    to_status: SubmissionStatus
    changed_by: uuid.UUID
    note: str | None
    changed_at: datetime
