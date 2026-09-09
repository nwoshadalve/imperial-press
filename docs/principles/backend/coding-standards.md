# Coding Standards — backend

## Copyright Notice

Every Python source file in `backend/` must begin with the following module docstring (before `from __future__ import annotations`, imports, or other code):

```python
"""Copyright (c) 2026 Imperial Press. All rights reserved.

Developed by MD Nwoshad Alam Chowdhury.
"""
```

Apply this to all `.py` files under `app/`, `tests/`, and `alembic/`.

## Language

- **Python 3.14** — use modern syntax: `X | Y` union types, `match/case`, `TypeAlias`
- **Type hints everywhere** — every function signature, every variable where the type is not immediately obvious
- `from __future__ import annotations` at the top of every file for forward references
- No bare `except:` — always catch specific exception types

## Async

The FastAPI app is fully async. All route handlers and all functions that do I/O must be `async def`.

- All route handlers: `async def`
- All service functions that call the repository or do I/O: `async def`
- All repository functions: `async def` (they use `await session.execute()`)
- **Never call `asyncio.run()` inside a request handler** — the event loop is already running
- Use `asyncio.gather()` for concurrent I/O within a single request rather than sequential awaits

```python
# Good — concurrent DB reads
user, submission = await asyncio.gather(
    user_repo.get_by_id(session, user_id),
    submission_repo.get_by_id(session, submission_id),
)

# Bad — sequential when they could run concurrently
user = await user_repo.get_by_id(session, user_id)
submission = await submission_repo.get_by_id(session, submission_id)
```

## File & Folder Naming

| Thing | Convention | Example |
|---|---|---|
| Python module files | snake_case (one word per layer) | `service.py`, `repository.py`, `models.py`, `schemas.py` |
| Classes | PascalCase | `SubmissionService`, `UserRepository` |
| Functions | snake_case | `get_submission_by_id`, `publish_paper` |
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE_MB` |
| Domain folders | snake_case | `modules/submissions/` |

## Imports

Group in this order (isort/ruff enforced):

1. Standard library
2. Third-party (`fastapi`, `sqlalchemy`, `pydantic`, `bleach`)
3. Internal (`app.core`, `app.modules`, `app.utils`)

```python
from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.modules.submissions.repository import get_by_id
from app.modules.submissions.schemas import SubmissionPublic
```

## Functions

- One responsibility per function
- All public functions have a return type annotation
- Keep functions under ~50 lines; split at logical boundaries
- Raise specific custom exceptions from `core/exceptions.py` from service functions — never `raise HTTPException` inside a service

```python
async def publish_paper(session: AsyncSession, paper_id: uuid.UUID) -> PaperPublic:
    paper = await paper_repo.get_by_id(session, paper_id)
    if paper is None:
        raise NotFoundError("Paper not found")
    paper.is_published = True
    await session.commit()
    return PaperPublic.model_validate(paper)
```

## Config

All configuration comes from the **repo-root** `.env` and `.env.compose` (with their `.example` templates). Load it only through `app/core/config.py` via `pydantic-settings`. Never hardcode URLs, secrets, ports, feature flags, or other environment-specific values in application code — and never put defaults for those values on the `Settings` class. Do not add `backend/.env` or other per-app env files.

`Settings` resolves the monorepo root and loads `.env.compose.example` → `.env.compose` → `.env.example` → `.env` when those files exist. For local hybrid development it builds `DATABASE_URL`, `MEILISEARCH_URL`, and `GARAGE_ENDPOINT` from `INFRA_HOST` plus the `HOST_*` ports in `.env.compose`. `ALLOWED_ORIGINS` is always set explicitly in `.env` (browser origins are not always derivable from ports). In Docker production the API container receives explicit `DATABASE_URL` from Compose via process environment.

```python
from app.core.config import settings

# Good
url = settings.garage_endpoint

# Bad — hardcoded, bypasses .env
url = "http://localhost:3900"
```

Copy root `.env.example` → `.env` for local development. Tests read `TEST_DATABASE_URL` from the environment (falling back to `DATABASE_URL`).

## Logging

Use the Python `logging` module. Never use `print()`.

```python
import logging

logger = logging.getLogger(__name__)
logger.info("Certificate generated for submission %s", submission_id)
```

## Do Not

- Do not use `Any` type annotation
- Do not use bare `except:` or `except Exception:` without re-raising or specific handling
- Do not call `session.execute()` with a raw SQL f-string — use the SQLAlchemy ORM or `text()` (only in migrations)
- Do not access the repository from a route function
- Do not raise `HTTPException` in a service — raise domain exceptions; let the exception handler in `main.py` convert them
- Do not `print()` — use `logging`
- Do not commit commented-out code
