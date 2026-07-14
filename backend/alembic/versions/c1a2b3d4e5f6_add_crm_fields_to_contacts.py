"""Add CRM fields to contacts (industry, lead_score, pipeline_stage, ai_insights)

Revision ID: c1a2b3d4e5f6
Revises: b7d9e0a1c2f3
Create Date: 2026-07-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c1a2b3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'b7d9e0a1c2f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('contacts', sa.Column('industry', sa.String(length=120), nullable=True))
    op.add_column('contacts', sa.Column('lead_score', sa.Integer(), nullable=True))
    op.add_column(
        'contacts',
        sa.Column('pipeline_stage', sa.String(length=20), nullable=False, server_default='new'),
    )
    op.add_column(
        'contacts',
        sa.Column(
            'ai_insights',
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.create_index('ix_contacts_lead_score', 'contacts', ['lead_score'])
    op.create_index('ix_contacts_pipeline_stage', 'contacts', ['pipeline_stage'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_contacts_pipeline_stage', table_name='contacts')
    op.drop_index('ix_contacts_lead_score', table_name='contacts')
    op.drop_column('contacts', 'ai_insights')
    op.drop_column('contacts', 'pipeline_stage')
    op.drop_column('contacts', 'lead_score')
    op.drop_column('contacts', 'industry')
