# Imperial Press

Academic publishing platform for managing journals, peer review, submissions, and open-access publication.

**Setup (dev + prod):** see **[docs/setup.md](docs/setup.md)** — start there after cloning.

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

## How environments work

| Mode | Apps (`web` / `admin` / `api`) | Infra (Postgres / Meili / Garage) |
|---|---|---|
| **Local development** | Run on your machine (hot reload) | Docker via `./scripts/compose.sh infra` |
| **Production** (and other remote envs) | Docker | Docker via `./scripts/compose.sh prod` |

**Config is global** — repo-root `.env` (secrets + app ports) and `.env.compose` (Docker `CONTAINER_*` / `HOST_*` ports). No per-app `.env` files.

**URLs are mostly derived from ports** — backend connection strings and browser-facing API/Meili URLs are built automatically from `API_PORT`, `INFRA_HOST`, and `HOST_*` in `.env.compose`. You still set **`ALLOWED_ORIGINS`** explicitly (CORS origins are not always localhost).

**Single domain:** public site at `/`, admin at `/admin`, API on its own port (`API_PORT` locally / `HOST_API_PORT` in production).

---

## Quick start

```bash
cp .env.example .env
cp .env.compose.example .env.compose
# Edit secrets in .env; adjust ports in .env / .env.compose if defaults clash
```

**Local development**

```bash
./scripts/compose.sh infra up -d          # Windows: .\scripts\compose.ps1 infra up -d

./scripts/dev-backend.sh                  # Windows: scripts\dev-backend.cmd
                                          # → sync + migrate + API on API_PORT

# Frontends (either together on Windows, or separately):
scripts\dev-frontends.cmd                 # Windows — web + admin in two windows
cd frontend-web && npm ci && npm run dev  # → http://localhost:$WEB_PORT/
cd frontend-admin && npm ci && npm run dev # → http://localhost:$ADMIN_PORT/admin/
```

Set `ALLOWED_ORIGINS` in `.env` to match your web and admin dev URLs (e.g. `http://localhost:50173,http://localhost:50174`).

**Production**

```bash
./scripts/compose.sh prod up -d --build
./scripts/compose.sh prod exec api uv run alembic upgrade head
# Site: https://$DOMAIN/  ·  Admin: https://$DOMAIN/admin/  ·  API: :$HOST_API_PORT
```

Full steps, env reference, TLS, troubleshooting, and checklists: **[docs/setup.md](docs/setup.md)**.

---

## Repository structure

```
imperial-press/
├── frontend-web/          # Public website (Next.js) — local or Docker
├── frontend-admin/        # Admin panel (React + Vite) — local or Docker
├── backend/               # REST API (FastAPI) — local or Docker
├── infra/                 # Compose, Dockerfiles, Nginx, Postgres, Garage
├── scripts/               # compose.*, dev-backend.*, dev-frontends.cmd, env helpers
├── compose.yaml           # Root Compose entry
├── .env.example           # Secrets & app config template
├── .env.compose.example   # Docker port template (CONTAINER_* + HOST_*)
└── docs/
    └── setup.md           # ← onboarding guide
```

### Dev scripts (`scripts/`)

| Script | Purpose |
|---|---|
| `compose.sh` / `compose.ps1` | Docker Compose wrapper (`infra` \| `prod` \| `cert`) — loads `.env` + `.env.compose` |
| `dev-backend.sh` / `.cmd` / `.ps1` | API: `uv sync` → migrate → uvicorn with reload |
| `dev-frontends.cmd` | Windows: `npm ci` (if needed) → start web + admin dev servers |
| `load-repo-env.mjs` | Merges repo-root env files for Node tooling |
| `resolve-env-urls.mjs` | Builds API / Meili / site URLs from ports |

---

## Architecture docs

| Document | Contents |
|---|---|
| [docs/setup.md](docs/setup.md) | **Clone → run** for local and production |
| [docs/default-admin-credentials.md](docs/default-admin-credentials.md) | Bootstrap admin email / password |
| [docs/architecture/infra.md](docs/architecture/infra.md) | Docker Compose, Nginx, SSL, backups |
| [docs/architecture/storage.md](docs/architecture/storage.md) | Garage S3, buckets, FastAPI integration |
| [docs/architecture/backend.md](docs/architecture/backend.md) | FastAPI structure, auth, DB, MeiliSearch |
| [docs/architecture/frontend-web.md](docs/architecture/frontend-web.md) | Next.js rendering strategy, route map |
| [docs/architecture/frontend-admin.md](docs/architecture/frontend-admin.md) | Admin SPA architecture |
