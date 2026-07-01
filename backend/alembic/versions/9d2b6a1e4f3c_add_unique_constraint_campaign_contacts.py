"""Add unique constraint on campaign_contacts (campaign_id, contact_id)

Revision ID: 9d2b6a1e4f3c
Revises: 7f3a1c9e2b4d
Create Date: 2026-07-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9d2b6a1e4f3c'
down_revision: Union[str, Sequence[str], None] = '7f3a1c9e2b4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # De-duplicate first: the constraint never existed at the DB level, so
    # any environment that hit the buggy ON CONFLICT upsert path via direct
    # inserts (or race conditions) could already have duplicate
    # (campaign_id, contact_id) pairs. Keep one row per pair before adding
    # the constraint, or this migration itself would fail.
    op.execute(
        """
        DELETE FROM campaign_contacts a
        USING campaign_contacts b
        WHERE a.id > b.id
          AND a.campaign_id = b.campaign_id
          AND a.contact_id = b.contact_id
        """
    )
    op.create_unique_constraint(
        'uq_campaign_contacts_campaign_id_contact_id',
        'campaign_contacts',
        ['campaign_id', 'contact_id'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        'uq_campaign_contacts_campaign_id_contact_id',
        'campaign_contacts',
        type_='unique',
    )
