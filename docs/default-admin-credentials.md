# Default Admin Credentials

Local / bootstrap credentials for the Imperial Press admin panel. The API creates this user on startup when the email is not already registered (see `backend/app/core/seed.py`).

| Field | Value |
|---|---|
| Email | `admin@imperialpress.com` |
| Password | `ImperialAdmin2026!` |
| Full name | Imperial Press Admin |
| Role | `admin` |

## Login

- Admin panel: `POST /api/v1/auth/admin/login` with the email and password above.
- Same credentials are also accepted by `POST /api/v1/auth/login` (admin role is not required on that endpoint).

## Seeding

After migrations are applied, either:

1. Start the API — the lifespan hook seeds the admin if missing, or
2. Run manually:

```bash
cd backend
uv run python -m app.core.seed
```

Config comes from the repo-root `.env`:

- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_ADMIN_FULL_NAME`

## Security

**Change this password before any production or shared staging deploy.** These values are for local development and first-time bootstrap only. Prefer setting a strong unique password in `.env` and rotating it after first login.
