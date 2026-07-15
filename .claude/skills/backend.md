---
name: backend
description: Load all backend principle docs and set context before working on the FastAPI backend. Use at the start of any backend task or when you need a principles refresher.
---

Read the following docs **in order** before writing any code. They are short — do not skip.

| Doc | Covers |
|---|---|
| [coding-standards.md](../../docs/principles/backend/coding-standards.md) | Async conventions, type hints, import order, naming, `asyncio.gather` |
| [module-structure.md](../../docs/principles/backend/module-structure.md) | models → repository → service → schemas layering with code examples |
| [api-conventions.md](../../docs/principles/backend/api-conventions.md) | Paginated envelope shape, RFC 7807 errors, thin routes, status codes |
| [database.md](../../docs/principles/backend/database.md) | UUID PKs, atomic increments, Alembic-only migrations, eager loading |
| [security.md](../../docs/principles/backend/security.md) | JWT, bleach for HTML, file validation chain, IDOR ownership checks |
| [testing.md](../../docs/principles/backend/testing.md) | Real test DB, rollback-per-test session fixture, no mocks |

After reading, summarise in one sentence what the task is, confirm which principle docs are relevant, then begin.

## Stack at a glance

- FastAPI + SQLAlchemy (async) + PostgreSQL
- Alembic for migrations — never `create_all()` in production
- Pydantic v2 schemas — ORM objects never leave the service layer
- Garage (S3-compatible) for file storage via `utils/storage.py`
- MeiliSearch for full-text search
- Background workers via FastAPI `BackgroundTask` and ARQ
- JWT auth — access token short-lived, refresh token in `httpOnly` cookie
