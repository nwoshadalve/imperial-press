from __future__ import annotations

import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.stats.schemas import StatsPublic

logger = logging.getLogger(__name__)


async def get_homepage_stats(session: AsyncSession) -> StatsPublic:
    """Return aggregate counts for the public home page stats bar."""
    from app.modules.papers.models import Paper
    from app.modules.journals.models import Journal
    from app.modules.users.models import User
    from app.modules.submissions.models import Submission
    from app.modules.reviews.models import ReviewAssignment

    import asyncio

    papers_count, journals_count, users_count, submissions_count, reviews_count = (
        await asyncio.gather(
            session.execute(select(func.count()).select_from(Paper)),
            session.execute(select(func.count()).select_from(Journal)),
            session.execute(select(func.count()).select_from(User)),
            session.execute(select(func.count()).select_from(Submission)),
            session.execute(select(func.count()).select_from(ReviewAssignment)),
        )
    )

    return StatsPublic(
        total_papers=papers_count.scalar_one(),
        total_journals=journals_count.scalar_one(),
        total_users=users_count.scalar_one(),
        total_submissions=submissions_count.scalar_one(),
        total_reviews=reviews_count.scalar_one(),
    )
