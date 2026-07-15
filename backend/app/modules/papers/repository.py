from __future__ import annotations

import uuid

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.papers.models import Paper, PaperAuthor


async def get_by_id(session: AsyncSession, paper_id: uuid.UUID) -> Paper | None:
    result = await session.execute(
        select(Paper)
        .options(selectinload(Paper.authors))
        .where(Paper.id == paper_id)
    )
    return result.scalar_one_or_none()


async def create(session: AsyncSession, **kwargs: object) -> Paper:
    paper = Paper(**kwargs)
    session.add(paper)
    await session.flush()
    return paper


async def update_paper(session: AsyncSession, paper: Paper, **kwargs: object) -> Paper:
    for key, value in kwargs.items():
        setattr(paper, key, value)
    await session.flush()
    return paper


async def list_by_issue(session: AsyncSession, issue_id: uuid.UUID) -> list[Paper]:
    result = await session.execute(
        select(Paper)
        .options(selectinload(Paper.authors))
        .where(Paper.issue_id == issue_id)
    )
    return list(result.scalars())


async def list_papers(
    session: AsyncSession, page: int = 1, page_size: int = 20
) -> tuple[list[Paper], int]:
    offset = (page - 1) * page_size
    total_result = await session.execute(select(func.count()).select_from(Paper))
    total = total_result.scalar_one()
    result = await session.execute(
        select(Paper).options(selectinload(Paper.authors)).offset(offset).limit(page_size)
    )
    return list(result.scalars()), total


async def increment_view(session: AsyncSession, paper_id: uuid.UUID) -> None:
    """Atomic increment — no read-modify-write race condition."""
    await session.execute(
        update(Paper)
        .where(Paper.id == paper_id)
        .values(view_count=Paper.view_count + 1)
    )
    await session.commit()


async def increment_download(session: AsyncSession, paper_id: uuid.UUID) -> None:
    """Atomic increment — no read-modify-write race condition."""
    await session.execute(
        update(Paper)
        .where(Paper.id == paper_id)
        .values(download_count=Paper.download_count + 1)
    )
    await session.commit()


async def add_author(session: AsyncSession, **kwargs: object) -> PaperAuthor:
    author = PaperAuthor(**kwargs)
    session.add(author)
    await session.flush()
    return author
