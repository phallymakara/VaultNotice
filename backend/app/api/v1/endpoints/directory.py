from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import search_directory
from app.schemas.user import DirectorySearchItem, UserResponse
from app.services.announcement_service import can_post_announcement

router = APIRouter()


@router.get(
    "/search", response_model=list[DirectorySearchItem], summary="Search Directory"
)
def search_directory_endpoint(
    db: Annotated[Session, Depends(get_db)],
    q: Annotated[
        str,
        Query(description="Search term for user name, group name, email or department"),
    ] = "",
):
    """Searches corporate directory across Users and Microsoft 365 / Security Groups."""
    return search_directory(db, query=q)


@router.get(
    "/users/current", response_model=UserResponse, summary="Get Current Persona"
)
def get_current_user_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Returns the profile and calculated permissions of the current persona."""
    user_groups = [m.group.name for m in current_user.group_memberships if m.group]
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        department=current_user.department,
        groups=user_groups,
        can_post_announcement=can_post_announcement(current_user),
        created_at=current_user.created_at,
    )
