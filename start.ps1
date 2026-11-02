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
Write-Host "[1/2] Checking environment prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "ERROR: 'npm' is required for Vite frontend."
    exit 1
}

Write-Host "  ✓ Node & npm are installed" -ForegroundColor Green

# 2. Launch Vite frontend
Write-Host "[2/2] Launching VaultNotice Frontend..." -ForegroundColor Yellow
Push-Location "$ScriptDir\frontend"
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  VaultNotice is starting in standalone mock mode!" -ForegroundColor Green
Write-Host "  Frontend URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

npm run dev
