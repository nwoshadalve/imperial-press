from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.reviews.models import ReviewAssignment, ReviewReport


async def get_assignment_by_id(
    session: AsyncSession, assignment_id: uuid.UUID
) -> ReviewAssignment | None:
    result = await session.execute(
        select(ReviewAssignment)
        .options(selectinload(ReviewAssignment.report))
        .where(ReviewAssignment.id == assignment_id)
    )
    return result.scalar_one_or_none()


async def create_assignment(session: AsyncSession, **kwargs: object) -> ReviewAssignment:
    assignment = ReviewAssignment(**kwargs)
    session.add(assignment)
    await session.flush()
    return assignment


async def update_assignment(
    session: AsyncSession, assignment: ReviewAssignment, **kwargs: object
) -> ReviewAssignment:
    for key, value in kwargs.items():
        setattr(assignment, key, value)
    await session.flush()
    return assignment


async def list_by_reviewer(
    session: AsyncSession, reviewer_id: uuid.UUID
) -> list[ReviewAssignment]:
    result = await session.execute(
        select(ReviewAssignment).where(ReviewAssignment.reviewer_id == reviewer_id)
    )
    return list(result.scalars())


async def list_by_submission(
    session: AsyncSession, submission_id: uuid.UUID
) -> list[ReviewAssignment]:
    result = await session.execute(
        select(ReviewAssignment)
        .options(selectinload(ReviewAssignment.report))
        .where(ReviewAssignment.submission_id == submission_id)
    )
    return list(result.scalars())


async def create_report(session: AsyncSession, **kwargs: object) -> ReviewReport:
    report = ReviewReport(**kwargs)
    session.add(report)
    await session.flush()
    return report
