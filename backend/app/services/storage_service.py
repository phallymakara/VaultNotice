import os
import re
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import APIError
from app.core.logging import logger

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


def sanitize_folder_name(date_prefix: str, title: str) -> str:
    """Creates a clean folder name format: YYYY-MM-DD - [Title]."""
    clean_title = re.sub(r'[\\/*?:"<>|]', "", title).strip()
    clean_title = re.sub(r"\s+", " ", clean_title)
    if not clean_title:
        clean_title = "Untitled Announcement"
    # Truncate title if excessively long
    clean_title = clean_title[:80]
    return f"{date_prefix} - {clean_title}"


def get_announcement_folder_path(folder_name: str) -> str:
    """Returns absolute path to announcement folder and validates against path traversal."""
    base_dir = Path(settings.STORAGE_DIR).resolve()
    target_path = (base_dir / folder_name).resolve()

    if not str(target_path).startswith(str(base_dir)):
        raise APIError(
            "Path traversal attempt detected",
            error_code="SECURITY_VIOLATION",
            status_code=400,
        )

    return str(target_path)


def create_announcement_folder(folder_name: str) -> str:
    folder_path = get_announcement_folder_path(folder_name)
    os.makedirs(folder_path, exist_ok=True)
    return folder_path


def sanitize_filename(filename: str) -> str:
    clean_name = os.path.basename(filename)
    clean_name = re.sub(r'[\\/*?:"<>|]', "_", clean_name)
    clean_name = re.sub(r"\s+", "_", clean_name)
    return clean_name or "attachment.bin"


async def save_uploaded_file(
    file: UploadFile, folder_path: str
) -> tuple[str, str, int, str]:
    """Saves an uploaded file safely into the announcement folder, returning (file_name, file_path, file_size, mime_type)."""
    clean_name = sanitize_filename(file.filename or "attachment")
    destination = os.path.join(folder_path, clean_name)

    # Prevent overwriting
    counter = 1
    base_name, ext = os.path.splitext(clean_name)
    while os.path.exists(destination):
        clean_name = f"{base_name}_{counter}{ext}"
        destination = os.path.join(folder_path, clean_name)
        counter += 1

    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE:
        raise APIError(
            f"File '{file.filename}' exceeds maximum limit of 25MB",
            error_code="FILE_TOO_LARGE",
            status_code=400,
        )

    Path(destination).write_bytes(content)

    mime_type = file.content_type or "application/octet-stream"
    logger.info(f"Saved uploaded attachment: {destination} ({file_size} bytes)")
    return clean_name, destination, file_size, mime_type
