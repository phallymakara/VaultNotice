from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.notification import AuditNotification
from app.repositories.user_repository import get_group_members
from app.schemas.announcement import RecipientTarget


def dispatch_simulated_notifications(
    db: Session,
    recipients: list[RecipientTarget],
    announcement_title: str,
    author_name: str,
    attachment_count: int,
) -> list[AuditNotification]:
    """Resolves all individual recipients (expanding groups) and logs simulated

    Email and Microsoft Teams alerts with zero attached files.
    """
    recipient_user_ids: set[str] = set()

    for r in recipients:
        if r.type == "USER":
            recipient_user_ids.add(r.id)
        elif r.type == "GROUP":
            group_members = get_group_members(db, r.id)
            for member in group_members:
                recipient_user_ids.add(member.id)

    notifications: list[AuditNotification] = []
    now = datetime.now(UTC)

    for uid in recipient_user_ids:
        # 1. Simulated Email Alert
        notif_email = AuditNotification(
            recipient_user_id=uid,
            channel="EMAIL",
            status="DELIVERED",
            sent_at=now,
        )
        # 2. Simulated Teams Alert
        notif_teams = AuditNotification(
            recipient_user_id=uid,
            channel="TEAMS",
            status="DELIVERED",
            sent_at=now,
        )
        notifications.extend([notif_email, notif_teams])

    logger.info(
        f"Dispatched {len(notifications)} alerts ({len(recipient_user_ids)} recipients) "
        f"for announcement '{announcement_title}' by {author_name} with {attachment_count} document(s)"
    )
    return notifications
