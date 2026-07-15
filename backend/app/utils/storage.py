from __future__ import annotations

import logging
import uuid

from app.core.config import settings

logger = logging.getLogger(__name__)


async def upload_file(bucket: str, filename: str, content: bytes) -> str:
    """Upload a file to Garage S3-compatible storage and return the storage key.

    Stubbed for scaffolding — the full implementation uses aiobotocore to PUT
    the object to the configured Garage endpoint.
    """
    logger.info(
        "Uploading %s to bucket %s (%d bytes) via %s",
        filename,
        bucket,
        len(content),
        settings.garage_endpoint,
    )
    # Full implementation:
    #   session = aiobotocore.session.AioSession()
    #   async with session.create_client("s3", endpoint_url=settings.garage_endpoint,
    #       aws_access_key_id=settings.garage_access_key,
    #       aws_secret_access_key=settings.garage_secret_key,
    #       region_name=settings.garage_region) as client:
    #       await client.put_object(Bucket=bucket, Key=key, Body=content)
    key = f"{bucket}/{uuid.uuid4()}/{filename}"
    return key


async def delete_file(bucket: str, key: str) -> None:
    """Delete a file from Garage S3-compatible storage."""
    logger.info("Deleting %s from bucket %s via %s", key, bucket, settings.garage_endpoint)


async def presigned_url(bucket: str, key: str, expires_in: int = 300) -> str:
    """Generate a pre-signed URL for private file download.

    Stubbed for scaffolding — full implementation calls
    aiobotocore generate_presigned_url.
    """
    logger.info("Generating presigned URL for %s/%s (expires=%ds)", bucket, key, expires_in)
    return f"{settings.garage_endpoint}/{bucket}/{key}?signed=stub"
