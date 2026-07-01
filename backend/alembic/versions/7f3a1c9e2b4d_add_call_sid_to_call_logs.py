"""Add call_sid to call_logs

Revision ID: 7f3a1c9e2b4d
Revises: c478bc351d5a
Create Date: 2026-07-01 00:00:00.000001

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f3a1c9e2b4d'
down_revision: Union[str, Sequence[str], None] = 'c478bc351d5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('call_logs', sa.Column('call_sid', sa.String(length=64), nullable=True))
    op.create_index(op.f('ix_call_logs_call_sid'), 'call_logs', ['call_sid'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_call_logs_call_sid'), table_name='call_logs')
    op.drop_column('call_logs', 'call_sid')
