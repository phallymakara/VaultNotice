from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    announcement_id: int
    announcement_title: str
    author_name: str
    channel: str
    status: str
    sent_at: datetime
    open_url: str

    model_config = ConfigDict(from_attributes=True)
