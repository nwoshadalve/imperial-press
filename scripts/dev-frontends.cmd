@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Start frontend-web and frontend-admin dev servers together (local Windows).
REM Idempotent: runs npm ci only when node_modules is missing in each app.
REM
REM Usage (from repo root, CMD or PowerShell):
REM   scripts\dev-frontends.cmd
REM
REM Requires: Node.js + npm, repo-root .env. Ports from WEB_PORT / ADMIN_PORT.

cd /d "%~dp0.."
set "ROOT=%CD%"

if not exist ".env" (
  echo Missing .env - copy .env.example to .env and fill in secrets. 1>&2
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed - https://nodejs.org/ 1>&2
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm is not installed - install Node.js from https://nodejs.org/ 1>&2
  exit /b 1
)

set "WEB_PORT=50173"
set "ADMIN_PORT=50174"
set "ADMIN_BASE_PATH=/admin"

for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
  set "KEY=%%A"
  set "VAL=%%B"
  if defined KEY (
    for /f "tokens=* delims= " %%K in ("!KEY!") do set "KEY=%%K"
    if /I "!KEY!"=="WEB_PORT" (
      for /f "tokens=1 delims=# " %%P in ("!VAL!") do set "WEB_PORT=%%~P"
    )
    if /I "!KEY!"=="ADMIN_PORT" (
      for /f "tokens=1 delims=# " %%P in ("!VAL!") do set "ADMIN_PORT=%%~P"
    )
    if /I "!KEY!"=="ADMIN_BASE_PATH" (
      for /f "tokens=1 delims=# " %%P in ("!VAL!") do set "ADMIN_BASE_PATH=%%~P"
    )
  )
)

if not "!ADMIN_BASE_PATH:~0,1!"=="/" set "ADMIN_BASE_PATH=/!ADMIN_BASE_PATH!"

call :ensure_deps "frontend-web"
if errorlevel 1 exit /b %ERRORLEVEL%

call :ensure_deps "frontend-admin"
if errorlevel 1 exit /b %ERRORLEVEL%

echo.
echo Starting dev servers in separate windows...
echo   Web   -^> http://localhost:!WEB_PORT!/
echo   Admin -^> http://localhost:!ADMIN_PORT!!ADMIN_BASE_PATH!/
echo.
echo Close each window (or Ctrl+C in it) to stop a server.
echo.

start "Imperial Press - Web" cmd /k "cd /d "%ROOT%\frontend-web" && npm run dev"
start "Imperial Press - Admin" cmd /k "cd /d "%ROOT%\frontend-admin" && npm run dev"

exit /b 0

:ensure_deps
set "APP_DIR=%~1"
if exist "%APP_DIR%\node_modules" exit /b 0

echo Installing dependencies in %APP_DIR%...
pushd "%APP_DIR%"
call npm ci
set "RC=!ERRORLEVEL!"
popd
exit /b !RC!
