"""Copyright (c) 2026 Imperial Press. All rights reserved.

Developed by MD Nwoshad Alam Chowdhury.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes.auth import router as auth_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["auth"])
