"""Copyright (c) 2026 Imperial Press. All rights reserved.

Developed by MD Nwoshad Alam Chowdhury.
"""

from __future__ import annotations

import logging

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.exceptions import ConflictError
import app.models  # noqa: F401  # register ORM models before queries
from app.modules.users import service as user_service
from app.modules.users.schemas import UserCreate

logger = logging.getLogger(__name__)


async def ensure_default_admin() -> None:
    """Create the default admin user if it does not already exist.

    Idempotent: skips when the configured email is already registered.
    Failures are logged and swallowed so a missing/unmigrated database does
    not prevent the API from starting.
    """
    try:
        async with AsyncSessionLocal() as session:
            try:
                await user_service.create_user(
                    session,
                    UserCreate(
                        email=settings.default_admin_email,
                        full_name=settings.default_admin_full_name,
                        password=settings.default_admin_password,
                        roles=["admin"],
                    ),
                )
                await session.commit()
                logger.info(
                    "Default admin created (%s). Change this password before production use.",
                    settings.default_admin_email,
                )
            except ConflictError:
                await session.rollback()
                logger.debug(
                    "Default admin %s already exists - skipping seed",
                    settings.default_admin_email,
                )
    except Exception:
        logger.warning(
            "Could not seed default admin (is the database migrated?). "
            "Run `uv run alembic upgrade head` then restart, or "
            "`uv run python -m app.core.seed`.",
            exc_info=True,
        )


async def main() -> None:
    """CLI entry: `uv run python -m app.core.seed`."""
    logging.basicConfig(level=logging.INFO)
    await ensure_default_admin()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
