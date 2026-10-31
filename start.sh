#!/usr/bin/env bash
# ==============================================================================
# VaultNotice - Turn-key Demo Launcher
# Secure, Targeted Management Announcement Web Part & Portal
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "               VAULTNOTICE - ENTERPRISE DEMO LAUNCHER                 "
echo "======================================================================"

# 1. Check prerequisites
echo "[1/5] Checking environment prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is required but not installed." >&2
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Attempting to start Docker daemon..."
    open -a Docker || true
    until docker info &> /dev/null; do
        sleep 2
        echo "Waiting for Docker daemon to become responsive..."
    done
fi

if ! command -v uv &> /dev/null; then
    echo "ERROR: 'uv' package manager is required for Python backend." >&2
    echo "Please install via: curl -LsSf https://astral.sh/uv/install.sh | sh" >&2
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: 'npm' is required for Vite frontend." >&2
    exit 1
fi

echo "  ✓ Docker daemon is active"
echo "  ✓ uv is installed ($(uv --version))"
echo "  ✓ Node & npm are installed ($(node --version), npm v$(npm --version))"

# 2. Start PostgreSQL container
echo "[2/5] Starting PostgreSQL database container..."
docker compose up -d db

echo "Waiting for PostgreSQL database container to become healthy..."
until docker compose exec -T db pg_isready -U postgres -d vaultnotice > /dev/null 2>&1; do
    sleep 1
done
echo "  ✓ PostgreSQL is healthy on localhost:5432"

# 3. Database migrations & Seed data
echo "[3/5] Applying migrations and seeding database..."
cd "${REPO_ROOT}/backend"
uv run alembic upgrade head
uv run python -m scripts.seed_data
echo "  ✓ Database migrated and seeded successfully"

# 4. Start backend and frontend
echo "[4/5] Launching backend & frontend services..."

cleanup() {
    echo ""
    echo "----------------------------------------------------------------------"
    echo "Stopping VaultNotice demo servers..."
    if [ -n "${BACKEND_PID:-}" ]; then
        kill -TERM "${BACKEND_PID}" 2>/dev/null || true
    fi
    if [ -n "${FRONTEND_PID:-}" ]; then
        kill -TERM "${FRONTEND_PID}" 2>/dev/null || true
    fi
    wait "${BACKEND_PID}" 2>/dev/null || true
    wait "${FRONTEND_PID}" 2>/dev/null || true
    echo "✓ All VaultNotice services stopped."
    echo "======================================================================"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start FastAPI backend
cd "${REPO_ROOT}/backend"
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Vite frontend
cd "${REPO_ROOT}/frontend"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

# 5. Display banner
sleep 2
echo "======================================================================"
echo "              VAULTNOTICE IS RUNNING AND READY FOR DEMO               "
echo "======================================================================"
echo ""
echo "  ▶ Web Portal UI:       http://localhost:5173"
echo "  ▶ Backend REST API:    http://localhost:8000"
echo "  ▶ API Documentation:   http://localhost:8000/docs"
echo ""
echo "----------------------------------------------------------------------"
echo " DEMO PERSONAS (Switch easily via top-right dropdown in UI):"
echo "----------------------------------------------------------------------"
echo "  1. Sarah Lin (Management)      - Has 'Post Announcement' form & author access"
echo "  2. David Miller (Staff)        - Branch Manager; targeted recipient"
echo "  3. Sreyneath Meas (Staff)      - Compliance Officer; targeted recipient"
echo "  4. Emily Tan (Staff)           - Finance Specialist; untargeted recipient"
echo "  5. Alex Vorn (Staff)           - IT Support; untargeted recipient"
echo "  6. Portal Admin                - Full platform & template management access"
echo ""
echo "----------------------------------------------------------------------"
echo "  See DEMO_GUIDE.md for the step-by-step presentation walkthrough."
echo "  Press Ctrl+C to stop all services cleanly."
echo "======================================================================"

# Wait indefinitely until interrupted
wait

