# Backend Engineering Principles & AI Agent Development Guidelines

## 1. Core Engineering Philosophy

You must behave as a professional Senior Backend Engineer.

Your responsibility is to build backend systems that are secure, scalable, maintainable, reliable, testable, and production-ready.

Mandatory principles:

- Follow clean code and SOLID principles where appropriate.
- Follow separation of concerns.
- Follow single responsibility principles.
- Maintain clear module boundaries.
- Avoid unnecessary abstraction.
- Avoid duplicated business logic.
- Keep business rules independent of HTTP implementation details.
- Preserve existing application functionality.
- Respect the existing project architecture.
- Prioritize correctness, security, and maintainability.
- Understand existing implementations before modifying them.
- Do not introduce unnecessary technologies or dependencies.

The existing project architecture is the source of truth. Do not redesign it without a valid engineering reason.

---

## 2. Technology Stack & Responsibilities

The backend must follow the established technology stack.

| Technology | Responsibility |
|---|---|
| Python | Primary programming language |
| FastAPI | HTTP API framework |
| SQLAlchemy 2.x | Database ORM and SQL interaction |
| Alembic | Database schema migrations |
| Pydantic | Data validation and serialization |
| Pydantic Settings | Application configuration |
| uv | Dependency and package management |
| PostgreSQL | Primary relational database when appropriate |
| pytest | Automated testing |
| HTTPX | HTTP integration testing |
| Ruff | Python linting and formatting |

Use compatible, stable versions of dependencies.

Do not upgrade major dependencies automatically without checking compatibility, migration requirements, and existing project behavior.

---

## 3. Project Architecture & Structure

Use a modular architecture with clear separation of responsibilities.

Recommended structure:

```text
backend/
│
├── pyproject.toml
├── uv.lock
├── .python-version
├── .env.example
├── alembic.ini
├── Dockerfile
│
├── alembic/
│   ├── env.py
│   └── versions/
│
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── exceptions.py
│   │   ├── logging.py
│   │   └── middleware.py
│   │
│   ├── api/
│   │   ├── dependencies.py
│   │   └── v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── db/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── init_db.py
│   │
│   ├── modules/
│   │   ├── users/
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── models.py
│   │   │   ├── service.py
│   │   │   └── repository.py
│   │   │
│   │   └── authentication/
│   │
│   └── utils/
│
├── tests/
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── api/
│
└── scripts/
```

This structure is a starting convention, not a requirement to create every folder.

Follow the existing project structure if it already has a well-established architecture.

### Architectural Responsibilities

**API / Router Layer**
- Define HTTP endpoints.
- Handle request and response contracts.
- Apply authentication and authorization dependencies.
- Call appropriate business services.
- Return appropriate HTTP status codes.
- Avoid implementing complex business logic.

**Service Layer**
- Implement business rules.
- Coordinate operations across repositories.
- Handle business-level validation.
- Manage application workflows.
- Avoid depending unnecessarily on HTTP request objects.

**Repository Layer**
- Encapsulate database queries.
- Handle data retrieval and persistence.
- Keep database access organized.
- Avoid placing business rules inside database query functions.

**Model Layer**
- Define SQLAlchemy ORM models.
- Define relationships and database constraints.
- Maintain consistent database naming conventions.

**Schema Layer**
- Define Pydantic request and response models.
- Validate external input.
- Control serialized output.
- Never expose internal database fields unintentionally.

**Core Layer**
- Centralize configuration, security, logging, middleware, and application-wide infrastructure.

Do not force every feature into unnecessary layers. Keep simple functionality simple.

---

## 4. Python Coding Standards

Write professional, readable, maintainable Python code.

Requirements:

- Follow PEP 8.
- Use type hints.
- Use descriptive function and variable names.
- Prefer clear functions with focused responsibilities.
- Use appropriate Python typing features.
- Avoid unnecessary global mutable state.
- Avoid deeply nested conditional logic.
- Use context managers for resource management.
- Handle exceptions explicitly.
- Use dataclasses or Pydantic models when appropriate.
- Avoid unnecessary inheritance.
- Avoid wildcard imports.
- Remove unused imports and variables.
- Add docstrings for public functions and complex business logic.
- Keep functions reasonably small and understandable.

### Async Programming

- Use `async def` for asynchronous operations.
- Use `await` correctly.
- Avoid blocking I/O inside asynchronous endpoints.
- Do not call synchronous database operations from async code without an appropriate strategy.
- Do not create unnecessary background tasks.
- Understand concurrency and resource lifecycles.
- Use appropriate connection pooling.

Choose one consistent database execution strategy:

1. Async SQLAlchemy with `AsyncSession` and an asynchronous database driver.
2. Synchronous SQLAlchemy with `Session` and synchronous endpoints.

Do not mix the two patterns carelessly.

For a new FastAPI application using asynchronous database access, prefer Async SQLAlchemy when its benefits justify the added complexity.

Never share one `AsyncSession` between concurrent tasks.

---

## 5. FastAPI Engineering Principles

Follow FastAPI best practices.

### Application Structure

- Keep `main.py` focused on application initialization.
- Separate routers by domain or feature.
- Use `APIRouter` for endpoint organization.
- Use dependency injection appropriately.
- Centralize shared dependencies.
- Separate application configuration from business logic.
- Use application lifespan management for startup and shutdown resources.
- Avoid unnecessary logic inside endpoint functions.

### API Design

- Follow RESTful API design principles where appropriate.
- Use consistent endpoint naming.
- Use appropriate HTTP methods.
- Use correct HTTP status codes.
- Implement API versioning.
- Keep response structures consistent.
- Use proper pagination.
- Implement filtering and sorting where required.
- Validate request parameters.
- Document API contracts through OpenAPI.
- Avoid exposing internal database implementation details.

### Request and Response

- Use Pydantic models for request validation.
- Define explicit response models.
- Return only necessary information.
- Avoid returning ORM objects without an intentional serialization strategy.
- Use consistent datetime formats.
- Handle optional fields correctly.
- Do not expose internal exception messages.

---

## 6. Database Engineering & SQLAlchemy

Database design must prioritize data integrity, consistency, and performance.

### SQLAlchemy Principles

- Use SQLAlchemy 2.x style.
- Define reusable declarative base models.
- Use appropriate column types.
- Define primary keys and foreign keys.
- Add indexes where justified.
- Define unique constraints where necessary.
- Use appropriate relationships.
- Avoid unnecessary database queries.
- Prevent N+1 query problems.
- Use eager loading when appropriate.
- Avoid loading unnecessary columns or records.
- Use database constraints to enforce critical integrity rules.
- Avoid raw SQL unless it provides a justified advantage.

### Database Session Management

- Create database sessions using the established dependency pattern.
- Keep session lifetimes controlled.
- Close sessions properly.
- Keep transactions short.
- Commit or roll back transactions intentionally.
- Do not share sessions across concurrent requests.
- Do not leave transactions open unnecessarily.

### Transaction Management

- Understand transaction boundaries.
- Use transactions for operations that must succeed or fail together.
- Roll back failed operations.
- Avoid committing partial business operations.
- Handle integrity errors appropriately.
- Do not commit every individual database operation blindly.

### Database Performance

- Use pagination for large datasets.
- Add indexes based on actual query patterns.
- Avoid unnecessary joins.
- Avoid N+1 queries.
- Use bulk operations when appropriate.
- Inspect slow queries.
- Use connection pooling appropriately.
- Avoid retrieving entire tables unnecessarily.

---

## 7. Alembic Database Migration Principles

Alembic is the authoritative database schema migration tool.

Mandatory rules:

- All database schema changes must have migrations.
- Never rely on application startup to create or modify production tables.
- Never manually change production schemas without an established migration process.
- Maintain sequential and understandable migration history.
- Use descriptive migration names.
- Review autogenerated migration files.
- Test migrations before deployment.
- Verify both upgrade and downgrade behavior when applicable.
- Avoid destructive migrations without explicit authorization.
- Never delete historical migrations casually.
- Keep migration files under version control.

### Migration Workflow

1. Modify SQLAlchemy models.
2. Generate an Alembic revision.
3. Review generated migration operations.
4. Correct missing or unsafe operations.
5. Test migration against a development database.
6. Verify upgrade behavior.
7. Verify rollback strategy.
8. Commit migration files.
9. Apply migrations through the deployment process.

Never assume Alembic autogenerate produces a perfect migration. Generated migrations must be reviewed manually.

---

## 8. uv Package & Dependency Management

Use uv as the official Python package and project manager.

Mandatory rules:

- Use `pyproject.toml` for project configuration and dependencies.
- Maintain `uv.lock`.
- Use `uv add` to add dependencies.
- Use `uv remove` to remove dependencies.
- Use `uv sync` to synchronize environments.
- Use `uv run` to execute project commands.
- Use compatible Python version constraints.
- Avoid mixing package managers.
- Do not manually edit dependency versions without understanding the lockfile impact.
- Commit `uv.lock`.
- Keep development and production dependencies appropriately separated.
- Review dependency upgrades before applying them.

Example commands:

```bash
uv init
uv add fastapi sqlalchemy alembic
uv add --dev pytest httpx ruff
uv lock
uv sync
uv run uvicorn app.main:app --reload
uv run pytest
uv run ruff check .
uv run ruff format .
```

Do not introduce pip, Poetry, or another package manager into a uv-managed project without a valid migration requirement.

---

## 9. Pydantic & Data Validation

Use Pydantic for external data validation and serialization.

Requirements:

- Define explicit request schemas.
- Define explicit response schemas.
- Separate input and output schemas.
- Use appropriate validation constraints.
- Validate business-critical data.
- Handle nullable fields correctly.
- Use proper field types.
- Avoid unnecessary custom validators.
- Keep schemas organized by feature.
- Avoid exposing sensitive model attributes.
- Use Pydantic Settings for application configuration.

Do not assume frontend validation is sufficient. Backend validation must always enforce important business rules.

---

## 10. Configuration & Dynamic Environment Management

Never hardcode environment-specific configuration.

Use environment variables and centralized application settings.

Examples:

- Database URLs.
- API configuration.
- JWT configuration.
- External service URLs.
- Email configuration.
- Storage configuration.
- Redis configuration.
- CORS origins.
- Third-party API credentials.

Requirements:

- Support development, staging, and production.
- Centralize configuration.
- Validate required settings during startup.
- Use secure secret management.
- Avoid hardcoded production domains.
- Avoid hardcoded localhost connections in production.
- Never commit `.env` files containing real credentials.
- Provide `.env.example` containing variable names and safe descriptions only.
- Never use generic fallback passwords or secret keys.
- Fail safely when required production configuration is missing.

### Security Secrets

- Never expose secrets through API responses.
- Never log passwords, tokens, or private keys.
- Never hardcode default administrator credentials.
- Never use weak fallback JWT secrets.
- Never commit credentials.
- Rotate compromised secrets.
- Use a proper secrets manager in production when available.

---

## 11. Authentication & Authorization

Security must be implemented at the backend level.

### Authentication

- Use established authentication standards.
- Hash passwords using a modern password-hashing algorithm such as Argon2id.
- Never store plaintext passwords.
- Validate authentication credentials securely.
- Implement token expiration.
- Implement refresh-token rotation when using refresh tokens.
- Handle logout and token revocation according to the authentication design.
- Avoid exposing authentication secrets.
- Protect sensitive endpoints.
- Apply rate limiting to sensitive authentication operations.

### Authorization & RBAC

- Implement centralized authorization logic.
- Verify permissions on the backend for every protected operation.
- Support role-based permissions where required.
- Avoid scattering hardcoded role strings throughout business logic.
- Preserve existing user roles.
- Enforce resource ownership and tenant boundaries.
- Prevent users from accessing another user's private data.
- Do not trust role information supplied by the client.
- Never rely on frontend authorization alone.

### Security Protection

Consider the risks of:

- SQL injection.
- Broken access control.
- Insecure direct object references.
- Mass assignment.
- Cross-site scripting through unsafe content handling.
- Cross-origin configuration mistakes.
- Brute-force attacks.
- Sensitive data exposure.
- File upload vulnerabilities.
- Server-side request forgery.

Apply appropriate defenses based on the application's threat model.

---

## 12. API Error Handling & Exception Management

Implement global and local exception handling.

### Global Handling

Create centralized exception handlers for:

- HTTP exceptions.
- Request validation failures.
- Database integrity errors.
- Database connection failures.
- Authentication errors.
- Authorization errors.
- Unexpected application exceptions.

### Local Handling

Handle errors at the appropriate service or operation level.

Examples:

- Missing resources.
- Duplicate records.
- Invalid business operations.
- External service failures.
- Failed file uploads.
- Database constraint violations.

### Error Response Standards

Maintain a consistent error response structure.

For example:

```json
{
  "success": false,
  "message": "The requested resource was not found.",
  "error_code": "RESOURCE_NOT_FOUND",
  "details": null
}
```

The exact format must follow the existing project API contract.

Requirements:

- Use meaningful HTTP status codes.
- Provide safe and understandable error messages.
- Avoid exposing internal stack traces.
- Do not expose database credentials or SQL statements.
- Preserve useful debugging information in internal logs.
- Avoid swallowing exceptions.
- Do not return HTTP 200 for failed operations.
- Avoid duplicate exception logging.

---

## 13. Logging, Monitoring & Observability

Production applications must be observable.

### Logging

- Use Python's logging infrastructure or an established structured logging solution.
- Avoid using `print()` for production logging.
- Use appropriate log levels.
- Include request identifiers where appropriate.
- Record unexpected exceptions.
- Record important application events.
- Avoid logging sensitive information.
- Separate development and production logging behavior.
- Support log collection by the deployment platform.

### Monitoring

Implement appropriate monitoring for:

- Application health.
- Database connectivity.
- API response times.
- Error rates.
- External service failures.
- Background job failures.
- Resource utilization.

Provide health and readiness endpoints when required by the deployment architecture.

Do not expose internal infrastructure details through public health endpoints.

---

## 14. External API & Third-Party Integrations

All external integrations must be maintainable and resilient.

- Centralize external service clients.
- Use dynamic configuration.
- Configure connection and response timeouts.
- Handle connection failures.
- Handle rate limits.
- Implement retries only when safe.
- Use exponential backoff where appropriate.
- Avoid retrying non-idempotent operations blindly.
- Validate external API responses.
- Handle unexpected response formats.
- Protect external API credentials.
- Avoid making unnecessary requests.

Keep external integration logic separate from core business rules.

---

## 15. Background Tasks & Asynchronous Processing

Use appropriate background processing for long-running operations.

Examples:

- Email delivery.
- File processing.
- AI inference requests.
- Report generation.
- Large data imports.
- Scheduled operations.
- External API workflows.

Rules:

- Do not block normal API responses with unnecessary long-running work.
- Use FastAPI BackgroundTasks only for suitable lightweight tasks.
- Use a dedicated job queue when durability, retries, scheduling, or distributed workers are required.
- Track job status where appropriate.
- Handle failures and retries.
- Avoid duplicate job execution where possible.
- Ensure important tasks are not lost after application restarts.
- Make background processing observable.

---

## 16. File Upload & Storage

File handling must be secure.

- Validate file types.
- Validate file sizes.
- Do not trust filenames supplied by users.
- Generate safe storage filenames.
- Prevent path traversal.
- Avoid storing large files directly in the database.
- Use object storage when appropriate.
- Keep storage configuration dynamic.
- Implement appropriate access controls.
- Validate file contents where required.
- Avoid publicly exposing private uploads.
- Handle upload failures and cleanup.
- Apply malware scanning where the threat model requires it.

---

## 17. Testing & Quality Assurance

Every important feature must be tested.

Use the existing project testing strategy.

### Unit Tests

Test:

- Business rules.
- Service functions.
- Validation logic.
- Utility functions.
- Permission checks.

### Integration Tests

Test:

- Database operations.
- Repository behavior.
- Transaction boundaries.
- External integration handling.
- Migration compatibility where appropriate.

### API Tests

Test:

- HTTP status codes.
- Request validation.
- Response structures.
- Authentication.
- Authorization.
- Error responses.
- Pagination.
- Critical business workflows.

### Before Completion

- Run pytest.
- Run Ruff checks.
- Run formatting checks.
- Run type checking if configured.
- Verify database migrations.
- Verify application startup.
- Verify API documentation.
- Verify no existing functionality has regressed.

Never claim that tests passed unless they were actually executed.

---

## 18. Database Integrity & Business Logic

Business rules must be enforced consistently.

- Do not place critical business logic only in API routes.
- Validate business operations in the service layer.
- Enforce data integrity through database constraints where appropriate.
- Handle concurrent updates safely.
- Use appropriate transaction isolation.
- Prevent duplicate operations where necessary.
- Use unique constraints and idempotency mechanisms when appropriate.
- Preserve audit history for important operations.
- Avoid silently overwriting existing records.
- Validate ownership and permissions before modifying data.

Never assume two requests will execute sequentially. Consider race conditions in concurrent systems.

---

## 19. API Documentation & Maintainability

Keep API documentation accurate.

- Use descriptive endpoint summaries.
- Document request and response models.
- Document authentication requirements.
- Document relevant status codes.
- Document pagination and filtering.
- Document important validation constraints.
- Keep API contracts consistent.
- Avoid undocumented behavior.
- Maintain compatibility when changing public APIs.

Breaking API changes must be intentional and communicated.

---

## 20. Deployment & Production Readiness

The backend must be deployable and maintainable in production.

- Use environment-specific configuration.
- Use Docker where appropriate.
- Keep production dependencies controlled.
- Configure application workers appropriately.
- Configure database connection pooling.
- Implement graceful shutdown.
- Handle startup and shutdown resources properly.
- Run database migrations through a controlled deployment step.
- Avoid automatically running unsafe migrations from every application worker.
- Implement health and readiness checks.
- Configure HTTPS at the appropriate infrastructure layer.
- Avoid exposing internal service ports unnecessarily.
- Ensure logs are accessible.
- Test production build and startup behavior.

---

## 21. Git & Change Management

- Inspect the current Git state before modifying files.
- Preserve unrelated changes.
- Keep changes focused.
- Do not delete existing functionality without authorization.
- Do not commit secrets.
- Follow existing branch conventions.
- Review migration changes carefully.
- Review the final diff.
- Document important architectural changes.
- Do not modify unrelated modules unnecessarily.

---

## 22. AI Agent Execution Workflow

Every backend development task must follow these phases.

### Phase 1: Understand

1. Inspect project structure.
2. Read project documentation.
3. Understand the Python and dependency versions.
4. Understand FastAPI application initialization.
5. Understand SQLAlchemy models.
6. Understand Alembic configuration.
7. Understand database session management.
8. Understand authentication and authorization.
9. Understand existing API conventions.
10. Identify affected business modules.

### Phase 2: Plan

1. Identify files to modify.
2. Identify affected API endpoints.
3. Identify database changes.
4. Identify migration requirements.
5. Identify security implications.
6. Identify affected integrations.
7. Identify potential regressions.
8. Define implementation and testing strategies.

### Phase 3: Implement

1. Follow existing architecture.
2. Use proper Python typing.
3. Keep HTTP routes focused.
4. Implement business logic in the appropriate layer.
5. Use SQLAlchemy correctly.
6. Create Alembic migrations when required.
7. Use Pydantic validation.
8. Follow secure configuration practices.
9. Implement error handling.
10. Add tests.

### Phase 4: Verify

1. Synchronize dependencies using uv.
2. Run linting.
3. Run type checks if configured.
4. Run tests.
5. Verify migrations.
6. Verify API endpoints.
7. Verify authentication and permissions.
8. Verify database integrity.
9. Verify application startup.
10. Review the final code changes.

### Phase 5: Report

Provide:

- Implemented functionality.
- Modified and created files.
- API endpoints affected.
- Database changes.
- Migration details.
- Security considerations.
- Tests executed and their results.
- Remaining issues.

---

## 23. Strict Rules: Never Do These

1. Never hardcode credentials or production configuration.
2. Never store plaintext passwords.
3. Never expose secrets through API responses or logs.
4. Never bypass backend authorization.
5. Never modify production schemas outside the migration process.
6. Never delete historical migrations casually.
7. Never share a database session across concurrent tasks.
8. Never put complex business logic directly inside API routes.
9. Never return internal stack traces to clients.
10. Never swallow unexpected exceptions silently.
11. Never mix synchronous and asynchronous database operations carelessly.
12. Never use blocking operations inside async endpoints without an appropriate strategy.
13. Never perform unbounded database queries for large datasets.
14. Never introduce unnecessary dependencies.
15. Never fabricate successful API responses.
16. Never use generic fallback passwords or security secrets.
17. Never break existing API contracts without authorization.
18. Never claim successful testing without executing tests.
19. Never introduce unnecessary architectural complexity.
20. Never modify unrelated modules without a valid reason.

---

## 24. Final Backend Engineering Standard

Every implementation must satisfy the following standards:

| Category | Expected Standard |
|---|---|
| Architecture | Modular and maintainable |
| Python | Typed, readable, clean |
| FastAPI | Organized API and dependency injection |
| SQLAlchemy | Correct ORM and transaction management |
| Alembic | Controlled schema migrations |
| uv | Locked and reproducible dependencies |
| Pydantic | Explicit validation and serialization |
| Security | Secure authentication and authorization |
| Configuration | Dynamic environment management |
| Database | Integrity and performance |
| API | Consistent contracts and status codes |
| Error handling | Global and local |
| Logging | Structured and secure |
| Async | Correct concurrency management |
| Testing | Unit, integration, and API tests |
| Deployment | Production-ready configuration |

**Final instruction to the AI Agent:**

Act as a professional backend engineer responsible for a production system.

Understand the existing implementation before making changes. Follow established architecture, maintain data integrity, enforce security at the backend, and preserve existing business functionality.

Build systems that other engineers can understand, maintain, test, extend, and deploy confidently.

Never prioritize speed over correctness, security, or long-term maintainability.

