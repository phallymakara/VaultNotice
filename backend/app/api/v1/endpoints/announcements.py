from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.announcement import (
    AcknowledgementResponse,
    AnnouncementDetailResponse,
    AnnouncementSummaryResponse,
)
from app.services.announcement_service import (
    acknowledge_announcement,
    get_announcement_details_authorized,
    list_security_trimmed_announcements,
    process_and_create_announcement,
)

router = APIRouter()


@router.post(
    "",
    response_model=AnnouncementDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Post Announcement (Audience Targeted)",
)
async def post_announcement(
    title: Annotated[str, Form(description="Announcement subject/title")],
    message_content: Annotated[
        str, Form(description="Announcement markdown/rich message")
    ],
    recipients: Annotated[
        str, Form(description="JSON string array of RecipientTarget")
    ],
    template_id: Annotated[
        int | None, Form(description="Optional template ID used")
    ] = None,
    confidentiality_level: Annotated[
        str, Form(description="Confidentiality classification")
    ] = "Internal",
    expires_at: Annotated[
        datetime | None, Form(description="Optional expiration datetime")
    ] = None,
    files: Annotated[
        list[UploadFile] | None, File(description="Document attachments")
    ] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Processes and publishes a targeted announcement:

    - Creates dedicated storage folder: YYYY-MM-DD - [Title]
    - Saves attachments & compiles official Announcement.pdf
    - Sets unique folder permissions for targeted users & groups
    - Dispatches simulated Email and Teams alerts
    """
    return await process_and_create_announcement(
        db=db,
        current_user=current_user,
        title=title,
        message_content=message_content,
        recipients_json=recipients,
        template_id=template_id,
        confidentiality_level=confidentiality_level,
        expires_at=expires_at,
        files=files,
    )


@router.get(
    "",
    response_model=list[AnnouncementSummaryResponse],
    summary="List Security-Trimmed Announcements",
)
def list_announcements(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    """Lists announcement folders accessible to the active persona based on folder permissions."""
    return list_security_trimmed_announcements(
        db=db,
        current_user=current_user,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{announcement_id}",
    response_model=AnnouncementDetailResponse,
    summary="Get Announcement Folder Details",
)
def get_announcement_details(
    announcement_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Inspects an announcement folder, listing the Announcement.pdf and all attached documents."""
    return get_announcement_details_authorized(
        db=db,
        announcement_id=announcement_id,
        current_user=current_user,
    )


@router.post(
    "/{announcement_id}/acknowledge",
    response_model=AcknowledgementResponse,
    summary="Acknowledge Announcement",
)
def acknowledge_notice(
    announcement_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Records read acknowledgement for the current user."""
    return acknowledge_announcement(
        db=db,
        announcement_id=announcement_id,
        current_user=current_user,
    )
