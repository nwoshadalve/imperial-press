from __future__ import annotations

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.modules.journals import repository as journal_repo
from app.modules.journals.schemas import (
    IssueCreate,
    IssuePublic,
    IssueUpdate,
    JournalCreate,
    JournalPublic,
    JournalUpdate,
    SubjectCreate,
    SubjectPublic,
    VolumeCreate,
    VolumePublic,
)

logger = logging.getLogger(__name__)


# ── Subject ────────────────────────────────────────────────────────────────────

async def create_subject(session: AsyncSession, data: SubjectCreate) -> SubjectPublic:
    existing = await journal_repo.get_subject_by_slug(session, data.slug)
    if existing is not None:
        raise ConflictError("Subject slug already exists")
    subject = await journal_repo.create_subject(session, name=data.name, slug=data.slug)
    return SubjectPublic.model_validate(subject)


async def list_subjects(session: AsyncSession) -> list[SubjectPublic]:
    subjects = await journal_repo.list_subjects(session)
    return [SubjectPublic.model_validate(s) for s in subjects]


# ── Journal ────────────────────────────────────────────────────────────────────

async def create_journal(session: AsyncSession, data: JournalCreate) -> JournalPublic:
    existing = await journal_repo.get_journal_by_slug(session, data.slug)
    if existing is not None:
        raise ConflictError("Journal slug already exists")
    journal = await journal_repo.create_journal(session, **data.model_dump())
    logger.info("Created journal %s", journal.id)
    return JournalPublic.model_validate(journal)


async def get_journal(session: AsyncSession, journal_id: uuid.UUID) -> JournalPublic:
    journal = await journal_repo.get_journal_by_id(session, journal_id)
    if journal is None:
        raise NotFoundError("Journal not found")
    return JournalPublic.model_validate(journal)


async def get_journal_by_slug(session: AsyncSession, slug: str) -> JournalPublic:
    journal = await journal_repo.get_journal_by_slug(session, slug)
    if journal is None:
        raise NotFoundError("Journal not found")
    return JournalPublic.model_validate(journal)


async def update_journal(
    session: AsyncSession, journal_id: uuid.UUID, data: JournalUpdate
) -> JournalPublic:
    journal = await journal_repo.get_journal_by_id(session, journal_id)
    if journal is None:
        raise NotFoundError("Journal not found")
    journal = await journal_repo.update_journal(session, journal, **data.model_dump(exclude_none=True))
    return JournalPublic.model_validate(journal)


async def list_journals(
    session: AsyncSession, page: int = 1, page_size: int = 20
) -> tuple[list[JournalPublic], int]:
    journals, total = await journal_repo.list_journals(session, page, page_size)
    return [JournalPublic.model_validate(j) for j in journals], total


# ── Volume ────────────────────────────────────────────────────────────────────

async def create_volume(session: AsyncSession, data: VolumeCreate) -> VolumePublic:
    volume = await journal_repo.create_volume(session, **data.model_dump())
    return VolumePublic.model_validate(volume)


async def list_volumes(session: AsyncSession, journal_id: uuid.UUID) -> list[VolumePublic]:
    volumes = await journal_repo.list_volumes_by_journal(session, journal_id)
    return [VolumePublic.model_validate(v) for v in volumes]


# ── Issue ─────────────────────────────────────────────────────────────────────

async def create_issue(session: AsyncSession, data: IssueCreate) -> IssuePublic:
    issue = await journal_repo.create_issue(session, **data.model_dump())
    return IssuePublic.model_validate(issue)


async def update_issue(
    session: AsyncSession, issue_id: uuid.UUID, data: IssueUpdate
) -> IssuePublic:
    issue = await journal_repo.get_issue_by_id(session, issue_id)
    if issue is None:
        raise NotFoundError("Issue not found")
    issue = await journal_repo.update_issue(session, issue, **data.model_dump(exclude_none=True))
    return IssuePublic.model_validate(issue)
