#!/bin/bash
# Health check script for backend service

set -e

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
MAX_RETRIES=3
RETRY_INTERVAL=5

echo "Starting health check for ${BACKEND_URL}"

# Function to check health
check_health() {
    local url=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" "${url}/health")
    
    if [ "$response" -eq 200 ]; then
        return 0
    else
        return 1
    fi
}

# Retry logic
for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt ${i}/${MAX_RETRIES}..."
    
    if check_health "$BACKEND_URL"; then
        echo "✓ Health check passed!"
        
        # Get detailed health info
        health_data=$(curl -s "${BACKEND_URL}/health")
        echo "Health data: ${health_data}"
        
        exit 0
    else
        echo "✗ Health check failed"
        
        if [ $i -lt $MAX_RETRIES ]; then
            echo "Retrying in ${RETRY_INTERVAL} seconds..."
            sleep $RETRY_INTERVAL
        fi
    fi
done

echo "✗ Health check failed after ${MAX_RETRIES} attempts"
exit 1
