# Architecture — backend (FastAPI REST API)

**Tech:** Python 3.14.6 · FastAPI 0.139 · SQLAlchemy 2.0 · Alembic · PostgreSQL 18 · MeiliSearch 1.48 · uv 0.11  
**Serves:** Both frontends (public website + admin panel)  
**URL:** `api.imperialpress.com` (Nginx → port 8000)

---

## 1. Overview

The backend is a single FastAPI application that handles:
- All CRUD operations for every content type
- JWT authentication and role-based access control
- File upload and serving (manuscripts, images, certificate PDFs)
- Certificate PDF generation
- MeiliSearch index updates (synced on publish/update)
- Email dispatch for all system notifications
- Automatic reviewer reminder scheduling (via background workers)
- View and download count tracking

The application is structured as **domain modules** rather than flat layers. Each domain owns its router, service (business logic), repository (DB queries), schemas (Pydantic), and models (SQLAlchemy). This keeps related code co-located and makes domains independently testable.

---

## 2. Folder Structure

```
backend/
├── alembic/
│   ├── env.py             # Alembic migration environment (reads DB URL from config)
│   └── versions/          # Auto-generated migration files
│
├── app/
│   ├── main.py            # FastAPI app factory: creates app, registers routers, CORS, middleware
│   │
│   ├── core/
│   │   ├── config.py      # Settings via pydantic-settings (reads .env)
│   │   ├── database.py    # SQLAlchemy async engine, session factory, Base
│   │   ├── security.py    # JWT encode/decode, bcrypt hashing, password validation
│   │   ├── dependencies.py # FastAPI Depends: get_db, get_current_user, require_role
│   │   └── exceptions.py  # Custom HTTPException subclasses (NotFound, Forbidden, etc.)
│   │
│   ├── api/
│   │   └── v1/
│   │       └── routes/
│   │           ├── __init__.py     # Aggregates all module routers → single v1 router
│   │           ├── auth.py         # /auth/login, /auth/refresh, /auth/logout
│   │           ├── users.py        # /users/me, /users/register, /users/{id}
│   │           ├── journals.py     # /journals, /journals/{slug}
│   │           ├── papers.py       # /papers, /papers/{id}, /papers/{id}/view, /papers/{id}/download
│   │           ├── submissions.py  # /submissions, /submissions/{id}, /submissions/{id}/revise
│   │           ├── reviews.py      # /reviews, /reviews/{id}, /reviews/{id}/submit
│   │           ├── payments.py     # /payments, /payments/{id}/confirm, /payments/{id}/reject
│   │           ├── certificates.py # /certificates/{id}, /certificates/{id}/verify
│   │           ├── content.py      # /blog, /services, /static-pages, /announcements, /cfp
│   │           ├── search.py       # /search (proxies to MeiliSearch with auth)
│   │           ├── notifications.py # /notifications, /notifications/mark-read
│   │           ├── stats.py        # /stats (home page counters)
│   │           └── admin/          # Admin-only routes (role: admin required)
│   │               ├── subjects.py
│   │               ├── journals.py
│   │               ├── issues.py
│   │               ├── papers.py
│   │               ├── submissions.py
│   │               ├── reviewers.py
│   │               ├── payments.py
│   │               ├── certificates.py
│   │               ├── users.py
│   │               └── settings.py
│   │
│   ├── modules/           # Domain modules (business logic lives here)
│   │   ├── auth/
│   │   │   ├── service.py        # login, token refresh, password reset logic
│   │   │   └── schemas.py        # LoginRequest, TokenResponse, PasswordResetRequest
│   │   │
│   │   ├── users/
│   │   │   ├── models.py         # User SQLAlchemy model
│   │   │   ├── repository.py     # DB queries (get_by_email, create, update)
│   │   │   ├── service.py        # register, update_profile, change_password
│   │   │   └── schemas.py        # UserCreate, UserPublic, UserProfile, AuthorProfile
│   │   │
│   │   ├── journals/
│   │   │   ├── models.py         # Subject, Journal, Volume, Issue models
│   │   │   ├── repository.py     # get_by_slug, list_by_subject, get_latest_issue
│   │   │   ├── service.py        # create_journal, update_sections, publish_issue
│   │   │   └── schemas.py        # JournalPublic, JournalDetail, IssuePublic
│   │   │
│   │   ├── papers/
│   │   │   ├── models.py         # Paper, PaperAuthor models
│   │   │   ├── repository.py     # get_by_issue, increment_view, increment_download
│   │   │   ├── service.py        # publish_paper, assign_to_issue, serve_pdf
│   │   │   └── schemas.py        # PaperPublic, PaperDetail, PaperCreate
│   │   │
│   │   ├── submissions/
│   │   │   ├── models.py         # Submission, Contributor, SubmissionFile models
│   │   │   ├── repository.py     # get_by_author, get_by_status, filter_for_admin
│   │   │   ├── service.py        # create_draft, update_step, submit, request_revision,
│   │   │   │                     #   accept, reject — enforces all status transition rules
│   │   │   └── schemas.py        # SubmissionCreate, SubmissionStatus, ContributorAdd
│   │   │
│   │   ├── reviews/
│   │   │   ├── models.py         # ReviewAssignment, ReviewReport models
│   │   │   ├── repository.py     # get_pending, get_active, get_by_reviewer
│   │   │   ├── service.py        # invite_reviewer, accept_invite, decline_invite,
│   │   │   │                     #   submit_report — triggers certificate generation
│   │   │   └── schemas.py        # ReviewInvitationPublic, ReviewReportCreate
│   │   │
│   │   ├── payments/
│   │   │   ├── models.py         # Payment, PaymentProof models
│   │   │   ├── repository.py     # get_pending_proofs, get_by_submission
│   │   │   ├── service.py        # issue_invoice, upload_proof, confirm, reject
│   │   │   └── schemas.py        # PaymentDetail, ProofUpload, PaymentConfirm
│   │   │
│   │   ├── certificates/
│   │   │   ├── models.py         # Certificate model (type, recipient, issued_at, revoked)
│   │   │   ├── repository.py     # get_by_cert_id, list_by_user, revoke
│   │   │   ├── service.py        # generate_acceptance, generate_publication,
│   │   │   │                     #   generate_peer_review, verify_cert_id
│   │   │   ├── generator.py      # HTML template → WeasyPrint PDF rendering
│   │   │   └── schemas.py        # CertificatePublic, CertVerifyResponse
│   │   │
│   │   ├── content/
│   │   │   ├── models.py         # BlogPost, ServicePage, ServiceBlock, StaticPage,
│   │   │   │                     #   Announcement, CallForPapers, PublishingPackage,
│   │   │   │                     #   EditorialMember, IndexingEntry, Partner models
│   │   │   ├── repository.py     # CRUD for all content types
│   │   │   ├── service.py        # publish_post, update_static_page, build_service_page
│   │   │   └── schemas.py        # BlogPostPublic, ServicePagePublic, AnnouncementPublic
│   │   │
│   │   ├── search/
│   │   │   ├── client.py         # MeiliSearch Python client, index setup
│   │   │   ├── service.py        # index_paper, index_journal, index_blog,
│   │   │   │                     #   remove_from_index, search_all
│   │   │   └── schemas.py        # SearchQuery, SearchResultsPublic
│   │   │
│   │   ├── notifications/
│   │   │   ├── models.py         # Notification model (user, type, read, created_at)
│   │   │   ├── service.py        # create_notification, mark_read, dispatch_email
│   │   │   ├── email.py          # SMTP sender, template loader, email builder
│   │   │   └── schemas.py        # NotificationPublic
│   │   │
│   │   └── stats/
│   │       └── service.py        # Aggregate queries for home page stats bar
│   │
│   ├── workers/
│   │   ├── scheduler.py          # APScheduler setup; registered jobs below
│   │   ├── review_reminders.py   # Job: 7-day / 1-day / overdue reminder emails
│   │   └── cleanup.py            # Job: expire unconfirmed registrations, old draft cleanup
│   │
│   ├── templates/
│   │   ├── email/                # Jinja2 HTML email templates (one per notification type)
│   │   └── certificates/         # Per-journal HTML certificate templates (Jinja2)
│   │
│   └── utils/
│       ├── files.py              # Save to /data/uploads/, validate extension, serve
│       ├── slugify.py            # URL-safe slug generation
│       ├── doi.py                # DOI string construction from prefix + volume + issue + seq
│       └── pagination.py         # Shared paginated response helper
│
├── tests/                        # pytest test suite
├── scripts/                      # seed_db.py, create_admin.py
└── pyproject.toml                # uv project file: dependencies, requires-python = ">=3.14"
```

---

## 3. Module Anatomy (Domain Pattern)

Every domain module follows the same internal structure:

```
modules/<domain>/
├── models.py       SQLAlchemy ORM models (table definitions, relationships)
├── repository.py   Raw DB queries — no business logic, returns ORM objects or None
├── service.py      Business logic — calls repository, enforces rules, calls side-effects
│                   (email, search index, certificate generation)
└── schemas.py      Pydantic v2 models — request bodies and response shapes
```

Routes in `api/v1/routes/` call **service functions only** — never the repository directly. This keeps routes thin (auth check, call service, return response) and puts all logic in a testable layer.

---

## 4. Authentication & Authorisation

```
POST /api/v1/auth/login
  → verifies email + bcrypt password
  → issues: access_token (JWT, 15 min) + refresh_token (JWT, 30 days, HttpOnly cookie)

Every protected endpoint:
  → Depends(get_current_user) decodes access_token, loads User from DB
  → Depends(require_role("admin")) or require_role("reviewer") gates specific endpoints
```

**JWT payload:**
```json
{
  "sub": "user_uuid",
  "roles": ["author", "reviewer"],
  "exp": 1234567890
}
```

- A single user can hold multiple roles simultaneously (`["author", "reviewer"]`).
- Admin accounts are a separate user record with `role: admin`; they use a separate login endpoint that enforces the `admin` role claim.
- Passwords hashed with **bcrypt** (cost factor 12). Minimum strength enforced via `zxcvbn` score ≥ 2.

---

## 5. Database — PostgreSQL + SQLAlchemy 2

**Key relationships (simplified):**

```
Subject ──< Journal ──< Volume ──< Issue ──< Paper
                                              │
User (author) >──< PaperAuthor ──────────────┘
User (author) ──< Submission ──< SubmissionFile
Submission ──< ReviewAssignment ──< ReviewReport
Submission ──< Payment ──< PaymentProof
Submission ──< Certificate (acceptance)
Paper ──< Certificate (publication)
ReviewReport ──< Certificate (peer review)
User ──< Notification
```

**Key design decisions:**
- All primary keys are **UUIDs** (not sequential integers) — prevents enumeration attacks on submission IDs and certificate IDs.
- `Submission` holds its own `status` enum column and a full history log in `SubmissionStatusHistory` for audit trail.
- `Paper` has a `submission_id` FK (nullable) — papers can be created directly by admin without going through the submission workflow.
- `view_count` and `download_count` on `Paper` are updated via `UPDATE papers SET view_count = view_count + 1` (atomic increment), not a read-modify-write.

**Migrations:** Alembic with `--autogenerate`. All schema changes go through migration files; never alter tables directly.

---

## 6. File Storage — Garage (S3-compatible)

All files are stored in **Garage** (self-hosted S3-compatible object storage, `dxflrs/garage:v2.3.0`). FastAPI talks to Garage via `aiobotocore` (async boto3). See `docs/architecture/storage.md` for the full Garage architecture.

### Buckets

| Bucket | Access | Contents |
|---|---|---|
| `manuscripts` | Private | Author-uploaded `.docx` + supplementary files |
| `public-assets` | Public | Journal covers, editorial photos, partner logos, blog images |
| `certificates` | Private | Generated certificate PDFs |
| `payment-proofs` | Private | Author-uploaded payment receipts |

### How FastAPI interacts with files

**Uploads** — FastAPI reads the file from the multipart request and calls `storage.upload_file(bucket, key, body)` via `app/utils/storage.py`. The object key is stored in PostgreSQL; the full URL is never stored.

**Private file downloads** — FastAPI calls `storage.presigned_url(bucket, key, expires_in=300)` which returns a time-limited signed URL. This URL is returned to the authenticated client; the client downloads directly from Garage. FastAPI workers are never tied up streaming binary files.

**Public asset URLs** — Constructed directly from the key: `{GARAGE_PUBLIC_ASSETS_ENDPOINT}/{key}`. Nginx proxies `imperialpress.com/assets/` to Garage's web endpoint, so no FastAPI involvement.

**Paper PDF downloads** — Same presigned URL pattern, but FastAPI first increments `download_count` in PostgreSQL before returning the URL.

```
Private download flow:
  Client → GET /api/papers/{id}/download (authenticated)
         → FastAPI checks auth, increments download_count
         → returns { download_url: "https://storage:3900/...?X-Amz-Signature=..." }
         → Client GETs presigned URL directly from Garage (expires in 5 min)

Public asset flow:
  Client → GET imperialpress.com/assets/journals/ijllt/cover.jpg
         → Nginx proxies → Garage web endpoint (port 3902)
         → No FastAPI involved
```

All storage operations live in `app/utils/storage.py`. No raw boto3 calls are scattered across route files.

---

## 7. Certificate Generation

Certificates are generated using **WeasyPrint** (HTML/CSS → PDF):

1. `certificates/service.py` collects all required data (author name, paper title, DOI, etc.)
2. Jinja2 renders the per-journal HTML template with that data
3. WeasyPrint converts the HTML to PDF
4. PDF saved to `/data/certificates/{journal_slug}/{year}/{cert_id}.pdf`
5. Record inserted into `certificates` table
6. PDF emailed as attachment via `notifications/email.py`
7. Certificate available for download from dashboard

The HTML templates live in `app/templates/certificates/`. Admin uploads custom templates per journal via the admin panel; a base fallback template is used if no custom template is uploaded.

---

## 8. MeiliSearch Integration

FastAPI maintains the MeiliSearch index as a side-effect of publish/update actions:

| Trigger | Action |
|---|---|
| Admin publishes paper | `search.service.index_paper(paper)` |
| Admin updates journal | `search.service.index_journal(journal)` |
| Admin publishes blog post | `search.service.index_blog(post)` |
| Admin unpublishes / deletes | `search.service.remove_from_index(id, index)` |

The public website searches MeiliSearch directly using a **search-only API key** (no write access). The master key is only on the server and only used by the FastAPI service.

Three indexes: `papers`, `journals`, `blog_posts` — see PRD §16 for indexed fields.

---

## 9. Background Workers

`workers/scheduler.py` runs **APScheduler** (in-process) on a cron schedule:

| Job | Schedule | Action |
|---|---|---|
| `review_reminders` | Every hour | Check review deadlines; send 7-day, 1-day, and overdue emails |
| `cleanup` | Daily at 02:00 UTC | Remove unverified accounts older than 48 h; delete orphaned draft files |

Workers use the same SQLAlchemy session factory as the main app — no separate process needed at this scale.

---

## 10. Email

`modules/notifications/email.py` sends all transactional email via SMTP (provider TBD — see PRD §19 Out of Scope). Jinja2 HTML templates in `app/templates/email/` are editable by admin at runtime; the rendered HTML is stored per template type and fetched fresh on each send.

Email is always **fire-and-forget inside a FastAPI `BackgroundTask`** — the HTTP response is returned to the caller immediately; the email sends asynchronously and logs failures without surfacing them to the user.

---

## 11. API Conventions

- All routes versioned under `/api/v1/`
- Responses always return Pydantic schemas — ORM objects never returned directly
- Paginated list endpoints return `{ items: [...], total: int, page: int, page_size: int }`
- Errors follow RFC 7807 Problem Details: `{ detail: string, type: string, field_errors: [...] }`
- Swagger UI auto-generated at `api.imperialpress.com/docs` (disabled in production by default; enable via env flag for internal use)
- CORS allows `imperialpress.com` and `admin.imperialpress.com` only; no wildcard origin

---

## 12. Security Checklist

| Concern | Mitigation |
|---|---|
| SQL injection | SQLAlchemy ORM with parameterised queries; never raw string SQL |
| XSS in rich text | `bleach` sanitises HTML on write before DB storage |
| File upload abuse | Extension whitelist + MIME sniffing + size limits enforced in `utils/files.py` |
| JWT secret exposure | Secret loaded from environment variable only; never in source code |
| Brute-force login | Rate limiting via `slowapi` (10 attempts / 15 min per IP) |
| IDOR on submissions/files | Ownership check in service layer before any file serve or data return |
| Certificate enumeration | Certificate IDs use random UUID suffix; sequential `R042` counter salted |
| Admin panel access | Nginx blocks non-HTTPS; FastAPI enforces `role: admin` claim independently |
