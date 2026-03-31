# Deployment Guide

## Overview

This guide covers production deployment of the AI IQ Crypto Exchange platform across multiple cloud providers and container orchestration platforms.

**Supported Platforms:**
- Docker Compose (Development/Small Production)
- Kubernetes (Production)
- AWS (Elastic Kubernetes Service)
- Google Cloud Platform (Google Kubernetes Engine)
- Microsoft Azure (Azure Kubernetes Service)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [AWS Deployment](#aws-deployment)
6. [GCP Deployment](#gcp-deployment)
7. [Azure Deployment](#azure-deployment)
8. [Database Setup](#database-setup)
9. [SSL/TLS Configuration](#ssltls-configuration)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Backup and Recovery](#backup-and-recovery)
12. [Scaling](#scaling)

---

## Prerequisites

### Required Software

- **Docker:** 20.10+ and Docker Compose 2.0+
- **Kubernetes:** kubectl 1.25+
- **Helm:** 3.10+ (for Kubernetes deployments)
- **Cloud CLI Tools:**
  - AWS CLI 2.0+
  - gcloud CLI (for GCP)
  - Azure CLI 2.40+

### Domain and SSL

- Registered domain name
- SSL/TLS certificates (Let's Encrypt recommended)
- DNS configuration access

### Minimum Server Requirements

**Development:**
- 2 CPU cores
- 4 GB RAM
- 20 GB storage

**Production:**
- 4 CPU cores (backend)
- 8 GB RAM (backend)
- 100 GB SSD storage
- Load balancer
- CDN for static assets

---

## Environment Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Application
APP_NAME="AI IQ Crypto Exchange"
APP_VERSION="1.0.0"
ENVIRONMENT=production
DEBUG=false

# Server
HOST=0.0.0.0
PORT=8000
ALLOWED_HOSTS=api.aiiqexchange.com,www.aiiqexchange.com

# Database
POSTGRES_USER=crypto_admin
POSTGRES_PASSWORD=<STRONG_PASSWORD>
POSTGRES_DB=crypto_exchange
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis
REDIS_PASSWORD=<STRONG_PASSWORD>
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
REDIS_MAX_CONNECTIONS=50

# Security
SECRET_KEY=<GENERATE_STRONG_SECRET_KEY>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=https://aiiqexchange.com,https://www.aiiqexchange.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# KYC/AML (Sumsub)
KYC_PROVIDER=sumsub
KYC_API_KEY=<YOUR_SUMSUB_API_KEY>
KYC_SECRET_KEY=<YOUR_SUMSUB_SECRET>

# Payment Processing
STRIPE_API_KEY=<YOUR_STRIPE_SECRET_KEY>
STRIPE_WEBHOOK_SECRET=<YOUR_STRIPE_WEBHOOK_SECRET>
PAYPAL_CLIENT_ID=<YOUR_PAYPAL_CLIENT_ID>
PAYPAL_CLIENT_SECRET=<YOUR_PAYPAL_SECRET>

# Blockchain Nodes
ETH_NODE_URL=https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>
BTC_NODE_URL=https://bitcoin.example.com:8332

# Email (SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<YOUR_SENDGRID_API_KEY>
EMAIL_FROM=noreply@aiiqexchange.com

# Monitoring
SENTRY_DSN=<YOUR_SENTRY_DSN>
PROMETHEUS_ENABLED=true

# Trading Configuration
TRADING_FEE_PERCENT=0.1
MINIMUM_ORDER_SIZE=10.0
MAX_OPEN_ORDERS_PER_USER=100

# File Storage
UPLOAD_DIR=/var/uploads
MAX_UPLOAD_SIZE=10485760

# Grafana
GRAFANA_PASSWORD=<STRONG_PASSWORD>
```

### Generate Secret Keys

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate POSTGRES_PASSWORD
openssl rand -base64 32

# Generate REDIS_PASSWORD
openssl rand -base64 32
```

---

## Docker Deployment

### Build Images

```bash
# Build backend image
cd backend
docker build -t aiiq-backend:latest .

# Build frontend image
cd ../frontend
docker build -t aiiq-frontend:latest .
```

### Docker Compose Production

Use the production Docker Compose file:

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Service Health Checks

```bash
# Check backend health
curl http://localhost:8000/health

# Check database
docker exec crypto_exchange_db_prod pg_isready -U crypto_admin

# Check Redis
docker exec crypto_exchange_redis_prod redis-cli ping
```

### Database Migrations

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Create new migration
docker-compose -f docker-compose.prod.yml exec backend alembic revision --autogenerate -m "description"
```

---

## Kubernetes Deployment

### Cluster Setup

```bash
# Create namespace
kubectl create namespace crypto-exchange

# Set default namespace
kubectl config set-context --current --namespace=crypto-exchange
```

### Create Secrets

```bash
# Create secrets from .env file
kubectl create secret generic crypto-exchange-secrets \
  --from-literal=database-url="postgresql://user:pass@postgres:5432/crypto_exchange" \
  --from-literal=secret-key="your-secret-key" \
  --from-literal=stripe-api-key="your-stripe-key" \
  --from-literal=redis-password="your-redis-password"

# Verify secrets
kubectl get secrets
```

### Create ConfigMap

```bash
# Create ConfigMap
kubectl create configmap crypto-exchange-config \
  --from-literal=environment=production \
  --from-literal=redis-url=redis://redis:6379/0 \
  --from-literal=app-name="AI IQ Crypto Exchange"

# Verify ConfigMap
kubectl get configmap crypto-exchange-config -o yaml
```

### Deploy PostgreSQL

```bash
# Apply PostgreSQL deployment
kubectl apply -f k8s/postgres.yaml

# Verify deployment
kubectl get pods -l app=postgres
kubectl logs -l app=postgres
```

### Deploy Redis

```bash
# Apply Redis deployment
kubectl apply -f k8s/redis.yaml

# Verify deployment
kubectl get pods -l app=redis
```

### Deploy Backend

```bash
# Apply backend deployment
kubectl apply -f k8s/deployment.yaml

# Scale backend
kubectl scale deployment crypto-exchange-backend --replicas=5

# Verify deployment
kubectl get pods -l component=backend
kubectl logs -l component=backend
```

### Deploy Frontend

```bash
# Frontend is included in deployment.yaml
kubectl get pods -l component=frontend
```

### Create Services

```bash
# Apply services
kubectl apply -f k8s/service.yaml

# Verify services
kubectl get svc
```

### Configure Ingress

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml

# Get ingress IP
kubectl get ingress
```

### Update Ingress for SSL

Edit `k8s/ingress.yaml` to add TLS:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: crypto-exchange-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.aiiqexchange.com
    - aiiqexchange.com
    secretName: crypto-exchange-tls
  rules:
  - host: api.aiiqexchange.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: crypto-exchange-backend
            port:
              number: 8000
```

---

## AWS Deployment

### EKS Cluster Setup

```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create EKS cluster
eksctl create cluster \
  --name crypto-exchange \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name crypto-exchange

# Verify cluster
kubectl get nodes
```

### RDS PostgreSQL Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier crypto-exchange-db \
  --db-instance-class db.r5.large \
  --engine postgres \
  --engine-version 15.3 \
  --master-username crypto_admin \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --multi-az \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name crypto-exchange-subnet-group

# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier crypto-exchange-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### ElastiCache Redis Setup

```bash
# Create ElastiCache Redis cluster
aws elasticache create-replication-group \
  --replication-group-id crypto-exchange-redis \
  --replication-group-description "Crypto Exchange Redis" \
  --engine redis \
  --engine-version 7.0 \
  --cache-node-type cache.r5.large \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token <STRONG_PASSWORD> \
  --cache-subnet-group-name crypto-exchange-subnet-group

# Get Redis endpoint
aws elasticache describe-replication-groups \
  --replication-group-id crypto-exchange-redis \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' \
  --output text
```

### S3 for Static Assets

```bash
# Create S3 bucket
aws s3api create-bucket \
  --bucket aiiq-exchange-assets \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket aiiq-exchange-assets \
  --versioning-configuration Status=Enabled

# Configure CORS
aws s3api put-bucket-cors \
  --bucket aiiq-exchange-assets \
  --cors-configuration file://cors-config.json
```

### Application Load Balancer

```bash
# ALB is automatically created by AWS Load Balancer Controller
# Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=crypto-exchange \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### Route 53 DNS Configuration

```bash
# Create hosted zone (if not exists)
aws route53 create-hosted-zone \
  --name aiiqexchange.com \
  --caller-reference $(date +%s)

# Get ALB DNS name
ALB_DNS=$(kubectl get ingress crypto-exchange-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Create A record pointing to ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://route53-change.json
```

---

## GCP Deployment

### GKE Cluster Setup

```bash
# Set project
gcloud config set project crypto-exchange-project

# Create GKE cluster
gcloud container clusters create crypto-exchange \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-4 \
  --enable-autoscaling \
  --min-nodes 3 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-ip-alias \
  --network "default" \
  --subnetwork "default"

# Get credentials
gcloud container clusters get-credentials crypto-exchange --zone us-central1-a

# Verify cluster
kubectl get nodes
```

### Cloud SQL PostgreSQL

```bash
# Create Cloud SQL instance
gcloud sql instances create crypto-exchange-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-4-16384 \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=100GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04

# Create database
gcloud sql databases create crypto_exchange --instance=crypto-exchange-db

# Create user
gcloud sql users create crypto_admin \
  --instance=crypto-exchange-db \
  --password=<STRONG_PASSWORD>

# Get connection name
gcloud sql instances describe crypto-exchange-db --format='value(connectionName)'
```

### Cloud Memorystore Redis

```bash
# Create Redis instance
gcloud redis instances create crypto-exchange-redis \
  --size=5 \
  --region=us-central1 \
  --redis-version=redis_7_0 \
  --tier=standard \
  --replica-count=1

# Get Redis host
gcloud redis instances describe crypto-exchange-redis \
  --region=us-central1 \
  --format='value(host)'
```

### Cloud Storage for Assets

```bash
# Create bucket
gsutil mb -l us-central1 gs://aiiq-exchange-assets/

# Enable versioning
gsutil versioning set on gs://aiiq-exchange-assets/

# Set CORS
gsutil cors set cors-config.json gs://aiiq-exchange-assets/
```

### Cloud CDN

```bash
# Enable Cloud CDN on the backend service
gcloud compute backend-services update crypto-exchange-backend \
  --enable-cdn \
  --global
```

---

## Azure Deployment

### AKS Cluster Setup

```bash
# Create resource group
az group create --name crypto-exchange-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group crypto-exchange-rg \
  --name crypto-exchange-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10 \
  --enable-managed-identity \
  --network-plugin azure \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group crypto-exchange-rg --name crypto-exchange-aks

# Verify cluster
kubectl get nodes
```

### Azure Database for PostgreSQL

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group crypto-exchange-rg \
  --name crypto-exchange-db \
  --location eastus \
  --admin-user crypto_admin \
  --admin-password <STRONG_PASSWORD> \
  --sku-name Standard_D4s_v3 \
  --tier GeneralPurpose \
  --storage-size 128 \
  --version 15 \
  --high-availability Enabled \
  --backup-retention 7

# Create database
az postgres flexible-server db create \
  --resource-group crypto-exchange-rg \
  --server-name crypto-exchange-db \
  --database-name crypto_exchange
```

### Azure Cache for Redis

```bash
# Create Redis cache
az redis create \
  --resource-group crypto-exchange-rg \
  --name crypto-exchange-redis \
  --location eastus \
  --sku Premium \
  --vm-size P3 \
  --enable-non-ssl-port false \
  --redis-version 6

# Get Redis connection string
az redis show \
  --resource-group crypto-exchange-rg \
  --name crypto-exchange-redis \
  --query "hostName" \
  --output tsv
```

### Azure Blob Storage

```bash
# Create storage account
az storage account create \
  --name aiiqexchangeassets \
  --resource-group crypto-exchange-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# Create container
az storage container create \
  --name assets \
  --account-name aiiqexchangeassets \
  --public-access blob
```

---

## Database Setup

### Initial Schema

```bash
# Run migrations (Docker)
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Run migrations (Kubernetes)
kubectl exec -it <backend-pod> -- alembic upgrade head
```

### Create Initial Admin User

```python
# Create admin user script (create_admin.py)
from app.core.database import SessionLocal
from app.models import User, UserRole
from app.core.security import security

db = SessionLocal()

admin = User(
    email="admin@aiiqexchange.com",
    hashed_password=security.hash_password("ChangeThisPassword!"),
    full_name="System Administrator",
    role=UserRole.ADMIN,
    is_active=True,
    is_verified=True
)

db.add(admin)
db.commit()
print("Admin user created successfully")
```

```bash
# Run script
docker-compose -f docker-compose.prod.yml exec backend python create_admin.py
```

---

## SSL/TLS Configuration

### Let's Encrypt with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Create ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@aiiqexchange.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Custom SSL Certificate

```bash
# Create TLS secret
kubectl create secret tls crypto-exchange-tls \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem
```

---

## Monitoring and Logging

### Prometheus and Grafana

Already included in `docker-compose.prod.yml`:

```bash
# Access Prometheus
http://localhost:9090

# Access Grafana
http://localhost:3000
```

### CloudWatch (AWS)

```bash
# Install CloudWatch Container Insights
kubectl apply -f https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonset/container-insights-monitoring/quickstart/cwagent-fluentd-quickstart.yaml
```

### Stackdriver (GCP)

```bash
# Enable Stackdriver monitoring
gcloud container clusters update crypto-exchange \
  --enable-cloud-monitoring \
  --enable-cloud-logging \
  --zone us-central1-a
```

---

## Backup and Recovery

### Database Backups

```bash
# Automated PostgreSQL backups (Docker)
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U crypto_admin crypto_exchange > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U crypto_admin crypto_exchange < backup.sql
```

### Automated Backup Script

```bash
#!/bin/bash
# /scripts/backup.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/crypto_exchange_$TIMESTAMP.sql.gz"

pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://aiiq-exchange-backups/

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

---

## Scaling

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: crypto-exchange-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: crypto-exchange-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

```bash
kubectl apply -f hpa.yaml
kubectl get hpa
```

---

## Troubleshooting

### View Logs

```bash
# Docker
docker-compose -f docker-compose.prod.yml logs -f backend

# Kubernetes
kubectl logs -f deployment/crypto-exchange-backend
kubectl logs -f -l app=crypto-exchange --all-containers=true
```

### Debug Pod

```bash
# Execute shell in pod
kubectl exec -it <pod-name> -- /bin/bash

# Check environment variables
kubectl exec <pod-name> -- env

# Port forward for debugging
kubectl port-forward <pod-name> 8000:8000
```

### Common Issues

**Database Connection Failed:**
```bash
# Check database service
kubectl get svc postgres
kubectl describe svc postgres

# Test connection
kubectl exec -it <backend-pod> -- psql -h postgres -U crypto_admin -d crypto_exchange
```

**Redis Connection Failed:**
```bash
# Check Redis service
kubectl get svc redis

# Test connection
kubectl exec -it <backend-pod> -- redis-cli -h redis ping
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall rules
- [ ] Configure SSL/TLS certificates
- [ ] Enable database encryption at rest
- [ ] Enable Redis password authentication
- [ ] Configure network policies
- [ ] Enable audit logging
- [ ] Set up intrusion detection
- [ ] Configure rate limiting
- [ ] Enable DDoS protection
- [ ] Regular security updates
- [ ] Vulnerability scanning

---

## Support

For deployment assistance:
- Email: devops@aiiqexchange.com
- Slack: #deployment-support
- Documentation: https://docs.aiiqexchange.com/deployment
