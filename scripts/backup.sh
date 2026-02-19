#!/bin/bash
# Database backup script

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
DATABASE_URL="${DATABASE_URL:-postgresql://crypto_user:crypto_password@localhost:5432/crypto_exchange}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/crypto_exchange_${DATE}.sql"

echo "Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Parse database URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Perform backup
echo "Backing up database: ${DB_NAME}"
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -F c \
    -b \
    -v \
    -f "$BACKUP_FILE" \
    "$DB_NAME"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"

# Calculate size
SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
echo "✓ Backup completed: ${BACKUP_FILE}.gz (${SIZE})"

# Clean up old backups
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "crypto_exchange_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List recent backups
echo "Recent backups:"
ls -lh "$BACKUP_DIR" | tail -5

echo "✓ Backup process completed successfully"
