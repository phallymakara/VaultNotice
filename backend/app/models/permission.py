from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.announcement import Announcement


class AnnouncementPermission(Base):
    __tablename__ = "announcement_permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    announcement_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("announcements.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recipient_type: Mapped[str] = mapped_column(
        String(16), nullable=False
    )  # "USER" or "GROUP"
    recipient_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    access_level: Mapped[str] = mapped_column(
        String(32), default="READ", nullable=False
    )  # "READ" or "FULL_CONTROL"

    announcement: Mapped["Announcement"] = relationship(
        "Announcement", back_populates="permissions"
    )

    __table_args__ = (
        Index(
            "ix_perm_announcement_recipient",
            "announcement_id",
            "recipient_type",
            "recipient_id",
        ),
    )
