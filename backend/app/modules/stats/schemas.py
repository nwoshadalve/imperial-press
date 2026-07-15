from __future__ import annotations

from pydantic import BaseModel


class StatsPublic(BaseModel):
    total_papers: int
    total_journals: int
    total_users: int
    total_submissions: int
    total_reviews: int
