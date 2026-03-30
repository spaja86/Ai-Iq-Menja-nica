# Ai IQ Menjačnica - Deployment Guide

Complete guide for deploying the Ai IQ Menjačnica crypto exchange platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Manual Deployment](#manual-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Docker** 24.0+ and **Docker Compose** 2.20+
- **Python** 3.11+ (for local development)
- **PostgreSQL** 16+ (if running locally)
- **Redis** 7+ (if running locally)
- **Git** for version control

### Required Accounts

- **Stripe** account (for payment processing)
- **SendGrid** account (for email notifications)
- **Sentry** account (optional, for error tracking)
- **Domain** with SSL certificate

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/spaja86/Ai-Iq-Menja-nica.git
cd Ai-Iq-Menja-nica
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Generate secure keys
openssl rand -hex 32  # Use for JWT_SECRET_KEY
openssl rand -base64 32  # Use for DB_PASSWORD
openssl rand -base64 32  # Use for REDIS_PASSWORD

# Edit .env file with your values
nano .env
```

### 3. Deploy with Script

```bash
./scripts/deploy.sh
```

This automated script will:
- Validate environment variables
- Build Docker images
- Start all services
- Run database migrations
- Perform health checks

### 4. Verify Deployment

```bash
# Check health
curl http://localhost:7777/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Access API docs
open http://localhost:7777/api/v1/docs
```

## Manual Deployment

### Step 1: Prepare Environment

Create and configure `.env` file:

```bash
# Application
ENVIRONMENT=production
APP_NAME="Ai IQ Menjačnica"
LOG_LEVEL=info

# Database
DB_PASSWORD=$(openssl rand -base64 32)
DATABASE_URL=postgresql+asyncpg://spaja:${DB_PASSWORD}@postgres:5432/spaja

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

# Security
JWT_SECRET_KEY=$(openssl rand -hex 32)
ED25519_SEED_B64=$(openssl rand -base64 32)

# Stripe
STRIPE_API_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Domain
PUBLIC_BASE_URL=https://xn--aiiqmenjanica-xvb.com
DOMAIN=xn--aiiqmenjanica-xvb.com
```

### Step 2: SSL Certificates

#### Option A: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d xn--aiiqmenjanica-xvb.com

# Copy certificates
sudo cp /etc/letsencrypt/live/xn--aiiqmenjanica-xvb.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/xn--aiiqmenjanica-xvb.com/privkey.pem nginx/ssl/key.pem
```

#### Option B: Self-Signed (Development Only)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### Step 3: Build Images

```bash
# Build backend
docker build -f backend/Dockerfile.prod -t spaja86/ai-iq-menjacnica:latest backend/

# Verify build
docker images | grep ai-iq-menjacnica
```

### Step 4: Start Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 5: Database Setup

```bash
# Run migrations
docker exec spaja-api alembic upgrade head

# Verify database connection
docker exec spaja-postgres psql -U spaja -d spaja -c "\dt"
```

### Step 6: Health Checks

```bash
# Run health check script
./scripts/healthcheck.sh

# Or manually check endpoints
curl http://localhost:7777/health
curl http://localhost:7777/api/v1/docs
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.25+)
- kubectl configured
- Container registry access

### Deploy to Kubernetes

```bash
# Update secrets in k8s/deployment.yaml

# Apply configuration
kubectl apply -f k8s/deployment.yaml

# Check deployment
kubectl get pods -n spaja-prod
kubectl get services -n spaja-prod

# View logs
kubectl logs -f deployment/spaja-api -n spaja-prod

# Get service URL
kubectl get service spaja-api-service -n spaja-prod
```

### Scale Deployment

```bash
# Scale to 5 replicas
kubectl scale deployment spaja-api --replicas=5 -n spaja-prod

# Auto-scaling
kubectl autoscale deployment spaja-api \
  --min=3 --max=10 --cpu-percent=80 -n spaja-prod
```

## Post-Deployment

### 1. Configure Monitoring

```bash
# Start Prometheus
docker-compose -f monitoring/docker-compose.yml up -d

# Access Prometheus
open http://localhost:9090
```

### 2. Setup Backups

```bash
# Test backup
docker exec spaja-postgres /backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * docker exec spaja-postgres /backup.sh
```

### 3. Configure Webhooks

#### Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://xn--aiiqmenjanica-xvb.com/api/v1/payments/stripe/webhook`
3. Select events: `payment_intent.*`, `charge.*`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. DNS Configuration

```
# A Record
xn--aiiqmenjanica-xvb.com -> YOUR_SERVER_IP

# CNAME Record
www.xn--aiiqmenjanica-xvb.com -> xn--aiiqmenjanica-xvb.com
```

### 5. Security Checklist

- [ ] SSL/TLS certificate installed and valid
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Fail2ban installed and configured
- [ ] All passwords changed from defaults
- [ ] Secrets not committed to git
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Database backups scheduled
- [ ] Monitoring and alerting active

## Troubleshooting

### Service Won't Start

```bash
# Check Docker logs
docker-compose -f docker-compose.prod.yml logs backend

# Check system resources
docker stats

# Restart service
docker-compose -f docker-compose.prod.yml restart backend
```

### Database Connection Issues

```bash
# Check PostgreSQL status
docker exec spaja-postgres pg_isready -U spaja

# Check connection string
echo $DATABASE_URL

# Verify credentials
docker exec -it spaja-postgres psql -U spaja -d spaja
```

### Nginx Errors

```bash
# Test nginx config
docker exec spaja-nginx nginx -t

# Reload nginx
docker exec spaja-nginx nginx -s reload

# Check logs
docker logs spaja-nginx
```

### SSL Certificate Issues

```bash
# Verify certificate
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Check certificate expiration
openssl x509 -in nginx/ssl/cert.pem -enddate -noout

# Renew Let's Encrypt
sudo certbot renew
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase resources in docker-compose.prod.yml
# Update under deploy.resources.limits

# Scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Rollback Deployment

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout previous-commit-hash

# Redeploy
./scripts/deploy.sh
```

## Useful Commands

### Docker Commands

```bash
# View all containers
docker ps -a

# View logs
docker-compose -f docker-compose.prod.yml logs -f [service-name]

# Restart service
docker-compose -f docker-compose.prod.yml restart [service-name]

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.prod.yml down -v

# Update and restart
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Database Commands

```bash
# Backup database
docker exec spaja-postgres /backup.sh

# Restore database
gunzip < backup.sql.gz | docker exec -i spaja-postgres psql -U spaja -d spaja

# Access PostgreSQL
docker exec -it spaja-postgres psql -U spaja -d spaja

# Run migrations
docker exec spaja-api alembic upgrade head

# Rollback migration
docker exec spaja-api alembic downgrade -1
```

### Monitoring Commands

```bash
# Check health
curl http://localhost:7777/health

# Run full health check
./scripts/healthcheck.sh

# View metrics
curl http://localhost:7777/metrics

# Container stats
docker stats
```

## Support

For issues and questions:
- Email: spajicn@yahoo.com, spajicn@gmail.com
- GitHub Issues: https://github.com/spaja86/Ai-Iq-Menja-nica/issues

## License

Copyright © 2024 Ai IQ Menjačnica. All rights reserved.
