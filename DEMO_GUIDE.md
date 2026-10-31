# VaultNotice - Corporate Demonstration & Walkthrough Guide

> **Executive Presentation Script**  
> *A Business-First Walkthrough of the Management Announcement Portal*

---

## 1. Executive Summary & Value Proposition

**VaultNotice** replaces unmanaged, risky broadcast email attachments with a centralized, permission-governed corporate portal.

### Key Business Benefits:
* **Information Security & Leak Prevention:** Sensitive corporate memos, circulars, and policies remain hosted safely inside the portal. Confidential files are never broadcast directly as email attachments.
* **Targeted Audience Distribution:** Management can direct announcements to specific departments, employee groups (such as *All Branch Managers*), or individuals. Staff only see notices meant for them.
* **Instant Permission Governance:** When an employee joins or moves to a new department, their access updates automatically to show all current and historical notices for that group.
* **Standardized Executive Communication:** Pre-approved company templates ensure consistent branding, structure, and clarity for all official notices.

---

## 2. Starting the Platform

To start the portal demonstration:

```bash
./start.sh
```

Once running, open your web browser to: **[http://localhost:5173](http://localhost:5173)**

---

## 3. Demonstration Profiles

Switch between the following corporate profiles at any time using the **Profile Menu** in the top-right header:

| Profile | Role / Department | Portal Access & Experience |
| :--- | :--- | :--- |
| **Sarah Lin** | Executive Management | Authorized author. Can compose, target, and publish official announcements. |
| **David Miller** | Branch Manager | Targeted recipient. Receives branch-specific directives and company circulars. |
| **Sreyneath Meas** | Compliance Officer | Targeted recipient. Receives compliance policies and general notices. |
| **Emily Tan** | Finance Specialist | General staff. Sees only finance-specific or all-company announcements. |
| **Alex Vorn** | IT Support Specialist | General staff. Sees only IT-specific or all-company announcements. |
| **Portal Admin** | System Administrator | Complete oversight. Views activity distribution logs and manages templates. |

---

## 4. Step-by-Step Demonstration Script

### Scene 1: Composing and Publishing an Announcement (Management View)

**Presenter Goal:** Demonstrate how easily management can draft, target, attach documents, and publish an official directive.

1. **Active Profile:** Ensure **Sarah Lin (Executive Management)** is selected in the top-right profile menu.
2. **The Announcements Workspace:**
   - Point out the clean **Company Announcements** table. Sarah can immediately review all active notices.
   - Point out the **"+ New Announcement"** button at the top right, exclusively available to authorized management authors.
3. **Open the Composer:**
   - Click **"+ New Announcement"**. A focused creation window appears.
4. **Select a Pre-Approved Template:**
   - In the **Template** dropdown, choose **"Policy Update"** or **"Circular Memo"**.
   - Notice that the **Subject** and **Message Content** automatically pre-fill with standardized corporate wording.
5. **Target the Audience (Directory Search):**
   - Click into the **Target Audience** field.
   - Type `"David"`: The directory suggests **David Miller (Branch Manager)**. Click to select.
   - Type `"Branch"`: The directory suggests the group **All Branch Managers**. Click to select.
   - Both recipient badges now appear under Target Audience.
6. **Attach Official Documents:**
   - Click the file attachment area or drag and drop a sample document (such as an operational circular or policy PDF).
   - The file appears with its filename and formatted file size.
7. **Publish the Notice:**
   - Click **"Publish Announcement"**.
   - The window closes, and the newly published directive immediately appears at the top of the **Company Announcements** list.

---

### Scene 2: Targeted Recipient Experience vs. Confidentiality Protection

**Presenter Goal:** Show that targeted recipients see their notices immediately, while untargeted staff have zero visibility into confidential materials.

1. **Switch to Targeted Recipient (David Miller):**
   - Open the top-right profile menu and select **David Miller (Branch Manager)**.
   - **Notice the UX Adaptations:**
     - The **"+ New Announcement"** button is **hidden**, keeping David’s interface focused as a reader.
     - The announcement just published by Sarah Lin is **clearly visible** in David's list because he was selected as an individual and as part of *All Branch Managers*.
2. **Switch to Untargeted Recipient (Emily Tan):**
   - Open the profile menu and select **Emily Tan (Finance Specialist)**.
   - **Notice the Confidentiality Protection:**
     - The **"+ New Announcement"** button is hidden.
     - The announcement is **completely absent** from Emily’s list.
     - The screen displays: *"You have no announcements at this time. New notices targeted to your profile or department will appear here."*
     - Emily cannot see the notice title, author, or any attached documents.

---

### Scene 3: Reviewing the Announcement & Official Documents

**Presenter Goal:** Showcase the unified document view, automated corporate notice generation, and secure downloads.

1. **Switch back to David Miller (or Sarah Lin).**
2. **Open the Notice:**
   - Click on the announcement row in the table, or click **"View Notice"**.
3. **Key Elements to Highlight:**
   - **Notice Header:** Displays the title, publishing author (*Sarah Lin*), date, and recipient audience summary.
   - **Message Content:** Displays the full formatted message and instructions.
   - **Official Notice Document (PDF):**
     - Point out the automatically generated official document (*Announcement.pdf*).
     - Explain: *When published, the portal automatically formats the author's message into an official corporate PDF with standardized header and typography for archiving.*
     - Click **"Download PDF"** to demonstrate instant document retrieval.
   - **Attached Documents:**
     - Review all supporting attachments uploaded by management.
     - Each attachment includes filename, size, and a download button.
4. **Close the View:** Click the close button or press `Esc`.

---

### Scene 4: Multi-Channel Alerts & The Portal-Link Standard

**Presenter Goal:** Demonstrate notification alerts via Outlook and Microsoft Teams while reinforcing that sensitive documents remain securely on the portal.

1. **Open Recent Notifications:**
   - Click the **Bell icon** in the top navigation bar.
   - The **Alerts & Notifications** panel slides open from the right.
2. **Simulated Outlook Alert:**
   - Review the email notification:
     - Shows the subject, publishing author, and brief announcement excerpt.
     - Features a prominent **"Open on Web Portal"** button.
   - **Key Confidentiality Highlight:** Emphasize that **no sensitive files were attached to the email**. The email simply alerts the recipient and guides them safely back to the portal.
3. **Simulated Microsoft Teams Alert:**
   - Review the Teams card notification with its interactive portal link.
4. **Test the Portal Link:**
   - Click **"Open on Web Portal"** inside any notification card.
   - The announcement view opens directly to that notice, demonstrating seamless navigation from alert to document.

---

### Scene 5: Governance, Templates, and Activity Tracking

**Presenter Goal:** Demonstrate administrative oversight and compliance tracking.

1. **Switch Profile to Portal Admin:**
   - Select **Portal Admin** in the profile switcher.
2. **Activity & Distribution Log:**
   - Click the **"Audit Trail"** tab in the top navigation bar.
   - Point out the complete distribution record:
     - Exact publication date and time.
     - Publishing author name.
     - Targeted recipient groups and individuals.
     - Number of attached documents.
     - Delivery confirmation status.
3. **Announcement Templates:**
   - Click the **"Templates"** tab.
   - Review the pre-configured corporate templates (*Policy Update, Circular Memo, Holiday Schedule, Townhall Notice*).
   - Explain how standard templates help executives quickly issue announcements with pre-approved corporate language.

---

## 5. Summary of Governance Standards

| Business Requirement | How VaultNotice Delivers It |
| :--- | :--- |
| **Executive Authoring Control** | Only authorized management profiles see the announcement creation tools. General staff receive a clean reading workspace. |
| **Audience-Targeted Visibility** | Each employee only sees notices addressed to them or their assigned department groups. |
| **Zero-Attachment Security** | Email and Teams alerts direct recipients back to the portal. Confidential files are never sent over email. |
| **Automatic Department Sync** | When staff join or change departments, their portal view automatically reflects all current and past notices for that group. |
| **Archival & Compliance Tracking** | Every announcement is preserved alongside its complete recipient snapshot and document records. |
