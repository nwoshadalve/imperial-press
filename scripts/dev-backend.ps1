# Start the FastAPI backend with live reload for local development.
# Idempotent: safe for first-time and everyday use (sync → migrate → uvicorn).
#
# Usage (from repo root):
#   .\scripts\dev-backend.ps1
#
# Requires: uv, Python 3.14, repo-root .env, and infra services
#   (.\scripts\compose.ps1 infra up -d). Port comes from API_PORT in .env.
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path ".env")) {
  Write-Error "Missing .env - copy .env.example to .env and fill in secrets."
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  Write-Error "uv is not installed - https://docs.astral.sh/uv/"
}

$ApiPort = "8000"
$apiPortLine = Get-Content ".env" |
  Where-Object { $_ -match '^\s*API_PORT=' } |
  Select-Object -Last 1
if ($apiPortLine) {
  $value = ($apiPortLine -split '=', 2)[1]
  $value = ($value -split '#', 2)[0].Trim().Trim('"').Trim("'")
  if ($value) { $ApiPort = $value }
}

Set-Location (Join-Path $Root "backend")
uv sync --extra dev
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Applying database migrations..."
uv run alembic upgrade head
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "API -> http://localhost:${ApiPort}  (Swagger /docs when ENABLE_SWAGGER=true)"
Write-Host "Live reload on - editing backend/ restarts the server."
uv run uvicorn app.main:app --host 0.0.0.0 --port $ApiPort --reload
exit $LASTEXITCODE
