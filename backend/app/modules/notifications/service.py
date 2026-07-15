from __future__ import annotations

import logging
import uuid

from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications import repository as notification_repo
from app.modules.notifications.email import send_email
from app.modules.notifications.schemas import NotificationPublic
from app.modules.users.models import User

logger = logging.getLogger(__name__)


async def create_notification(
    session: AsyncSession,
    user_id: uuid.UUID,
    notification_type: str,
    title: str,
    body: str | None = None,
) -> NotificationPublic:
    notification = await notification_repo.create(
        session,
        user_id=user_id,
        type=notification_type,
        title=title,
        body=body,
    )
    return NotificationPublic.model_validate(notification)


async def list_notifications(
    session: AsyncSession, user: User
) -> list[NotificationPublic]:
    notifications = await notification_repo.list_by_user(session, user.id)
    return [NotificationPublic.model_validate(n) for n in notifications]


async def mark_read(
    session: AsyncSession, notification_id: uuid.UUID, user: User
) -> NotificationPublic | None:
    notification = await notification_repo.mark_read(session, notification_id)
    if notification is None or notification.user_id != user.id:
        return None
    return NotificationPublic.model_validate(notification)


async def mark_all_read(session: AsyncSession, user: User) -> None:
    await notification_repo.mark_all_read(session, user.id)


def dispatch_email_background(
    background_tasks: BackgroundTasks,
    to: str,
    subject: str,
    html_body: str,
) -> None:
    """Schedule an email to be sent in the background (fire-and-forget).

    Never await this directly in a request handler — return the HTTP response
    first, then let FastAPI run the background task.
    """
    background_tasks.add_task(send_email, to, subject, html_body)
    logger.debug("Email scheduled (fire-and-forget) to %s", to)
