#!/bin/bash
# Database migration script

set -e

# Configuration
BACKEND_DIR="${BACKEND_DIR:-./backend}"
DATABASE_URL="${DATABASE_URL:-postgresql://crypto_user:crypto_password@localhost:5432/crypto_exchange}"

echo "Starting database migration..."

# Change to backend directory
cd "$BACKEND_DIR"

# Export database URL
export DATABASE_URL

# Check Alembic installation
if ! command -v alembic &> /dev/null; then
    echo "Error: Alembic is not installed"
    exit 1
fi

# Get current revision
echo "Current database revision:"
alembic current

# Show pending migrations
echo "Pending migrations:"
alembic history

# Run migrations
echo "Running migrations..."
alembic upgrade head

# Verify migration
echo "Migration completed. New revision:"
alembic current

echo "✓ Database migration completed successfully"
