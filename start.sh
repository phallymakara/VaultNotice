#!/usr/bin/env bash
# ==============================================================================
# VaultNotice - Turn-key Demo Launcher for Linux & macOS
# ==============================================================================

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "======================================================================"
echo "               VAULTNOTICE - ENTERPRISE DEMO LAUNCHER                 "
echo "======================================================================"

echo "[1/2] Checking prerequisites..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: 'npm' is required to run the frontend."
    exit 1
fi

echo "  ✓ Node & npm are installed"

echo "[2/2] Starting VaultNotice Frontend..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo ""
echo "======================================================================"
echo "  VaultNotice is starting in standalone mock mode!"
echo "  Frontend URL: http://localhost:5173"
echo "======================================================================"
echo ""

npm run dev
