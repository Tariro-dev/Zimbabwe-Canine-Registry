# Zimbabwe Canine Registry - Database Sync (PowerShell)

if (Test-Path .env) {
    Get-Content .env | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
    }
}

Write-Host "Connecting to Neon Database..." -ForegroundColor Gold
pnpm --filter @workspace/db run push
