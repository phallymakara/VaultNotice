from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.exceptions import ForbiddenError, NotFoundError
from app.db.session import get_db
from app.models.user import User
from app.repositories.template_repository import (
    create_template,
    get_active_templates,
    get_template_by_id,
    update_template,
)
from app.schemas.template import TemplateCreate, TemplateResponse, TemplateUpdate

router = APIRouter()


@router.get("", response_model=list[TemplateResponse], summary="List Active Templates")
def list_templates(
    db: Annotated[Session, Depends(get_db)],
):
    """Retrieves all active announcement templates for the composer dropdown."""
    return get_active_templates(db)


@router.get(
    "/{template_id}", response_model=TemplateResponse, summary="Get Template by ID"
)
def get_template(
    template_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    template = get_template_by_id(db, template_id)
    if not template:
        raise NotFoundError(f"Template with ID {template_id} not found.")
    return template


@router.post(
    "",
    response_model=TemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Template (Admin)",
)
def create_template_endpoint(
    data: TemplateCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if current_user.role != "Portal Admin":
        raise ForbiddenError("Only Portal Admins are authorized to manage templates.")
    return create_template(db, data)


@router.put(
    "/{template_id}", response_model=TemplateResponse, summary="Update Template (Admin)"
)
def update_template_endpoint(
    template_id: int,
    data: TemplateUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if current_user.role != "Portal Admin":
        raise ForbiddenError("Only Portal Admins are authorized to manage templates.")
    template = get_template_by_id(db, template_id)
    if not template:
        raise NotFoundError(f"Template with ID {template_id} not found.")
    return update_template(db, template, data)
