from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.file import FileResponse


class RecipientTarget(BaseModel):
    type: Literal["USER", "GROUP"]
    id: str
    name: str


class GroupMemberResponse(BaseModel):
    id: str
    name: str
    email: str | None = None
    role: str
    department: str

    model_config = ConfigDict(from_attributes=True)


class FullControlUserResponse(BaseModel):
    id: str
    name: str
    role: str
    department: str
    reason: str

    model_config = ConfigDict(from_attributes=True)


class AnnouncementPermissionResponse(BaseModel):
    id: int
    recipient_type: str
    recipient_id: str
    recipient_name: str
    access_level: str
    group_members: list[GroupMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AnnouncementSummaryResponse(BaseModel):
    id: int
    title: str
    folder_name: str
    author_id: str
    author_name: str
    created_at: datetime
    status: str
    confidentiality_level: str = "Internal"
    expires_at: datetime | None = None
    acknowledged: bool = False
    acknowledgement_count: int = 0
    target_summary: list[str] = []
    attachment_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class AnnouncementDetailResponse(BaseModel):
    id: int
    title: str
    folder_name: str
    folder_url: str = ""
    message_content: str
    author_id: str
    author_name: str
    author_role: str = "Management"
    author_department: str = "Executive Office"
    template_name: str | None = None
    created_at: datetime
    status: str
    error_message: str | None = None
    confidentiality_level: str = "Internal"
    expires_at: datetime | None = None
    acknowledged: bool = False
    acknowledged_at: datetime | None = None
    acknowledgement_count: int = 0
    target_summary: list[str] = []
    selected_recipients: list[RecipientTarget] = []
    permissions: list[AnnouncementPermissionResponse] = []
    full_control_users: list[FullControlUserResponse] = []
    effective_access_count: int = 0
    teams_alert_sent: bool = True
    email_alert_sent: bool = True
    alerts_sent_at: datetime | None = None
    alerted_users_count: int = 0
    can_view_detailed_permissions: bool = False
    files: list[FileResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AcknowledgementResponse(BaseModel):
    announcement_id: int
    acknowledged: bool
    acknowledged_at: datetime | None = None
    acknowledgement_count: int
