from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.file import AnnouncementFile
    from app.models.notification import AuditNotification
    from app.models.permission import AnnouncementPermission
    from app.models.template import Template
    from app.models.user import User


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    folder_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    message_content: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    template_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("templates.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(32), default="SUCCESS", nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        index=True,
    )

    author: Mapped["User"] = relationship(
        "User", back_populates="announcements_created"
    )
    template: Mapped[Optional["Template"]] = relationship(
        "Template", back_populates="announcements"
    )
    permissions: Mapped[list["AnnouncementPermission"]] = relationship(
        "AnnouncementPermission",
        back_populates="announcement",
        cascade="all, delete-orphan",
    )
    files: Mapped[list["AnnouncementFile"]] = relationship(
        "AnnouncementFile",
        back_populates="announcement",
        cascade="all, delete-orphan",
    )
    notifications: Mapped[list["AuditNotification"]] = relationship(
        "AuditNotification",
        back_populates="announcement",
        cascade="all, delete-orphan",
    )
