from collections.abc import Sequence

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.announcement import Announcement
from app.models.file import AnnouncementFile
from app.models.notification import AuditNotification
from app.models.permission import AnnouncementPermission


def create_announcement_record(
    db: Session,
    announcement: Announcement,
    permissions: list[AnnouncementPermission],
    files: list[AnnouncementFile],
    notifications: list[AuditNotification],
) -> Announcement:
    db.add(announcement)
    db.flush()

    for perm in permissions:
        perm.announcement_id = announcement.id
        db.add(perm)

    for f in files:
        f.announcement_id = announcement.id
        db.add(f)

    for notif in notifications:
        notif.announcement_id = announcement.id
        db.add(notif)

    db.commit()
    db.refresh(announcement)
    return announcement


def get_security_trimmed_announcements(
    db: Session,
    user_id: str,
    group_ids: list[str],
    is_admin: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> Sequence[Announcement]:
    query = (
        select(Announcement)
        .options(
            joinedload(Announcement.author),
            joinedload(Announcement.permissions),
            joinedload(Announcement.files),
        )
        .order_by(Announcement.created_at.desc())
    )

    if not is_admin:
        # User is author OR user has direct permission OR user is member of a targeted group
        permission_conditions = [
            (AnnouncementPermission.recipient_type == "USER")
            & (AnnouncementPermission.recipient_id == user_id)
        ]
        if group_ids:
            permission_conditions.append(
                (AnnouncementPermission.recipient_type == "GROUP")
                & (AnnouncementPermission.recipient_id.in_(group_ids))
            )

        perm_subquery = (
            select(AnnouncementPermission.announcement_id)
            .where(or_(*permission_conditions))
            .scalar_subquery()
        )

        query = query.where(
            or_(
                Announcement.author_id == user_id,
                Announcement.id.in_(perm_subquery),
            )
        )

    return db.execute(query.limit(limit).offset(offset)).unique().scalars().all()


def get_announcement_by_id(db: Session, announcement_id: int) -> Announcement | None:
    return (
        db.execute(
            select(Announcement)
            .options(
                joinedload(Announcement.author),
                joinedload(Announcement.template),
                joinedload(Announcement.permissions),
                joinedload(Announcement.files),
            )
            .where(Announcement.id == announcement_id)
        )
        .unique()
        .scalar_one_or_none()
    )


def check_user_access(
    db: Session,
    announcement_id: int,
    user_id: str,
    group_ids: list[str],
    is_admin: bool = False,
) -> tuple[bool, str]:
    if is_admin:
        return True, "FULL_CONTROL"

    announcement = db.execute(
        select(Announcement).where(Announcement.id == announcement_id)
    ).scalar_one_or_none()

    if not announcement:
        return False, "NOT_FOUND"

    if announcement.author_id == user_id:
        return True, "FULL_CONTROL"

    # Check permissions
    conditions = [
        (AnnouncementPermission.recipient_type == "USER")
        & (AnnouncementPermission.recipient_id == user_id)
    ]
    if group_ids:
        conditions.append(
            (AnnouncementPermission.recipient_type == "GROUP")
            & (AnnouncementPermission.recipient_id.in_(group_ids))
        )

    has_perm = db.execute(
        select(AnnouncementPermission).where(
            AnnouncementPermission.announcement_id == announcement_id,
            or_(*conditions),
        )
    ).first()

    if has_perm:
        return True, "READ"

    return False, "NO_ACCESS"


def get_file_by_id(db: Session, file_id: int) -> AnnouncementFile | None:
    return db.execute(
        select(AnnouncementFile).where(AnnouncementFile.id == file_id)
    ).scalar_one_or_none()


def get_audit_logs(
    db: Session, limit: int = 50, offset: int = 0
) -> Sequence[Announcement]:
    return (
        db.execute(
            select(Announcement)
            .options(
                joinedload(Announcement.author),
                joinedload(Announcement.permissions),
                joinedload(Announcement.files),
            )
            .order_by(Announcement.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        .unique()
        .scalars()
        .all()
    )


def get_notifications_for_user(
    db: Session, user_id: str, limit: int = 20
) -> Sequence[AuditNotification]:
    return (
        db.execute(
            select(AuditNotification)
            .options(
                joinedload(AuditNotification.announcement).joinedload(
                    Announcement.author
                )
            )
            .where(AuditNotification.recipient_user_id == user_id)
            .order_by(AuditNotification.sent_at.desc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
