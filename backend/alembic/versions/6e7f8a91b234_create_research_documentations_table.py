"""create_research_documentations_table

Revision ID: 6e7f8a91b234
Revises: 5d6e7f80a912
Create Date: 2026-10-10 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6e7f8a91b234'
down_revision: Union[str, Sequence[str], None] = '5d6e7f80a912'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safely checking if table already exists."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "research_documentations" not in tables:
        op.create_table(
            "research_documentations",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("project_id", sa.Integer(), sa.ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("title", sa.String(length=500), nullable=False),
            sa.Column("template", sa.String(length=100), nullable=False, server_default="IEEE Conference"),
            sa.Column("target_journal", sa.String(length=255), nullable=True),
            sa.Column("reference_style", sa.String(length=50), nullable=False, server_default="IEEE"),
            sa.Column("authors", sa.JSON(), nullable=True),
            sa.Column("institution", sa.String(length=500), nullable=True),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="draft"),
            sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("structured_content", sa.JSON(), nullable=False),
            sa.Column("sections_config", sa.JSON(), nullable=False),
            sa.Column("compiled_markdown", sa.Text(), nullable=True),
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
        op.create_index(op.f("ix_research_documentations_id"), "research_documentations", ["id"], unique=False)
        op.create_index(op.f("ix_research_documentations_project_id"), "research_documentations", ["project_id"], unique=False)
        op.create_index(op.f("ix_research_documentations_user_id"), "research_documentations", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_research_documentations_user_id"), table_name="research_documentations")
    op.drop_index(op.f("ix_research_documentations_project_id"), table_name="research_documentations")
    op.drop_index(op.f("ix_research_documentations_id"), table_name="research_documentations")
    op.drop_table("research_documentations")
