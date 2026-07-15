# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Imperial Press is an academic publishing platform (journals, peer review, submissions, open-access). It is a **monorepo with three independent apps** — no root `package.json`, no shared build pipeline.

| App | Dir | Port | Stack |
|---|---|---|---|
| Admin panel | `frontend-admin/` | 50174 | React 19 + Vite 8 + Tailwind v4 + Radix UI |
| Public website | `frontend-web/` | 50173 | Next.js 16 + React 19 + Tailwind v4 |
| REST API | `backend/` | 8000 | Python 3.14 + FastAPI + SQLAlchemy 2 + Alembic |

Backing services (PostgreSQL, MeiliSearch, Garage S3) run in Docker via `infra/compose/docker-compose.yml`.

---

## Commands

### frontend-admin

```bash
cd frontend-admin
npm run dev          # dev server → http://localhost:50174
npm run build        # tsc -b && vite build
npm run typecheck    # tsc --noEmit (no emit, fastest type check)
npm run lint         # eslint src --max-warnings 0
```

### frontend-web

```bash
cd frontend-web
npm run dev          # dev server → http://localhost:50173
npm run build        # next build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
```

### backend

```bash
cd backend
uv sync                                                        # install deps (uses uv lockfile)
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload  # dev server

# Database
uv run alembic upgrade head          # apply all migrations
uv run alembic revision --autogenerate -m "description"  # generate migration from model changes

# Tests
uv run pytest                        # all tests
uv run pytest tests/modules/journals/test_service.py  # single file
uv run pytest -k "test_create"       # tests matching a name pattern
uv run pytest -x                     # stop on first failure
```

### Backing services

```bash
cd infra/compose
docker compose up -d    # start PostgreSQL :5432, MeiliSearch :7700, Garage :3900/:3903
docker compose down     # stop
```

---

## Invoking project skills

Use these slash commands at the start of a task to load the right principles before writing code:

| Command | When to use |
|---|---|
| `/frontend-admin` | Working in `frontend-admin/` |
| `/frontend-web` | Working in `frontend-web/` |
| `/backend` | Working in `backend/` |
| `/run` | Start the admin dev server and open a browser preview |

Full principle docs live in `docs/principles/{frontend-admin,frontend-web,backend}/`.

---

## Architecture — what requires multiple files to understand

### Tailwind v4 design token system (frontend-admin and frontend-web)

Both frontends use the same pattern. Semantic colour tokens are declared once in `styles/global.css` (or `styles/globals.css`) inside `@theme {}`:

```css
@theme {
  --color-primary: var(--color-primary-800);
  --color-bg:      #ffffff;
  --color-text:    var(--color-neutral-900);
  /* … */
}
.dark {
  --color-primary: var(--color-primary-400);
  --color-bg:      var(--color-neutral-800);
  --color-text:    var(--color-neutral-100);
}
```

Dark mode is toggled by adding/removing `.dark` on `<html>` (not `prefers-color-scheme`). The store that controls this is `src/stores/uiStore.ts` (`toggleTheme`). **Never hardcode hex values in components** — always reference design tokens (`text-[var(--color-text)]`, `bg-[var(--color-bg)]`) or Tailwind scale utilities with `dark:` variants.

### Component ownership model (frontend-admin)

`src/components/ui/` holds fully-owned, Tailwind-styled wrappers around Radix primitives — there is no installed design system package. These are edited directly when restyling is needed. Pages and feature components must use these wrappers; never call Radix primitives directly outside `components/ui/`.

`cn()` in `lib/utils/cn.ts` (clsx + tailwind-merge) is the only way to compose conditional `className` strings.

### Backend domain module anatomy

Each business domain in `backend/app/modules/<domain>/` follows a strict four-file layout:

```
models.py      → SQLAlchemy ORM models
repository.py  → raw DB queries (no business logic)
service.py     → business rules, calls repository, raises domain exceptions
schemas.py     → Pydantic v2 I/O schemas (ORM objects never leave service layer)
```

Routes in `app/api/v1/routes/` are thin — they call one service function and return the Pydantic schema. Business logic, validation, IDOR checks, and side-effects (email, search index, certificates) all live in the service.

### Auth flow (both frontends)

- `POST /api/auth/admin/login` → JWT (access) + HttpOnly cookie (refresh)  
- Access token held **in memory only** (Zustand `authStore`) — never `localStorage`  
- Axios interceptor in `lib/api/` attaches `Authorization: Bearer` on every request and silently refreshes on 401  
- Admin routes also enforce a `role: admin` JWT claim server-side in `app/core/dependencies.py` (`require_role`)

### Data tables (frontend-admin)

All tables use `components/ui/data-table.tsx` (TanStack Table). A single column config drives two render paths: standard `<table>` at `md+`, stacked cards below `md`. Pagination is server-side — the table passes `page`/`pageSize` to the React Query hook, which forwards them to the API.

### Service page builder (frontend-admin)

`components/page-builder/PageBuilder.tsx` manages a JSON array of typed blocks via `@dnd-kit/core` drag-and-drop. Block data is stored as JSON in PostgreSQL; `frontend-web` deserialises and renders the matching React block components. Editing one block's schema requires updating both the admin block component and the public block renderer.

### MeiliSearch integration

The backend's `modules/search/service.py` maintains MeiliSearch indexes. Documents are indexed on publish/update in the service layer (not in routes). The public website queries MeiliSearch directly from the browser using a **search-only API key** (`NEXT_PUBLIC_MEILI_SEARCH_KEY`) — the master key is never exposed client-side.

---

## Key constraints

- **Alembic only** for schema changes — never `ALTER TABLE` directly, never `Base.metadata.create_all()` in production  
- **UUIDs** for all PKs — no sequential integer IDs on public resources  
- **Destructive actions** (delete, revoke, reject) always require confirmation via `ConfirmModal` in the admin — no single-click destructive operations  
- **All API calls** through typed wrappers in `lib/api/` — no raw `fetch`/`axios` in components  
- **Rich text** is sanitised server-side by FastAPI using `bleach` before storage — the admin trusts its own users but the API is the final sanitisation layer
