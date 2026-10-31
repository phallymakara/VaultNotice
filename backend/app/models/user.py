from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.announcement import Announcement
    from app.models.notification import AuditNotification
    from app.models.user_group_map import UserGroupMap


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(64), nullable=False, default="Staff")
    department: Mapped[str] = mapped_column(
        String(255), nullable=False, default="General"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    group_memberships: Mapped[list["UserGroupMap"]] = relationship(
        "UserGroupMap",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    announcements_created: Mapped[list["Announcement"]] = relationship(
        "Announcement",
        back_populates="author",
        cascade="all, delete-orphan",
    )
    notifications_received: Mapped[list["AuditNotification"]] = relationship(
        "AuditNotification",
        back_populates="recipient_user",
        cascade="all, delete-orphan",
    )
