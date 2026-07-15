from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.content.models import (
    Announcement,
    BlogPost,
    CallForPapers,
    Partner,
    ServiceBlock,
    ServicePage,
    StaticPage,
)


# ── BlogPost ──────────────────────────────────────────────────────────────────

async def get_blog_post_by_id(session: AsyncSession, post_id: uuid.UUID) -> BlogPost | None:
    result = await session.execute(select(BlogPost).where(BlogPost.id == post_id))
    return result.scalar_one_or_none()


async def get_blog_post_by_slug(session: AsyncSession, slug: str) -> BlogPost | None:
    result = await session.execute(select(BlogPost).where(BlogPost.slug == slug))
    return result.scalar_one_or_none()


async def create_blog_post(session: AsyncSession, **kwargs: object) -> BlogPost:
    post = BlogPost(**kwargs)
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return post


async def update_blog_post(session: AsyncSession, post: BlogPost, **kwargs: object) -> BlogPost:
    for key, value in kwargs.items():
        setattr(post, key, value)
    await session.commit()
    await session.refresh(post)
    return post


async def list_blog_posts(session: AsyncSession) -> list[BlogPost]:
    result = await session.execute(select(BlogPost).order_by(BlogPost.created_at.desc()))
    return list(result.scalars())


# ── StaticPage ────────────────────────────────────────────────────────────────

async def get_static_page_by_slug(session: AsyncSession, slug: str) -> StaticPage | None:
    result = await session.execute(select(StaticPage).where(StaticPage.slug == slug))
    return result.scalar_one_or_none()


async def upsert_static_page(session: AsyncSession, **kwargs: object) -> StaticPage:
    slug = kwargs.get("slug")
    existing = await get_static_page_by_slug(session, str(slug))
    if existing is not None:
        for key, value in kwargs.items():
            setattr(existing, key, value)
        await session.commit()
        await session.refresh(existing)
        return existing
    page = StaticPage(**kwargs)
    session.add(page)
    await session.commit()
    await session.refresh(page)
    return page


# ── ServicePage ───────────────────────────────────────────────────────────────

async def get_service_page_by_slug(session: AsyncSession, slug: str) -> ServicePage | None:
    result = await session.execute(
        select(ServicePage)
        .options(selectinload(ServicePage.blocks))
        .where(ServicePage.slug == slug)
    )
    return result.scalar_one_or_none()


async def create_service_page(session: AsyncSession, **kwargs: object) -> ServicePage:
    page = ServicePage(**kwargs)
    session.add(page)
    await session.commit()
    await session.refresh(page)
    return page


async def create_service_block(session: AsyncSession, **kwargs: object) -> ServiceBlock:
    block = ServiceBlock(**kwargs)
    session.add(block)
    await session.commit()
    await session.refresh(block)
    return block


# ── Announcement ──────────────────────────────────────────────────────────────

async def list_announcements(session: AsyncSession, active_only: bool = True) -> list[Announcement]:
    stmt = select(Announcement)
    if active_only:
        stmt = stmt.where(Announcement.is_active.is_(True))
    result = await session.execute(stmt)
    return list(result.scalars())


async def create_announcement(session: AsyncSession, **kwargs: object) -> Announcement:
    ann = Announcement(**kwargs)
    session.add(ann)
    await session.commit()
    await session.refresh(ann)
    return ann


# ── CallForPapers ─────────────────────────────────────────────────────────────

async def list_cfps(session: AsyncSession, active_only: bool = True) -> list[CallForPapers]:
    stmt = select(CallForPapers)
    if active_only:
        stmt = stmt.where(CallForPapers.is_active.is_(True))
    result = await session.execute(stmt)
    return list(result.scalars())


async def create_cfp(session: AsyncSession, **kwargs: object) -> CallForPapers:
    cfp = CallForPapers(**kwargs)
    session.add(cfp)
    await session.commit()
    await session.refresh(cfp)
    return cfp


# ── Partner ───────────────────────────────────────────────────────────────────

async def list_partners(session: AsyncSession) -> list[Partner]:
    result = await session.execute(select(Partner).order_by(Partner.order))
    return list(result.scalars())


async def create_partner(session: AsyncSession, **kwargs: object) -> Partner:
    partner = Partner(**kwargs)
    session.add(partner)
    await session.commit()
    await session.refresh(partner)
    return partner
