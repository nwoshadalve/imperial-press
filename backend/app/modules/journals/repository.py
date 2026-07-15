from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.journals.models import Issue, Journal, Subject, Volume


# ── Subject ────────────────────────────────────────────────────────────────────

async def get_subject_by_id(session: AsyncSession, subject_id: uuid.UUID) -> Subject | None:
    result = await session.execute(select(Subject).where(Subject.id == subject_id))
    return result.scalar_one_or_none()


async def get_subject_by_slug(session: AsyncSession, slug: str) -> Subject | None:
    result = await session.execute(select(Subject).where(Subject.slug == slug))
    return result.scalar_one_or_none()


async def create_subject(session: AsyncSession, **kwargs: object) -> Subject:
    subject = Subject(**kwargs)
    session.add(subject)
    await session.flush()
    return subject


async def list_subjects(session: AsyncSession) -> list[Subject]:
    result = await session.execute(select(Subject))
    return list(result.scalars())


# ── Journal ────────────────────────────────────────────────────────────────────

async def get_journal_by_id(session: AsyncSession, journal_id: uuid.UUID) -> Journal | None:
    result = await session.execute(select(Journal).where(Journal.id == journal_id))
    return result.scalar_one_or_none()


async def get_journal_by_slug(session: AsyncSession, slug: str) -> Journal | None:
    result = await session.execute(select(Journal).where(Journal.slug == slug))
    return result.scalar_one_or_none()


async def create_journal(session: AsyncSession, **kwargs: object) -> Journal:
    journal = Journal(**kwargs)
    session.add(journal)
    await session.flush()
    return journal


async def update_journal(session: AsyncSession, journal: Journal, **kwargs: object) -> Journal:
    for key, value in kwargs.items():
        setattr(journal, key, value)
    await session.flush()
    return journal


async def list_journals(
    session: AsyncSession, page: int = 1, page_size: int = 20
) -> tuple[list[Journal], int]:
    offset = (page - 1) * page_size
    total_result = await session.execute(select(func.count()).select_from(Journal))
    total = total_result.scalar_one()
    result = await session.execute(select(Journal).offset(offset).limit(page_size))
    return list(result.scalars()), total


# ── Volume ────────────────────────────────────────────────────────────────────

async def get_volume_by_id(session: AsyncSession, volume_id: uuid.UUID) -> Volume | None:
    result = await session.execute(select(Volume).where(Volume.id == volume_id))
    return result.scalar_one_or_none()


async def create_volume(session: AsyncSession, **kwargs: object) -> Volume:
    volume = Volume(**kwargs)
    session.add(volume)
    await session.flush()
    return volume


async def list_volumes_by_journal(session: AsyncSession, journal_id: uuid.UUID) -> list[Volume]:
    result = await session.execute(
        select(Volume).where(Volume.journal_id == journal_id)
    )
    return list(result.scalars())


# ── Issue ─────────────────────────────────────────────────────────────────────

async def get_issue_by_id(session: AsyncSession, issue_id: uuid.UUID) -> Issue | None:
    result = await session.execute(select(Issue).where(Issue.id == issue_id))
    return result.scalar_one_or_none()


async def create_issue(session: AsyncSession, **kwargs: object) -> Issue:
    issue = Issue(**kwargs)
    session.add(issue)
    await session.flush()
    return issue


async def update_issue(session: AsyncSession, issue: Issue, **kwargs: object) -> Issue:
    for key, value in kwargs.items():
        setattr(issue, key, value)
    await session.flush()
    return issue


async def list_issues_by_volume(
    session: AsyncSession, volume_id: uuid.UUID
) -> list[Issue]:
    result = await session.execute(
        select(Issue)
        .options(selectinload(Issue.papers))
        .where(Issue.volume_id == volume_id)
    )
    return list(result.scalars())
