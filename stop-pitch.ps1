<#
.SYNOPSIS
    Guardian Agent — Pitch Teardown Orchestrator
    Cleanly stops backend, BFF, frontend, and ephemeral Cloudflare tunnel.
    Stops Docker Compose if active.
#>

$ErrorActionPreference = "SilentlyContinue"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $Root

Write-Host "Stopping Guardian Agent Pitch Stack..." -ForegroundColor Cyan

# 1. Stop Docker Compose if running
$dockerCheck = Get-Command "docker" -ErrorAction SilentlyContinue
if ($dockerCheck) {
    docker compose down --remove-orphans 2>$null
}

# 2. Stop tracked processes from PID file
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
                    Write-Host "Stopping $name (PID $procId)..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                }
            }
        }
    } catch {}
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

# 3. Clean any remaining listeners on project ports (8000, 4000, 5173)
foreach ($port in @(8000, 4000, 5173)) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        if ($c.OwningProcess -and $c.OwningProcess -gt 0) {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

# Clean temp logs
$TunnelLog = Join-Path $Root ".cloudflared.log"
if (Test-Path $TunnelLog) { Remove-Item $TunnelLog -Force -ErrorAction SilentlyContinue }

Write-Host "Guardian Agent pitch stack stopped cleanly." -ForegroundColor Green
