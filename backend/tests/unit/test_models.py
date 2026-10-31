from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.announcement import Announcement
from app.models.file import AnnouncementFile
from app.models.group import Group
from app.models.notification import AuditNotification
from app.models.permission import AnnouncementPermission
from app.models.template import Template
from app.models.user import User
from app.models.user_group_map import UserGroupMap


def test_seeded_users_and_groups():
    db = SessionLocal()
    try:
        # Check users count
        users = db.execute(select(User)).scalars().all()
        assert len(users) >= 6
        user_ids = {u.id for u in users}
        assert "user-sarah" in user_ids
        assert "user-david" in user_ids
        assert "user-emily" in user_ids

        # Check groups count
        groups = db.execute(select(Group)).scalars().all()
        assert len(groups) >= 5
        group_ids = {g.id for g in groups}
        assert "grp-management" in group_ids
        assert "grp-branch-managers" in group_ids
        assert "grp-finance" in group_ids

        # Check templates count
        templates = db.execute(select(Template)).scalars().all()
        assert len(templates) >= 5
        template_names = {t.name for t in templates}
        assert "Holiday Schedule & Office Operations" in template_names
        assert "Company Policy Update" in template_names
    finally:
        db.close()


def test_user_group_membership_resolution():
    db = SessionLocal()
    try:
        # Query groups for David Miller
        david_groups = (
            db.execute(
                select(Group.name)
                .join(UserGroupMap, UserGroupMap.group_id == Group.id)
                .where(UserGroupMap.user_id == "user-david")
            )
            .scalars()
            .all()
        )

        assert "All Branch Managers" in david_groups
        assert "Operations Team" in david_groups
        assert "Finance Department" not in david_groups

        # Query members of "All Branch Managers"
        branch_mgrs = (
            db.execute(
                select(User.name)
                .join(UserGroupMap, UserGroupMap.user_id == User.id)
                .where(UserGroupMap.group_id == "grp-branch-managers")
            )
            .scalars()
            .all()
        )

        assert "David Miller" in branch_mgrs
        assert "Sreyneath Keo" in branch_mgrs
        assert "Emily Tan" not in branch_mgrs
    finally:
        db.close()


def test_announcement_with_acls_and_files():
    db = SessionLocal()
    try:
        # Create a test announcement
        announcement = Announcement(
            title="Test Security Directive",
            folder_name="2026-10-31 - Test Security Directive",
            message_content="This is a test announcement message with confidential circular attachments.",
            author_id="user-sarah",
            status="SUCCESS",
        )
        db.add(announcement)
        db.flush()

        # Add permissions (ACLs): Full Control for Sarah, Read for Branch Managers
        perm_author = AnnouncementPermission(
            announcement_id=announcement.id,
            recipient_type="USER",
            recipient_id="user-sarah",
            access_level="FULL_CONTROL",
        )
        perm_group = AnnouncementPermission(
            announcement_id=announcement.id,
            recipient_type="GROUP",
            recipient_id="grp-branch-managers",
            access_level="READ",
        )
        db.add_all([perm_author, perm_group])

        # Add files: Generated PDF and attachment
        file_pdf = AnnouncementFile(
            announcement_id=announcement.id,
            file_name="Announcement.pdf",
            file_path="storage/announcements/2026-10-31 - Test Security Directive/Announcement.pdf",
            file_size=10240,
            mime_type="application/pdf",
            is_generated_pdf=True,
        )
        file_doc = AnnouncementFile(
            announcement_id=announcement.id,
            file_name="SecurityPolicy_v2.docx",
            file_path="storage/announcements/2026-10-31 - Test Security Directive/SecurityPolicy_v2.docx",
            file_size=20480,
            mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            is_generated_pdf=False,
        )
        db.add_all([file_pdf, file_doc])

        # Add simulated notification
        notif = AuditNotification(
            announcement_id=announcement.id,
            recipient_user_id="user-david",
            channel="EMAIL",
            status="DELIVERED",
        )
        db.add(notif)
        db.commit()

        # Verify retrieval and relationships
        saved = db.execute(
            select(Announcement).where(Announcement.id == announcement.id)
        ).scalar_one()
        assert saved.author.name == "Sarah Lin"
        assert len(saved.permissions) == 2
        assert len(saved.files) == 2
        assert len(saved.notifications) == 1
        assert saved.files[0].is_generated_pdf or saved.files[1].is_generated_pdf

        # Clean up test announcement (cascades to permissions, files, notifications)
        db.delete(saved)
        db.commit()

        # Verify cascade deletion
        perms = (
            db.execute(
                select(AnnouncementPermission).where(
                    AnnouncementPermission.announcement_id == announcement.id
                )
            )
            .scalars()
            .all()
        )
        assert len(perms) == 0
    finally:
        db.close()
