# Module Structure — backend

## Domain Module Anatomy

Every domain in `modules/` follows the same four-file pattern:

```
modules/<domain>/
├── models.py       SQLAlchemy ORM models — table definitions and relationships only
├── repository.py   DB queries — no business logic; returns ORM objects or None
├── service.py      Business logic — calls repository, enforces rules, triggers side-effects
└── schemas.py      Pydantic v2 models — request bodies and response shapes
```

Routes in `api/v1/routes/` call **service functions only**. Never import from `repository.py` in a route file.

```
Route (thin) → Service (logic) → Repository (queries) → SQLAlchemy → PostgreSQL
```

---

## models.py

Define SQLAlchemy ORM models only. No business logic, no validation, no Pydantic.

```python
import uuid
from sqlalchemy import String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500))
    status: Mapped[SubmissionStatus] = mapped_column(Enum(SubmissionStatus), default=SubmissionStatus.draft)
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))

    author: Mapped["User"] = relationship("User", back_populates="submissions")
    files: Mapped[list["SubmissionFile"]] = relationship("SubmissionFile", back_populates="submission")
```

---

## repository.py

Raw DB queries. Takes `AsyncSession` as first argument. Returns ORM objects, lists, or `None`. No business logic, no Pydantic conversion, no side-effects.

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.modules.submissions.models import Submission

async def get_by_id(session: AsyncSession, submission_id: uuid.UUID) -> Submission | None:
    result = await session.execute(
        select(Submission)
        .options(selectinload(Submission.files))
        .where(Submission.id == submission_id)
    )
    return result.scalar_one_or_none()

async def list_by_status(session: AsyncSession, status: SubmissionStatus) -> list[Submission]:
    result = await session.execute(
        select(Submission).where(Submission.status == status)
    )
    return list(result.scalars())
```

---

## service.py

Business logic layer. Calls repository, enforces rules, triggers side-effects (email, search index updates, certificate generation). Converts ORM objects to Pydantic schemas before returning. Raises domain exceptions — not `HTTPException`.

```python
from app.core.exceptions import NotFoundError, ForbiddenError
from app.modules.submissions import repository as submission_repo
from app.modules.submissions.schemas import SubmissionPublic

async def get_submission(
    session: AsyncSession,
    submission_id: uuid.UUID,
    requesting_user: User,
) -> SubmissionPublic:
    submission = await submission_repo.get_by_id(session, submission_id)
    if submission is None:
        raise NotFoundError("Submission not found")
    if submission.author_id != requesting_user.id and not requesting_user.is_admin:
        raise ForbiddenError("Access denied")
    return SubmissionPublic.model_validate(submission)

async def accept_submission(session: AsyncSession, submission_id: uuid.UUID) -> SubmissionPublic:
    submission = await submission_repo.get_by_id(session, submission_id)
    if submission.status != SubmissionStatus.under_review:
        raise ConflictError("Cannot accept a submission that is not under review")
    submission.status = SubmissionStatus.accepted
    await session.commit()

    # Side-effects belong in service, not in the route
    await certificate_service.generate_acceptance(session, submission)
    await notification_service.create_notification(session, submission.author_id, "submission_accepted")
    return SubmissionPublic.model_validate(submission)
```

---

## schemas.py

Pydantic v2 schemas. Use **separate schemas** for create, update, and public response — never reuse the same schema for both input and output.

```python
from pydantic import BaseModel, ConfigDict
import uuid

class SubmissionCreate(BaseModel):
    title: str
    abstract: str
    journal_id: uuid.UUID

class SubmissionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # required for model_validate(orm_obj)

    id: uuid.UUID
    title: str
    status: SubmissionStatus
    created_at: datetime
```

All response schemas must have `model_config = ConfigDict(from_attributes=True)`.

---

## Route Files (api/v1/routes/)

Routes are thin controllers: validate the caller's identity, call one service function, return the result. Nothing else.

```python
@router.get("/{submission_id}", response_model=SubmissionPublic)
async def get_submission(
    submission_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await submission_service.get_submission(session, submission_id, current_user)
```

Business logic, ownership checks, status transitions, and side-effects are **never** in route files.

---

## Existing Domains

| Domain | Key models |
|---|---|
| `users` | User |
| `journals` | Subject, Journal, Volume, Issue |
| `papers` | Paper, PaperAuthor |
| `submissions` | Submission, Contributor, SubmissionFile, SubmissionStatusHistory |
| `reviews` | ReviewAssignment, ReviewReport |
| `payments` | Payment, PaymentProof |
| `certificates` | Certificate — plus `generator.py` for WeasyPrint PDF rendering |
| `content` | BlogPost, ServicePage, ServiceBlock, StaticPage, Announcement, CallForPapers, Partner |
| `search` | No models — wraps MeiliSearch via `client.py` |
| `notifications` | Notification — plus `email.py` for SMTP dispatch |
| `stats` | No models — aggregate queries for the home page stats bar |
