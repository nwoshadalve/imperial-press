#!/usr/bin/env bash
# Start the FastAPI backend with live reload for local development.
# Idempotent: safe for first-time and everyday use (sync → migrate → uvicorn).
#
# Usage (from repo root):
#   ./scripts/dev-backend.sh
#
# Requires: uv, Python 3.14, repo-root .env, and infra services
#   (./scripts/compose.sh infra up -d). Port comes from API_PORT in .env.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example to .env and fill in secrets." >&2
  exit 1
fi

if ! command -v uv >/dev/null 2>&1; then
  echo "uv is not installed — https://docs.astral.sh/uv/" >&2
  exit 1
fi

API_PORT=8000
line="$(grep -E '^[[:space:]]*API_PORT=' .env | tail -1 || true)"
if [[ -n "$line" ]]; then
  API_PORT="${line#*=}"
  API_PORT="${API_PORT%%#*}"
  API_PORT="${API_PORT//[[:space:]]/}"
  API_PORT="${API_PORT#\"}"
  API_PORT="${API_PORT%\"}"
  API_PORT="${API_PORT#\'}"
  API_PORT="${API_PORT%\'}"
fi

cd backend
uv sync --extra dev

echo "Applying database migrations…"
uv run alembic upgrade head

echo "API → http://localhost:${API_PORT}  (Swagger /docs when ENABLE_SWAGGER=true)"
echo "Live reload on — editing backend/ restarts the server."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port "$API_PORT" --reload
