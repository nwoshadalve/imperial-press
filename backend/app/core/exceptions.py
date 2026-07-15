from __future__ import annotations


class AppError(Exception):
    status_code: int = 500
    error_type: str = "internal_error"

    def __init__(self, detail: str = "An error occurred") -> None:
        self.detail = detail
        super().__init__(detail)


class NotFoundError(AppError):
    status_code = 404
    error_type = "not_found"


class ForbiddenError(AppError):
    status_code = 403
    error_type = "forbidden"


class UnauthorizedError(AppError):
    status_code = 401
    error_type = "unauthorized"


class ConflictError(AppError):
    status_code = 409
    error_type = "conflict"


class ValidationAppError(AppError):
    status_code = 422
    error_type = "validation_error"
