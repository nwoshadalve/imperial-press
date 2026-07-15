from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import UnauthorizedError
from app.modules.users import service as user_service
from app.modules.users.schemas import LoginRequest, TokenResponse

logger = logging.getLogger(__name__)

router = APIRouter()

_REFRESH_COOKIE = "refresh_token"
_COOKIE_OPTS: dict[str, object] = {
    "httponly": True,
    "secure": True,
    "samesite": "strict",
    "path": "/api/v1/auth",
}


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    body: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate a user and return an access token.

    Rate-limited by the slowapi middleware attached in main.py (10/15min per IP).
    The `request` parameter is required by slowapi even though it is not used
    directly in the handler body.
    """
    token_data = await user_service.authenticate(session, body.email, body.password)
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token_data.refresh_token or "",
        **_COOKIE_OPTS,  # type: ignore[arg-type]
    )
    return token_data


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(
    request: Request,
    body: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate an admin user.

    Enforces `role: admin` in addition to verifying the password.
    Rate-limited by the slowapi middleware (10/15min per IP).
    """
    token_data = await user_service.authenticate(
        session, body.email, body.password, require_role="admin"
    )
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token_data.refresh_token or "",
        **_COOKIE_OPTS,  # type: ignore[arg-type]
    )
    return token_data


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Issue a new access token using the HttpOnly refresh cookie."""
    refresh_cookie = request.cookies.get(_REFRESH_COOKIE)
    if not refresh_cookie:
        raise UnauthorizedError("No refresh token provided")

    token_data = await user_service.refresh_access_token(session, refresh_cookie)
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token_data.refresh_token or "",
        **_COOKIE_OPTS,  # type: ignore[arg-type]
    )
    return token_data


@router.post("/logout", status_code=204)
async def logout(response: Response) -> None:
    """Clear the refresh token cookie."""
    response.delete_cookie(key=_REFRESH_COOKIE, path="/api/v1/auth")
