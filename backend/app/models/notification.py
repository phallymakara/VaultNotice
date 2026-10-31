from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.announcement import Announcement
    from app.models.user import User


class AuditNotification(Base):
    __tablename__ = "audit_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    announcement_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("announcements.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recipient_user_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    channel: Mapped[str] = mapped_column(
        String(32), default="EMAIL", nullable=False
    )  # "EMAIL" or "TEAMS"
    status: Mapped[str] = mapped_column(String(32), default="DELIVERED", nullable=False)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    announcement: Mapped["Announcement"] = relationship(
        "Announcement", back_populates="notifications"
    )
    recipient_user: Mapped["User"] = relationship(
        "User", back_populates="notifications_received"
    )
