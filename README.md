# VaultNotice

> **Secure, Targeted Management Announcement Web Part & Portal**  
> *Developed for Proseth Solution*

[![Backend Tests](https://img.shields.io/badge/pytest-13%20passed-brightgreen.svg)]()
[![Code Style](https://img.shields.io/badge/code%20style-ruff-000000.svg)]()
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue.svg)]()
[![Tailwind](https://img.shields.io/badge/tailwind-v3.4-38bdf8.svg)]()

---

## 1. Overview & Purpose

**VaultNotice** is an enterprise-grade management announcement platform. It replaces the traditional "send email" broadcast pattern with a secure, centralized web portal solution. 

Announcements and their attached confidential documents reside safely inside dedicated, permission-trimmed folders on the portal. Recipient staff members receive alerts (via Email and Microsoft Teams) directing them back to the portal with an **"Open on Web Portal"** link. Files are strictly protected by folder-level access control lists (ACLs) and are never attached directly to emails.

---

## 2. Core Architecture & Workflow

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  VaultNotice Portal                    │
                                  └────────────────────────────────────────────────────────┘
                                                               │
                       ┌───────────────────────────────────────┴───────────────────────────────────────┐
                       ▼                                                                               ▼
         ┌───────────────────────────┐                                                   ┌───────────────────────────┐
         │     Management Persona    │                                                   │       Staff Persona       │
         └───────────────────────────┘                                                   └───────────────────────────┘
                       │                                                                               │
         [Audience Targeted: VISIBLE]                                                    [Audience Targeted: HIDDEN]
                       │                                                                               │
                       ▼                                                                               │
         ┌───────────────────────────┐                                                                 │
         │  Post Announcement Form   │                                                                 │
         │  (Template, Recipients,   │                                                                 │
         │   Message, Attachments)   │                                                                 │
         └─────────────┬─────────────┘                                                                 │
                       │                                                                               │
                       ▼                                                                               │
         ┌───────────────────────────┐                                                                 │
         │ Automated Processing      │                                                                 │
         │ • Folder Creation         │                                                                 │
         │ • PDF Conversion          │                                                                 │
         │ • Permission ACL Set      │                                                                 │
         │ • Email/Teams Alert       │                                                                 │
         └─────────────┬─────────────┘                                                                 │
                       │                                                                               │
                       ▼                                                                               ▼
         ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
         │                        Security-Trimmed Announcements Library                               │
         │                    (Displays only folders user has permission to see)                       │
         └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Quick Start (Turn-Key Demo)

To run the entire system (database, migrations, seed data, backend API, and frontend UI) with a single command:

```bash
# Clone or enter the project directory
cd VaultNotice

# Run the turn-key launcher
./start.sh
```

### Access URLs:
* **Web Portal UI:** [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** [http://localhost:8000](http://localhost:8000)
* **Interactive API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

> **Detailed Presentation Script:** See [`DEMO_GUIDE.md`](./DEMO_GUIDE.md) for step-by-step instructions for demonstrating the 4 proposal screens.

---

## 4. Demo Personas

Switch personas dynamically via the top-right dropdown in the web portal to experience different security viewpoints:

| Persona | Role / Title | Group Memberships | Portal Experience |
| :--- | :--- | :--- | :--- |
| **Sarah Lin** | Management (Author) | Management, Senior Leadership | Sees "Post Announcement" form; can author & publish announcements. |
| **David Miller** | Staff (Branch Manager) | All Branch Managers, Retail Banking | Form hidden (Feedback Banner); sees announcements sent to him or Branch Managers. |
| **Sreyneath Meas** | Staff (Compliance Officer) | Compliance Team, Legal & Compliance | Form hidden; sees compliance and company-wide announcements. |
| **Emily Tan** | Staff (Finance Specialist) | Finance Team | Form hidden; untargeted announcements are invisible (security trimmed). |
| **Alex Vorn** | Staff (IT Support) | IT Support, Operations | Form hidden; untargeted announcements are invisible. |
| **Portal Admin** | System Administrator | Global Admin | Full access to all announcements, templates, and immutable audit logs. |

---

## 5. Technology Stack

* **Frontend**:
  * **Framework**: React 18+ (TypeScript / TSX) with Vite
  * **Design System**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v3
  * **Icons**: Lucide React
  * **State & Data Fetching**: TanStack Query v5 (React Query)
  * **Guidelines**: Adheres strictly to [`FRONTEND_GUIDELINES.md`](./FRONTEND_GUIDELINES.md)

* **Backend**:
  * **Language & Framework**: Python 3.12/3.13 + FastAPI (async REST APIs)
  * **ORM & Database**: SQLAlchemy 2.x + PostgreSQL 16 Alpine (Docker service)
  * **Database Migrations**: Alembic
  * **Validation & Settings**: Pydantic v2 + Pydantic Settings
  * **Package & Dependency Manager**: `uv`
  * **PDF Engine**: ReportLab (generates official `Announcement.pdf`)
  * **Code Quality & Testing**: Ruff + pytest + HTTPX
  * **Guidelines**: Adheres strictly to [`BACKEND_GUIDELINES.md`](./BACKEND_GUIDELINES.md)

---

## 6. Security Principles & Architecture

1. **Role-Based Visibility (RBAC):** The composer is rendered only for users with management privileges (`currentUser.is_management`). For general staff, the form is completely removed and replaced with a feedback banner.
2. **Server-Side Security Trimming:** Announcements and folders are filtered at the database query level:
   $$\text{Visible} \iff \text{author\_id} = \text{user\_id} \lor \text{is\_admin} \lor \text{target\_id} = \text{user\_id} \lor \text{target\_id} \in \text{user\_groups}$$
3. **Anti-URL Guessing Protection:** Direct file downloads and announcement lookups validate ACL permissions on every request; unauthorized attempts return `403 FORBIDDEN`.
4. **Dynamic Group Membership:** Permissions map directly to `group_id`. Adding or removing a user from a group dynamically grants or revokes access to past and future announcements without modifying announcement records.
5. **Zero Attachment Security Rule:** Notification emails (Outlook & Teams) contain only notification metadata and an "Open on Web Portal" deep link. Files are never attached to emails.
6. **Path Traversal & Size Guards:** Filenames and folder names are sanitized to prevent directory traversal (`../`). Uploaded attachments are strictly validated to 25MB maximum size.

---

## 7. Testing & Quality Verification

### Run Backend Tests (13 passed):
```bash
cd backend
uv run pytest -v
```

### Run Backend Linter & Formatter:
```bash
cd backend
uv run ruff check .
uv run ruff format --check .
```

### Run Frontend Typecheck & Build:
```bash
cd frontend
npm run build
```

---

## 8. Project Structure

```
VaultNotice/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # REST routes (announcements, templates, directory, audit, files)
│   │   ├── core/                # Config, database session, security, exceptions, logging
│   │   ├── models/              # SQLAlchemy models (User, Group, Announcement, etc.)
│   │   ├── repositories/        # Database query & ACL access layers
│   │   ├── schemas/             # Pydantic v2 validation models
│   │   ├── services/            # PDF compiler, storage manager, notification engine
│   │   └── main.py              # FastAPI application entrypoint
│   ├── alembic/                 # Database migrations
│   ├── scripts/seed_data.py     # Idempotent demo database seeder
│   └── tests/                   # Pytest test suite (13 automated tests)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components (Button, Card, Dialog, Sheet, etc.)
│   │   │   └── webparts/        # Proposal Web Parts (PostForm, Library, FolderModal, Alerts)
│   │   ├── services/api.ts      # Axios API client
│   │   ├── types/api.ts         # TypeScript schema interfaces
│   │   └── App.tsx              # Portal root with persona switcher and role layout
├── docker-compose.yml           # PostgreSQL 16 Alpine container definition
├── start.sh                     # Turn-key demo launcher script
├── DEMO_GUIDE.md                # Presentation guide for proposal screens 1-4
├── FRONTEND_GUIDELINES.md       # Frontend engineering standards
├── BACKEND_GUIDELINES.md        # Backend engineering standards
└── README.md                    # Project documentation
```
