"""add_indexes_for_performance

Revision ID: cbdefb7ce683
Revises: 848e8550592b
Create Date: 2025-11-23 05:34:40.510487

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cbdefb7ce683'
down_revision: Union[str, Sequence[str], None] = '848e8550592b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add index on card_stats.due_date for fast filtering of due/overdue cards
    op.create_index('ix_card_stats_due_date', 'card_stats', ['due_date'])

    # Add index on flashcards.status for fast filtering by status
    op.create_index('ix_flashcards_status', 'flashcards', ['status'])


def downgrade() -> None:
    """Downgrade schema."""
    # Remove indexes
    op.drop_index('ix_card_stats_due_date', table_name='card_stats')
    op.drop_index('ix_flashcards_status', table_name='flashcards')
