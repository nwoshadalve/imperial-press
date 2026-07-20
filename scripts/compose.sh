#!/usr/bin/env bash
# Run Docker Compose from the repo root with both env files loaded.
#
# Shortcuts:
#   ./scripts/compose.sh infra <args...>   # local hybrid — db, search, storage (+ host ports)
#   ./scripts/compose.sh prod  <args...>   # full stack in Docker (profile full + prod overlay)
#   ./scripts/compose.sh cert  <args...>   # certbot profile helpers
#   ./scripts/compose.sh <args...>         # passthrough (base compose only)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example to .env and fill in secrets." >&2
  exit 1
fi
if [[ ! -f .env.compose ]]; then
  echo "Missing .env.compose — copy .env.compose.example to .env.compose and adjust ports." >&2
  exit 1
fi

ENV_ARGS=(--env-file .env --env-file .env.compose)
MODE="${1:-}"

case "$MODE" in
  infra)
    shift
    exec docker compose "${ENV_ARGS[@]}" \
      -f compose.yaml \
      -f infra/compose/docker-compose.infra.yml \
      "$@"
    ;;
  prod)
    shift
    exec docker compose "${ENV_ARGS[@]}" \
      --profile full \
      -f compose.yaml \
      -f infra/compose/docker-compose.prod.yml \
      "$@"
    ;;
  cert)
    shift
    exec docker compose "${ENV_ARGS[@]}" \
      --profile certbot \
      -f compose.yaml \
      -f infra/compose/docker-compose.prod.yml \
      "$@"
    ;;
  *)
    exec docker compose "${ENV_ARGS[@]}" "$@"
    ;;
esac
