from __future__ import annotations

import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.modules.submissions import repository as submission_repo
from app.modules.submissions.models import SubmissionStatus
from app.modules.submissions.schemas import SubmissionCreate, SubmissionPublic, SubmissionUpdate
from app.modules.users.models import User

logger = logging.getLogger(__name__)


async def create_submission(
    session: AsyncSession, data: SubmissionCreate, author: User
) -> SubmissionPublic:
    submission = await submission_repo.create(
        session,
        title=data.title,
        abstract=data.abstract,
        journal_id=data.journal_id,
        author_id=author.id,
        status=SubmissionStatus.draft,
    )
    await submission_repo.add_status_history(
        session,
        submission_id=submission.id,
        from_status=None,
        to_status=SubmissionStatus.draft,
        changed_by=author.id,
    )
    logger.info("Created submission %s for author %s", submission.id, author.id)
    return SubmissionPublic.model_validate(submission)


async def get_submission(
    session: AsyncSession, submission_id: uuid.UUID, requesting_user: User
) -> SubmissionPublic:
    submission = await submission_repo.get_by_id(session, submission_id)
    if submission is None:
        raise NotFoundError("Submission not found")
    if submission.author_id != requesting_user.id and "admin" not in requesting_user.roles:
        raise ForbiddenError("Access denied")
    return SubmissionPublic.model_validate(submission)


async def update_submission(
    session: AsyncSession,
    submission_id: uuid.UUID,
    data: SubmissionUpdate,
    requesting_user: User,
) -> SubmissionPublic:
    submission = await submission_repo.get_by_id(session, submission_id)
    if submission is None:
        raise NotFoundError("Submission not found")
    if submission.author_id != requesting_user.id and "admin" not in requesting_user.roles:
        raise ForbiddenError("Access denied")
    if submission.status not in (SubmissionStatus.draft, SubmissionStatus.revision_requested):
        raise ConflictError("Submission cannot be edited in its current status")
    submission = await submission_repo.update(
        session, submission, **data.model_dump(exclude_none=True)
    )
    return SubmissionPublic.model_validate(submission)


async def submit_submission(
    session: AsyncSession, submission_id: uuid.UUID, requesting_user: User
) -> SubmissionPublic:
    submission = await submission_repo.get_by_id(session, submission_id)
    if submission is None:
        raise NotFoundError("Submission not found")
    if submission.author_id != requesting_user.id:
        raise ForbiddenError("Access denied")
    if submission.status != SubmissionStatus.draft:
        raise ConflictError("Only draft submissions can be submitted")
    prev_status = submission.status
    submission = await submission_repo.update(
        session, submission, status=SubmissionStatus.submitted
    )
    await submission_repo.add_status_history(
        session,
        submission_id=submission.id,
        from_status=prev_status,
        to_status=SubmissionStatus.submitted,
        changed_by=requesting_user.id,
    )
    return SubmissionPublic.model_validate(submission)


async def accept_submission(
    session: AsyncSession, submission_id: uuid.UUID, admin: User
) -> SubmissionPublic:
    submission = await submission_repo.get_by_id(session, submission_id)
    if submission is None:
        raise NotFoundError("Submission not found")
    if submission.status != SubmissionStatus.under_review:
        raise ConflictError("Only submissions under review can be accepted")
    prev_status = submission.status
    submission = await submission_repo.update(
        session, submission, status=SubmissionStatus.accepted
    )
    await submission_repo.add_status_history(
        session,
        submission_id=submission.id,
        from_status=prev_status,
        to_status=SubmissionStatus.accepted,
        changed_by=admin.id,
    )
    logger.info("Submission %s accepted by %s", submission.id, admin.id)
    return SubmissionPublic.model_validate(submission)


async def reject_submission(
    session: AsyncSession, submission_id: uuid.UUID, admin: User, note: str | None = None
) -> SubmissionPublic:
    submission = await submission_repo.get_by_id(session, submission_id)
    if submission is None:
        raise NotFoundError("Submission not found")
    if submission.status not in (SubmissionStatus.submitted, SubmissionStatus.under_review):
        raise ConflictError("Submission cannot be rejected in its current status")
    prev_status = submission.status
    submission = await submission_repo.update(
        session, submission, status=SubmissionStatus.rejected
    )
    await submission_repo.add_status_history(
        session,
        submission_id=submission.id,
        from_status=prev_status,
        to_status=SubmissionStatus.rejected,
        changed_by=admin.id,
        note=note,
    )
    logger.info("Submission %s rejected by %s", submission.id, admin.id)
    return SubmissionPublic.model_validate(submission)
