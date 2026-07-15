from __future__ import annotations

import logging

from fastapi import UploadFile

from app.core.exceptions import ValidationAppError

logger = logging.getLogger(__name__)

MAX_SIZES: dict[str, int] = {
    "manuscript": 50 * 1024 * 1024,
    "payment_proof": 10 * 1024 * 1024,
    "image": 5 * 1024 * 1024,
}

FORBIDDEN_EXTENSIONS: set[str] = {".html", ".js", ".php", ".exe", ".sh", ".bat"}


async def validate_and_upload(
    file: UploadFile,
    allowed_extensions: set[str],
    max_mb: int,
    bucket: str,
) -> str:
    """Validate a file upload (extension, size) and store it in Garage.

    Returns the storage key.
    """
    from app.utils.storage import upload_file

    raw_name = file.filename or "upload"
    if "." in raw_name:
        ext = "." + raw_name.rsplit(".", 1)[-1].lower()
    else:
        ext = ""

    if ext in FORBIDDEN_EXTENSIONS or ext not in allowed_extensions:
        raise ValidationAppError(f"File extension {ext!r} is not allowed")

    content = await file.read()
    max_bytes = max_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise ValidationAppError(f"File exceeds {max_mb} MB limit")

    logger.info(
        "Uploading %s (%d bytes) to bucket %s",
        raw_name,
        len(content),
        bucket,
    )
    key = await upload_file(bucket, raw_name, content)
    return key
