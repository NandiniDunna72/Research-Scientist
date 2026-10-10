"""create_research_presentations_table

Revision ID: 7f8a91b2c345
Revises: 6e7f8a91b234
Create Date: 2026-10-10 10:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f8a91b2c345'
down_revision: Union[str, Sequence[str], None] = '6e7f8a91b234'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safely checking if table already exists."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "research_presentations" not in tables:
        op.create_table(
            "research_presentations",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("project_id", sa.Integer(), sa.ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("title", sa.String(length=500), nullable=False),
            sa.Column("presentation_type", sa.String(length=100), nullable=False, server_default="Project Proposal"),
            sa.Column("theme", sa.String(length=100), nullable=False, server_default="Professional Academic"),
            sa.Column("style", sa.String(length=100), nullable=False, server_default="Academic Formal"),
            sa.Column("slide_count", sa.Integer(), nullable=False, server_default="12"),
            sa.Column("presenter_name", sa.String(length=255), nullable=True),
            sa.Column("institution", sa.String(length=500), nullable=True),
            sa.Column("supervisor_name", sa.String(length=255), nullable=True),
            sa.Column("include_speaker_notes", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("structured_slides", sa.JSON(), nullable=False),
            sa.Column("file_path", sa.String(length=1000), nullable=True),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="generated"),
            sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_research_presentations_id"), "research_presentations", ["id"], unique=False)
        op.create_index(op.f("ix_research_presentations_project_id"), "research_presentations", ["project_id"], unique=False)
        op.create_index(op.f("ix_research_presentations_user_id"), "research_presentations", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_research_presentations_user_id"), table_name="research_presentations")
    op.drop_index(op.f("ix_research_presentations_project_id"), table_name="research_presentations")
    op.drop_index(op.f("ix_research_presentations_id"), table_name="research_presentations")
    op.drop_table("research_presentations")
