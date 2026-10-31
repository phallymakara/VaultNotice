# VaultNotice

> **Secure, Targeted Management Announcement Web Part & Portal**  
> *Developed for Proseth Solution*

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

## 3. Technology Stack

* **Frontend**:
  * **Framework**: React 18+ (TypeScript / TSX) with Vite
  * **Design System**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
  * **Icons**: Lucide React
  * **State & Data Fetching**: TanStack Query (React Query)
  * **Guidelines**: Adheres strictly to [`FRONTEND_GUIDELINES.md`](./FRONTEND_GUIDELINES.md)

* **Backend**:
  * **Language & Framework**: Python 3.12 + FastAPI (async REST APIs)
  * **ORM & Database**: SQLAlchemy 2.x + PostgreSQL (Docker service)
  * **Database Migrations**: Alembic
  * **Validation & Settings**: Pydantic v2 + Pydantic Settings
  * **Package & Dependency Manager**: `uv`
  * **PDF Engine**: ReportLab (generates official `Announcement.pdf`)
  * **Code Quality & Testing**: Ruff + pytest + HTTPX
  * **Guidelines**: Adheres strictly to [`BACKEND_GUIDELINES.md`](./BACKEND_GUIDELINES.md)

---

## 4. Key Modules & Feature Functions

| Module | Features & Capabilities |
| :--- | :--- |
| **IAM & Audience Targeting** | Role & group-based audience targeting. Post form is visible only to Management; hidden for other staff. Live dynamic group membership checks. |
| **Template Management** | Pre-loaded starter templates (*Holiday Schedule, Policy Update, Circular, Townhall, Blank*) with title and body auto-fill. |
| **Announcement Composer** | People & Group picker, markdown/rich-text editor, multi-document attachment dropzone, and pre-submission confirmation. |
| **Automated Processing Engine** | Automatic generation of `YYYY-MM-DD - [Title]` folders, conversion of message to `Announcement.pdf`, and strict ACL assignment. |
| **Security-Trimmed Library** | Chronological feed of announcement folders trimmed dynamically based on user identity and group memberships. |
| **Inside Folder Explorer** | Interactive modal viewing full announcement details, previewing `Announcement.pdf`, and downloading attachments. |
| **Simulated Notification Center** | In-app drawer showcasing simulated Outlook and Teams alerts with deep links back to the portal folder. |
| **Audit Trail & Governance** | Immutable logging of all postings, author metadata, recipient snapshots, and delivery status. |

---

## 5. Development Principles & Standards

All engineering activities are governed by the established guidelines:
* **[Frontend Guidelines](./FRONTEND_GUIDELINES.md)**
* **[Backend Guidelines](./BACKEND_GUIDELINES.md)**
* **[Original Proposal](./Documents/Proposal%20Management%20Announcement%20Web%20Part%20(1)%20(1).docx)**

