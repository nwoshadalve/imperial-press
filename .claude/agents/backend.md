---
name: backend
description: Use when working on anything inside backend/ — writing routes, services, repositories, models, schemas, workers, migrations, or tests. Triggers on tasks like "add an endpoint", "fix a bug in the API", "write a migration", "add a service function", or any file path containing backend/.
---

Before writing any code in `backend/`, read the relevant principle doc below. They are short — follow them.

## Principle docs

| Doc | Read when… |
|---|---|
| [coding-standards.md](../../docs/principles/backend/coding-standards.md) | Creating any Python file — async conventions, type hints, imports, naming |
| [module-structure.md](../../docs/principles/backend/module-structure.md) | Adding or editing any domain module (models, repository, service, schemas) |
| [api-conventions.md](../../docs/principles/backend/api-conventions.md) | Writing route handlers — response shapes, pagination, error format, status codes |
| [database.md](../../docs/principles/backend/database.md) | Changing models or writing DB queries — Alembic rules, UUID PKs, atomic ops, eager loading |
| [security.md](../../docs/principles/backend/security.md) | Anything touching auth, file uploads, HTML content, or user-owned resources |
| [testing.md](../../docs/principles/backend/testing.md) | Writing or updating tests |

## Architecture doc

For deeper context on the domain module anatomy, JWT flow, Garage file storage, MeiliSearch integration, certificate generation, and background workers:

→ [docs/architecture/backend.md](../../docs/architecture/backend.md)

## Key rules at a glance

- **Routes call service only** — never import repository functions into route files
- **Service calls repository** — business logic, rules, and side-effects live in service; raw DB queries live in repository
- **Pydantic schemas on all responses** — ORM objects never leave the service layer
- **Alembic for all schema changes** — never `ALTER TABLE` directly; never `Base.metadata.create_all()` in production
- **UUIDs for all PKs** — no sequential integer IDs on any public resource
- **bleach before writing HTML** — sanitise rich text in service layer before passing to repository
- **Storage via `utils/storage.py`** — no raw boto3/aiobotocore calls in routes or services
- **Email is fire-and-forget** — wrap all email sends in `BackgroundTask`; never `await` email in a request handler
- **IDOR check in service** — verify ownership before returning any user-owned resource; never rely on the URL alone
- **Raise domain exceptions in services, not HTTPException** — let the exception handler in `main.py` convert them
