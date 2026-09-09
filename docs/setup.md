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
  Next.js  :WEB_PORT     (/)     ─┐       Nginx :HOST_HTTP/:HOST_HTTPS
  Vite     :ADMIN_PORT   (/admin) ┼─► host    ├─► /        → web
  FastAPI  :API_PORT              ─┘           └─► /admin/  → admin
                                                     API :HOST_API_PORT
         │                                      │
         ▼                                      ▼
  ┌─────────────────┐                    ┌─────────────────┐
  │ Docker          │                    │ Docker          │
  │  Postgres       │                    │  Postgres       │
  │  MeiliSearch    │                    │  MeiliSearch    │
  │  Garage         │                    │  Garage         │
  │  (HOST_* ports) │                    │  (internal)     │
  └─────────────────┘                    └─────────────────┘
```

Default example ports are in `.env.example` / `.env.compose.example` (`WEB_PORT=50173`, `HOST_POSTGRES_PORT=5433`, etc.). Change them in your `.env` / `.env.compose` if they clash with other services.

**Routing model (single domain, no subdomains):**

| Surface | Path / port | App |
|---|---|---|
| Public website | `/` | `frontend-web` |
| Admin panel | `/admin` (`ADMIN_BASE_PATH`) | `frontend-admin` |
| REST API | dedicated port (`API_PORT` / `HOST_API_PORT`) | `backend` |

All secrets and app config live in the **repo-root** `.env`. Docker host and container ports live in `.env.compose`. Do **not** create `.env` files inside `backend/`, `frontend-web/`, or `frontend-admin/`.

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

- Set strong values for `DB_PASSWORD`, `SECRET_KEY`, `MEILISEARCH_MASTER_KEY`, `MEILISEARCH_SEARCH_KEY`
- Set `WEB_PORT`, `ADMIN_PORT`, `API_PORT`, and `INFRA_HOST` for local hybrid dev
- Set **`ALLOWED_ORIGINS`** to match your browser origins (e.g. `http://localhost:50173,http://localhost:50174` — update if you change `WEB_PORT` / `ADMIN_PORT`)
- For production, set real `DOMAIN`, `CERTBOT_EMAIL`, SMTP, Garage keys, and `ALLOWED_ORIGINS=https://$DOMAIN`

Edit `.env.compose` if Docker publish ports clash (e.g. another Postgres already on `5433`). You do **not** need to hand-edit `DATABASE_URL` when you change `HOST_POSTGRES_PORT` — the backend builds it from `INFRA_HOST` + `HOST_POSTGRES_PORT`.

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
| `… infra <args>` | Local hybrid — Postgres, MeiliSearch, Garage on `Imperial-press-network` |
| `… prod <args>` | Full stack in Docker (apps + nginx + infra) |
| `… cert <args>` | Certbot profile (TLS issuance / renew) |

---

## 2. Local development setup

### 2.1 Start backing services

```bash
./scripts/compose.sh infra up -d
# Windows: .\scripts\compose.ps1 infra up -d
```

This starts **only** `db`, `search`, and `storage`. Apps are not containerized. All infra services share the Docker network `Imperial-press-network`.

Check (ports from your `.env.compose`):

| Service | URL |
|---|---|
| PostgreSQL | `localhost:${HOST_POSTGRES_PORT}` (default `5433`) |
| MeiliSearch UI | `http://localhost:${HOST_MEILI_PORT}` (default `7700`) |
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
# Windows CMD:        scripts\dev-backend.cmd
# Windows PowerShell: .\scripts\dev-backend.ps1
```

→ `http://localhost:${API_PORT}` (Swagger at `/docs` when `ENABLE_SWAGGER=true`)

The script runs `uv sync` → `alembic upgrade head` → `uvicorn … --reload`. Safe to re-run anytime. Requires infra up (§2.1).

The API loads repo-root `.env` + `.env.compose` and **auto-builds** `DATABASE_URL`, `TEST_DATABASE_URL`, `MEILISEARCH_URL`, and `GARAGE_ENDPOINT` from `INFRA_HOST` and `HOST_*` ports.

On startup the API seeds a default admin if that email is not already registered. Credentials: [default-admin-credentials.md](./default-admin-credentials.md).

### 2.3 Frontends (web + admin)

**Windows — both at once:**

```cmd
scripts\dev-frontends.cmd
```

Runs `npm ci` in each app when `node_modules` is missing, then opens two dev-server windows.

**Either platform — one at a time:**

```bash
cd frontend-web && npm ci && npm run dev
# → http://localhost:${WEB_PORT}/

cd frontend-admin && npm ci && npm run dev
# → http://localhost:${ADMIN_PORT}${ADMIN_BASE_PATH}/  (default /admin/)
```

Browser-facing URLs (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_MEILISEARCH_HOST`, `VITE_API_BASE_URL`) are **auto-built** from `API_PORT` and `HOST_MEILI_PORT`. `scripts/next-with-root-env.mjs` injects them before Next starts; Vite resolves them in `vite.config.ts`.

The Vite `base` and React Router basename both come from `ADMIN_BASE_PATH`, so local and production share the same `/admin` URL prefix.

### 2.4 Local checklist

- [ ] `.env` and `.env.compose` exist at repo root
- [ ] `DOMAIN=localhost`, `INFRA_HOST=localhost`
- [ ] `./scripts/compose.sh infra up -d` is healthy
- [ ] `./scripts/dev-backend.sh` (or `dev-backend.cmd` / `.ps1` on Windows) starts the API
- [ ] Web and admin start with hot reload (`dev-frontends.cmd` or `npm run dev`)
- [ ] `ALLOWED_ORIGINS` lists `http://localhost:${WEB_PORT}` and `http://localhost:${ADMIN_PORT}`
- [ ] `MEILISEARCH_SEARCH_KEY` is set in `.env` (mapped to `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` automatically)

### 2.5 Optional one-time infra bootstrap

After first Garage start, create buckets and access keys (needed before file uploads work). See [storage.md](./architecture/storage.md) §8 and [infra.md](./architecture/infra.md) deployment runbook.

---

## 3. Production setup (everything in Docker)

Use this on a VM / staging / any environment where you do not run Node or Python on the host.

### 3.1 Prepare `.env` for production

At minimum:

- Strong `DB_PASSWORD`, `SECRET_KEY`, Meili keys
- Real `DOMAIN`, `CERTBOT_EMAIL`
- `ALLOWED_ORIGINS=https://$DOMAIN` (or your real browser origins)
- Override auto-built URLs when the public hostname differs from internal Docker names:

```bash
DOMAIN=example.com
ADMIN_BASE_PATH=/admin
ALLOWED_ORIGINS=https://example.com
NEXT_PUBLIC_API_BASE_URL=http://example.com:8000
NEXT_PUBLIC_MEILISEARCH_HOST=https://…   # per your search exposure policy
VITE_API_BASE_URL=http://example.com:8000
GARAGE_PUBLIC_ASSETS_ENDPOINT=https://example.com/assets
ENABLE_SWAGGER=false
```

`MEILISEARCH_SEARCH_KEY` stays in `.env`; frontends pick it up at build time.

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
- [ ] `ALLOWED_ORIGINS` matches production browser origins
- [ ] Garage buckets + API keys configured ([storage.md](./architecture/storage.md))

---

## 4. Common commands

| Task | Local | Production |
|---|---|---|
| Start Docker pieces | `./scripts/compose.sh infra up -d` | `./scripts/compose.sh prod up -d --build` |
| Stop Docker pieces | `./scripts/compose.sh infra down` | `./scripts/compose.sh prod down` |
| Logs | `./scripts/compose.sh infra logs -f` | `./scripts/compose.sh prod logs -f api` |
| Start API (live reload) | `./scripts/dev-backend.sh` (Windows: `scripts\dev-backend.cmd`) | — (use Compose `api`) |
| Start frontends | `scripts\dev-frontends.cmd` (Windows) or `npm run dev` per app | — (use Compose `web` / `admin`) |
| Migrate DB | `cd backend && uv run alembic upgrade head` | `./scripts/compose.sh prod exec api uv run alembic upgrade head` |
| Shell in API | — | `./scripts/compose.sh prod exec api sh` |

---

## 5. Environment reference

| File | Committed? | Purpose |
|---|---|---|
| `.env.example` | yes | Template for secrets + app config |
| `.env` | **no** | Your real secrets (apps + Compose) |
| `.env.compose.example` | yes | Template for Docker `CONTAINER_*` and `HOST_*` ports |
| `.env.compose` | **no** | Container-internal and host publish ports for Compose |

### What you set manually

| Variable | File | Notes |
|---|---|---|
| `WEB_PORT` / `ADMIN_PORT` / `API_PORT` | `.env` | Local hybrid app ports (defaults `50173` / `50174` / `8000`) |
| `INFRA_HOST` | `.env` | Hostname for reaching Docker-published infra from the host (default `localhost`) |
| `ALLOWED_ORIGINS` | `.env` | **Always explicit** — comma-separated CORS origins; must match your real browser URLs |
| `MEILISEARCH_SEARCH_KEY` | `.env` | Search-only key; frontends map this to `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` at build/dev start |
| `HOST_*` / `CONTAINER_*` | `.env.compose` | All Docker publish and internal listen ports |

### What is auto-built (local hybrid)

| Variable | Built from | Example (defaults) |
|---|---|---|
| `DATABASE_URL` | `INFRA_HOST` + `HOST_POSTGRES_PORT` + DB creds | `postgresql+asyncpg://…@localhost:5433/…` |
| `TEST_DATABASE_URL` | same pattern | `…_test` database |
| `MEILISEARCH_URL` | `INFRA_HOST` + `HOST_MEILI_PORT` | `http://localhost:7700` |
| `GARAGE_ENDPOINT` | `INFRA_HOST` + `HOST_GARAGE_S3_PORT` | `http://localhost:3900` |
| `NEXT_PUBLIC_API_BASE_URL` / `VITE_API_BASE_URL` | `INFRA_HOST` + `API_PORT` | `http://localhost:8000` |
| `NEXT_PUBLIC_MEILISEARCH_HOST` | `INFRA_HOST` + `HOST_MEILI_PORT` | `http://localhost:7700` |
| `NEXT_PUBLIC_SITE_URL` | `INFRA_HOST` + `WEB_PORT` | `http://localhost:50173` |

Set any of these explicitly in `.env` to override (required for production Docker builds when the public hostname differs).

Implementation: `backend/app/core/config.py`, `scripts/resolve-env-urls.mjs`, `frontend-web/next.config.ts`, `frontend-web/scripts/next-with-root-env.mjs`, `frontend-admin/vite.config.ts`.

Compose reads all service ports from `.env.compose`: `CONTAINER_*` for in-network listen ports and `HOST_*` for publishes to the host. In production, the API container receives `DATABASE_URL` from Compose (`db:${CONTAINER_POSTGRES_PORT}`), not your host hybrid URL. Nginx terminates TLS for the site domain (`/` and `/admin/`); the API is published separately on `HOST_API_PORT`.

---

## 6. Troubleshooting

**Compose says missing `.env` / `.env.compose`**  
Create them from the `.example` files at the repo root.

**API cannot connect to Postgres**  
Ensure `infra up` is running and `DB_PASSWORD` matches `.env`. The backend builds `DATABASE_URL` from `HOST_POSTGRES_PORT` — verify that port in `.env.compose` matches what Docker published (`docker ps`).

**Port already in use**  
Change the conflicting `HOST_*` in `.env.compose` or `WEB_PORT` / `ADMIN_PORT` / `API_PORT` in `.env`, update `ALLOWED_ORIGINS` if web/admin ports changed, then restart. Recreate infra if needed: `… infra up -d --force-recreate db`.

**Web: `Missing required environment variable: NEXT_PUBLIC_*`**  
Restart the dev server after pulling changes. URLs are injected by `next-with-root-env.mjs` and `next.config.ts`; `src/config/index.ts` must use static `process.env.NEXT_PUBLIC_*` access (not `process.env[key]`).

**Admin / web missing env vars**  
They load the **root** `.env` (Vite `envDir`, Next `loadEnvConfig` + `next-with-root-env.mjs`). Do not add app-local `.env` files.

**Admin 404 on refresh under `/admin/...`**  
Confirm Vite was built with `ADMIN_BASE_PATH=/admin` and Nginx has `location /admin/` proxying to the admin container.

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
