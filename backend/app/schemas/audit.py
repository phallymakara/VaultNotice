from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int
    announcement_id: int
    title: str
    author_name: str
    recipients_summary: list[str]
    file_count: int
    timestamp: datetime
    status: str
    error_message: str | None = None

    model_config = ConfigDict(from_attributes=True)
