"""Copyright (c) 2026 Imperial Press. All rights reserved.

Developed by MD Nwoshad Alam Chowdhury.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _repo_env_files() -> tuple[str, ...]:
    """Load global env from the monorepo root when present; otherwise OS env only."""
    # .../imperial-press/backend/app/core/config.py → parents[3] = repo root
    repo_root = Path(__file__).resolve().parents[3]
    files: list[str] = []
    for name in (
        ".env.compose.example",
        ".env.compose",
        ".env.example",
        ".env",
    ):
        path = repo_root / name
        if path.is_file():
            files.append(str(path))
    return tuple(files)


def _pick(data: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in data and data[key] not in (None, ""):
            return data[key]
    return None


def _build_database_url(data: dict[str, Any]) -> str:
    user = _pick(data, "POSTGRES_USER", "postgres_user")
    password = _pick(data, "DB_PASSWORD", "db_password")
    db_name = _pick(data, "POSTGRES_DB", "postgres_db")
    host = _pick(data, "INFRA_HOST", "infra_host")
    port = _pick(data, "HOST_POSTGRES_PORT", "host_postgres_port")
    return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db_name}"


def _build_test_database_url(data: dict[str, Any]) -> str:
    host = _pick(data, "INFRA_HOST", "infra_host")
    port = _pick(data, "HOST_POSTGRES_PORT", "host_postgres_port")
    return f"postgresql+asyncpg://test:test@{host}:{port}/imperial_test"


def _build_meilisearch_url(data: dict[str, Any]) -> str:
    host = _pick(data, "INFRA_HOST", "infra_host")
    port = _pick(data, "HOST_MEILI_PORT", "host_meili_port")
    return f"http://{host}:{port}"


def _build_garage_endpoint(data: dict[str, Any]) -> str:
    host = _pick(data, "INFRA_HOST", "infra_host")
    port = _pick(data, "HOST_GARAGE_S3_PORT", "host_garage_s3_port")
    return f"http://{host}:{port}"


class Settings(BaseSettings):
    """All values come from the repo-root `.env` / `.env.compose` / process environment."""

    model_config = SettingsConfigDict(
        # Later files win — real `.env` overrides templates; OS env overrides files.
        env_file=_repo_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    infra_host: str = Field(validation_alias="INFRA_HOST")

    postgres_user: str
    postgres_db: str
    db_password: str

    host_postgres_port: int = Field(validation_alias="HOST_POSTGRES_PORT")
    host_meili_port: int = Field(validation_alias="HOST_MEILI_PORT")
    host_garage_s3_port: int = Field(validation_alias="HOST_GARAGE_S3_PORT")

    database_url: str
    test_database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int

    meilisearch_url: str
    meilisearch_master_key: str
    meilisearch_search_key: str

    garage_endpoint: str
    garage_access_key: str
    garage_secret_key: str
    garage_region: str

    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    smtp_from: str

    allowed_origins: str
    enable_swagger: bool

    # Bootstrap admin — seeded on API startup if the email is not yet registered.
    # Documented in docs/default-admin-credentials.md; change before production.
    default_admin_email: str
    default_admin_password: str
    default_admin_full_name: str

    @model_validator(mode="before")
    @classmethod
    def assemble_service_urls(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data

        if not _pick(data, "DATABASE_URL", "database_url"):
            data["database_url"] = _build_database_url(data)

        if not _pick(data, "TEST_DATABASE_URL", "test_database_url"):
            data["test_database_url"] = _build_test_database_url(data)

        if not _pick(data, "MEILISEARCH_URL", "meilisearch_url"):
            data["meilisearch_url"] = _build_meilisearch_url(data)

        if not _pick(data, "GARAGE_ENDPOINT", "garage_endpoint"):
            data["garage_endpoint"] = _build_garage_endpoint(data)

        return data

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
