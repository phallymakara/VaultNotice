from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.file import FileResponse


class RecipientTarget(BaseModel):
    type: Literal["USER", "GROUP"]
    id: str
    name: str


class AnnouncementPermissionResponse(BaseModel):
    id: int
    recipient_type: str
    recipient_id: str
    recipient_name: str
    access_level: str

    model_config = ConfigDict(from_attributes=True)


class AnnouncementSummaryResponse(BaseModel):
    id: int
    title: str
    folder_name: str
    author_id: str
    author_name: str
    created_at: datetime
    status: str
    target_summary: list[str] = []
    attachment_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class AnnouncementDetailResponse(BaseModel):
    id: int
    title: str
    folder_name: str
    message_content: str
    author_id: str
    author_name: str
    template_name: str | None = None
    created_at: datetime
    status: str
    target_summary: list[str] = []
    permissions: list[AnnouncementPermissionResponse] = []
    files: list[FileResponse] = []

    model_config = ConfigDict(from_attributes=True)
