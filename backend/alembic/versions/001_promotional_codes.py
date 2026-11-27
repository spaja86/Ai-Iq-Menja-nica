"""
Create promotional_codes table

Revision ID: 001_promotional_codes
Revises: 
Create Date: 2026-02-20
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '001_promotional_codes'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create promotional_codes table"""
    op.create_table(
        'promotional_codes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('code_type', sa.Enum('autofinish', 'referral', 'promotion', 'bonus', 'discount', name='codetype'), nullable=False),
        sa.Column('sequence_number', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'active', 'used', 'expired', 'disabled', name='codestatus'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=False),
        sa.Column('usage_count', sa.Integer(), nullable=True, default=0),
        sa.Column('max_uses', sa.Integer(), nullable=True, default=1),
        sa.Column('discount_percentage', sa.Float(), nullable=True, default=0.0),
        sa.Column('bonus_amount', sa.Float(), nullable=True, default=0.0),
        sa.Column('referral_bonus', sa.Float(), nullable=True, default=0.0),
        sa.Column('valid_from', sa.DateTime(), nullable=True),
        sa.Column('valid_until', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('activated_at', sa.DateTime(), nullable=True),
        sa.Column('first_used_at', sa.DateTime(), nullable=True),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
        sa.Column('processed_at', sa.DateTime(), nullable=True),
        sa.Column('created_by_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('metadata', sa.String(length=1000), nullable=True),
        sa.Column('batch_id', sa.String(length=50), nullable=True),
        sa.Column('processing_order', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
    )
    
    # Create indexes
    op.create_index(op.f('ix_promotional_codes_code'), 'promotional_codes', ['code'], unique=True)
    op.create_index(op.f('ix_promotional_codes_id'), 'promotional_codes', ['id'], unique=False)
    op.create_index(op.f('ix_promotional_codes_sequence_number'), 'promotional_codes', ['sequence_number'], unique=False)
    op.create_index(op.f('ix_promotional_codes_batch_id'), 'promotional_codes', ['batch_id'], unique=False)
    op.create_index(op.f('ix_promotional_codes_status'), 'promotional_codes', ['status'], unique=False)


def downgrade():
    """Drop promotional_codes table"""
    op.drop_index(op.f('ix_promotional_codes_status'), table_name='promotional_codes')
    op.drop_index(op.f('ix_promotional_codes_batch_id'), table_name='promotional_codes')
    op.drop_index(op.f('ix_promotional_codes_sequence_number'), table_name='promotional_codes')
    op.drop_index(op.f('ix_promotional_codes_id'), table_name='promotional_codes')
    op.drop_index(op.f('ix_promotional_codes_code'), table_name='promotional_codes')
    op.drop_table('promotional_codes')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS codestatus')
    op.execute('DROP TYPE IF EXISTS codetype')
