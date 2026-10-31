import os
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import ForbiddenError, NotFoundError
from app.db.session import get_db
from app.models.user import User
from app.repositories.announcement_repository import check_user_access, get_file_by_id
from app.repositories.user_repository import get_user_group_ids

router = APIRouter()


@router.get(
    "/{announcement_id}/files/{file_id}/download",
    summary="Download Announcement Document (Protected)",
)
def download_announcement_file(
    announcement_id: int,
    file_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Securely streams an announcement attachment or generated Announcement.pdf.

    Enforces folder ACLs: returns HTTP 403 Forbidden if user lacks permission.
    """
    user_groups = get_user_group_ids(db, current_user.id)
    is_admin = current_user.role == "Portal Admin" or "grp-portal-admins" in user_groups

    has_access, _ = check_user_access(
        db=db,
        announcement_id=announcement_id,
        user_id=current_user.id,
        group_ids=user_groups,
        is_admin=is_admin,
    )

    if not has_access:
        raise ForbiddenError(
            "Access Denied: You do not have permission to access files in this folder."
        )

    file_record = get_file_by_id(db, file_id)
    if not file_record or file_record.announcement_id != announcement_id:
        raise NotFoundError(
            "The requested file was not found in this announcement folder."
        )

    if not os.path.exists(file_record.file_path):
        raise NotFoundError("The physical file is missing from portal storage.")

    return FileResponse(
        path=file_record.file_path,
        filename=file_record.file_name,
        media_type=file_record.mime_type,
    )
