# Run Docker Compose from the repo root with both env files loaded.
#
# Shortcuts:
#   .\scripts\compose.ps1 infra <args...>   # local hybrid — db, search, storage (+ host ports)
#   .\scripts\compose.ps1 prod  <args...>   # full stack in Docker (profile full + prod overlay)
#   .\scripts\compose.ps1 cert  <args...>   # certbot profile helpers
#   .\scripts\compose.ps1 <args...>         # passthrough (base compose only)
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path ".env")) {
  Write-Error "Missing .env — copy .env.example to .env and fill in secrets."
}
if (-not (Test-Path ".env.compose")) {
  Write-Error "Missing .env.compose — copy .env.compose.example to .env.compose and adjust ports."
}

$EnvArgs = @("--env-file", ".env", "--env-file", ".env.compose")

if ($args.Count -gt 0 -and $args[0] -eq "infra") {
  $rest = @()
  if ($args.Count -gt 1) { $rest = $args[1..($args.Count - 1)] }
  docker compose @EnvArgs `
    -f compose.yaml `
    -f infra/compose/docker-compose.infra.yml `
    @rest
  exit $LASTEXITCODE
}

if ($args.Count -gt 0 -and $args[0] -eq "prod") {
  $rest = @()
  if ($args.Count -gt 1) { $rest = $args[1..($args.Count - 1)] }
  docker compose @EnvArgs `
    --profile full `
    -f compose.yaml `
    -f infra/compose/docker-compose.prod.yml `
    @rest
  exit $LASTEXITCODE
}

if ($args.Count -gt 0 -and $args[0] -eq "cert") {
  $rest = @()
  if ($args.Count -gt 1) { $rest = $args[1..($args.Count - 1)] }
  docker compose @EnvArgs `
    --profile certbot `
    -f compose.yaml `
    -f infra/compose/docker-compose.prod.yml `
    @rest
  exit $LASTEXITCODE
}

docker compose @EnvArgs @args
exit $LASTEXITCODE
