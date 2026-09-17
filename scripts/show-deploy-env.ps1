# Prints env vars from server/.env for copy-paste into Render dashboard.
# Run: .\scripts\show-deploy-env.ps1

$envFile = Join-Path $PSScriptRoot "..\server\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: server/.env not found" -ForegroundColor Red
    exit 1
}

$vars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $parts = $_ -split '=', 2
    if ($parts.Count -eq 2) { $vars[$parts[0].Trim()] = $parts[1].Trim() }
}

Write-Host "`n=== COPY THESE INTO RENDER → Environment ===" -ForegroundColor Cyan
Write-Host "NODE_ENV=production"
Write-Host "PORT=5000"
Write-Host "MONGO_URI=$($vars['MONGO_URI'])"
Write-Host "JWT_SECRET=$($vars['JWT_SECRET'])"
Write-Host "JWT_REFRESH_SECRET=$($vars['JWT_REFRESH_SECRET'] ?? 'GENERATE_A_32_CHAR_RANDOM_STRING')"
Write-Host "JWT_EXPIRE=15m"
Write-Host "JWT_REFRESH_EXPIRE=7d"
Write-Host "CLIENT_URL=https://YOUR-VERCEL-URL.vercel.app"
Write-Host "COOKIE_SAME_SITE=none"
Write-Host "CLOUDINARY_CLOUD_NAME=$($vars['CLOUDINARY_CLOUD_NAME'])"
Write-Host "CLOUDINARY_API_KEY=$($vars['CLOUDINARY_API_KEY'])"
Write-Host "CLOUDINARY_API_SECRET=$($vars['CLOUDINARY_API_SECRET'])"
Write-Host "SMTP_HOST=$($vars['SMTP_HOST'])"
Write-Host "SMTP_PORT=$($vars['SMTP_PORT'])"
Write-Host "SMTP_SECURE=$($vars['SMTP_SECURE'])"
Write-Host "SMTP_USER=$($vars['SMTP_USER'])"
Write-Host "SMTP_PASS=$($vars['SMTP_PASS'])"
Write-Host "EMAIL_FROM=$($vars['EMAIL_FROM'])"
Write-Host "`n=== VERCEL env var ===" -ForegroundColor Cyan
Write-Host "VITE_API_URL=https://remarket-api.onrender.com/api"
Write-Host "`n(Update CLIENT_URL on Render after you get your Vercel URL)`n" -ForegroundColor Yellow
