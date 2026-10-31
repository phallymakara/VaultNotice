import os
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db

router = APIRouter()


@router.get("/health", summary="Health Check")
def health_check(db: Annotated[Session, Depends(get_db)]):
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except SQLAlchemyError as e:
        db_status = f"error: {e!s}"

    storage_exists = os.path.isdir(settings.STORAGE_DIR)

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "project": settings.PROJECT_NAME,
        "database": db_status,
        "storage": "ready" if storage_exists else "missing",
    }
