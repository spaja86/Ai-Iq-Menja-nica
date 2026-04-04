#!/bin/bash

DOMAIN="xn--aiiqmenjanica-xvb.com"
API_URL="https://$DOMAIN"

echo "🏥 Health Check for Ai IQ Menjačnica"
echo "=================================="

# Check API health
echo "Checking API health..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API: OK"
else
    echo "❌ API: FAILED (HTTP $API_RESPONSE)"
    exit 1
fi

# Check database
echo "Checking database..."
DB_CHECK=$(curl -s $API_URL/api/v1/health/db)
if [[ $DB_CHECK == *"ok"* ]]; then
    echo "✅ Database: OK"
else
    echo "❌ Database: FAILED"
    exit 1
fi

# Check Redis
echo "Checking Redis..."
REDIS_CHECK=$(curl -s $API_URL/api/v1/health/redis)
if [[ $REDIS_CHECK == *"ok"* ]]; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: FAILED"
    exit 1
fi

echo ""
echo "✅ All systems operational!"
