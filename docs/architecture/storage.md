# Architecture — File Storage (Garage)

**Service:** Garage v2.3.0 — S3-compatible self-hosted object storage  
**Docker image:** `dxflrs/garage:v2.3.0`  
**Runs on:** Same VM as all other services, internal Docker network only  
**Why Garage:** MinIO was archived April 2026; Garage is the leading actively-maintained S3-compatible replacement for single-VM self-hosting

---

## 1. Overview

Garage replaces direct filesystem storage (`/data/`) with a proper object storage layer. FastAPI no longer serves binary files itself — it either generates **presigned URLs** for private files (client downloads directly from Garage) or proxies public assets through Nginx.

```
                    ┌─────────────────────────────────────────┐
                    │              VM (Docker)                │
                    │                                         │
  Upload request    │  FastAPI  ──boto3──►  Garage            │
  ─────────────────►│  (api)               (storage:3900)    │
                    │    │                      │             │
                    │    │  presigned URL        │ /garage-data│
  ◄─────────────────│    │◄─────────────────────│  (volume)   │
  Client gets URL   │                           │             │
       │            └───────────────────────────┼─────────────┘
       │                                        │
       └──── GET presigned URL ─────────────────►
             (direct to Garage, bypasses API)
```

**Public assets** (journal covers, editorial photos, partner logos, blog images) are served through a Nginx location block pointing at Garage's web endpoint — no FastAPI involvement at all.

**Private files** (manuscripts, payment proofs, certificates) are never accessible via a public URL. FastAPI generates a time-limited presigned URL on demand, returned to the authenticated user only.

---

## 2. Folder Structure Addition

```
infra/
└── garage/
    └── garage.toml       # Garage configuration (mounted read-only into container)
```

---

## 3. Bucket Structure

Four buckets, each with its own access policy:

| Bucket | Access | Contents | Served by |
|---|---|---|---|
| `manuscripts` | Private | Author-uploaded `.docx` + supplementary files | Presigned URL via FastAPI |
| `public-assets` | Public (read) | Journal covers, editorial photos, partner logos, blog images | Nginx → Garage web endpoint |
| `certificates` | Private | Generated certificate PDFs | Presigned URL via FastAPI |
| `payment-proofs` | Private | Author-uploaded payment receipts | FastAPI admin only (direct stream) |

### Object key naming conventions

Consistent key structure makes buckets browsable and avoids collisions:

```
manuscripts/
  {submission_id}/{filename}.docx
  {submission_id}/supplementary/{filename}

public-assets/
  journals/{journal_slug}/cover.{ext}
  journals/{journal_slug}/editorial/{member_id}.{ext}
  blog/{post_slug}/{filename}
  partners/{partner_id}.{ext}
  site/logo.svg

certificates/
  {journal_slug}/{year}/{cert_id}.pdf

payment-proofs/
  {payment_id}/{filename}
```

---

## 4. Garage Configuration

### `infra/garage/garage.toml`

```toml
metadata_dir = "/var/lib/garage/meta"
data_dir     = "/var/lib/garage/data"

# Single-node deployment
replication_factor = 1

[db_engine]
engine = "sqlite"

[s3_api]
s3_region       = "garage"
api_bind_addr   = "0.0.0.0:3900"
root_domain     = ".storage.imperialpress.com"

[s3_web]
bind_addr = "0.0.0.0:3902"
root_domain = ".web.garage"
index     = "index.html"

[admin]
api_bind_addr = "0.0.0.0:3903"
```

Key settings:
- `replication_factor = 1` — single node; no replication needed on one VM. Increase when adding nodes.
- `engine = "sqlite"` — metadata stored in SQLite; sufficient for single-node. Switch to LMDB for heavy multi-node.
- Port `3900` — S3 API (used by FastAPI via boto3)
- Port `3902` — Static web endpoint (used by Nginx to serve public-assets)
- Port `3903` — Admin API (used only during setup; not exposed outside the VM)

---

## 5. Docker Compose Service

Add to `infra/compose/docker-compose.yml` under `services:`:

```yaml
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
```

Add `garagedata` to the top-level `volumes:` block:

```yaml
volumes:
  pgdata:
  meilidata:
  garagedata:       # ← add this
  data:
  certbot-certs:
  certbot-www:
```

Update `api` service to depend on storage:

```yaml
  api:
    depends_on:
      db:
        condition: service_healthy
      search:
        condition: service_healthy
      storage:             # ← add this
        condition: service_healthy
```

Add Garage environment variables to the `api` service:

```yaml
    environment:
      - GARAGE_S3_ENDPOINT=http://storage:3900
      - GARAGE_S3_REGION=garage
      - GARAGE_ACCESS_KEY_ID=${GARAGE_ACCESS_KEY_ID}
      - GARAGE_SECRET_ACCESS_KEY=${GARAGE_SECRET_ACCESS_KEY}
      - GARAGE_PUBLIC_ASSETS_ENDPOINT=https://imperialpress.com/assets
```

### Dev override (`docker-compose.override.yml`)

Expose the admin port locally during development for bucket management via the Garage CLI:

```yaml
  storage:
    ports:
      - "3900:3900"   # S3 API — for testing with local boto3 scripts
      - "3903:3903"   # Admin API — for running garage CLI commands
```

---

## 6. Nginx — Public Assets

Add a `location /assets/` block to `infra/nginx/conf.d/imperialpress.conf` to proxy public asset requests straight to Garage's web endpoint, bypassing FastAPI entirely:

```nginx
# Public assets served directly from Garage — no API involvement
location /assets/ {
    proxy_pass         http://storage:3902/;
    proxy_set_header   Host public-assets.web.garage;
    proxy_hide_header  x-amz-id-2;
    proxy_hide_header  x-amz-request-id;

    # Aggressive caching for images and static assets
    proxy_cache_valid  200 7d;
    add_header         Cache-Control "public, max-age=604800, immutable";
    expires            7d;
}
```

The `Host` header tells Garage which bucket to serve (`public-assets` bucket via the virtual-host style routing using `root_domain = ".web.garage"`).

---

## 7. FastAPI Integration

### Python dependencies (add to `backend/pyproject.toml`)

```toml
aiobotocore = ">=2.13"    # Async boto3 — talks to any S3-compatible store
boto3       = ">=1.35"    # Used for presigned URL generation (synchronous is fine here)
```

### `backend/app/utils/storage.py`

```python
import aiobotocore.session
from app.core.config import settings

def _client():
    session = aiobotocore.session.get_session()
    return session.create_client(
        "s3",
        endpoint_url          = settings.GARAGE_S3_ENDPOINT,
        region_name           = settings.GARAGE_S3_REGION,
        aws_access_key_id     = settings.GARAGE_ACCESS_KEY_ID,
        aws_secret_access_key = settings.GARAGE_SECRET_ACCESS_KEY,
    )

async def upload_file(bucket: str, key: str, body: bytes, content_type: str) -> str:
    """Upload bytes to Garage. Returns the object key."""
    async with _client() as s3:
        await s3.put_object(Bucket=bucket, Key=key, Body=body, ContentType=content_type)
    return key

async def delete_file(bucket: str, key: str) -> None:
    async with _client() as s3:
        await s3.delete_object(Bucket=bucket, Key=key)

def presigned_url(bucket: str, key: str, expires_in: int = 3600) -> str:
    """
    Generate a time-limited presigned GET URL for a private object.
    Uses synchronous boto3 — presigned URL generation is CPU-only, no I/O.
    expires_in: seconds until the URL expires (default 1 hour)
    """
    import boto3
    from botocore.config import Config
    client = boto3.client(
        "s3",
        endpoint_url          = settings.GARAGE_S3_ENDPOINT,
        region_name           = settings.GARAGE_S3_REGION,
        aws_access_key_id     = settings.GARAGE_ACCESS_KEY_ID,
        aws_secret_access_key = settings.GARAGE_SECRET_ACCESS_KEY,
        config                = Config(signature_version="s3v4"),
    )
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires_in,
    )
```

### Usage patterns in FastAPI routes

**Manuscript upload (submission Step 2):**
```python
# routes/submissions.py
from app.utils.storage import upload_file

contents = await file.read()
key = f"{submission_id}/{file.filename}"
await upload_file("manuscripts", key, contents, file.content_type)
# Store key in DB — never store the full URL
```

**Manuscript download (admin or author — authenticated):**
```python
# routes/submissions.py
from app.utils.storage import presigned_url

url = presigned_url("manuscripts", submission.manuscript_key, expires_in=300)
return {"download_url": url}  # Client redirects to this — expires in 5 minutes
```

**Certificate download (dashboard):**
```python
url = presigned_url("certificates", certificate.storage_key, expires_in=3600)
return {"download_url": url}
```

**Public asset URL (journal cover, editorial photo):**
```python
# No presigned URL needed — just construct the public path
public_url = f"{settings.GARAGE_PUBLIC_ASSETS_ENDPOINT}/{key}"
# e.g. https://imperialpress.com/assets/journals/ijllt/cover.jpg
```

---

## 8. First-Time Setup Runbook

Run these commands once after first deploying the `storage` container. All commands use the `garage` CLI inside the container.

```bash
# 1. Get the node ID
docker compose exec storage garage status

# 2. Assign the node a layout (zone and capacity in GB)
docker compose exec storage garage layout assign \
  --zone dc1 --capacity 50 <node-id>

# 3. Apply the layout
docker compose exec storage garage layout apply --version 1

# 4. Create access keys
docker compose exec storage garage key create imperial-press-api

# 5. Note the printed Access Key ID and Secret Key → add to .env:
#    GARAGE_ACCESS_KEY_ID=...
#    GARAGE_SECRET_ACCESS_KEY=...

# 6. Create the four buckets
docker compose exec storage garage bucket create manuscripts
docker compose exec storage garage bucket create public-assets
docker compose exec storage garage bucket create certificates
docker compose exec storage garage bucket create payment-proofs

# 7. Grant the API key full access to all buckets
docker compose exec storage garage bucket allow manuscripts    --read --write --owner --key imperial-press-api
docker compose exec storage garage bucket allow public-assets  --read --write --owner --key imperial-press-api
docker compose exec storage garage bucket allow certificates   --read --write --owner --key imperial-press-api
docker compose exec storage garage bucket allow payment-proofs --read --write --owner --key imperial-press-api

# 8. Make public-assets readable by everyone (for Nginx web serving)
docker compose exec storage garage bucket allow public-assets --read --anonymous
```

Add the generated keys to `.env`:

```bash
GARAGE_ACCESS_KEY_ID=your_generated_key_id
GARAGE_SECRET_ACCESS_KEY=your_generated_secret
```

---

## 9. Environment Variables

Add to `.env` and `.env.example`:

```bash
# Garage object storage
GARAGE_ACCESS_KEY_ID=
GARAGE_SECRET_ACCESS_KEY=
```

`GARAGE_S3_ENDPOINT`, `GARAGE_S3_REGION`, and `GARAGE_PUBLIC_ASSETS_ENDPOINT` are non-secret and can be hardcoded in `backend/app/core/config.py` or set in the Docker Compose `environment:` block.

---

## 10. Backup

Garage stores all data in the `garagedata` Docker volume. Back it up the same way as `pgdata`:

```bash
# /etc/cron.d/garage-backup  (on the VM)
0 4 * * * root docker run --rm \
  -v imperial-press_garagedata:/source:ro \
  -v /data/backups:/dest \
  alpine tar czf /dest/garage_$(date +%Y%m%d).tar.gz -C /source .
```

Keep 30 days of backups. Transfer to off-VM storage for disaster recovery.

---

## 11. Migration Path

If the platform outgrows a single VM, Garage scales without code changes:

1. Add new nodes to the Docker Swarm / Kubernetes cluster
2. Run `garage layout assign` on each new node
3. Increase `replication_factor` in `garage.toml` to 2 or 3
4. FastAPI code is unchanged — it still talks to the same S3 API

Alternatively, migrate to **Cloudflare R2** or **AWS S3** by updating four environment variables (`GARAGE_S3_ENDPOINT`, `GARAGE_S3_REGION`, `GARAGE_ACCESS_KEY_ID`, `GARAGE_SECRET_ACCESS_KEY`). Application code is unchanged.
