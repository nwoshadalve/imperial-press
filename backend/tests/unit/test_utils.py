from __future__ import annotations

import uuid

from app.utils.pagination import PaginatedResponse, paginate
from app.utils.text import construct_doi, sanitise_html, slugify


# ── slugify ───────────────────────────────────────────────────────────────────

def test_slugify_basic():
    assert slugify("Hello World") == "hello-world"


def test_slugify_strips_special_chars():
    assert slugify("FastAPI: A Tutorial!") == "fastapi-a-tutorial"


def test_slugify_collapses_hyphens():
    assert slugify("a  --  b") == "a-b"


def test_slugify_trims_edge_hyphens():
    assert slugify("  hello  ") == "hello"


# ── sanitise_html ─────────────────────────────────────────────────────────────

def test_sanitise_html_strips_script():
    dirty = '<script>alert("xss")</script><p>Hello</p>'
    clean = sanitise_html(dirty)
    assert "<script>" not in clean
    assert "<p>Hello</p>" in clean


def test_sanitise_html_allows_safe_tags():
    html = "<p>Hello <strong>world</strong></p>"
    assert sanitise_html(html) == html


def test_sanitise_html_strips_onclick():
    html = '<a href="http://example.com" onclick="bad()">Link</a>'
    clean = sanitise_html(html)
    assert "onclick" not in clean
    assert "href" in clean


def test_sanitise_html_strips_style():
    html = '<p style="color:red">text</p>'
    clean = sanitise_html(html)
    assert "style" not in clean


# ── construct_doi ─────────────────────────────────────────────────────────────

def test_construct_doi_format():
    paper_id = str(uuid.uuid4())
    doi = construct_doi("ijllt", 2025, paper_id)
    assert doi.startswith("10.99999/ijllt.2025.")
    assert doi.endswith(paper_id[:8])


# ── paginate ──────────────────────────────────────────────────────────────────

def test_paginate_returns_correct_shape():
    result: PaginatedResponse[str] = paginate(["a", "b"], total=10, page=2, page_size=2)
    assert result.items == ["a", "b"]
    assert result.total == 10
    assert result.page == 2
    assert result.page_size == 2


def test_paginate_empty_list():
    result = paginate([], total=0, page=1, page_size=20)
    assert result.items == []
    assert result.total == 0
