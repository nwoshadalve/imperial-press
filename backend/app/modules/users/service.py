from __future__ import annotations

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.modules.users import repository as user_repo
from app.modules.users.schemas import TokenResponse, UserCreate, UserPublic, UserUpdate

logger = logging.getLogger(__name__)


async def authenticate(
    session: AsyncSession,
    email: str,
    password: str,
    require_role: str | None = None,
) -> TokenResponse:
    user = await user_repo.get_by_email(session, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password")
    if not user.is_active:
        raise ForbiddenError("Account is disabled")
    if require_role and require_role not in user.roles:
        raise ForbiddenError("Insufficient permissions")

    access_token = create_access_token(user.id, user.roles)
    refresh_token = create_refresh_token(user.id)
    logger.info("User %s authenticated", user.id)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


async def refresh_access_token(session: AsyncSession, refresh_token: str) -> TokenResponse:
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid refresh token")
    user_id = uuid.UUID(str(payload["sub"]))
    user = await user_repo.get_by_id(session, user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError("User not found or disabled")

    new_access_token = create_access_token(user.id, user.roles)
    new_refresh_token = create_refresh_token(user.id)
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )


async def create_user(session: AsyncSession, data: UserCreate) -> UserPublic:
    existing = await user_repo.get_by_email(session, data.email)
    if existing is not None:
        raise ConflictError("Email already registered")
    hashed = hash_password(data.password)
    user = await user_repo.create(
        session,
        email=data.email,
        full_name=data.full_name,
        hashed_password=hashed,
        roles=data.roles,
    )
    logger.info("Created user %s", user.id)
    return UserPublic.model_validate(user)


async def get_user(session: AsyncSession, user_id: uuid.UUID) -> UserPublic:
    user = await user_repo.get_by_id(session, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return UserPublic.model_validate(user)


async def list_users(
    session: AsyncSession, page: int = 1, page_size: int = 20
) -> tuple[list[UserPublic], int]:
    users, total = await user_repo.list_users(session, page, page_size)
    return [UserPublic.model_validate(u) for u in users], total


async def update_user(
    session: AsyncSession, user_id: uuid.UUID, data: UserUpdate
) -> UserPublic:
    user = await user_repo.get_by_id(session, user_id)
    if user is None:
        raise NotFoundError("User not found")
    updates = data.model_dump(exclude_none=True)
    user = await user_repo.update(session, user, **updates)
    return UserPublic.model_validate(user)
