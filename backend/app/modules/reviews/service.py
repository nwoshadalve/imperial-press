from __future__ import annotations

import logging
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.modules.reviews import repository as review_repo
from app.modules.reviews.schemas import (
    ReviewAssignmentPublic,
    ReviewReportCreate,
    ReviewReportPublic,
)
from app.modules.users.models import User

logger = logging.getLogger(__name__)


async def assign_reviewer(
    session: AsyncSession,
    submission_id: uuid.UUID,
    reviewer_id: uuid.UUID,
    due_date: datetime | None,
    admin: User,
) -> ReviewAssignmentPublic:
    assignment = await review_repo.create_assignment(
        session,
        submission_id=submission_id,
        reviewer_id=reviewer_id,
        due_date=due_date,
        status="pending",
    )
    logger.info(
        "Reviewer %s assigned to submission %s by admin %s",
        reviewer_id,
        submission_id,
        admin.id,
    )
    return ReviewAssignmentPublic.model_validate(assignment)


async def get_assignment(
    session: AsyncSession, assignment_id: uuid.UUID, requesting_user: User
) -> ReviewAssignmentPublic:
    assignment = await review_repo.get_assignment_by_id(session, assignment_id)
    if assignment is None:
        raise NotFoundError("Review assignment not found")
    if (
        assignment.reviewer_id != requesting_user.id
        and "admin" not in requesting_user.roles
    ):
        raise ForbiddenError("Access denied")
    return ReviewAssignmentPublic.model_validate(assignment)


async def submit_report(
    session: AsyncSession,
    assignment_id: uuid.UUID,
    data: ReviewReportCreate,
    reviewer: User,
) -> ReviewReportPublic:
    assignment = await review_repo.get_assignment_by_id(session, assignment_id)
    if assignment is None:
        raise NotFoundError("Review assignment not found")
    if assignment.reviewer_id != reviewer.id:
        raise ForbiddenError("Access denied")
    if assignment.report is not None:
        raise ConflictError("Report already submitted for this assignment")

    report = await review_repo.create_report(
        session,
        assignment_id=assignment_id,
        recommendation=data.recommendation,
        comments_to_author=data.comments_to_author,
        comments_to_editor=data.comments_to_editor,
    )
    await review_repo.update_assignment(session, assignment, status="completed")
    logger.info("Review report submitted for assignment %s", assignment_id)
    return ReviewReportPublic.model_validate(report)
