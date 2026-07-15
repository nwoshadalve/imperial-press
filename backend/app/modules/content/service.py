from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.modules.content import repository as content_repo
from app.modules.content.schemas import (
    AnnouncementCreate,
    AnnouncementPublic,
    BlogPostCreate,
    BlogPostPublic,
    BlogPostUpdate,
    CallForPapersCreate,
    CallForPapersPublic,
    PartnerCreate,
    PartnerPublic,
    ServiceBlockCreate,
    ServiceBlockPublic,
    ServicePageCreate,
    ServicePagePublic,
    StaticPageCreate,
    StaticPagePublic,
    StaticPageUpdate,
)
from app.modules.users.models import User
from app.utils.text import sanitise_html

logger = logging.getLogger(__name__)


# ── BlogPost ──────────────────────────────────────────────────────────────────

async def create_blog_post(
    session: AsyncSession, data: BlogPostCreate, author: User
) -> BlogPostPublic:
    existing = await content_repo.get_blog_post_by_slug(session, data.slug)
    if existing is not None:
        raise ConflictError("Blog post slug already exists")
    safe_body = sanitise_html(data.body)
    published_at = datetime.now(UTC) if data.is_published else None
    post = await content_repo.create_blog_post(
        session,
        title=data.title,
        slug=data.slug,
        body=safe_body,
        is_published=data.is_published,
        author_id=author.id,
        published_at=published_at,
    )
    return BlogPostPublic.model_validate(post)


async def get_blog_post(session: AsyncSession, post_id: uuid.UUID) -> BlogPostPublic:
    post = await content_repo.get_blog_post_by_id(session, post_id)
    if post is None:
        raise NotFoundError("Blog post not found")
    return BlogPostPublic.model_validate(post)


async def update_blog_post(
    session: AsyncSession, post_id: uuid.UUID, data: BlogPostUpdate
) -> BlogPostPublic:
    post = await content_repo.get_blog_post_by_id(session, post_id)
    if post is None:
        raise NotFoundError("Blog post not found")
    updates = data.model_dump(exclude_none=True)
    if "body" in updates:
        updates["body"] = sanitise_html(updates["body"])
    if updates.get("is_published") and not post.is_published:
        updates["published_at"] = datetime.now(UTC)
    post = await content_repo.update_blog_post(session, post, **updates)
    return BlogPostPublic.model_validate(post)


async def list_blog_posts(session: AsyncSession) -> list[BlogPostPublic]:
    posts = await content_repo.list_blog_posts(session)
    return [BlogPostPublic.model_validate(p) for p in posts]


# ── StaticPage ────────────────────────────────────────────────────────────────

async def upsert_static_page(
    session: AsyncSession, data: StaticPageCreate
) -> StaticPagePublic:
    safe_body = sanitise_html(data.body)
    page = await content_repo.upsert_static_page(
        session, slug=data.slug, title=data.title, body=safe_body
    )
    return StaticPagePublic.model_validate(page)


async def update_static_page_by_slug(
    session: AsyncSession, slug: str, data: StaticPageUpdate
) -> StaticPagePublic:
    page = await content_repo.get_static_page_by_slug(session, slug)
    if page is None:
        raise NotFoundError("Static page not found")
    updates = data.model_dump(exclude_none=True)
    if "body" in updates:
        updates["body"] = sanitise_html(updates["body"])
    page = await content_repo.upsert_static_page(session, slug=slug, **updates)
    return StaticPagePublic.model_validate(page)


# ── ServicePage ───────────────────────────────────────────────────────────────

async def create_service_page(
    session: AsyncSession, data: ServicePageCreate
) -> ServicePagePublic:
    existing = await content_repo.get_service_page_by_slug(session, data.slug)
    if existing is not None:
        raise ConflictError("Service page slug already exists")
    page = await content_repo.create_service_page(session, **data.model_dump())
    return ServicePagePublic.model_validate(page)


async def add_service_block(
    session: AsyncSession, data: ServiceBlockCreate
) -> ServiceBlockPublic:
    block = await content_repo.create_service_block(session, **data.model_dump())
    return ServiceBlockPublic.model_validate(block)


# ── Announcement ──────────────────────────────────────────────────────────────

async def create_announcement(
    session: AsyncSession, data: AnnouncementCreate
) -> AnnouncementPublic:
    safe_body = sanitise_html(data.body)
    ann = await content_repo.create_announcement(
        session, title=data.title, body=safe_body, is_active=data.is_active
    )
    return AnnouncementPublic.model_validate(ann)


async def list_announcements(
    session: AsyncSession, active_only: bool = True
) -> list[AnnouncementPublic]:
    anns = await content_repo.list_announcements(session, active_only)
    return [AnnouncementPublic.model_validate(a) for a in anns]


# ── CallForPapers ─────────────────────────────────────────────────────────────

async def create_cfp(
    session: AsyncSession, data: CallForPapersCreate
) -> CallForPapersPublic:
    safe_body = sanitise_html(data.body)
    cfp = await content_repo.create_cfp(
        session,
        title=data.title,
        body=safe_body,
        deadline=data.deadline,
        journal_id=data.journal_id,
        is_active=data.is_active,
    )
    return CallForPapersPublic.model_validate(cfp)


async def list_cfps(
    session: AsyncSession, active_only: bool = True
) -> list[CallForPapersPublic]:
    cfps = await content_repo.list_cfps(session, active_only)
    return [CallForPapersPublic.model_validate(c) for c in cfps]


# ── Partner ───────────────────────────────────────────────────────────────────

async def create_partner(
    session: AsyncSession, data: PartnerCreate
) -> PartnerPublic:
    partner = await content_repo.create_partner(session, **data.model_dump())
    return PartnerPublic.model_validate(partner)


async def list_partners(session: AsyncSession) -> list[PartnerPublic]:
    partners = await content_repo.list_partners(session)
    return [PartnerPublic.model_validate(p) for p in partners]
