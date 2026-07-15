from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.modules.payments.models import PaymentStatus


class PaymentCreate(BaseModel):
    submission_id: uuid.UUID
    amount: Decimal
    currency: str = "USD"


class PaymentPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    submission_id: uuid.UUID
    amount: Decimal
    currency: str
    status: PaymentStatus
    created_at: datetime


class PaymentProofPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    payment_id: uuid.UUID
    storage_key: str
    uploaded_at: datetime
    note: str | None


class PaymentConfirm(BaseModel):
    note: str | None = None
