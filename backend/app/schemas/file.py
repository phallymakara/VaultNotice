from pydantic import BaseModel, ConfigDict


class FileResponse(BaseModel):
    id: int
    announcement_id: int
    file_name: str
    file_size: int
    mime_type: str
    is_generated_pdf: bool
    download_url: str

    model_config = ConfigDict(from_attributes=True)

