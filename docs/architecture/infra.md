# Architecture — Infrastructure

**Components:** Docker · Docker Compose · Nginx · PostgreSQL 18 · MeiliSearch 1.48  
**Deployment:** Single VM (Contabo or Hostinger) — all services managed by Docker Compose  
**OS:** Ubuntu 24.04 LTS

---

## 1. Overview — How Everything Fits Together

```
Internet
    │
    ├─► port 80 / 443  (Nginx — single domain)
    │     /          → web   (port 3000)
    │     /admin/    → admin (port 3001)
    │     /assets/   → storage (Garage public, port 3902)
    │
    └─► port HOST_API_PORT (default 8000) → api (FastAPI)
```

```
┌───────────────────────────────────────────────────────────────────┐
│  Nginx (reverse proxy + SSL)                                      │
│  Let's Encrypt via Certbot                                        │
│                                                                   │
│  $DOMAIN/ ───────────────────────────► web     (port 3000)       │
│  $DOMAIN/admin/ ─────────────────────► admin   (port 3001)       │
│  $DOMAIN/assets/ ────────────────────► storage (port 3902)       │
└───────────────────────────────────────────────────────────────────┘
         API published separately on HOST_API_PORT → api :8000
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
             db              search            storage
         (port 5432)      (port 7700)    Garage S3 (port 3900)
          internal          internal          internal
          only               only        4 buckets: manuscripts,
                                         public-assets, certificates,
                                              payment-proofs
```

All services run in Docker containers on one VM. PostgreSQL and MeiliSearch are **never exposed to the public internet** — only Nginx, the published API port, and the app containers communicate with them, via an internal Docker network.

---

## 2. Folder Structure

```
infra/
├── compose/
│   ├── docker-compose.yml          # Base — all services defined here
│   ├── docker-compose.override.yml # Dev overrides (hot reload, debug ports)
│   └── docker-compose.prod.yml     # Prod overrides (restart policies, resource limits)
├── docker/
│   ├── web/
│   │   └── Dockerfile              # Next.js multi-stage build (context: frontend-web/)
│   ├── admin/
│   │   ├── Dockerfile              # React + Vite multi-stage build (context: frontend-admin/)
│   │   └── nginx.conf              # SPA fallback — all routes → index.html
│   └── api/
│       └── Dockerfile              # FastAPI (context: backend/)
├── nginx/
│   ├── nginx.conf
│   ├── templates-dev/          # HTTP-only single-domain templates
│   │   └── default.conf.template
│   └── templates-prod/         # TLS single-domain templates
│       └── web.conf.template   # / → web, /admin/ → admin, /assets/ → Garage
├── postgres/
│   └── init/
│       └── 01_extensions.sql       # Enable uuid-ossp, pg_trgm on first boot
├── meilisearch/
│   └── .gitkeep                    # Config is env-var only; no file config needed
└── garage/
    └── garage.toml                 # Garage object storage config (mounted read-only)
```

---

## 3. Docker — Dockerfiles

### 3.1 `infra/docker/web/Dockerfile` — Next.js 16

Multi-stage build. The `builder` stage compiles the app; the `runner` stage is a minimal image with only the compiled output.

```dockerfile
# Stage 1 — install deps + build
FROM node:22-alpine AS builder
WORKDIR /app

COPY frontend-web/package.json frontend-web/package-lock.json ./

RUN npm ci

COPY frontend-web/ .

RUN npm run build

# Stage 2 — minimal runtime image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

Key points:
- `node:22-alpine` — Node 22 LTS, minimal Alpine base (~5 MB OS layer)
- `standalone` output mode (set in `next.config.ts`) — self-contained server with no `node_modules` at runtime
- Non-root user `nextjs` — never run app containers as root
- `NEXT_TELEMETRY_DISABLED=1` — no outbound telemetry calls in production

---

### 3.2 `infra/docker/admin/Dockerfile` — React + Vite

Vite builds to static files. Nginx (a separate lightweight container) serves them — no Node.js at runtime.

```dockerfile
# Stage 1 — build
FROM node:22-alpine AS builder
WORKDIR /app

COPY frontend-admin/package.json frontend-admin/package-lock.json ./

RUN npm ci

COPY frontend-admin/ .

RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY infra/docker/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
```

`infra/docker/admin/nginx.conf` — handles SPA client-side routing (all unknown paths → `index.html`):

```nginx
server {
    listen 3001;

    root /usr/share/nginx/html;
    index index.html;

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 3.3 `infra/docker/api/Dockerfile` — FastAPI (Python 3.14)

```dockerfile
FROM python:3.14-slim AS base

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files first (layer cache)
COPY pyproject.toml uv.lock ./

# Install dependencies into the system Python (no venv needed in container)
RUN uv sync --frozen --no-dev

# Copy application code
COPY . .

RUN addgroup --system --gid 1001 fastapi \
 && adduser  --system --uid 1001 fastapi
USER fastapi

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "4"]
```

Key points:
- `python:3.14-slim` — full CPython 3.14, minimal Debian base (no Alpine — C extensions like psycopg need glibc)
- `uv sync --frozen` — reproducible installs from `uv.lock`; `--no-dev` excludes test dependencies
- `--workers 4` — 4 Uvicorn worker processes; tune to `(2 × CPU cores) + 1` on the VM
- Non-root user `fastapi`

---

## 4. Docker Compose

### 4.1 `infra/compose/docker-compose.yml` — Base (all environments)

```yaml
services:

  web:
    build:
      context: ../../frontend-web
      dockerfile: ../infra/docker/web/Dockerfile
    image: imperial-press/web:latest
    networks: [internal]
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://imperialpress.com:8000
      - NEXT_REVALIDATE_SECRET=${NEXT_REVALIDATE_SECRET}
    depends_on: [api]

  admin:
    build:
      context: ../../frontend-admin
      dockerfile: ../infra/docker/admin/Dockerfile
    image: imperial-press/admin:latest
    networks: [internal]

  api:
    build:
      context: ../../backend
      dockerfile: ../infra/docker/api/Dockerfile
    image: imperial-press/api:latest
    networks: [internal]
    environment:
      - DATABASE_URL=postgresql+asyncpg://imperial:${DB_PASSWORD}@db:5432/imperial_press
      - SECRET_KEY=${SECRET_KEY}
      - MEILISEARCH_URL=http://search:7700
      - MEILISEARCH_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
      - MEILISEARCH_SEARCH_KEY=${MEILISEARCH_SEARCH_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - GARAGE_S3_ENDPOINT=http://storage:3900
      - GARAGE_S3_REGION=garage
      - GARAGE_ACCESS_KEY_ID=${GARAGE_ACCESS_KEY_ID}
      - GARAGE_SECRET_ACCESS_KEY=${GARAGE_SECRET_ACCESS_KEY}
      - GARAGE_PUBLIC_ASSETS_ENDPOINT=https://imperialpress.com/assets
    depends_on:
      db:
        condition: service_healthy
      search:
        condition: service_healthy
      storage:
        condition: service_healthy

  db:
    image: postgres:18-alpine
    networks: [internal]
    environment:
      - POSTGRES_USER=imperial
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=imperial_press
    volumes:
      - pgdata:/var/lib/postgresql
      - ../../infra/postgres/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U imperial -d imperial_press"]
      interval: 10s
      timeout: 5s
      retries: 5

  search:
    image: getmeili/meilisearch:v1.48
    networks: [internal]
    environment:
      - MEILI_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
      - MEILI_ENV=production
      - MEILI_NO_ANALYTICS=true
    volumes:
      - meilidata:/meili_data
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:7700/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:1.27-alpine
    networks: [internal]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ../../infra/nginx/conf.d:/etc/nginx/conf.d:ro
      - certbot-certs:/etc/letsencrypt:ro
      - certbot-www:/var/www/certbot:ro
    depends_on: [web, admin, api]

  storage:
    image: dxflrs/garage:v2.3.0
    networks: [internal]
    volumes:
      - garagedata:/var/lib/garage
      - ../../infra/garage/garage.toml:/etc/garage.toml:ro
    environment:
      - GARAGE_CONFIG_FILE=/etc/garage.toml
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3900/"]
      interval: 15s
      timeout: 5s
      retries: 5

  certbot:
    image: certbot/certbot:latest
    volumes:
      - certbot-certs:/etc/letsencrypt
      - certbot-www:/var/www/certbot
    # Runs once manually to issue certs, then via cron for renewal
    profiles: ["certbot"]

networks:
  internal:
    driver: bridge

volumes:
  pgdata:
  meilidata:
  garagedata:
  certbot-certs:
  certbot-www:
```

---

### 4.2 `infra/compose/docker-compose.override.yml` — Development

Applied automatically when running `docker compose up` locally (Docker Compose merges this with the base).

```yaml
services:

  web:
    build:
      context: ../../frontend-web
      dockerfile: ../infra/docker/web/Dockerfile
      target: builder
    volumes:
      - ../../frontend-web:/app
      - /app/.next
    environment:
      - NODE_ENV=development
    command: npm run dev

  admin:
    build:
      context: ../../frontend-admin
      dockerfile: ../infra/docker/admin/Dockerfile
      target: builder
    volumes:
      - ../../frontend-admin:/app
    command: npm run dev

  api:
    volumes:
      - ../../backend:/app
    command: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    ports:
      # Host port from .env.compose (default 5433). Container stays on 5432.
      - "${HOST_POSTGRES_PORT}:5432"

  search:
    ports:
      - "${HOST_MEILI_PORT}:7700"
    environment:
      - MEILI_ENV=development  # Enables the MeiliSearch web UI at localhost:7700
```

Local hybrid defaults publish Postgres on **5433** (`HOST_POSTGRES_PORT`) so a system Postgres on **5432** can keep running. The API on the host auto-builds `DATABASE_URL` / `TEST_DATABASE_URL` from `INFRA_HOST` + `HOST_POSTGRES_PORT` — no manual URL editing when you change the publish port.

All Compose services attach to the Docker network **`Imperial-press-network`** (`imperial-press-network` in compose files). Service listen ports use `${CONTAINER_*}` variables from `.env.compose`; host publishes use `${HOST_*}`.

---

### 4.3 `infra/compose/docker-compose.prod.yml` — Production

Applied explicitly: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

```yaml
services:

  web:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M

  admin:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M

  api:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 1G

  db:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G

  search:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M

  nginx:
    restart: unless-stopped
```

---

### 4.4 Environment Variables — `.env`

One `.env` file at the repo root, **never committed**. `.gitignore` excludes it. A `.env.example` with blank values is committed instead.

```bash
# Database
DB_PASSWORD=change_me_strong_password

# FastAPI
SECRET_KEY=change_me_64_char_random_hex

# MeiliSearch
MEILISEARCH_MASTER_KEY=change_me_master_key
MEILISEARCH_SEARCH_KEY=change_me_search_only_key   # Read-only; safe to expose to browser

# Next.js ISR revalidation
NEXT_REVALIDATE_SECRET=change_me_revalidate_secret

# Garage object storage
GARAGE_ACCESS_KEY_ID=
GARAGE_SECRET_ACCESS_KEY=

# Email (SMTP — provider TBD)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

---

## 5. Nginx

Single domain, path-based frontends. Templates live under `infra/nginx/templates-prod/` (TLS) and `templates-dev/` (HTTP). The API is **not** proxied here — it is published on `HOST_API_PORT`.

### 5.1 `infra/nginx/templates-prod/web.conf.template`

```nginx
# Redirect HTTP → HTTPS (+ ACME challenge)
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://${DOMAIN}$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security "max-age=63072000; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location /assets/ {
        proxy_pass         http://storage:3902/;
        proxy_set_header   Host public-assets.web.garage;
        add_header         Cache-Control "public, max-age=604800, immutable";
        expires            7d;
    }

    location = ${ADMIN_BASE_PATH} {
        return 301 ${ADMIN_BASE_PATH}/;
    }

    location ${ADMIN_BASE_PATH}/ {
        proxy_pass       http://admin:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass         http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/revalidate {
        allow 172.16.0.0/12;
        deny  all;
        proxy_pass http://web:3000;
    }
}
```

| Path | Upstream |
|---|---|
| `/` | `web:3000` (Next.js) |
| `/admin/` | `admin:3001` (Vite SPA; prefix stripped) |
| `/assets/` | Garage public bucket |
| API | Host port `HOST_API_PORT` → `api:8000` (Compose publish, not Nginx) |

---

## 6. PostgreSQL

### 6.1 Image & Configuration

Using the official `postgres:18-alpine` image. All configuration is via environment variables in Docker Compose — no custom `postgresql.conf` needed at this scale.

Key environment variables passed at startup:

| Variable | Value |
|---|---|
| `POSTGRES_USER` | `imperial` |
| `POSTGRES_PASSWORD` | from `.env` |
| `POSTGRES_DB` | `imperial_press` |

### 6.2 `infra/postgres/init/01_extensions.sql`

Runs once on first container start (before Alembic migrations). Enables PostgreSQL extensions the app depends on:

```sql
-- UUID generation (used for all primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigram indexes for fast text search within PostgreSQL (used for reviewer search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 6.3 Connection from FastAPI

FastAPI connects via SQLAlchemy's async engine using `asyncpg` as the driver:

```
postgresql+asyncpg://imperial:<password>@db:5432/imperial_press
```

SQLAlchemy connection pool settings (in `backend/app/core/database.py`):

| Setting | Value | Reason |
|---|---|---|
| `pool_size` | 10 | Concurrent DB connections per worker |
| `max_overflow` | 20 | Burst headroom above pool_size |
| `pool_pre_ping` | `True` | Detects stale connections before use |
| `pool_recycle` | 3600 | Recycle connections every hour |

### 6.4 Migrations

All schema changes go through **Alembic** — never alter tables directly in the database.

```bash
# Generate a new migration after changing SQLAlchemy models
docker compose exec api uv run alembic revision --autogenerate -m "add_certificates_table"

# Apply all pending migrations
docker compose exec api uv run alembic upgrade head

# Roll back one migration
docker compose exec api uv run alembic downgrade -1
```

### 6.5 Backups

A daily backup cron job on the VM dumps the database to the `/data/backups/` directory:

```bash
# /etc/cron.d/postgres-backup  (set up on the VM, not in Docker)
0 3 * * * root docker exec imperial-press-db-1 \
  pg_dump -U imperial imperial_press \
  | gzip > /data/backups/db_$(date +%Y%m%d).sql.gz
```

Keep the last 30 days of backups. Transfer to off-VM storage (Backblaze B2 or similar) for disaster recovery.

---

## 7. MeiliSearch

### 7.1 Configuration

MeiliSearch is configured entirely via environment variables — no config file.

| Variable | Value |
|---|---|
| `MEILI_MASTER_KEY` | Secret key (from `.env`) — never exposed to client |
| `MEILI_ENV` | `production` (disables the web dashboard UI) |
| `MEILI_NO_ANALYTICS` | `true` (no outbound telemetry) |

In development, `MEILI_ENV=development` enables the web UI at `http://localhost:7700`.

### 7.2 API Keys

Two keys are generated from the master key via the MeiliSearch API on first setup:

| Key | Permissions | Where used |
|---|---|---|
| **Master key** | Full access | FastAPI only — never leaves the server |
| **Search-only key** | `search` on `papers`, `journals`, `blog_posts` | Public website browser — safe to expose |

The search-only key is generated once and stored in `.env` as `MEILISEARCH_SEARCH_KEY`. The Next.js public site uses this key directly from the browser via an environment variable prefixed `NEXT_PUBLIC_`.

### 7.3 Indexes

Three indexes, created by FastAPI on startup if they don't exist:

| Index | Searchable fields | Filterable fields |
|---|---|---|
| `papers` | `title`, `abstract`, `keywords`, `author_names`, `journal_name` | `journal_slug`, `issue_id`, `published_date` |
| `journals` | `title`, `subject_name`, `eissn`, `pissn` | `subject_id`, `frequency` |
| `blog_posts` | `title`, `excerpt` | `published_date` |

### 7.4 Index Updates

FastAPI updates MeiliSearch as a side-effect of publish/update actions. Updates are fire-and-forget in a `BackgroundTask` — the HTTP response is not delayed by indexing.

| Trigger | Action |
|---|---|
| Paper published | `client.index('papers').add_documents([paper_doc])` |
| Paper updated | `client.index('papers').update_documents([paper_doc])` |
| Paper unpublished / deleted | `client.index('papers').delete_document(paper_id)` |
| Journal created / updated | Same pattern on `journals` index |
| Blog post published / updated | Same pattern on `blog_posts` index |

---

## 8. Deployment Runbook

### First-time setup on a fresh VM

```bash
# 1. Install Docker + Docker Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 2. Clone the repo
git clone git@github.com:your-org/imperial-press.git
cd imperial-press

# 3. Create .env from example
cp .env.example .env
# → Edit .env and fill in all secrets

# 4. Issue SSL certificates (runs certbot once)
docker compose -f infra/compose/docker-compose.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d imperialpress.com -d www.imperialpress.com \
  --email admin@imperialpress.com --agree-tos --no-eff-email

# 5. Build and start all services
docker compose -f infra/compose/docker-compose.yml \
               -f infra/compose/docker-compose.prod.yml \
               up -d --build

# 6. Run database migrations
docker compose exec api uv run alembic upgrade head

# 7. Create the first admin account
docker compose exec api uv run python scripts/create_admin.py

# 8. Set up MeiliSearch search-only key (run once)
docker compose exec api uv run python scripts/setup_meilisearch.py

# 9. Set up Garage buckets and access keys (run once — see docs/architecture/storage.md §8)
docker compose exec storage garage status
# → copy node ID, then:
docker compose exec storage garage layout assign --zone dc1 --capacity 50 <node-id>
docker compose exec storage garage layout apply --version 1
docker compose exec storage garage key create imperial-press-api
# → copy Access Key ID + Secret → add to .env, restart api container
docker compose exec storage garage bucket create manuscripts
docker compose exec storage garage bucket create public-assets
docker compose exec storage garage bucket create certificates
docker compose exec storage garage bucket create payment-proofs
docker compose exec storage garage bucket allow manuscripts    --read --write --owner --key imperial-press-api
docker compose exec storage garage bucket allow public-assets  --read --write --owner --key imperial-press-api
docker compose exec storage garage bucket allow certificates   --read --write --owner --key imperial-press-api
docker compose exec storage garage bucket allow payment-proofs --read --write --owner --key imperial-press-api
docker compose exec storage garage bucket allow public-assets  --read --anonymous
```

### SSL renewal (automated)

```bash
# Add to VM crontab — runs renewal check twice daily (certbot only renews if <30 days remain)
0 0,12 * * * docker compose -f /path/to/infra/compose/docker-compose.yml \
  run --rm certbot renew --quiet \
  && docker compose exec nginx nginx -s reload
```

### Deploying a new version

```bash
git pull origin main
docker compose -f infra/compose/docker-compose.yml \
               -f infra/compose/docker-compose.prod.yml \
               up -d --build --no-deps web admin api
docker compose exec api uv run alembic upgrade head
```

`--no-deps` rebuilds only the three app containers, leaving `db`, `search`, and `nginx` untouched.
