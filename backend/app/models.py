"""Import all ORM models so SQLAlchemy can resolve string relationship() targets.

Import this module once at application / Alembic / test startup. Do not import
individual models from here in domain code — keep using each module's models.py.
"""

from __future__ import annotations

import app.modules.certificates.models as certificates_models  # noqa: F401
import app.modules.content.models as content_models  # noqa: F401
import app.modules.journals.models as journals_models  # noqa: F401
import app.modules.notifications.models as notifications_models  # noqa: F401
import app.modules.papers.models as papers_models  # noqa: F401
import app.modules.payments.models as payments_models  # noqa: F401
import app.modules.reviews.models as reviews_models  # noqa: F401
import app.modules.submissions.models as submissions_models  # noqa: F401
import app.modules.users.models as users_models  # noqa: F401
