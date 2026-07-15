from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import Notification


async def create(session: AsyncSession, **kwargs: object) -> Notification:
    notification = Notification(**kwargs)
    session.add(notification)
    await session.flush()
    return notification


async def list_by_user(
    session: AsyncSession, user_id: uuid.UUID
) -> list[Notification]:
    result = await session.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    )
    return list(result.scalars())


async def mark_read(session: AsyncSession, notification_id: uuid.UUID) -> Notification | None:
    result = await session.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    if notification is not None:
        notification.is_read = True
        await session.flush()
    return notification


async def mark_all_read(session: AsyncSession, user_id: uuid.UUID) -> None:
    result = await session.execute(
        select(Notification)
        .where(Notification.user_id == user_id, Notification.is_read.is_(False))
    )
    for notification in result.scalars():
        notification.is_read = True
    await session.flush()
