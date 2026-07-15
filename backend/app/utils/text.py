from __future__ import annotations

import re

import bleach

ALLOWED_TAGS: list[str] = [
    "p", "strong", "em", "ul", "ol", "li", "a", "h2", "h3", "br", "blockquote"
]
ALLOWED_ATTRIBUTES: dict[str, list[str]] = {"a": ["href", "rel", "target"]}


def sanitise_html(html: str) -> str:
    return bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


def construct_doi(journal_slug: str, year: int, paper_id: str) -> str:
    return f"10.99999/{journal_slug}.{year}.{paper_id[:8]}"
