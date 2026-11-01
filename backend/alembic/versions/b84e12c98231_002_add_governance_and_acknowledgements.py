"""002_add_governance_and_acknowledgements

Revision ID: b84e12c98231
Revises: 48378cfb7cac
Create Date: 2026-11-01 22:20:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b84e12c98231"
down_revision: str | Sequence[str] | None = "48378cfb7cac"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Add governance columns to announcements
    op.add_column(
        "announcements",
        sa.Column(
            "confidentiality_level",
            sa.String(length=64),
            server_default="Internal",
            nullable=False,
        ),
    )
    op.add_column(
        "announcements",
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create announcement_acknowledgements table
    op.create_table(
        "announcement_acknowledgements",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("announcement_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["announcement_id"],
            ["announcements.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "announcement_id", "user_id", name="uq_announcement_user_ack"
        ),
    )
    op.create_index(
        op.f("ix_announcement_acknowledgements_announcement_id"),
        "announcement_acknowledgements",
        ["announcement_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_announcement_acknowledgements_user_id"),
        "announcement_acknowledgements",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_announcement_acknowledgements_user_id"),
        table_name="announcement_acknowledgements",
    )
    op.drop_index(
        op.f("ix_announcement_acknowledgements_announcement_id"),
        table_name="announcement_acknowledgements",
    )
    op.drop_table("announcement_acknowledgements")
    op.drop_column("announcements", "expires_at")
    op.drop_column("announcements", "confidentiality_level")
