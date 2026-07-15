from __future__ import annotations

import uuid

import pytest

from app.core.exceptions import UnauthorizedError, ValidationAppError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_password_round_trip():
    hashed = hash_password("StrongPass1!")
    assert verify_password("StrongPass1!", hashed)


def test_verify_password_wrong_returns_false():
    hashed = hash_password("StrongPass1!")
    assert not verify_password("wrongpassword", hashed)


def test_hash_password_weak_raises_validation_error():
    with pytest.raises(ValidationAppError, match="too weak"):
        hash_password("123")


def test_create_access_token_decode_round_trip():
    user_id = uuid.uuid4()
    roles = ["author", "reviewer"]
    token = create_access_token(user_id, roles)
    payload = decode_token(token)

    assert payload["sub"] == str(user_id)
    assert payload["roles"] == roles


def test_create_refresh_token_has_refresh_type():
    user_id = uuid.uuid4()
    token = create_refresh_token(user_id)
    payload = decode_token(token)

    assert payload["sub"] == str(user_id)
    assert payload["type"] == "refresh"


def test_decode_token_invalid_raises_unauthorized():
    with pytest.raises(UnauthorizedError, match="Invalid or expired"):
        decode_token("not.a.real.token")


def test_decode_token_tampered_raises_unauthorized():
    user_id = uuid.uuid4()
    token = create_access_token(user_id, ["admin"])
    tampered = token[:-4] + "xxxx"
    with pytest.raises(UnauthorizedError):
        decode_token(tampered)
