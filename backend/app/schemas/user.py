from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    groups: list[str] = []
    can_post_announcement: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DirectorySearchItem(BaseModel):
    id: str
    name: str
    email: str | None = None
    type: Literal["USER", "GROUP"]
    details: str

    model_config = ConfigDict(from_attributes=True)
