# Zimbabwe Canine Registry - Development Runner (PowerShell)

if (Test-Path .env) {
    Get-Content .env | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
    }
}

Write-Host "Starting Dynamic System (Backend + Frontend)..." -ForegroundColor Yellow
# Using --parallel BEFORE the command 'run dev' ensures pnpm consumes it, not the underlying app
pnpm -r --filter "@workspace/api-server" --filter "@workspace/web" --parallel run dev
