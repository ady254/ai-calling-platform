"""Enforce one business per user

Revision ID: c478bc351d5a
Revises: eacaad9c7d58
Create Date: 2026-07-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c478bc351d5a'
down_revision: Union[str, Sequence[str], None] = 'eacaad9c7d58'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('businesses', 'user_id', existing_type=sa.UUID(), nullable=False)
    op.create_unique_constraint('uq_businesses_user_id', 'businesses', ['user_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_businesses_user_id', 'businesses', type_='unique')
    op.alter_column('businesses', 'user_id', existing_type=sa.UUID(), nullable=True)
