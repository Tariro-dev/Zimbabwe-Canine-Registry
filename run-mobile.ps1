# Zimbabwe Canine Registry - Mobile Runner (PowerShell)

Write-Host "Starting Expo Development Server (Offline Mode)..." -ForegroundColor Yellow

# Fix for "fetch failed" / "Body is unusable" errors in Node.js
$env:NODE_OPTIONS = "--dns-result-order=ipv4first"
$env:EXPO_OFFLINE = 1

pnpm --filter @workspace/mobile run dev
