"""Add outcome, summary, follow_up to call_logs

Revision ID: b7d9e0a1c2f3
Revises: 9d2b6a1e4f3c
Create Date: 2026-07-04 00:00:00.000001

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7d9e0a1c2f3'
down_revision: Union[str, Sequence[str], None] = '9d2b6a1e4f3c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('call_logs', sa.Column('outcome', sa.String(length=32), nullable=True))
    op.add_column('call_logs', sa.Column('summary', sa.String(), nullable=True))
    op.add_column('call_logs', sa.Column('follow_up', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('call_logs', 'follow_up')
    op.drop_column('call_logs', 'summary')
    op.drop_column('call_logs', 'outcome')
