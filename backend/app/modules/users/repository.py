from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.models import User


async def get_by_id(session: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create(session: AsyncSession, **kwargs: object) -> User:
    user = User(**kwargs)
    session.add(user)
    await session.flush()
    return user


async def list_users(
    session: AsyncSession, page: int = 1, page_size: int = 20
) -> tuple[list[User], int]:
    offset = (page - 1) * page_size
    total_result = await session.execute(select(func.count()).select_from(User))
    total = total_result.scalar_one()
    result = await session.execute(select(User).offset(offset).limit(page_size))
    return list(result.scalars()), total


async def update(session: AsyncSession, user: User, **kwargs: object) -> User:
    for key, value in kwargs.items():
        setattr(user, key, value)
    await session.flush()
    return user


async def delete(session: AsyncSession, user: User) -> None:
    await session.delete(user)
    await session.flush()
