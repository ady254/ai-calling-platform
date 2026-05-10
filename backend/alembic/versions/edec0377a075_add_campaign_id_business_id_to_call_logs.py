"""add_campaign_id_business_id_to_call_logs

Revision ID: edec0377a075
Revises: fb1c8ed4c88a
Create Date: 2026-05-10 14:28:01.178696

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'edec0377a075'
down_revision: Union[str, Sequence[str], None] = 'fb1c8ed4c88a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add campaign_id and business_id to call_logs
    op.add_column('call_logs', sa.Column('campaign_id', sa.UUID(), nullable=True))
    op.add_column('call_logs', sa.Column('business_id', sa.UUID(), nullable=True))
    op.create_foreign_key('fk_call_logs_business_id', 'call_logs', 'businesses', ['business_id'], ['id'])
    op.create_foreign_key('fk_call_logs_campaign_id', 'call_logs', 'campaigns', ['campaign_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_call_logs_campaign_id', 'call_logs', type_='foreignkey')
    op.drop_constraint('fk_call_logs_business_id', 'call_logs', type_='foreignkey')
    op.drop_column('call_logs', 'business_id')
    op.drop_column('call_logs', 'campaign_id')
    # ### end Alembic commands ###
