from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TemplateResponse(BaseModel):
    id: int
    name: str
    category: str
    title_template: str
    content_template: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TemplateCreate(BaseModel):
    name: str
    category: str = "General"
    title_template: str = ""
    content_template: str = ""
    is_active: bool = True


class TemplateUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    title_template: str | None = None
    content_template: str | None = None
    is_active: bool | None = None
