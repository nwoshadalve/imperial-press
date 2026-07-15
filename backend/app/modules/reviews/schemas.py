from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReviewAssignmentPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    submission_id: uuid.UUID
    reviewer_id: uuid.UUID
    assigned_at: datetime
    due_date: datetime | None
    status: str


class ReviewReportCreate(BaseModel):
    recommendation: str
    comments_to_author: str
    comments_to_editor: str | None = None


class ReviewReportPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    assignment_id: uuid.UUID
    recommendation: str
    comments_to_author: str
    comments_to_editor: str | None
    submitted_at: datetime
