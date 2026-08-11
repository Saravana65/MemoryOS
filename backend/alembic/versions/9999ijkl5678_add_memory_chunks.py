"""add_memory_chunks

Revision ID: 9999ijkl5678
Revises: 5678efgh1234
Create Date: 2026-08-11 08:47:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9999ijkl5678'
down_revision: Union[str, None] = '5678efgh1234'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'memory_chunks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('chunk_text', sa.Text(), nullable=False),
        sa.Column('vector_id', sa.String(length=255), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('memory_chunks')
