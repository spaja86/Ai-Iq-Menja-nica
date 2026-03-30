#!/bin/bash
# Quick deployment script for Ai IQ Menjačnica

set -e

echo "🚀 Ai IQ Menjačnica - Production Deployment"
echo "==========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your production values!"
    echo ""
    echo "Required environment variables:"
    echo "  - DB_PASSWORD"
    echo "  - REDIS_PASSWORD"
    echo "  - JWT_SECRET_KEY"
    echo "  - STRIPE_API_KEY"
    echo "  - STRIPE_WEBHOOK_SECRET"
    echo ""
    echo "Generate secure keys with:"
    echo "  openssl rand -hex 32"
    echo ""
    exit 1
fi

# Load environment
source .env

# Validate required variables
REQUIRED_VARS=("DB_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET_KEY")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   - %s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "Please update your .env file before deploying."
    exit 1
fi

echo "✅ Environment variables validated"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Build and deploy
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo ""
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "🔄 Running database migrations..."
docker exec spaja-api alembic upgrade head || echo "⚠️  Database migrations may not be ready yet"

echo ""
echo "🏥 Health check..."
sleep 5

# Health check
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7777/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ API is healthy!"
else
    echo "⚠️  API health check returned: $HEALTH_STATUS"
    echo "Check logs with: docker-compose -f docker-compose.prod.yml logs -f"
fi

echo ""
echo "==========================================="
echo "✅ Deployment complete!"
echo ""
echo "Services:"
echo "  - API: http://localhost:7777"
echo "  - API Docs: http://localhost:7777/api/v1/docs"
echo "  - Nginx: http://localhost (port 80)"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  - Run migrations: docker exec spaja-api alembic upgrade head"
echo "  - Backup database: docker exec spaja-postgres /backup.sh"
echo ""
