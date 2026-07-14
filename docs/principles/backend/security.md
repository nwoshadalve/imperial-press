# Security — backend

## Authentication (JWT)

### Token Design

- **Access token**: JWT, 15-minute expiry, returned in the response body. Stored in Zustand memory on the client — never in a cookie.
- **Refresh token**: JWT, 30-day expiry, returned as an `HttpOnly, Secure, SameSite=Strict` cookie. JavaScript cannot read it.
- All JWT operations go through `app/core/security.py`. Never call `jose` or `PyJWT` directly in route or service files.

### JWT Payload

```json
{
  "sub": "user-uuid",
  "roles": ["author", "reviewer"],
  "exp": 1234567890
}
```

A single user can hold multiple roles simultaneously. Admin accounts carry `roles: ["admin"]` and use a separate login endpoint that enforces the admin claim.

### Password Hashing

bcrypt at cost factor 12. Password strength enforced via `zxcvbn` score ≥ 2 before hashing. Never store or log plaintext passwords.

```python
from app.core.security import hash_password, verify_password

hashed = hash_password(plain_password)
is_valid = verify_password(plain_password, hashed)
```

### Role Enforcement

Use `Depends(require_role("admin"))` or `Depends(get_current_user)` on every protected route. Never check roles manually in a route body.

```python
@router.delete("/{id}", status_code=204)
async def delete_user(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),  # enforces admin role
):
    await user_service.delete(session, id)
```

---

## SQL Injection

Use SQLAlchemy ORM for all queries. Never use raw SQL strings with string formatting or f-strings.

```python
# Good — parameterised ORM query
await session.execute(select(User).where(User.email == email))

# Bad — SQL injection risk
await session.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

Raw SQL via `text()` is acceptable only in Alembic migration files.

---

## XSS — Rich Text Sanitisation

All HTML content (blog posts, service page blocks, announcement bodies, call-for-papers descriptions) is sanitised with `bleach` **before writing to the database**. This prevents stored XSS.

```python
import bleach

ALLOWED_TAGS = ["p", "strong", "em", "ul", "ol", "li", "a", "h2", "h3", "br", "blockquote"]
ALLOWED_ATTRIBUTES = {"a": ["href", "rel", "target"]}

def sanitise_html(html: str) -> str:
    return bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)
```

Call `sanitise_html()` in the **service layer** before passing content to the repository. Never store raw user-supplied HTML.

---

## File Upload Validation

All file uploads go through `app/utils/files.py`. The validation chain runs in this order:

1. **Extension whitelist** — check the file extension against the allowed set for that upload type
2. **MIME sniffing** — check the `python-magic` result against expected MIME types (not the client-supplied `content_type`)
3. **Size limit** — enforce per upload type: manuscripts 50 MB, payment proofs 10 MB, images 5 MB
4. **Storage** — save to Garage via `utils/storage.py`; never write to the local filesystem in production

```python
from app.utils.files import validate_and_upload

async def upload_manuscript(file: UploadFile) -> str:
    key = await validate_and_upload(file, allowed_extensions={".docx", ".doc"}, max_mb=50, bucket="manuscripts")
    return key
```

Never allow `.html`, `.js`, `.php`, `.exe`, or any executable extension.

---

## IDOR Prevention

Before returning any resource tied to a user (submission, payment, certificate, file), verify ownership in the service layer. Never rely on the URL parameter alone.

```python
async def get_submission(session, submission_id, requesting_user):
    submission = await submission_repo.get_by_id(session, submission_id)
    if submission is None:
        raise NotFoundError()
    if submission.author_id != requesting_user.id and not requesting_user.is_admin:
        raise ForbiddenError()
    return SubmissionPublic.model_validate(submission)
```

This check applies to every user-owned resource: submissions, files, payment proofs, review assignments.

---

## Rate Limiting

The login endpoint is rate-limited via `slowapi`: 10 attempts per 15 minutes per IP. Configured in `main.py`.

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("10/15minutes")
async def login(request: Request, body: LoginRequest, session: AsyncSession = Depends(get_db)):
    ...
```

---

## Secrets

- All secrets (JWT secret key, Garage credentials, SMTP credentials, MeiliSearch master key) are loaded from environment variables via `pydantic-settings` in `core/config.py`
- Never commit secrets to source control
- Never log JWT tokens, passwords, or API keys — scrub them from log messages before writing

---

## CORS

Only `imperialpress.com` and `admin.imperialpress.com` are allowed origins. Configured once in `main.py`. Never use `allow_origins=["*"]`.

---

## Certificate IDs

Certificate IDs are random UUIDs. Sequential human-readable counters (e.g. `R042`) are salted before being exposed in any public response. This prevents certificate enumeration attacks.
