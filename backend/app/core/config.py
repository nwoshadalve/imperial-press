from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    meilisearch_url: str = "http://localhost:7700"
    meilisearch_master_key: str = ""
    meilisearch_search_key: str = ""

    garage_endpoint: str = "http://localhost:3900"
    garage_access_key: str = ""
    garage_secret_key: str = ""
    garage_region: str = "garage"

    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@imperialpress.com"

    allowed_origins: str = "http://localhost:50174,http://localhost:50173"
    enable_swagger: bool = True

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
