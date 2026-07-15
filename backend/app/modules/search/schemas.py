from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class SearchHit(BaseModel):
    id: str
    type: str
    title: str
    snippet: str | None = None
    extra: dict[str, Any] = {}


class SearchResult(BaseModel):
    query: str
    hits: list[SearchHit]
    total: int
    processing_time_ms: int
