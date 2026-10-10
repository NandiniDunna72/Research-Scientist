"""create_research_paper_comparisons_table

Revision ID: 4c5c8730cd75
Revises: 23e87d19c012
Create Date: 2026-10-09 22:33:50.805652

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4c5c8730cd75'
down_revision: Union[str, Sequence[str], None] = '23e87d19c012'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safely checking if table already exists."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "research_paper_comparisons" not in tables:
        op.create_table(
            "research_paper_comparisons",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("project_id", sa.Integer(), sa.ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("title", sa.String(length=500), nullable=True),
            sa.Column("papers_compared", sa.Integer(), server_default="0", nullable=False),
            sa.Column("paper_ids", sa.JSON(), nullable=False),
            sa.Column("structured_comparison_result", sa.JSON(), nullable=False),
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
        op.create_index(op.f("ix_research_paper_comparisons_id"), "research_paper_comparisons", ["id"], unique=False)
        op.create_index(op.f("ix_research_paper_comparisons_project_id"), "research_paper_comparisons", ["project_id"], unique=False)
        op.create_index(op.f("ix_research_paper_comparisons_user_id"), "research_paper_comparisons", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_research_paper_comparisons_user_id"), table_name="research_paper_comparisons")
    op.drop_index(op.f("ix_research_paper_comparisons_project_id"), table_name="research_paper_comparisons")
    op.drop_index(op.f("ix_research_paper_comparisons_id"), table_name="research_paper_comparisons")
    op.drop_table("research_paper_comparisons")

