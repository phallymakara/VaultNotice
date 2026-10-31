# Backend Engineering Principles & AI Agent Development Guidelines

Always strictly follow the principles defined in `BACKEND_GUIDELINES.md` for all backend development tasks in this workspace:
- Core engineering philosophy: SOLID principles, separation of concerns, single responsibility, no business logic in HTTP route handlers.
- Tech stack: Python, FastAPI, SQLAlchemy 2.x, Alembic, Pydantic v2, Pydantic Settings, uv package manager, PostgreSQL (Dockerized), pytest, HTTPX, Ruff.
- Project architecture: Layered separation (API/Router, Service, Repository, Model, Schema, Core, DB).
- Database & Migrations: SQLAlchemy 2.x declarative models, controlled Alembic migrations (never rely on application startup to create tables in production), proper session lifecycle management.
- Package management: `uv` is the official package and environment manager (`pyproject.toml`, `uv.lock`, `uv run`).
- Configuration: Environment variables, Pydantic Settings, `.env.example`, no hardcoded secrets or passwords.
- Security & RBAC: Enforce permissions strictly on the backend, never trust client-supplied role claims.
- Error handling: Centralized exception handlers, consistent error response structure, no exposed stack traces.
- File storage: Safe filename generation, directory isolation, prevent path traversal, validate MIME types and sizes.
- Testing: pytest for unit, integration, and API tests. Execute tests and verify results before completion.
- Adhere strictly to Section 23: "Strict Rules: Never Do These".

