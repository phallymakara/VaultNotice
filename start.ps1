# ==============================================================================
# VaultNotice - Turn-key Demo Launcher for Windows PowerShell
# Secure, Targeted Management Announcement Web Part & Portal
# ==============================================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "               VAULTNOTICE - ENTERPRISE DEMO LAUNCHER                 " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Check prerequisites
Write-Host "[1/5] Checking environment prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "ERROR: Docker is required but not installed or not in PATH."
    exit 1
}

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Error "ERROR: 'uv' package manager is required for Python backend."
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "ERROR: 'npm' is required for Vite frontend."
    exit 1
}

Write-Host "  ✓ Docker daemon is available" -ForegroundColor Green
Write-Host "  ✓ uv is installed" -ForegroundColor Green
Write-Host "  ✓ Node & npm are installed" -ForegroundColor Green

# 2. Start PostgreSQL container
$pgPort = if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { "5445" }
Write-Host "[2/5] Starting PostgreSQL database container on host port $pgPort..." -ForegroundColor Yellow
docker compose -p vaultnotice up -d db

Write-Host "Waiting for PostgreSQL database container to become healthy..."
$healthy = $false
for ($i = 0; $i -lt 30; $i++) {
    $status = docker compose -p vaultnotice exec -T db pg_isready -U postgres -d vaultnotice_db 2>&1
    if ($status -like "*accepting connections*") {
        $healthy = $true
        break
    }
    Start-Sleep -Seconds 1
}

if (-not $healthy) {
    Write-Error "PostgreSQL container failed to become ready."
    exit 1
}
Write-Host "  ✓ PostgreSQL is healthy on localhost:$pgPort" -ForegroundColor Green

# 3. Database migrations & Seed data
Write-Host "[3/5] Applying migrations and seeding database..." -ForegroundColor Yellow
Push-Location "$ScriptDir\backend"
try {
    uv run alembic upgrade head
    uv run python -m scripts.seed_data
} finally {
    Pop-Location
}
Write-Host "  ✓ Database migrated and seeded successfully" -ForegroundColor Green

# 4. Launch backend and frontend
Write-Host "[4/5] Launching backend & frontend services..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "uv" -ArgumentList "run uvicorn app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "$ScriptDir\backend" -PassThru
$frontendProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev -- --host 0.0.0.0 --port 5173" -WorkingDirectory "$ScriptDir\frontend" -PassThru

# 5. Display banner
Start-Sleep -Seconds 3
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "              VAULTNOTICE IS RUNNING AND READY FOR DEMO               " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  ▶ Web Portal UI:       http://localhost:5173" -ForegroundColor White
Write-Host "  ▶ Backend REST API:    http://localhost:8000" -ForegroundColor White
Write-Host "  ▶ API Documentation:   http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host " DEMO PERSONAS (Switch easily via top-right dropdown in UI):" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  1. Sarah Lin (Management)      - Has 'Post Announcement' form & author access"
Write-Host "  2. David Miller (Staff)        - Branch Manager; targeted recipient"
Write-Host "  3. Sreyneath Keo (Staff)       - Branch Manager; targeted recipient"
Write-Host "  4. Emily Tan (Staff)           - Finance Specialist; untargeted recipient"
Write-Host "  5. Alex Vorn (Staff)           - IT Support; untargeted recipient"
Write-Host "  6. Portal Admin                - Full platform & template management access"
Write-Host ""
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  See DEMO_GUIDE.md for the step-by-step presentation walkthrough." -ForegroundColor Gray
Write-Host "  Press Ctrl+C to stop all services cleanly." -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor DarkGray

try {
    while ($true) {
        if ($backendProcess.HasExited -or $frontendProcess.HasExited) {
            break
        }
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nStopping VaultNotice demo servers..." -ForegroundColor Yellow
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✓ All VaultNotice services stopped." -ForegroundColor Green
}
