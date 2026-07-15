from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.modules.certificates.models import CertificateType


class CertificatePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: CertificateType
    user_id: uuid.UUID
    submission_id: uuid.UUID | None
    paper_id: uuid.UUID | None
    issued_at: datetime
    storage_key: str | None


class CertVerifyResponse(BaseModel):
    valid: bool
    certificate: CertificatePublic | None = None
