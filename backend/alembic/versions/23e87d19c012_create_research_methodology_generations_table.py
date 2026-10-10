"""create research_methodology_generations table

Revision ID: 23e87d19c012
Revises: 11d56c728318
Create Date: 2026-10-09 15:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '23e87d19c012'
down_revision: Union[str, Sequence[str], None] = '11d56c728318'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safely checking if table already exists."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "research_methodology_generations" not in tables:
        op.create_table(
            "research_methodology_generations",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("project_id", sa.Integer(), sa.ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("topic", sa.String(length=500), nullable=False),
            sa.Column("version", sa.Integer(), server_default="1", nullable=False),
            sa.Column("papers_considered", sa.Integer(), server_default="0", nullable=False),
            sa.Column("gaps_considered", sa.Integer(), server_default="0", nullable=False),
            sa.Column("questions_considered", sa.Integer(), server_default="0", nullable=False),
            sa.Column("has_literature_review", sa.Boolean(), server_default=sa.text("false"), nullable=False),
            sa.Column("research_overview", sa.JSON(), nullable=False),
            sa.Column("research_design", sa.JSON(), nullable=False),
            sa.Column("proposed_approach", sa.JSON(), nullable=False),
            sa.Column("data_collection", sa.JSON(), nullable=False),
            sa.Column("data_preprocessing", sa.JSON(), nullable=False),
            sa.Column("methods_and_algorithms", sa.JSON(), nullable=False),
            sa.Column("system_design", sa.JSON(), nullable=False),
            sa.Column("experimental_setup", sa.JSON(), nullable=False),
            sa.Column("evaluation_metrics", sa.JSON(), nullable=False),
            sa.Column("comparison_strategy", sa.JSON(), nullable=False),
            sa.Column("expected_outcomes", sa.JSON(), nullable=False),
            sa.Column("limitations_and_risks", sa.JSON(), nullable=False),
            sa.Column("reproducibility_and_ethics", sa.JSON(), nullable=False),
            sa.Column("execution_plan", sa.JSON(), nullable=False),
            sa.Column("assumptions_and_open_questions", sa.JSON(), nullable=True),
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
        op.create_index(op.f("ix_research_methodology_generations_id"), "research_methodology_generations", ["id"], unique=False)
        op.create_index(op.f("ix_research_methodology_generations_project_id"), "research_methodology_generations", ["project_id"], unique=False)
        op.create_index(op.f("ix_research_methodology_generations_user_id"), "research_methodology_generations", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_research_methodology_generations_user_id"), table_name="research_methodology_generations")
    op.drop_index(op.f("ix_research_methodology_generations_project_id"), table_name="research_methodology_generations")
    op.drop_index(op.f("ix_research_methodology_generations_id"), table_name="research_methodology_generations")
    op.drop_table("research_methodology_generations")
