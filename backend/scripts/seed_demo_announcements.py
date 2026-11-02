import os
from datetime import datetime, timezone
from pathlib import Path

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.announcement import Announcement
from app.models.file import AnnouncementFile
from app.models.permission import AnnouncementPermission
from app.models.user import User

DEMO_NOTICES = [
    {
        "title": "Holiday Schedule Q4",
        "folder_name": "2026-10-22 Holiday Schedule Q4",
        "created_at": datetime(2026, 10, 22, 9, 30, tzinfo=timezone.utc),
        "message_content": (
            "Dear colleagues,\n\n"
            "Please find attached the public holiday schedule for October to December 2026 "
            "and the branch opening arrangements."
        ),
        "target_group_id": "grp-branch-managers",
        "confidentiality_level": "Internal",
        "files": [
            ("Holiday Calendar Q4 2026.pdf", "application/pdf", 245000),
            ("Branch Opening Hours.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 112000),
            ("Executive Holiday Directive.pdf", "application/pdf", 185000),
        ],
    },
    {
        "title": "New Loan Policy Effective Nov",
        "folder_name": "2026-10-20 New Loan Policy Effective Nov",
        "created_at": datetime(2026, 10, 20, 14, 15, tzinfo=timezone.utc),
        "message_content": (
            "Management announces the revised credit evaluation guidelines and updated loan appraisal limits "
            "effective from 1st November 2026. Branch managers must review and confirm adherence."
        ),
        "target_group_id": "grp-branch-managers",
        "confidentiality_level": "Official Directive",
        "files": [
            ("Loan Policy Guide v2.4.pdf", "application/pdf", 530000),
            ("Interest Rate Schedule.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 94000),
        ],
    },
    {
        "title": "Q3 Results Briefing",
        "folder_name": "2026-10-15 Q3 Results Briefing",
        "created_at": datetime(2026, 10, 15, 11, 0, tzinfo=timezone.utc),
        "message_content": (
            "The executive summary of Q3 operating financial performance, asset quality ratios, and department milestones "
            "is now available for department heads."
        ),
        "target_group_id": "grp-management",
        "confidentiality_level": "Confidential",
        "files": [
            ("Q3 Executive Performance Deck.pdf", "application/pdf", 890000),
        ],
    },
    {
        "title": "IT Security Reminder",
        "folder_name": "2026-10-09 IT Security Reminder",
        "created_at": datetime(2026, 10, 9, 8, 45, tzinfo=timezone.utc),
        "message_content": (
            "Please ensure all multi-factor authentication devices are updated. Never share temporary credentials "
            "or client data across unauthorized external communication channels."
        ),
        "target_group_id": "grp-branch-managers",
        "confidentiality_level": "Internal",
        "files": [
            ("Security Hygiene Best Practices.pdf", "application/pdf", 142000),
        ],
    },
]


def seed_demo_notices():
    db = SessionLocal()
    try:
        author = db.query(User).filter(User.id == "user-sarah").first()
        if not author:
            print("Author user-sarah not found, skipping demo seed.")
            return

        storage_root = Path(settings.STORAGE_DIR)
        storage_root.mkdir(parents=True, exist_ok=True)

        for item in DEMO_NOTICES:
            existing = db.query(Announcement).filter(Announcement.title == item["title"]).first()
            if existing:
                continue

            folder_path = storage_root / item["folder_name"]
            folder_path.mkdir(parents=True, exist_ok=True)

            announcement = Announcement(
                title=item["title"],
                folder_name=item["folder_name"],
                message_content=item["message_content"],
                author_id=author.id,
                status="SUCCESS",
                confidentiality_level=item["confidentiality_level"],
                created_at=item["created_at"],
            )
            db.add(announcement)
            db.flush()

            # Add permission
            perm = AnnouncementPermission(
                announcement_id=announcement.id,
                recipient_type="GROUP",
                recipient_id=item["target_group_id"],
                access_level="READ",
            )
            db.add(perm)

            # Add files
            for idx, (filename, file_type, file_size) in enumerate(item["files"]):
                f_path = folder_path / filename
                if not f_path.exists():
                    f_path.write_bytes(f"Mock content for {filename}".encode("utf-8"))

                a_file = AnnouncementFile(
                    announcement_id=announcement.id,
                    file_name=filename,
                    file_path=str(f_path),
                    file_size=file_size,
                    mime_type=file_type,
                    is_generated_pdf=False,
                )
                db.add(a_file)

            db.commit()
            print(f"Created demo announcement: {announcement.title} (ID: {announcement.id})")

        print("Demo notices seeding completed.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding demo notices: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_notices()
