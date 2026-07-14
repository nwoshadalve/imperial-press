# Backend Principles

## Stack

Python 3.14 · FastAPI 0.139 · SQLAlchemy 2.0 (async) · Alembic · PostgreSQL 18 · uv 0.11

## Index

| Doc | Covers |
|---|---|
| [coding-standards.md](./coding-standards.md) | Python style, type hints, async conventions, file naming |
| [module-structure.md](./module-structure.md) | Domain module anatomy (models → repository → service → schemas), what goes where |
| [api-conventions.md](./api-conventions.md) | Thin route controllers, response shapes, error format, pagination, versioning |
| [database.md](./database.md) | SQLAlchemy patterns, Alembic migration rules, UUID PKs, atomic operations |
| [security.md](./security.md) | JWT, bleach, file validation, IDOR prevention, rate limiting |
| [testing.md](./testing.md) | pytest fixtures, test DB setup, what to cover at each layer |

## Core Rules

- **Domain modules own everything** — models, repository, service, and schemas live together under `modules/<domain>/`
- **Routes call service only** — never import repository functions into route files
- **Service calls repository** — business logic, rules, and side-effects live in service; raw DB queries live in repository
- **Schemas on all responses** — all route responses return Pydantic schemas; ORM objects never leave the service layer
- **Alembic for all schema changes** — never `ALTER TABLE` directly; never `Base.metadata.create_all()` in production
- **UUIDs for all PKs** — no sequential integer IDs on any public-facing resource
- **bleach before writing HTML** — sanitise rich text in the service layer before passing to the repository
- **Storage via `utils/storage.py`** — no raw boto3/aiobotocore calls in route or service files
- **Email is fire-and-forget** — always wrap email sends in `BackgroundTask`; never `await` email inside a request handler
- **IDOR check in service** — verify ownership before returning any user-owned resource; never rely on the URL alone
