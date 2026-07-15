from __future__ import annotations

import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import partial

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_email_sync(to: str, subject: str, html_body: str) -> None:
    """Synchronous SMTP send, intended to run in a thread executor."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, [to], msg.as_string())
        logger.info("Email sent to %s (subject=%r)", to, subject)
    except Exception as exc:
        # Fire-and-forget: log failure without raising so the HTTP response is
        # not blocked and the caller does not surface email errors to the user.
        logger.error("Failed to send email to %s: %s", to, exc)


async def send_email(to: str, subject: str, html_body: str) -> None:
    """Send a transactional email in a thread executor (non-blocking)."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, partial(_send_email_sync, to, subject, html_body))
