from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.submissions.models import (
    Submission,
    SubmissionStatus,
    SubmissionStatusHistory,
)


async def get_by_id(session: AsyncSession, submission_id: uuid.UUID) -> Submission | None:
    result = await session.execute(
        select(Submission)
        .options(
            selectinload(Submission.contributors),
            selectinload(Submission.files),
            selectinload(Submission.status_history),
        )
        .where(Submission.id == submission_id)
    )
    return result.scalar_one_or_none()


async def create(session: AsyncSession, **kwargs: object) -> Submission:
    submission = Submission(**kwargs)
    session.add(submission)
    await session.flush()
    return submission


async def update(session: AsyncSession, submission: Submission, **kwargs: object) -> Submission:
    for key, value in kwargs.items():
        setattr(submission, key, value)
    await session.flush()
    return submission


async def list_by_author(
    session: AsyncSession, author_id: uuid.UUID, page: int = 1, page_size: int = 20
) -> tuple[list[Submission], int]:
    offset = (page - 1) * page_size
    total_result = await session.execute(
        select(func.count()).select_from(Submission).where(Submission.author_id == author_id)
    )
    total = total_result.scalar_one()
    result = await session.execute(
        select(Submission)
        .where(Submission.author_id == author_id)
        .offset(offset)
        .limit(page_size)
    )
    return list(result.scalars()), total


async def list_by_status(
    session: AsyncSession, status: SubmissionStatus, page: int = 1, page_size: int = 20
) -> tuple[list[Submission], int]:
    offset = (page - 1) * page_size
    total_result = await session.execute(
        select(func.count()).select_from(Submission).where(Submission.status == status)
    )
    total = total_result.scalar_one()
    result = await session.execute(
        select(Submission).where(Submission.status == status).offset(offset).limit(page_size)
    )
    return list(result.scalars()), total


async def list_all(
    session: AsyncSession, page: int = 1, page_size: int = 20
) -> tuple[list[Submission], int]:
    offset = (page - 1) * page_size
    total_result = await session.execute(select(func.count()).select_from(Submission))
    total = total_result.scalar_one()
    result = await session.execute(select(Submission).offset(offset).limit(page_size))
    return list(result.scalars()), total


async def add_status_history(
    session: AsyncSession,
    submission_id: uuid.UUID,
    from_status: SubmissionStatus | None,
    to_status: SubmissionStatus,
    changed_by: uuid.UUID,
    note: str | None = None,
) -> SubmissionStatusHistory:
    history = SubmissionStatusHistory(
        submission_id=submission_id,
        from_status=from_status,
        to_status=to_status,
        changed_by=changed_by,
        note=note,
    )
    session.add(history)
    await session.flush()
    return history
