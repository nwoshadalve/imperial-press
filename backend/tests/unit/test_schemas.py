from __future__ import annotations

import uuid

import pytest
from pydantic import ValidationError

from app.modules.submissions.schemas import SubmissionCreate
from app.modules.users.schemas import LoginRequest, UserCreate, UserPublic


def test_submission_create_requires_title():
    with pytest.raises(ValidationError):
        SubmissionCreate(title="", abstract="A valid abstract", journal_id=str(uuid.uuid4()))  # type: ignore[arg-type]


def test_submission_create_valid():
    data = SubmissionCreate(
        title="My Paper",
        abstract="Abstract text",
        journal_id=uuid.uuid4(),
    )
    assert data.title == "My Paper"


def test_login_request_requires_email():
    with pytest.raises(ValidationError):
        LoginRequest(email="not-an-email", password="pass")


def test_login_request_valid():
    req = LoginRequest(email="user@example.com", password="secret")
    assert req.email == "user@example.com"


def test_user_create_default_roles():
    u = UserCreate(email="a@b.com", full_name="Alice", password="StrongPass1!")
    assert u.roles == ["author"]


def test_user_public_from_attributes():
    """UserPublic must have from_attributes=True to accept ORM objects."""
    config = UserPublic.model_config
    assert config.get("from_attributes") is True
