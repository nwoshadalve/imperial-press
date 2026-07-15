from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


def paginate(items: list[T], total: int, page: int, page_size: int) -> PaginatedResponse[T]:
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size)
