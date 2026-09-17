# One-command deploy setup for ReMarket
# Prerequisites: gh CLI logged in, Render + Vercel accounts
#
# Usage:
#   1. Get Render API key: https://dashboard.render.com/u/settings#api-keys
#   2. Get Vercel token: https://vercel.com/account/tokens
#   3. Run: .\scripts\deploy-all.ps1

param(
    [string]$RenderApiKey,
    [string]$VercelToken
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $root "server\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: server/.env not found" -ForegroundColor Red
    exit 1
}

# Parse .env
$vars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $parts = $_ -split '=', 2
    if ($parts.Count -eq 2) { $vars[$parts[0].Trim()] = $parts[1].Trim() }
}

function Get-Val($key, $default) {
    if ($vars.ContainsKey($key) -and $vars[$key]) { return $vars[$key] }
    return $default
}

$jwtRefresh = Get-Val 'JWT_REFRESH_SECRET' 'remarket_prod_refresh_secret_min32chars_xyz'

Write-Host "`n=== Step 1: GitHub repo ===" -ForegroundColor Cyan
Push-Location $root
git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "Deploy: update project files"
    git push
}
Write-Host "GitHub: https://github.com/farhanrangara06/ReMarket" -ForegroundColor Green
Pop-Location

if (-not $RenderApiKey) {
    Write-Host "`n=== RENDER DEPLOY (manual - 3 min) ===" -ForegroundColor Yellow
    Write-Host "1. Open: https://dashboard.render.com/blueprint/new"
    Write-Host "2. Sign in with GitHub -> select farhanrangara06/ReMarket"
    Write-Host "3. Paste these env vars:"
    Write-Host ""
    & (Join-Path $PSScriptRoot "show-deploy-env.ps1")
    Write-Host ""
    Write-Host "4. After deploy, API URL: https://remarket-api.onrender.com"
} else {
    Write-Host "`n=== Step 2: Render API deploy ===" -ForegroundColor Cyan
    Write-Host "Render API key provided - use Blueprint on dashboard (API create requires connected repo)"
    Write-Host "Open: https://dashboard.render.com/blueprint/new"
}

if (-not $VercelToken) {
    Write-Host "`n=== VERCEL DEPLOY (manual - 3 min) ===" -ForegroundColor Yellow
    Write-Host "1. Open: https://vercel.com/new"
    Write-Host "2. Import: farhanrangara06/ReMarket"
    Write-Host "3. Root Directory: client"
    Write-Host "4. Env: VITE_API_URL=https://remarket-api.onrender.com/api"
    Write-Host "5. Deploy -> copy Vercel URL -> set CLIENT_URL on Render"
} else {
    Write-Host "`n=== Step 3: Vercel CLI deploy ===" -ForegroundColor Cyan
    $env:VERCEL_TOKEN = $VercelToken
    Push-Location (Join-Path $root "client")
    npx --yes vercel@latest deploy --prod --yes --token $VercelToken
    Pop-Location
}

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "Repo:  https://github.com/farhanrangara06/ReMarket"
Write-Host "Guide: QUICK_DEPLOY.md"
Write-Host ""
