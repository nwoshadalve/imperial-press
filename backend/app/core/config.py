from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _repo_env_files() -> tuple[str, ...]:
    """Load global env from the monorepo root when present; otherwise OS env only."""
    # .../imperial-press/backend/app/core/config.py → parents[3] = repo root
    repo_root = Path(__file__).resolve().parents[3]
    files: list[str] = []
    for name in (".env.example", ".env"):
        path = repo_root / name
        if path.is_file():
            files.append(str(path))
    return tuple(files)


class Settings(BaseSettings):
    """All values come from the root `.env` / process environment — no per-app env files."""

    model_config = SettingsConfigDict(
        # Later files win — real `.env` overrides the committed example template.
        env_file=_repo_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str
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

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
