from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.announcement_repository import get_audit_logs
from app.repositories.user_repository import get_all_groups, get_all_users
from app.schemas.audit import AuditLogResponse

router = APIRouter()


@router.get("/logs", response_model=list[AuditLogResponse], summary="List Audit Logs")
def list_audit_logs(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    """Returns the immutable audit log of all announcement postings and delivery status."""
    logs = get_audit_logs(db, limit=limit, offset=offset)
    users_map = {u.id: u.name for u in get_all_users(db)}
    groups_map = {g.id: g.name for g in get_all_groups(db)}

    results: list[AuditLogResponse] = []
    for a in logs:
        recipients_summary: list[str] = []
        for p in a.permissions:
            if p.access_level != "FULL_CONTROL":
                if p.recipient_type == "USER":
                    recipients_summary.append(
                        users_map.get(p.recipient_id, p.recipient_id)
                    )
                else:
                    recipients_summary.append(
                        groups_map.get(p.recipient_id, p.recipient_id)
                    )

        results.append(
            AuditLogResponse(
                id=a.id,
                announcement_id=a.id,
                title=a.title,
                author_name=a.author.name if a.author else "Management",
                recipients_summary=recipients_summary,
                file_count=len(a.files),
                timestamp=a.created_at,
                status=a.status,
                error_message=a.error_message,
            )
        )

    return results
