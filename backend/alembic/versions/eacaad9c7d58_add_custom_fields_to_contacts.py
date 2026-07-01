"""Add custom_fields to contacts

Revision ID: eacaad9c7d58
Revises: 38637014af2c
Create Date: 2026-07-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'eacaad9c7d58'
down_revision: Union[str, Sequence[str], None] = '38637014af2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'contacts',
        sa.Column(
            'custom_fields',
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default='{}',
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('contacts', 'custom_fields')
