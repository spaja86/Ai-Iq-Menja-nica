#!/bin/bash
# Setup Kubernetes secrets

set -e

echo "Setting up Kubernetes secrets..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed"
    exit 1
fi

# Prompt for secrets
read -p "Enter DATABASE_URL: " DATABASE_URL
read -sp "Enter SECRET_KEY: " SECRET_KEY
echo
read -sp "Enter STRIPE_API_KEY: " STRIPE_API_KEY
echo
read -sp "Enter PAYPAL_CLIENT_ID: " PAYPAL_CLIENT_ID
echo

# Create namespace
kubectl create namespace crypto-exchange --dry-run=client -o yaml | kubectl apply -f -

# Create secrets
kubectl create secret generic crypto-exchange-secrets \
    --from-literal=database-url="$DATABASE_URL" \
    --from-literal=secret-key="$SECRET_KEY" \
    --from-literal=stripe-api-key="$STRIPE_API_KEY" \
    --from-literal=paypal-client-id="$PAYPAL_CLIENT_ID" \
    --namespace=crypto-exchange \
    --dry-run=client -o yaml | kubectl apply -f -

# Create PostgreSQL secret
read -sp "Enter PostgreSQL password: " POSTGRES_PASSWORD
echo

kubectl create secret generic postgres-secret \
    --from-literal=password="$POSTGRES_PASSWORD" \
    --namespace=crypto-exchange \
    --dry-run=client -o yaml | kubectl apply -f -

# Create Grafana secret
read -sp "Enter Grafana admin password: " GRAFANA_PASSWORD
echo

kubectl create secret generic grafana-secret \
    --from-literal=admin-password="$GRAFANA_PASSWORD" \
    --namespace=monitoring \
    --dry-run=client -o yaml | kubectl apply -f -

echo "✓ Secrets created successfully"

# Verify
echo "Verifying secrets..."
kubectl get secrets -n crypto-exchange
kubectl get secrets -n monitoring

echo "✓ Setup completed successfully"
