# Setup Guide — Imperial Press

How to run this repo after a fresh clone: **local development** (apps on your machine, infra in Docker) or **production** (everything in Docker).

---

## Two modes

| Mode | Where apps run | Where Postgres / MeiliSearch / Garage run | When to use |
|---|---|---|---|
| **Local development** | Host (`frontend-web`, `frontend-admin`, `backend`) | Docker | Day-to-day coding with hot reload |
| **Production** (staging, VM, etc.) | Docker (`web`, `admin`, `api`, `nginx`) | Docker | Any non-local environment |

```
Local development                         Production
─────────────────                         ──────────
  Next.js  :50173  (/)     ─┐               Nginx :80/:443
  Vite     :50174  (/admin) ┼─► host          ├─► /        → web
  FastAPI  :8000            ─┘                └─► /admin/  → admin
                                                     API :8000 (host port)
         │                                      │
         ▼                                      ▼
  ┌─────────────────┐                    ┌─────────────────┐
  │ Docker          │                    │ Docker          │
  │  Postgres :5433 │                    │  Postgres       │
  │  Meili    :7700 │                    │  MeiliSearch    │
  │  Garage   :3900 │                    │  Garage         │
  └─────────────────┘                    │  (internal only)│
                                         └─────────────────┘
```

Local Postgres is published on host port **5433** by default (`HOST_POSTGRES_PORT`) so it does not collide with a system Postgres on `5432`. Inside Docker the container still listens on `5432`.

**Routing model (single domain, no subdomains):**

| Surface | Path / port | App |
|---|---|---|
| Public website | `/` | `frontend-web` |
| Admin panel | `/admin` (`ADMIN_BASE_PATH`) | `frontend-admin` |
| REST API | dedicated port (`API_PORT` / `HOST_API_PORT`) | `backend` |

All secrets and app config live in the **repo-root** `.env`. Docker host ports live in `.env.compose`. Do **not** create `.env` files inside `backend/`, `frontend-web/`, or `frontend-admin/`.

---

## Prerequisites

### Local development

| Tool | Version | Notes |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | current | Compose V2 included |
| [Node.js](https://nodejs.org/) | 24 LTS | for web + admin |
| [Python](https://www.python.org/) | 3.14 | for the API |
| [uv](https://docs.astral.sh/uv/) | latest | Python package manager |

### Production host

| Tool | Version |
|---|---|
| Docker Engine + Compose plugin | current |
| Git | current |

---

## 1. Clone and env files (both modes)

```bash
git clone <repo-url> imperial-press
cd imperial-press

cp .env.example .env
cp .env.compose.example .env.compose
```

Edit `.env`:

- Set strong values for `DB_PASSWORD`, `SECRET_KEY`, `MEILISEARCH_MASTER_KEY`
- Keep local URL defaults for hybrid development (`DOMAIN=localhost`, `DATABASE_URL=...@localhost:5433`, API at `http://localhost:8000`, …)
- For production, set real `DOMAIN`, `CERTBOT_EMAIL`, SMTP, Garage keys, and public API URLs (`NEXT_PUBLIC_API_BASE_URL` / `VITE_API_BASE_URL` → `http://$DOMAIN:$HOST_API_PORT`)

Edit `.env.compose` if default host ports clash (e.g. another Postgres already on `5433`). Whenever you change `HOST_POSTGRES_PORT`, update `DATABASE_URL` and `TEST_DATABASE_URL` in `.env` to the same host port.

Always use the helper scripts so both env files are loaded:

```bash
# Linux / macOS
./scripts/compose.sh …

# Windows (PowerShell)
.\scripts\compose.ps1 …
```

Shortcuts:

| Command | Meaning |
|---|---|
| `… infra <args>` | Local hybrid — Postgres, MeiliSearch, Garage (+ published ports) |
| `… prod <args>` | Full stack in Docker (apps + nginx + infra) |
| `… cert <args>` | Certbot profile (TLS issuance / renew) |

---

## 2. Local development setup

### 2.1 Start backing services

```bash
./scripts/compose.sh infra up -d
# Windows: .\scripts\compose.ps1 infra up -d
```

This starts **only** `db`, `search`, and `storage`. Apps are not containerized.

Check:

| Service | URL |
|---|---|
| PostgreSQL | `localhost:${HOST_POSTGRES_PORT}` (default `5433`) |
| MeiliSearch UI | http://localhost:${HOST_MEILI_PORT} (default `7700`) |
| Garage S3 | `localhost:${HOST_GARAGE_S3_PORT}` (default `3900`) |
| Garage admin | `localhost:${HOST_GARAGE_ADMIN_PORT}` (default `3903`) |

Stop later with:

```bash
./scripts/compose.sh infra down
```

### 2.2 API (backend)

One command for first-time and everyday local use — installs deps, applies migrations, then starts the API with **live reload**:

```bash
./scripts/dev-backend.sh
# Windows CMD:     scripts\dev-backend.cmd
# Windows PowerShell: .\scripts\dev-backend.ps1
```

→ http://localhost:8000 (port from `API_PORT` in `.env`; Swagger at `/docs` when `ENABLE_SWAGGER=true`)

The script runs `uv sync` → `alembic upgrade head` → `uvicorn … --reload`. Safe to re-run anytime (sync and migrate are idempotent). Requires infra up (§2.1). The API reads the repo-root `.env` automatically (`DATABASE_URL`, `MEILISEARCH_URL`, `GARAGE_ENDPOINT` should point at `localhost`).

On startup the API seeds a default admin if that email is not already registered. Credentials: [default-admin-credentials.md](./default-admin-credentials.md).

### 2.3 Public website (frontend-web)

```bash
cd frontend-web
npm ci
npm run dev
```

→ http://localhost:50173 (port from `WEB_PORT` in `.env`)

### 2.4 Admin panel (frontend-admin)

```bash
cd frontend-admin
npm ci
npm run dev
```

→ http://localhost:50174/admin/ (port from `ADMIN_PORT`; path from `ADMIN_BASE_PATH`, default `/admin`)

The Vite `base` and React Router basename both come from `ADMIN_BASE_PATH`, so local and production share the same `/admin` URL prefix.

### 2.5 Local checklist

- [ ] `.env` and `.env.compose` exist at repo root  
- [ ] `DOMAIN=localhost` and API URLs point at `http://localhost:8000`  
- [ ] `./scripts/compose.sh infra up -d` is healthy  
- [ ] `./scripts/dev-backend.sh` (or `dev-backend.cmd` / `.ps1` on Windows) starts the API (sync + migrate + live reload)  
- [ ] Web and admin each start with hot reload (`npm run dev`)  
- [ ] CORS: `ALLOWED_ORIGINS` includes `http://localhost:50173` and `http://localhost:50174`

### 2.6 Optional one-time infra bootstrap

After first Garage start, create buckets and access keys (needed before file uploads work). See [storage.md](./architecture/storage.md) §8 and [infra.md](./architecture/infra.md) deployment runbook.

Generate a MeiliSearch search-only key and put it in `.env` as `MEILISEARCH_SEARCH_KEY` / `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` when search is wired up.

---

## 3. Production setup (everything in Docker)

Use this on a VM / staging / any environment where you do not run Node or Python on the host.

### 3.1 Prepare `.env` for production

At minimum:

- Strong `DB_PASSWORD`, `SECRET_KEY`, Meili keys  
- Real `DOMAIN`, `CERTBOT_EMAIL`  
- Public URLs for the browser:

```bash
DOMAIN=example.com
ADMIN_BASE_PATH=/admin
NEXT_PUBLIC_API_BASE_URL=http://example.com:8000
NEXT_PUBLIC_MEILISEARCH_HOST=https://…   # or your exposed search endpoint policy
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=…
VITE_API_BASE_URL=http://example.com:8000
GARAGE_PUBLIC_ASSETS_ENDPOINT=https://example.com/assets
ALLOWED_ORIGINS=https://example.com
ENABLE_SWAGGER=false
```

Point DNS for `DOMAIN` (and optional `www`) at the host before requesting certificates. Open `HOST_API_PORT` (default `8000`) for the API.

### 3.2 Build and start the full stack

```bash
./scripts/compose.sh prod up -d --build
./scripts/compose.sh prod exec api uv run alembic upgrade head
```

Services: `db`, `search`, `storage`, `api`, `web`, `admin`, `nginx`.

| Public URL | Backend |
|---|---|
| `https://$DOMAIN/` | Next.js (`web`) |
| `https://$DOMAIN/admin/` | Admin SPA (`admin`) |
| `http://$DOMAIN:$HOST_API_PORT` | FastAPI (`api`) |

### 3.3 TLS certificates (first time)

HTTP must already reach Nginx on port 80 (or use a temporary HTTP-only period). Then:

```bash
./scripts/compose.sh cert run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d imperialpress.com -d www.imperialpress.com \
  --email admin@imperialpress.com --agree-tos --no-eff-email
```

Reload Nginx after certs exist:

```bash
./scripts/compose.sh prod exec nginx nginx -s reload
```

### 3.4 Deploy a new version

```bash
git pull origin main
./scripts/compose.sh prod up -d --build --no-deps web admin api
./scripts/compose.sh prod exec api uv run alembic upgrade head
```

### 3.5 Production checklist

- [ ] Secrets rotated away from example placeholders  
- [ ] `DOMAIN` resolves to the host  
- [ ] `prod up -d --build` healthy  
- [ ] Migrations applied  
- [ ] TLS issued and Nginx reloaded  
- [ ] API reachable on `HOST_API_PORT`  
- [ ] Garage buckets + API keys configured ([storage.md](./architecture/storage.md))  

---

## 4. Common commands

| Task | Local | Production |
|---|---|---|
| Start Docker pieces | `./scripts/compose.sh infra up -d` | `./scripts/compose.sh prod up -d --build` |
| Stop Docker pieces | `./scripts/compose.sh infra down` | `./scripts/compose.sh prod down` |
| Logs | `./scripts/compose.sh infra logs -f` | `./scripts/compose.sh prod logs -f api` |
| Start API (live reload) | `./scripts/dev-backend.sh` (Windows: `scripts\dev-backend.cmd` or `.\scripts\dev-backend.ps1`) | — (use Compose `api`) |
| Migrate DB | `cd backend && uv run alembic upgrade head` | `./scripts/compose.sh prod exec api uv run alembic upgrade head` |
| Shell in API | — | `./scripts/compose.sh prod exec api sh` |

---

## 5. Environment reference

| File | Committed? | Purpose |
|---|---|---|
| `.env.example` | yes | Template for secrets + app config |
| `.env` | **no** | Your real secrets (apps + Compose) |
| `.env.compose.example` | yes | Template for host publish ports |
| `.env.compose` | **no** | Host ports for Docker publishes |

Important local (hybrid) values:

| Variable | File | Typical local value |
|---|---|---|
| `DOMAIN` | `.env` | `localhost` |
| `ADMIN_BASE_PATH` | `.env` | `/admin` |
| `HOST_POSTGRES_PORT` | `.env.compose` | `5433` (container remains `5432`) |
| `DATABASE_URL` | `.env` | `postgresql+asyncpg://…@localhost:5433/imperial_press` (must match `HOST_POSTGRES_PORT`) |
| `MEILISEARCH_URL` | `.env` | `http://localhost:7700` |
| `GARAGE_ENDPOINT` | `.env` | `http://localhost:3900` |
| `NEXT_PUBLIC_API_BASE_URL` / `VITE_API_BASE_URL` | `.env` | `http://localhost:8000` |
| `WEB_PORT` / `ADMIN_PORT` / `API_PORT` | `.env` | `50173` / `50174` / `8000` |
| `ALLOWED_ORIGINS` | `.env` | `http://localhost:50173,http://localhost:50174` |

In production Compose, the API container ignores host `DATABASE_URL` for the DB host and uses `db:5432` on the internal network (set in Compose). Browser-facing `NEXT_PUBLIC_*` / `VITE_*` must point at the public API host:port. Nginx only terminates TLS for the site domain (`/` and `/admin/`).

---

## 6. Troubleshooting

**Compose says missing `.env` / `.env.compose`**  
Create them from the `.example` files at the repo root.

**API cannot connect to Postgres**  
Ensure `infra up` is running, `DATABASE_URL` uses `localhost` with the same port as `HOST_POSTGRES_PORT` in `.env.compose` (default `5433`), and `DB_PASSWORD` matches `.env`.

**Port already in use**  
Change the conflicting `HOST_*` value in `.env.compose` (or `WEB_PORT` / `ADMIN_PORT` / `API_PORT` in `.env`) and restart. For Postgres, set `HOST_POSTGRES_PORT` and mirror that port in `DATABASE_URL` / `TEST_DATABASE_URL`, then recreate the `db` service (`… infra up -d --force-recreate db`).

**Admin 404 on refresh under `/admin/...`**  
Confirm Vite was built with `ADMIN_BASE_PATH=/admin` and Nginx has `location /admin/` proxying to the admin container.

**Admin / web missing env vars**  
They load the **root** `.env` (Vite `envDir`, Next `loadEnvConfig` + `scripts/next-with-root-env.mjs`). Do not add app-local `.env` files.

**Production Nginx SSL errors**  
Certs missing under the certbot volume — run the `cert` flow in §3.3, then reload Nginx.

---

## 7. Further reading

| Doc | Contents |
|---|---|
| [architecture/infra.md](./architecture/infra.md) | Compose, Nginx, SSL, backups |
| [architecture/storage.md](./architecture/storage.md) | Garage buckets and keys |
| [architecture/backend.md](./architecture/backend.md) | FastAPI layout |
| [default-admin-credentials.md](./default-admin-credentials.md) | Bootstrap admin email / password |
| [architecture/frontend-web.md](./architecture/frontend-web.md) | Next.js routing / rendering |
| [architecture/frontend-admin.md](./architecture/frontend-admin.md) | Admin SPA architecture |
| [principles/](./principles/) | Coding standards per app |
