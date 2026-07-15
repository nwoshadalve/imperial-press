# API Conventions — backend

## Versioning

All routes live under `/api/v1/`. When a breaking change is needed, create `/api/v2/` alongside rather than modifying existing endpoints.

## Response Schemas

- All route responses return **Pydantic schemas** — ORM objects never leave the service layer
- Declare `response_model=` on every route decorator
- Return the schema instance directly; FastAPI serialises it

```python
@router.get("/{id}", response_model=JournalPublic)
async def get_journal(id: uuid.UUID, session: AsyncSession = Depends(get_db)):
    return await journal_service.get_journal(session, id)
```

## Paginated Responses

All list endpoints return the same paginated envelope:

```json
{
  "items": [...],
  "total": 142,
  "page": 1,
  "page_size": 20
}
```

Use the shared helper in `utils/pagination.py`:

```python
from app.utils.pagination import paginate, PaginatedResponse

@router.get("/", response_model=PaginatedResponse[SubmissionPublic])
async def list_submissions(
    page: int = 1,
    page_size: int = 20,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = await submission_service.list_submissions(session, current_user, page, page_size)
    return paginate(items, total, page, page_size)
```

## Error Format (RFC 7807)

All errors follow Problem Details format:

```json
{
  "detail": "Submission not found",
  "type": "not_found",
  "field_errors": []
}
```

Validation errors (422) include `field_errors`:

```json
{
  "detail": "Validation failed",
  "type": "validation_error",
  "field_errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

FastAPI's default 422 handler is overridden in `main.py` to emit this format. Domain exceptions from `core/exceptions.py` are also converted here.

## HTTP Methods

| Operation | Method | Notes |
|---|---|---|
| Fetch one | `GET /{id}` | |
| Fetch list | `GET /` | Always paginated |
| Create | `POST /` | Returns 201 with the created resource |
| Full update | `PUT /{id}` | Requires full body |
| Partial update | `PATCH /{id}` | Partial fields |
| Delete | `DELETE /{id}` | Returns 204 no content |
| Action | `POST /{id}/action` | e.g. `/submissions/{id}/accept`, `/payments/{id}/confirm` |

## Status Codes

| Situation | Code |
|---|---|
| Successful GET | 200 |
| Successful POST (created) | 201 |
| Successful DELETE | 204 |
| Validation error | 422 |
| Unauthenticated | 401 |
| Forbidden (authenticated but wrong role or ownership) | 403 |
| Resource not found | 404 |
| Business rule violation | 409 Conflict |

## Route Thinness

Routes are thin controllers. The only logic allowed inside a route function:

1. Extract path/query params and request body
2. Call one service function
3. Return the result

```python
# Good — thin route
@router.post("/{id}/accept", response_model=SubmissionPublic)
async def accept_submission(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return await submission_service.accept(session, id)
```

Business logic (status checks, ownership, side-effects) all live in the service, not here.

## Admin Routes

Admin-only routes live in `api/v1/routes/admin/` and require `Depends(require_role("admin"))` on every endpoint. Public routes for the same resource use separate files under `api/v1/routes/`.

## CORS

Allowed origins: `imperialpress.com` and `admin.imperialpress.com` only. Configured in `main.py`. Never use `allow_origins=["*"]`.

## Swagger

Available at `/docs` (Swagger UI) and `/redoc`. Disabled in production by default; enabled via `ENABLE_SWAGGER=true` env var for internal use.
