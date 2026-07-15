from __future__ import annotations

import logging
import uuid

from app.modules.search.client import get_meilisearch_client

logger = logging.getLogger(__name__)

_PAPERS_INDEX = "papers"
_JOURNALS_INDEX = "journals"
_BLOG_INDEX = "blog_posts"


async def index_paper(paper: object) -> None:
    """Add or update a paper document in MeiliSearch."""
    from app.modules.papers.models import Paper

    if not isinstance(paper, Paper):
        return
    client = get_meilisearch_client()
    index = client.index(_PAPERS_INDEX)
    document = {
        "id": str(paper.id),
        "title": paper.title,
        "abstract": paper.abstract,
        "doi": paper.doi,
        "is_published": paper.is_published,
    }
    index.add_documents([document])
    logger.info("Indexed paper %s in MeiliSearch", paper.id)


async def remove_paper(paper_id: uuid.UUID) -> None:
    """Remove a paper document from MeiliSearch."""
    client = get_meilisearch_client()
    index = client.index(_PAPERS_INDEX)
    index.delete_document(str(paper_id))
    logger.info("Removed paper %s from MeiliSearch", paper_id)


async def index_blog_post(post: object) -> None:
    """Add or update a blog post document in MeiliSearch."""
    from app.modules.content.models import BlogPost

    if not isinstance(post, BlogPost):
        return
    client = get_meilisearch_client()
    index = client.index(_BLOG_INDEX)
    document = {
        "id": str(post.id),
        "title": post.title,
        "slug": post.slug,
        "body": post.body,
        "is_published": post.is_published,
    }
    index.add_documents([document])
    logger.info("Indexed blog post %s in MeiliSearch", post.id)


async def remove_blog_post(post_id: uuid.UUID) -> None:
    """Remove a blog post document from MeiliSearch."""
    client = get_meilisearch_client()
    index = client.index(_BLOG_INDEX)
    index.delete_document(str(post_id))
    logger.info("Removed blog post %s from MeiliSearch", post_id)
