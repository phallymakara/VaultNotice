# VaultNotice - Enterprise Demo Presentation Guide

> **Live Demonstration Script & Walkthrough**  
> *Compliant with Proposal Management Announcement Web Part Specifications and Role Principles*

---

## 1. Executive Summary

**VaultNotice** is an enterprise solution designed to solve the critical security, compliance, and clutter problems associated with company-wide announcement emails.

### The Problem It Solves:
* **Email Attachment Sprawl & Security Leaks:** Sensitive corporate memos, circulars, and policy updates sent via broadcast emails remain permanently unmanaged in local PSTs, mobile inboxes, and forwarded threads.
* **Lack of Revocability & Access Control:** Traditional emails cannot revoke access when an employee changes departments or leaves the organization.
* **Notification Fatigue:** Important executive announcements get buried beneath operational emails.

### The VaultNotice Solution:
* **Centralized Secure Storage:** Announcements and attachments reside inside dedicated, security-trimmed folders on the web portal.
* **Zero-Attachment Alerting:** Recipient staff receive simulated Outlook emails and Microsoft Teams cards containing only brief notification metadata and a direct **"Open on Web Portal"** button. Confidential documents are never attached to emails.
* **Automated PDF Compilation:** When management publishes an announcement, the portal automatically formats and renders an official corporate `Announcement.pdf` accompanied by any uploaded files.
* **Live Dynamic Group Membership:** Access is resolved on-the-fly at query time. When an employee joins a group, they immediately inherit access to all historical announcements for that group; when they leave, access is instantly revoked.

---

## 2. Quick Start & Setup

To launch the entire platform in turn-key mode:

```bash
# From the repository root
./start.sh
```

The script will automatically:
1. Verify Docker, `uv`, Node, and npm.
2. Spin up the PostgreSQL 16 database container.
3. Apply all Alembic migrations (`alembic upgrade head`).
4. Seed demo users, groups, and proposal starter templates.
5. Launch FastAPI backend on `http://localhost:8000` (docs at `http://localhost:8000/docs`).
6. Launch Vite frontend on `http://localhost:5173`.

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## 3. Demo Persona Directory

You can switch personas at any moment using the **Persona Dropdown** in the top-right header:

| Persona | Role / Title | Group Memberships | Portal Experience |
| :--- | :--- | :--- | :--- |
| **Sarah Lin** | Management (Author) | Management, Senior Leadership | Can compose & post announcements; views all authored announcements. |
| **David Miller** | Staff (Branch Manager) | All Branch Managers, Retail Banking | Form is hidden; sees announcements sent to him or Branch Managers. |
| **Sreyneath Meas** | Staff (Compliance Officer) | Compliance Team, Legal & Compliance | Form is hidden; sees compliance and all-staff announcements. |
| **Emily Tan** | Staff (Finance Specialist) | Finance Team | Form is hidden; untargeted announcements are invisible. |
| **Alex Vorn** | Staff (IT Support Specialist) | IT Support, Operations | Form is hidden; untargeted announcements are invisible. |
| **Portal Admin** | System Administrator | All Groups / Global Admin | Full administrative access to all announcements, templates, and audit logs. |

---

## 4. Step-by-Step Demonstration Walkthrough

### Act I: Proposal Screen 1 - Management View (Posting an Announcement)

**Presenter Goal:** Demonstrate how management easily drafts, targets, and publishes an announcement with pre-loaded templates and attachments.

1. **Verify Persona:** Ensure the active persona is **Sarah Lin (Management)**.
2. **Observe Screen 1 Layout:**
   - At the top of the portal, observe the **"Post Announcement"** composer web part.
   - Point out that this form is exclusively available to authorized management authors.
3. **Select a Starter Template:**
   - In the "Starter Template" dropdown, select **"Circular Memo"** or **"Policy Update"**.
   - Notice that the **Subject/Title** and **Announcement Body** immediately pre-populate with standardized corporate phrasing.
4. **Target the Audience (People & Group Picker):**
   - Click into the **"Target Audience"** input field.
   - Type `"David"`: Notice live directory search autocomplete finding **David Miller (Branch Manager)**. Click to select David.
   - Type `"Branch"`: Notice directory autocomplete finding the security group **All Branch Managers (5 members)**. Click to select the group.
   - Both pills appear with remove tags.
5. **Attach Supporting Documents:**
   - Drag and drop or browse to select a sample file (e.g., `Branch_Operations_Addendum.pdf` or any sample file up to 25MB).
   - Point out the file list displaying filename and file size in real time.
6. **Publish Announcement:**
   - Click the blue **"Publish Announcement"** button.
   - Watch the instant feedback notification: *"Announcement published successfully. Folder created and recipients notified."*
   - Scroll down to the **Announcements Library**: A new folder named `YYYY-MM-DD - [Title]` appears chronologically at the top with a folder icon and document count badge.

---

### Act II: Proposal Screen 2 - Audience Targeting & Security Trimming

**Presenter Goal:** Prove that staff members cannot see the post form, and untargeted users have zero visibility into confidential announcements.

1. **Switch to Targeted Recipient (David Miller):**
   - Click the persona dropdown in the top right and select **David Miller (Branch Manager)**.
   - **Observe:**
     - The "Post Announcement" form is **completely absent**. In its place is the proposal-compliant **Feedback Banner**: *"Looking for past announcements? Browse the library below..."*
     - The Announcements Library displays the announcement folder just created by Sarah Lin, because David was targeted individually and via his group `All Branch Managers`.
2. **Switch to Untargeted Recipient (Emily Tan):**
   - Switch persona to **Emily Tan (Finance Specialist)**.
   - **Observe:**
     - The "Post Announcement" form is hidden.
     - The Announcements Library shows **"No announcements available"** (empty state).
     - Emily has zero visibility into the folder metadata, title, author, or files.
3. **Demonstrate 403 Forbidden Protection (Direct URL / API Tampering):**
   - Explain to the audience that frontend hiding is backed by rigid server-side authorization.
   - If an unauthorized user attempts to query the announcement ID directly or download a file via HTTP, the backend returns:
     ```json
     {
       "detail": {
         "message": "You do not have permission to access this announcement",
         "error_code": "FORBIDDEN"
       }
     }
     ```
   *(This behavior is verified by automated test `test_anti_url_guessing_security`.)*

---

### Act III: Proposal Screen 3 - Inside Folder View (Interactive Folder Explorer)

**Presenter Goal:** Showcase the dedicated folder container, automated PDF compilation, and protected document downloads.

1. **Switch back to David Miller (or Sarah Lin).**
2. **Open the Announcement Folder:**
   - In the Announcements Library, click directly on the folder row or the **"View Folder"** button.
   - The **Inside Folder Explorer Modal** opens smoothly.
3. **Key Elements to Highlight:**
   - **Header Card:** Displays Announcement Title, Author badge (`Sarah Lin`), Publishing Date, and Target Audience summary.
   - **Compiled Corporate Document (`Announcement.pdf`):**
     - Click **"Preview PDF"** or **"Download"**.
     - Explain: *The system took the raw announcement text submitted by Sarah Lin and automatically compiled it into an official corporate PDF with standardized header, typography, and author signature block via the Python ReportLab engine.*
   - **Supporting Attachments Table:**
     - Displays all uploaded supplementary documents (`.pdf`, `.docx`, `.xlsx`).
     - Includes filename, mime type icon, formatted size, and direct secure download link.
4. **Close the Modal:** Click the "Close" button or press `Esc`.

---

### Act IV: Proposal Screen 4 - Recipient Alert Drawer & Zero-Attachment Rule

**Presenter Goal:** Demonstrate the simulated multi-channel notification engine (Outlook & Teams) and highlight the zero-attachment security principle.

1. **Open Notification Center:**
   - Click the **"Alerts"** button (bell icon with badge) in the top navigation bar.
   - The slide-over drawer opens from the right.
2. **Simulated Outlook Notification Tab:**
   - Select the **Outlook Email** tab.
   - Notice the exact email layout:
     - Sender: `vaultnotice-system@proseth.corp`
     - Recipient: `david.miller@proseth.corp`
     - Subject: `[VaultNotice Alert] New Management Announcement: ...`
     - Notice the prominent **"Open on Web Portal"** call-to-action button.
     - **Crucial Security Highlight:** Emphasize that **NO PDF is attached to this email**. The email simply informs the recipient and guides them safely back to the authenticated portal.
3. **Simulated Microsoft Teams Notification Tab:**
   - Select the **Teams Message** tab.
   - Notice the Teams Adaptive Card style with corporate accent, announcement preview, and deep link button.
4. **Test the Deep Link:**
   - Click the **"Open on Web Portal"** button inside either notification tab.
   - The modal for that specific announcement opens immediately, proving seamless deep-link navigation.

---

### Act V: Audit Trail & Administrative Governance

**Presenter Goal:** Show compliance oversight and template management for enterprise admins.

1. **Switch Persona to Portal Admin:**
   - Select **Portal Admin** in the persona switcher.
2. **Open Audit Trail:**
   - Click the **"Audit Trail"** tab/button.
   - View the immutable audit log table displaying:
     - Event Timestamp
     - Action (`ANNOUNCEMENT_CREATED`, `FILE_DOWNLOADED`, `PERMISSION_ACCESSED`)
     - Actor (`Sarah Lin`, `David Miller`)
     - Target Announcement ID
     - Client IP address and status
3. **Open Template Manager:**
   - Click the **"Templates"** tab.
   - View the 5 standard starter templates (*Holiday Schedule, Policy Update, Circular Memo, Townhall, Blank*).
   - Click "Preview" on any template to see the pre-configured title and markdown body.

---

## 5. Role Principles Verification Matrix

| Proposal Requirement | Implementation Mechanism | Test Verification |
| :--- | :--- | :--- |
| **Management Composer Visibility** | Role-based check on `currentUser.is_management`. Non-management users see `FeedbackBanner`. | `test_post_announcement_audience_restriction` |
| **Security-Trimmed Library** | Subquery filtering: `author_id = user_id OR is_admin OR target_id = user_id OR target_id IN (user_groups)`. | `test_current_user_audience_check` |
| **403 on Unauthorized URL Access** | Server-side `verify_announcement_access` dependency returning `403 FORBIDDEN`. | `test_anti_url_guessing_security` |
| **Dynamic Group Membership** | Permissions reference `group_id`. Adding/removing a user from `user_group_map` takes effect instantly without touching announcement records. | `test_dynamic_group_membership_transition` |
| **Path Traversal Protection** | Filename normalization stripping `../`, `..\\`, and absolute paths; folder sandboxing. | `test_path_traversal_protection` |
| **File Size Limit (25MB)** | Streaming byte counter throwing `400 FILE_TOO_LARGE` if file exceeds 25MB. | `test_oversized_file_rejection` |
| **Zero Email Attachment Rule** | `NotificationService` generates alert body with deep link URL only; attachment payload is empty. | `NotificationDrawer.tsx` & `notification_service.py` |

---

## 6. Troubleshooting & FAQ

* **Q: The database container fails to start.**
  * *Fix:* Ensure Docker Desktop is running (`open -a Docker` on macOS). Run `docker compose ps` to inspect container health.
* **Q: I want to reset the database to a fresh state.**
  * *Fix:* Run:
    ```bash
    cd backend
    uv run alembic downgrade base
    uv run alembic upgrade head
    uv run python -m scripts.seed_data
    ```
* **Q: How do I run the automated security test suite?**
  * *Fix:* Run:
    ```bash
    cd backend
    uv run pytest -v
    ```
    All 13 tests should pass in under 1 second.
