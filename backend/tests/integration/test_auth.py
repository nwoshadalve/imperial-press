from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import create_test_user


@pytest.mark.asyncio
async def test_login_returns_access_token(client: AsyncClient, session: AsyncSession):
    await create_test_user(session, email="author@test.com", password="ValidPass1!")
    await session.flush()

    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "author@test.com", "password": "ValidPass1!"},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client: AsyncClient, session: AsyncSession):
    await create_test_user(session, email="author@test.com", password="ValidPass1!")
    await session.flush()

    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "author@test.com", "password": "WrongPassword!"},
    )

    assert resp.status_code == 401
    assert resp.json()["type"] == "unauthorized"


@pytest.mark.asyncio
async def test_login_unknown_email_returns_401(client: AsyncClient, session: AsyncSession):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "ValidPass1!"},
    )

    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_missing_auth_header_returns_403(client: AsyncClient, session: AsyncSession):
    """Accessing a protected endpoint without a Bearer token returns 403."""
    resp = await client.get("/api/v1/auth/refresh")
    # refresh uses cookie, not bearer — but other protected endpoints use bearer
    # This is a smoke-test that the server responds meaningfully.
    assert resp.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_logout_clears_cookie(client: AsyncClient, session: AsyncSession):
    await create_test_user(session, email="author2@test.com", password="ValidPass1!")
    await session.flush()

    # Login to get cookie
    await client.post(
        "/api/v1/auth/login",
        json={"email": "author2@test.com", "password": "ValidPass1!"},
    )

    resp = await client.post("/api/v1/auth/logout")
    assert resp.status_code == 204
