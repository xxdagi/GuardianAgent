<#
.SYNOPSIS
    Guardian Agent — Pitch Ready Orchestrator
    Starts all services (Docker Compose if docker is present, otherwise clean native host stack),
    starts ephemeral Cloudflare tunnel, generates 800x800 QR code PNG, and displays pitch links.
#>

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $Root

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "          Guardian Agent — INITIALIZING PITCH STACK          " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Clean previous run if pid file exists
$PidFile = Join-Path $Root ".pitch-pids.json"
if (Test-Path $PidFile) {
    try {
        $pids = Get-Content $PidFile -Raw | ConvertFrom-Json
        foreach ($prop in $pids.PSObject.Properties) {
            $procId = $prop.Value
            if ($procId) {
                $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
                if ($p) {
                    $name = $prop.Name
                    Write-Host "Stopping previous $name (PID $procId)..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {}
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

# Also ensure ports 8000, 4000, 5173 are free
foreach ($port in @(8000, 4000, 5173)) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            if ($c.OwningProcess -and $c.OwningProcess -gt 0) {
                Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}
}

# 2. Check for Docker Compose vs Native Host Stack
$HasDocker = $false
try {
    $dockerCheck = Get-Command "docker" -ErrorAction SilentlyContinue
    if ($dockerCheck) {
        $testRun = docker compose version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $HasDocker = $true
        }
    }
} catch {
    $HasDocker = $false
}

$ProcessTracker = @{}

if ($HasDocker) {
    Write-Host "[1/5] Starting services via Docker Compose..." -ForegroundColor Green
    docker compose up -d --build
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start Docker Compose stack."
    }
} else {
    Write-Host "[1/5] Starting services natively on host (Docker CLI not detected in system PATH)..." -ForegroundColor Green

    # Python venv / executable
    $PythonExe = Join-Path $Root "backend\.venv\Scripts\python.exe"
    if (-not (Test-Path $PythonExe)) {
        $PythonExe = (Get-Command "python" -ErrorAction Stop).Source
    }

    # Start Backend on :8000
    Write-Host "  -> Launching Backend (FastAPI on :8000)..." -ForegroundColor Gray
    $backendOut = Join-Path $Root ".backend.log"
    $backendErr = Join-Path $Root ".backend.err.log"
    $backendProc = Start-Process -FilePath $PythonExe `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" `
        -WorkingDirectory (Join-Path $Root "backend") `
        -RedirectStandardOutput $backendOut `
        -RedirectStandardError $backendErr `
        -WindowStyle Hidden `
        -PassThru
    $ProcessTracker["Backend"] = $backendProc.Id

    # Start BFF on :4000
    Write-Host "  -> Launching BFF (Express on :4000)..." -ForegroundColor Gray
    $bffOut = Join-Path $Root ".bff.log"
    $bffErr = Join-Path $Root ".bff.err.log"
    $bffProc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npm run dev" `
        -WorkingDirectory (Join-Path $Root "bff") `
        -RedirectStandardOutput $bffOut `
        -RedirectStandardError $bffErr `
        -WindowStyle Hidden `
        -PassThru
    $ProcessTracker["BFF"] = $bffProc.Id

    # Start Frontend on :5173
    Write-Host "  -> Launching Frontend (Vite on :5173)..." -ForegroundColor Gray
    $frontendOut = Join-Path $Root ".frontend.log"
    $frontendErr = Join-Path $Root ".frontend.err.log"
    $frontendProc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npm run dev -- --host 0.0.0.0" `
        -WorkingDirectory (Join-Path $Root "frontend") `
        -RedirectStandardOutput $frontendOut `
        -RedirectStandardError $frontendErr `
        -WindowStyle Hidden `
        -PassThru
    $ProcessTracker["Frontend"] = $frontendProc.Id
}

# 3. Health Checks
Write-Host "[2/5] Verifying service health..." -ForegroundColor Green

# Backend Health
$backendOk = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
        if ($res.status -eq "ok") { $backendOk = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 500
}
if (-not $backendOk) { throw "Backend health check failed on http://127.0.0.1:8000/health" }

# BFF Health
$bffOk = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:4000/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
        if ($res.status -eq "ok") { $bffOk = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 500
}
if (-not $bffOk) { throw "BFF health check failed on http://127.0.0.1:4000/health" }

# Frontend Health
$frontendOk = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($res.StatusCode -eq 200) { $frontendOk = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 500
}
if (-not $frontendOk) { throw "Frontend check failed on http://127.0.0.1:5173" }

Write-Host "  [OK] Backend:  http://127.0.0.1:8000" -ForegroundColor Gray
Write-Host "  [OK] BFF:      http://127.0.0.1:4000" -ForegroundColor Gray
Write-Host "  [OK] Frontend: http://127.0.0.1:5173" -ForegroundColor Gray

# 4. Start Ephemeral Cloudflare Tunnel
Write-Host "[3/5] Starting ephemeral Cloudflare tunnel..." -ForegroundColor Green
$TunnelLog = Join-Path $Root ".cloudflared.log"
if (Test-Path $TunnelLog) { Remove-Item $TunnelLog -Force }

$tunnelProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npx --yes cloudflared tunnel --url http://127.0.0.1:5173 > `"$TunnelLog`" 2>&1" `
    -WorkingDirectory $Root `
    -WindowStyle Hidden `
    -PassThru
$ProcessTracker["Tunnel"] = $tunnelProc.Id

# Persist PID tracker
$ProcessTracker | ConvertTo-Json | Set-Content $PidFile -Force

# Read generated https://*.trycloudflare.com URL from log
$CloudflareUrl = $null
for ($i = 0; $i -lt 40; $i++) {
    if (Test-Path $TunnelLog) {
        $content = Get-Content $TunnelLog -Raw -ErrorAction SilentlyContinue
        if ($content -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
            $CloudflareUrl = $matches[0]
            break
        }
    }
    Start-Sleep -Milliseconds 500
}

if (-not $CloudflareUrl) {
    throw "Cloudflare tunnel did not provide a public trycloudflare.com URL. Check $TunnelLog"
}

# Verify Cloudflare URL is reachable and does not return 403
Write-Host "[4/5] Verifying Cloudflare public HTTPS URL ($CloudflareUrl)..." -ForegroundColor Green
$cfReachable = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $testReq = Invoke-WebRequest -Uri $CloudflareUrl -Method Get -TimeoutSec 3 -ErrorAction Stop
        if ($testReq.StatusCode -eq 200) {
            $cfReachable = $true
            break
        }
    } catch {
        # Cloudflare edge propagation may take 1-3 seconds
    }
    Start-Sleep -Milliseconds 500
}

# 5. Generate high-resolution 800x800 QR Code PNG
Write-Host "[5/5] Generating 800x800 QR Code image..." -ForegroundColor Green
$QrFile = Join-Path $Root "demo-qr.png"
if (Test-Path $QrFile) { Remove-Item $QrFile -Force }

$EncodedUrl = [System.Uri]::EscapeDataString($CloudflareUrl)
$QrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=800x800" + [char]38 + "data=" + $EncodedUrl + [char]38 + "format=png" + [char]38 + "margin=15"

Invoke-WebRequest -Uri $QrApiUrl -OutFile $QrFile -TimeoutSec 15 -ErrorAction Stop

# Verify PNG header (89 50 4E 47) and file size
$qrValid = $false
if (Test-Path $QrFile) {
    $bytes = [System.IO.File]::ReadAllBytes($QrFile)
    if ($bytes.Length -gt 1000 -and $bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50 -and $bytes[2] -eq 0x4E -and $bytes[3] -eq 0x47) {
        $qrValid = $true
    }
}
if (-not $qrValid) {
    throw "QR code generation failed or invalid PNG image received."
}

# Launch QR image in default viewer
try {
    Start-Process $QrFile
} catch {}

# Final Presentation Output
$DispatcherUrl = "$CloudflareUrl/dispatcher"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                Guardian Agent — PITCH READY                 " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PHONE:" -ForegroundColor Yellow
Write-Host "  $CloudflareUrl/" -ForegroundColor White
Write-Host ""
Write-Host "DISPATCHER:" -ForegroundColor Yellow
Write-Host "  $DispatcherUrl" -ForegroundColor White
Write-Host ""
Write-Host "QR:" -ForegroundColor Yellow
Write-Host "  $QrFile" -ForegroundColor White
Write-Host ""
Write-Host "BACKEND:    OK" -ForegroundColor Green
Write-Host "BFF:        OK" -ForegroundColor Green
Write-Host "FRONTEND:   OK" -ForegroundColor Green
Write-Host "CLOUDFLARE: OK" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
