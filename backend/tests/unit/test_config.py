"""Copyright (c) 2026 Imperial Press. All rights reserved.

Developed by MD Nwoshad Alam Chowdhury.
"""

from __future__ import annotations

from app.core.config import Settings


def test_settings_build_service_urls_from_host_ports() -> None:
    settings = Settings(
        INFRA_HOST="localhost",
        POSTGRES_USER="imperial",
        POSTGRES_DB="imperial_press",
        DB_PASSWORD="secret",
        HOST_POSTGRES_PORT=7105,
        HOST_MEILI_PORT=7102,
        HOST_GARAGE_S3_PORT=7103,
        SECRET_KEY="x",
        ALGORITHM="HS256",
        ACCESS_TOKEN_EXPIRE_MINUTES=15,
        REFRESH_TOKEN_EXPIRE_DAYS=30,
        MEILISEARCH_MASTER_KEY="master",
        MEILISEARCH_SEARCH_KEY="search",
        GARAGE_ACCESS_KEY="",
        GARAGE_SECRET_KEY="",
        GARAGE_REGION="garage",
        SMTP_HOST="",
        SMTP_PORT=587,
        SMTP_USER="",
        SMTP_PASSWORD="",
        SMTP_FROM="noreply@example.com",
        ALLOWED_ORIGINS="http://localhost:7001,http://localhost:7002",
        ENABLE_SWAGGER=True,
        DEFAULT_ADMIN_EMAIL="admin@example.com",
        DEFAULT_ADMIN_PASSWORD="password",
        DEFAULT_ADMIN_FULL_NAME="Admin",
    )

    assert (
        settings.database_url
        == "postgresql+asyncpg://imperial:secret@localhost:7105/imperial_press"
    )
    assert settings.test_database_url == "postgresql+asyncpg://test:test@localhost:7105/imperial_test"
    assert settings.meilisearch_url == "http://localhost:7102"
    assert settings.garage_endpoint == "http://localhost:7103"
    assert settings.allowed_origins == "http://localhost:7001,http://localhost:7002"
