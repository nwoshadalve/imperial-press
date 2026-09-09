@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Start the FastAPI backend with live reload for local development.
REM Idempotent: safe for first-time and everyday use (sync -> migrate -> uvicorn).
REM
REM Usage (from repo root, CMD or PowerShell):
REM   scripts\dev-backend.cmd
REM
REM Requires: uv, Python 3.14, repo-root .env, and infra services
REM   (scripts\compose.ps1 infra up -d). Port comes from API_PORT in .env.

cd /d "%~dp0.."
if not exist ".env" (
  echo Missing .env - copy .env.example to .env and fill in secrets. 1>&2
  exit /b 1
)

where uv >nul 2>&1
if errorlevel 1 (
  echo uv is not installed - https://docs.astral.sh/uv/ 1>&2
  exit /b 1
)

set "API_PORT=8000"
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
  set "KEY=%%A"
  set "VAL=%%B"
  if defined KEY (
    for /f "tokens=* delims= " %%K in ("!KEY!") do set "KEY=%%K"
    if /I "!KEY!"=="API_PORT" (
      for /f "tokens=1 delims=# " %%P in ("!VAL!") do set "API_PORT=%%~P"
    )
  )
)

cd /d "%~dp0..\backend"
uv sync --extra dev
if errorlevel 1 exit /b %ERRORLEVEL%

echo Applying database migrations...
uv run alembic upgrade head
if errorlevel 1 exit /b %ERRORLEVEL%

echo API -^> http://localhost:!API_PORT!  ^(Swagger /docs when ENABLE_SWAGGER=true^)
echo Live reload on - editing backend/ restarts the server.
uv run uvicorn app.main:app --host 0.0.0.0 --port !API_PORT! --reload
exit /b %ERRORLEVEL%
