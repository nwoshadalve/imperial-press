from __future__ import annotations

import logging

from app.modules.certificates.models import Certificate

logger = logging.getLogger(__name__)


async def generate_certificate(cert: Certificate) -> str:
    """Render a certificate PDF using WeasyPrint and upload it to Garage.

    Returns the storage key of the generated PDF.

    WeasyPrint rendering is out of scope for the initial scaffold.
    The full implementation will:
    1. Load the per-journal Jinja2 HTML template from app/templates/certificates/
    2. Render the template with certificate data (author name, title, DOI, etc.)
    3. Convert the rendered HTML to PDF via WeasyPrint
    4. Upload the PDF bytes to the 'certificates' Garage bucket via utils/storage.py
    5. Return the storage key for database storage
    """
    logger.info(
        "Certificate generation stub called for cert %s (type=%s, user=%s)",
        cert.id,
        cert.type,
        cert.user_id,
    )
    # Stub — return a placeholder key. Replace with full WeasyPrint implementation.
    return f"certificates/{cert.user_id}/{cert.id}.pdf"
