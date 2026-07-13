# Zimbabwe Canine Registry - Backend Runner (PowerShell)

if (Test-Path .env) {
    Get-Content .env | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
    }
}

$env:PORT = if ($env:PORT) { $env:PORT } else { 5000 }

Write-Host "Starting API Server on port $env:PORT..." -ForegroundColor Yellow
pnpm --filter @workspace/api-server run dev
