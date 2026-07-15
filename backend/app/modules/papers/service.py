from __future__ import annotations

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.modules.papers import repository as paper_repo
from app.modules.papers.schemas import PaperCreate, PaperPublic, PaperUpdate

logger = logging.getLogger(__name__)


async def get_paper(session: AsyncSession, paper_id: uuid.UUID) -> PaperPublic:
    paper = await paper_repo.get_by_id(session, paper_id)
    if paper is None:
        raise NotFoundError("Paper not found")
    return PaperPublic.model_validate(paper)


async def create_paper(session: AsyncSession, data: PaperCreate) -> PaperPublic:
    paper = await paper_repo.create(session, **data.model_dump())
    logger.info("Created paper %s", paper.id)
    return PaperPublic.model_validate(paper)


async def update_paper(
    session: AsyncSession, paper_id: uuid.UUID, data: PaperUpdate
) -> PaperPublic:
    paper = await paper_repo.get_by_id(session, paper_id)
    if paper is None:
        raise NotFoundError("Paper not found")
    paper = await paper_repo.update_paper(session, paper, **data.model_dump(exclude_none=True))
    return PaperPublic.model_validate(paper)


async def publish_paper(session: AsyncSession, paper_id: uuid.UUID) -> PaperPublic:
    paper = await paper_repo.get_by_id(session, paper_id)
    if paper is None:
        raise NotFoundError("Paper not found")
    paper = await paper_repo.update_paper(session, paper, is_published=True)
    logger.info("Published paper %s", paper.id)
    return PaperPublic.model_validate(paper)


async def increment_view(session: AsyncSession, paper_id: uuid.UUID) -> None:
    """Atomically increment the view counter. Uses its own commit (fire-and-forget counter)."""
    await paper_repo.increment_view(session, paper_id)


async def increment_download(session: AsyncSession, paper_id: uuid.UUID) -> None:
    """Atomically increment the download counter. Uses its own commit."""
    await paper_repo.increment_download(session, paper_id)


async def list_papers(
    session: AsyncSession, page: int = 1, page_size: int = 20
) -> tuple[list[PaperPublic], int]:
    papers, total = await paper_repo.list_papers(session, page, page_size)
    return [PaperPublic.model_validate(p) for p in papers], total
