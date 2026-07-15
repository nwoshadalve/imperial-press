from __future__ import annotations

import logging

import meilisearch

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_meilisearch_client() -> meilisearch.Client:
    """Return a configured MeiliSearch client using the master key."""
    return meilisearch.Client(
        url=settings.meilisearch_url,
        api_key=settings.meilisearch_master_key or None,
    )
