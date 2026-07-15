from __future__ import annotations

import uuid
from collections.abc import Callable, Coroutine
from typing import Any

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token

bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    session: AsyncSession = Depends(get_db),
) -> Any:
    from app.modules.users import repository as user_repo

    payload = decode_token(credentials.credentials)
    user_id = uuid.UUID(str(payload["sub"]))
    user = await user_repo.get_by_id(session, user_id)
    if user is None:
        raise UnauthorizedError("User not found")
    return user


def require_role(role: str) -> Callable[..., Coroutine[Any, Any, Any]]:
    async def _check(
        credentials: HTTPAuthorizationCredentials = Depends(bearer),
        session: AsyncSession = Depends(get_db),
    ) -> Any:
        from app.modules.users import repository as user_repo

        payload = decode_token(credentials.credentials)
        roles = payload.get("roles", [])
        if not isinstance(roles, list) or role not in roles:
            raise ForbiddenError("Insufficient permissions")
        user_id = uuid.UUID(str(payload["sub"]))
        user = await user_repo.get_by_id(session, user_id)
        if user is None:
            raise UnauthorizedError("User not found")
        return user

    return _check
