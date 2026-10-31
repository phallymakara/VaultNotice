from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.announcement_repository import get_notifications_for_user
from app.schemas.notification import NotificationResponse

router = APIRouter()


@router.get(
    "/my",
    response_model=list[NotificationResponse],
    summary="Get Current User Notifications",
)
def get_my_notifications(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
):
    """Returns simulated Email and Microsoft Teams notification alerts for the active persona."""
    notifs = get_notifications_for_user(db, current_user.id, limit=limit)
    results: list[NotificationResponse] = []

    for n in notifs:
        title = n.announcement.title if n.announcement else "Management Announcement"
        author = (
            n.announcement.author.name
            if n.announcement and n.announcement.author
            else "Management"
        )
        results.append(
            NotificationResponse(
                id=n.id,
                announcement_id=n.announcement_id,
                announcement_title=title,
                author_name=author,
                channel=n.channel,
                status=n.status,
                sent_at=n.sent_at,
                open_url=f"/announcements/{n.announcement_id}",
            )
        )

    return results
