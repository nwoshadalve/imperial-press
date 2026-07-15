# Testing — backend

## Overview

```
Static (mypy + ruff) → Unit (pytest, no DB) → Integration (pytest, real test DB)
        ~5s                    ~15s                        ~60s
```

The integration layer is the most important: it runs against a real PostgreSQL database (migrated to head by Alembic) and catches migration mismatches and schema drift that unit tests cannot.

---

## Test Structure

```
tests/
├── conftest.py             # Shared fixtures: engine, session, HTTP client, factory helpers
├── unit/                   # Pure function tests — no DB, no HTTP
│   ├── test_security.py    # hash_password, verify_password, encode/decode token
│   ├── test_schemas.py     # Pydantic validation, field coercion, error messages
│   └── test_utils.py       # slugify, DOI construction, pagination helper, sanitise_html
└── integration/            # Full request → DB → response cycle
    ├── test_auth.py        # login, refresh, logout
    ├── test_submissions.py
    ├── test_reviews.py
    ├── test_payments.py
    ├── test_certificates.py
    ├── test_content.py
    └── test_admin/         # Admin-only endpoints
```

---

## Fixtures (conftest.py)

```python
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.main import app
from app.core.database import get_db, Base

TEST_DB_URL = "postgresql+asyncpg://test:test@localhost:5432/imperial_test"

@pytest_asyncio.fixture(scope="session")
async def engine():
    e = create_async_engine(TEST_DB_URL)
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield e
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await e.dispose()

@pytest_asyncio.fixture
async def session(engine):
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as s:
        yield s
        await s.rollback()  # clean slate after every test

@pytest_asyncio.fixture
async def client(session):
    app.dependency_overrides[get_db] = lambda: session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
```

Each test gets a session that is **rolled back** after the test runs. No data leaks between tests; no teardown fixtures needed.

---

## Unit Tests

Test pure functions and Pydantic schema validation. No DB, no HTTP client needed.

```python
# tests/unit/test_security.py
from app.core.security import hash_password, verify_password

def test_password_round_trip():
    hashed = hash_password("StrongPass1!")
    assert verify_password("StrongPass1!", hashed)
    assert not verify_password("wrong", hashed)
```

```python
# tests/unit/test_schemas.py
import pytest
from pydantic import ValidationError
from app.modules.submissions.schemas import SubmissionCreate

def test_submission_create_requires_title():
    with pytest.raises(ValidationError):
        SubmissionCreate(title="", abstract="A valid abstract", journal_id="some-uuid")
```

---

## Integration Tests

Test the full request → service → repository → DB → response cycle.

```python
# tests/integration/test_auth.py
import pytest

@pytest.mark.asyncio
async def test_login_returns_access_token(client, session):
    # Arrange — seed a user directly via the session
    user = await create_test_user(session, email="author@test.com", password="ValidPass1!")

    # Act
    resp = await client.post("/api/v1/auth/login", json={
        "email": "author@test.com",
        "password": "ValidPass1!",
    })

    # Assert
    assert resp.status_code == 200
    assert "access_token" in resp.json()

@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client, session):
    await create_test_user(session, email="author@test.com", password="ValidPass1!")
    resp = await client.post("/api/v1/auth/login", json={
        "email": "author@test.com",
        "password": "wrong",
    })
    assert resp.status_code == 401
```

---

## What to Test at Each Layer

### Unit tests

- `core/security.py` — token encode/decode, password hash/verify
- `modules/*/schemas.py` — Pydantic validation for boundary inputs (empty strings, max lengths, invalid formats)
- `utils/` — slugify, DOI construction, file size validator, pagination helper, `sanitise_html`

### Integration tests

- Every route's happy path (correct input → expected status code and response shape)
- Auth enforcement: missing token → 401, wrong role → 403
- IDOR check: user A cannot access user B's submission, payment, or certificate
- Paginated list endpoints: correct `total`, right number of `items`
- Status transition rules: cannot accept a draft submission, cannot revoke a non-existent certificate
- File upload validation: wrong extension → 422, oversized file → 413

---

## Test Naming

| Thing | Convention | Example |
|---|---|---|
| Test file | `test_<domain>.py` | `test_submissions.py` |
| Test function | `test_<what_it_verifies>` | `test_login_returns_access_token` |
| Description | Plain sentence, no "should" | `test_reject_fails_without_admin_role` |

---

## Do Not

- Do not mock the database in integration tests — use the real test DB; mocked tests have hidden the prod schema before
- Do not use `Base.metadata.create_all()` in the test session — run `alembic upgrade head` against the test DB so the schema matches production exactly
- Do not share state between tests — each test rolls back its session
- Do not assert on internal ORM object fields — assert on HTTP responses or schema output

---

## Commands

```bash
# Type check
uv run mypy app/

# Lint
uv run ruff check app/

# All tests
uv run pytest

# Unit only
uv run pytest tests/unit/

# Integration only
uv run pytest tests/integration/ -v

# Specific file
uv run pytest tests/integration/test_submissions.py -v
```

## CI Order

```
1. uv run mypy app/
2. uv run ruff check app/
3. uv run pytest tests/unit/
4. uv run alembic upgrade head   ← against test DB, ensures schema matches migrations
5. uv run pytest tests/integration/
```
