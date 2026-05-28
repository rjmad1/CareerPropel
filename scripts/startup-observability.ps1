$ErrorActionPreference = "Stop"

$ProjectDir = "C:\Users\rajaj\career-ops"
Write-Host "Starting Observability Dashboard automation in $ProjectDir"

Set-Location $ProjectDir

Write-Host "Bringing up services using Docker Compose..."
docker-compose up -d

Write-Host "Waiting for the web service to become ready..."
$ready = $false
$maxRetries = 30
$retryCount = 0

while (-not $ready -and $retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/ready" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
            Write-Host "Service is ready!"
        }
    } catch {
        # Ignore connection errors and wait
    }
    
    if (-not $ready) {
        Start-Sleep -Seconds 2
        $retryCount++
        Write-Host "Still waiting... ($retryCount/$maxRetries)"
    }
}

if ($ready) {
    Write-Host "Launching Observability Dashboard..."
    Start-Process "http://localhost:3000/observability/live"
} else {
    Write-Host "Warning: Service did not become ready within the expected time."
}
