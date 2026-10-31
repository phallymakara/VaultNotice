from sqlalchemy import select

from app.core.logging import logger, setup_logging
from app.db.session import SessionLocal
from app.models.group import Group
from app.models.template import Template
from app.models.user import User
from app.models.user_group_map import UserGroupMap

INITIAL_USERS = [
    {
        "id": "user-sarah",
        "name": "Sarah Lin",
        "email": "sarah.lin@company.com",
        "role": "Management",
        "department": "Executive Office",
    },
    {
        "id": "user-david",
        "name": "David Miller",
        "email": "david.miller@company.com",
        "role": "Branch Manager",
        "department": "Battambang Branch",
    },
    {
        "id": "user-sreyneath",
        "name": "Sreyneath Keo",
        "email": "sreyneath.keo@company.com",
        "role": "Branch Manager",
        "department": "Siem Reap Branch",
    },
    {
        "id": "user-emily",
        "name": "Emily Tan",
        "email": "emily.tan@company.com",
        "role": "Staff",
        "department": "Finance & Accounting",
    },
    {
        "id": "user-alex",
        "name": "Alex Vorn",
        "email": "alex.vorn@company.com",
        "role": "Staff",
        "department": "Customer Service",
    },
    {
        "id": "user-admin",
        "name": "Portal Admin",
        "email": "admin@company.com",
        "role": "Portal Admin",
        "department": "IT Infrastructure",
    },
]

INITIAL_GROUPS = [
    {
        "id": "grp-management",
        "name": "Management",
        "email": "management@company.com",
        "description": "Executive leadership and corporate directors",
    },
    {
        "id": "grp-branch-managers",
        "name": "All Branch Managers",
        "email": "branch-managers@company.com",
        "description": "Provincial and urban branch managers nationwide",
    },
    {
        "id": "grp-finance",
        "name": "Finance Department",
        "email": "finance@company.com",
        "description": "Corporate finance, treasury, and audit specialists",
    },
    {
        "id": "grp-operations",
        "name": "Operations Team",
        "email": "operations@company.com",
        "description": "Branch support and frontline operations staff",
    },
    {
        "id": "grp-portal-admins",
        "name": "Portal Admins",
        "email": "portal-admins@company.com",
        "description": "IT portal and security administrators",
    },
]

INITIAL_MEMBERSHIPS = [
    ("user-sarah", "grp-management"),
    ("user-david", "grp-branch-managers"),
    ("user-david", "grp-operations"),
    ("user-sreyneath", "grp-branch-managers"),
    ("user-sreyneath", "grp-operations"),
    ("user-emily", "grp-finance"),
    ("user-alex", "grp-operations"),
    ("user-admin", "grp-portal-admins"),
    ("user-admin", "grp-management"),
]

INITIAL_TEMPLATES = [
    {
        "name": "Holiday Schedule & Office Operations",
        "category": "Operations",
        "title_template": "Holiday Schedule & Branch Operations Notice - Q4",
        "content_template": (
            "### Executive Notice: Upcoming Public Holiday Operations\n\n"
            "Please be advised on the operating schedule and customer service availability across all provincial and municipal branches during the upcoming public holidays.\n\n"
            "#### 1. Branch Operational Schedule\n"
            "* **Branch Closure Dates:** 18th – 20th November\n"
            "* **Normal Business Resumes:** 21st November at 08:00 AM\n"
            "* **Digital Banking & ATM Availability:** 24/7 continuous operation\n\n"
            "#### 2. Emergency Duty Officers\n"
            "Each branch manager is required to appoint an on-call duty officer. Please consult the attached circular for designated contact protocols.\n\n"
            "*Management Executive Office*"
        ),
    },
    {
        "name": "Company Policy Update",
        "category": "Compliance",
        "title_template": "Policy Update: Information Security & Data Protection Guidelines",
        "content_template": (
            "### Management Directive: Information Security Policy Revision\n\n"
            "Management has approved key updates to the Corporate Information Security and Data Handling Policy, effective immediately.\n\n"
            "#### Key Changes:\n"
            "1. Strict prohibition of transferring confidential client files over unsecured external email.\n"
            "2. Mandatory use of VaultNotice portal folders for all executive announcements and circulars.\n"
            "3. Multi-factor authentication requirements for all remote administrative sessions.\n\n"
            "Please review the attached formal policy PDF and ensure full team compliance.\n\n"
            "*Corporate Governance & Compliance Committee*"
        ),
    },
    {
        "name": "General Executive Circular",
        "category": "Executive",
        "title_template": "Executive Circular: Q4 Strategic Priorities & Directives",
        "content_template": (
            "### Executive Circular No. 2026/10\n\n"
            "**To:** Designated Department Heads & Branch Leadership  \n"
            "**From:** Office of the Chief Executive Officer  \n\n"
            "This circular outlines the key operational milestones and audit readiness guidelines for the fourth quarter.\n\n"
            "#### Required Actions:\n"
            "* Complete mid-quarter branch reconciliation by the 15th of next month.\n"
            "* Submit updated staff roster plans to Central Operations.\n\n"
            "*Approved by Chief Executive Officer*"
        ),
    },
    {
        "name": "Quarterly Townhall Agenda",
        "category": "Internal Comms",
        "title_template": "All-Hands Quarterly Townhall Meeting - Agenda & Presentation Deck",
        "content_template": (
            "### All-Hands Townhall Meeting Announcement\n\n"
            "Management cordially invites targeted team members to attend our upcoming Quarterly Townhall session.\n\n"
            "#### Agenda:\n"
            "* **Opening Remarks & Business Performance Update:** 09:00 AM – 09:30 AM\n"
            "* **Operational Milestones & Technological Advancements:** 09:30 AM – 10:15 AM\n"
            "* **Open Q&A with Executive Leadership:** 10:15 AM – 11:00 AM\n\n"
            "Please find the meeting briefing paper attached. The session link will be broadcast via Microsoft Teams."
        ),
    },
    {
        "name": "Blank Announcement",
        "category": "General",
        "title_template": "",
        "content_template": "",
    },
]


def seed_database() -> None:
    setup_logging()
    db = SessionLocal()
    try:
        logger.info("Seeding initial data into VaultNotice database...")

        # 1. Seed Users
        for user_data in INITIAL_USERS:
            existing = db.execute(
                select(User).where(User.id == user_data["id"])
            ).scalar_one_or_none()
            if not existing:
                user = User(**user_data)
                db.add(user)
                logger.info(f"Added User: {user.name} ({user.id})")
            else:
                existing.name = user_data["name"]
                existing.email = user_data["email"]
                existing.role = user_data["role"]
                existing.department = user_data["department"]

        # 2. Seed Groups
        for group_data in INITIAL_GROUPS:
            existing = db.execute(
                select(Group).where(Group.id == group_data["id"])
            ).scalar_one_or_none()
            if not existing:
                group = Group(**group_data)
                db.add(group)
                logger.info(f"Added Group: {group.name} ({group.id})")
            else:
                existing.name = group_data["name"]
                existing.email = group_data["email"]
                existing.description = group_data["description"]

        db.flush()

        # 3. Seed Memberships
        for user_id, group_id in INITIAL_MEMBERSHIPS:
            existing_map = db.execute(
                select(UserGroupMap).where(
                    UserGroupMap.user_id == user_id,
                    UserGroupMap.group_id == group_id,
                )
            ).scalar_one_or_none()
            if not existing_map:
                membership = UserGroupMap(user_id=user_id, group_id=group_id)
                db.add(membership)
                logger.info(f"Assigned User {user_id} to Group {group_id}")

        # 4. Seed Templates
        for template_data in INITIAL_TEMPLATES:
            existing = db.execute(
                select(Template).where(Template.name == template_data["name"])
            ).scalar_one_or_none()
            if not existing:
                template = Template(**template_data)
                db.add(template)
                logger.info(f"Added Template: {template.name}")
            else:
                existing.category = template_data["category"]
                existing.title_template = template_data["title_template"]
                existing.content_template = template_data["content_template"]

        db.commit()
        logger.info("Database seeding completed successfully!")
    except Exception:
        db.rollback()
        logger.exception("Database seeding failed!")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
