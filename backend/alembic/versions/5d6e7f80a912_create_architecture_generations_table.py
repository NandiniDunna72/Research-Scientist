"""create_architecture_generations_table

Revision ID: 5d6e7f80a912
Revises: 4c5c8730cd75
Create Date: 2026-10-09 23:14:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d6e7f80a912'
down_revision: Union[str, Sequence[str], None] = '4c5c8730cd75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema safely checking if table already exists."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "architecture_generations" not in tables:
        op.create_table(
            "architecture_generations",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("project_id", sa.Integer(), sa.ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("architecture_title", sa.String(length=500), nullable=False),
            sa.Column("architecture_type", sa.String(length=255), nullable=False),
            sa.Column("structured_architecture_result", sa.JSON(), nullable=False),
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
        op.create_index(op.f("ix_architecture_generations_id"), "architecture_generations", ["id"], unique=False)
        op.create_index(op.f("ix_architecture_generations_project_id"), "architecture_generations", ["project_id"], unique=False)
        op.create_index(op.f("ix_architecture_generations_user_id"), "architecture_generations", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_architecture_generations_user_id"), table_name="architecture_generations")
    op.drop_index(op.f("ix_architecture_generations_project_id"), table_name="architecture_generations")
    op.drop_index(op.f("ix_architecture_generations_id"), table_name="architecture_generations")
    op.drop_table("architecture_generations")
