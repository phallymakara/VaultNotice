from fastapi import APIRouter

from app.api.v1.endpoints import (
    announcements,
    audit,
    directory,
    files,
    health,
    notifications,
    templates,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(directory.router, prefix="/directory", tags=["Directory"])
api_router.include_router(templates.router, prefix="/templates", tags=["Templates"])
api_router.include_router(
    announcements.router, prefix="/announcements", tags=["Announcements"]
)
api_router.include_router(files.router, prefix="/announcements", tags=["Files"])
api_router.include_router(
    notifications.router, prefix="/notifications", tags=["Notifications"]
)
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
