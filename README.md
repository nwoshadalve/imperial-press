# Imperial Press

Academic publishing platform for managing journals, peer review, submissions, and open-access publication.

---

## Stack

| Layer | Technology |
|---|---|
| Public website | Next.js 16.2 · React 19.2 · TypeScript 6.0 · Tailwind CSS 4.3 |
| Admin panel | React 19.2 · Vite 8.1 · TypeScript 6.0 · Tailwind CSS 4.3 · Radix UI |
| API | Python 3.14 · FastAPI 0.139 · SQLAlchemy 2.0 · Alembic |
| Database | PostgreSQL 18 |
| Search | MeiliSearch 1.48 |
| Object storage | Garage v2.3.0 (S3-compatible) |
| Reverse proxy | Nginx 1.27 · Let's Encrypt (Certbot) |
| Runtime | Docker · Docker Compose · Ubuntu 24.04 LTS |

---

## Repository Structure

```
imperial-press/
├── frontend-web/     # Public website (Next.js) — imperialpress.com
├── frontend-admin/   # Admin panel (React + Vite) — admin.imperialpress.com
├── backend/          # REST API (FastAPI) — api.imperialpress.com
├── docs/
│   ├── architecture/ # Per-service architecture docs
│   └── prd/          # Product requirements
└── .env.example      # Environment variable template
```

Each app manages its own dependencies independently — there is no root `package.json` or npm workspaces yet. `packages/` (shared types, shared UI, shared tsconfig/eslint config), `infra/` (Docker Compose, Nginx, Garage, MeiliSearch config), and `scripts/` (one-off setup scripts) are planned but not yet scaffolded.

---

## Development Setup

In development, the three backing services (PostgreSQL, MeiliSearch, Garage) run in Docker. The three applications (web, admin, API) run locally for hot reload.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 24 LTS
- Python 3.14 + [uv](https://docs.astral.sh/uv/)

### 1. Environment

```bash
cp .env.example .env
# Fill in secrets — see .env.example for descriptions
```

### 2. Start backing services

```bash
cd infra/compose
docker compose up -d
```

This starts PostgreSQL (`:5432`), MeiliSearch (`:7700`), and Garage (`:3900`, `:3903`) with ports exposed locally. The MeiliSearch web UI is available at `http://localhost:7700`.

### 3. Run the API

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Run the public website

```bash
cd frontend-web
npm ci
npm run dev
# → http://localhost:50173
```

### 5. Run the admin panel

```bash
cd frontend-admin
npm ci
npm run dev
# → http://localhost:50174
```

---

## Production Deployment

All services run in Docker. See [docs/architecture/infra.md](docs/architecture/infra.md) for the full runbook including SSL certificate issuance and Garage bucket setup.

```bash
# Build and start everything
docker compose \
  -f infra/compose/docker-compose.yml \
  -f infra/compose/docker-compose.prod.yml \
  up -d --build

# Apply database migrations
docker compose -f infra/compose/docker-compose.yml exec api \
  uv run alembic upgrade head
```

Deploying a new version:

```bash
git pull origin main
docker compose \
  -f infra/compose/docker-compose.yml \
  -f infra/compose/docker-compose.prod.yml \
  up -d --build --no-deps web admin api
docker compose -f infra/compose/docker-compose.yml exec api \
  uv run alembic upgrade head
```

---

## Architecture Docs

| Document | Contents |
|---|---|
| [docs/architecture/infra.md](docs/architecture/infra.md) | Docker Compose, Nginx, deployment runbook, SSL, backups |
| [docs/architecture/storage.md](docs/architecture/storage.md) | Garage S3, bucket structure, presigned URLs, FastAPI integration |
| [docs/architecture/backend.md](docs/architecture/backend.md) | FastAPI structure, modules, auth, DB, MeiliSearch integration |
| [docs/architecture/frontend-web.md](docs/architecture/frontend-web.md) | Next.js rendering strategy (SSG/ISR/SSR/CSR), route map |
| [docs/architecture/frontend-admin.md](docs/architecture/frontend-admin.md) | Admin SPA, Tailwind + Radix UI (shadcn/ui pattern) architecture |
