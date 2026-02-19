# Ai IQ Menjačnica - Production Deployment Guide

Professional crypto exchange platform with complete production-ready deployment.

## 🚀 Features

- **FastAPI Backend** - High-performance async API
- **PostgreSQL Database** - Reliable data storage
- **Redis Cache** - Fast session and data caching
- **Docker Production Setup** - Multi-stage builds, security hardening
- **Nginx Reverse Proxy** - SSL/TLS, rate limiting, security headers
- **Kubernetes Ready** - K8s deployment configurations
- **CI/CD Pipeline** - Automated testing and deployment
- **Monitoring** - Prometheus metrics and health checks
- **Automated Backups** - Daily database backups

## 📋 Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- Python 3.11+ (for local development)
- PostgreSQL 16+ (for local development)
- Redis 7+ (for local development)

## 🏗️ Project Structure

```
.
├── backend/                    # Backend application
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Core configuration
│   │   └── db/                # Database models
│   ├── alembic/               # Database migrations
│   ├── Dockerfile.prod        # Production Docker image
│   └── requirements.txt       # Python dependencies
├── nginx/                     # Nginx configuration
│   └── nginx.prod.conf        # Production nginx config
├── k8s/                       # Kubernetes deployments
│   └── deployment.yaml        # K8s deployment spec
├── monitoring/                # Monitoring configuration
│   └── prometheus.yml         # Prometheus config
├── scripts/                   # Utility scripts
│   ├── backup.sh             # Database backup script
│   └── healthcheck.sh        # Health check script
├── .github/workflows/         # CI/CD pipelines
│   └── deploy-prod.yml       # Production deployment
├── docker-compose.prod.yml    # Production orchestration
├── .env.production           # Production environment
└── .env.example              # Environment template
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables to set:

- `DB_PASSWORD` - Secure database password
- `REDIS_PASSWORD` - Secure Redis password
- `JWT_SECRET_KEY` - 256-bit random key for JWT tokens
- `STRIPE_API_KEY` - Stripe API key (live or test)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `SENTRY_DSN` - Sentry monitoring DSN (optional)

### Generate Secure Keys

```bash
# Generate JWT secret key
openssl rand -hex 32

# Generate Redis password
openssl rand -base64 32

# Generate database password
openssl rand -base64 32
```

## 🚀 Deployment

### Local Development

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 7777
```

### Production with Docker Compose

1. **Set environment variables**:
```bash
export STRIPE_API_KEY=sk_live_...
export JWT_SECRET_KEY=$(openssl rand -hex 32)
export DB_PASSWORD=$(openssl rand -base64 32)
export REDIS_PASSWORD=$(openssl rand -base64 32)
```

2. **Build and deploy**:
```bash
# Build the Docker image
docker build -f backend/Dockerfile.prod -t spaja86/ai-iq-menjacnica:latest backend/

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

3. **Run database migrations**:
```bash
docker exec spaja-api alembic upgrade head
```

4. **Verify deployment**:
```bash
# Check health
curl http://localhost:7777/health

# Check API docs
curl http://localhost:7777/api/v1/docs
```

### Production with Kubernetes

1. **Update secrets** in `k8s/deployment.yaml`

2. **Apply configuration**:
```bash
kubectl apply -f k8s/deployment.yaml
```

3. **Verify deployment**:
```bash
kubectl get pods -n spaja-prod
kubectl get services -n spaja-prod
```

## 📊 Monitoring

### Health Checks

The application exposes health check endpoints:

- `/health` - General health check
- `/api/v1/health/db` - Database connectivity
- `/api/v1/health/redis` - Redis connectivity

Run the health check script:
```bash
./scripts/healthcheck.sh
```

### Prometheus Metrics

Configure Prometheus to scrape metrics:
```bash
docker-compose -f monitoring/docker-compose.yml up -d
```

Access Prometheus at: http://localhost:9090

## 🔒 Security

### SSL/TLS Configuration

1. Generate SSL certificates or use Let's Encrypt:
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem

# Or use Let's Encrypt (recommended for production)
certbot certonly --standalone -d xn--aiiqmenjanica-xvb.com
```

2. Update nginx to use certificates (already configured in `nginx.prod.conf`)

### Security Features

- **Rate Limiting** - API and login endpoints protected
- **Security Headers** - HSTS, CSP, X-Frame-Options, etc.
- **CORS** - Configured for specific domains in production
- **TLS 1.2/1.3** - Modern encryption protocols
- **User Isolation** - Non-root Docker containers
- **Health Checks** - Automatic container restart on failure

## 💾 Backup & Recovery

### Automated Backups

Database backups run automatically via cron:

```bash
# Run backup manually
docker exec spaja-postgres /backup.sh

# Schedule via cron (on host)
0 2 * * * docker exec spaja-postgres /backup.sh
```

Backups are stored in `/backups` and kept for 30 days.

### Recovery

```bash
# Restore from backup
gunzip < /backups/spaja_20240101_020000.sql.gz | \
  docker exec -i spaja-postgres psql -U spaja -d spaja
```

## 🔄 CI/CD

GitHub Actions automatically:

1. Runs tests on every push
2. Builds Docker image
3. Pushes to container registry
4. Deploys to production (on main branch)

### Required GitHub Secrets

- `DEPLOY_KEY` - SSH private key for deployment
- `DEPLOY_HOST` - Production server hostname
- `DEPLOY_USER` - Deployment user

## 📝 API Documentation

Once deployed, access interactive API documentation:

- **Swagger UI**: https://xn--aiiqmenjanica-xvb.com/api/v1/docs
- **ReDoc**: https://xn--aiiqmenjanica-xvb.com/api/v1/redoc

## 🐛 Troubleshooting

### Check logs

```bash
# Backend logs
docker logs spaja-api

# Nginx logs
docker logs spaja-nginx

# Database logs
docker logs spaja-postgres

# All services
docker-compose -f docker-compose.prod.yml logs -f
```

### Common Issues

**Database connection failed**:
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running: `docker ps | grep postgres`
- Check network connectivity: `docker network inspect spaja-network`

**API not responding**:
- Check health endpoint: `curl http://localhost:7777/health`
- Verify all containers running: `docker-compose -f docker-compose.prod.yml ps`
- Check resource usage: `docker stats`

**SSL certificate errors**:
- Verify certificates exist in `nginx/ssl/`
- Check certificate validity: `openssl x509 -in nginx/ssl/cert.pem -text -noout`
- Ensure Nginx has read permissions

## 📞 Support

- Email: spajicn@yahoo.com, spajicn@gmail.com
- Issues: GitHub Issues

## 📄 License

Copyright © 2024 Ai IQ Menjačnica. All rights reserved.

---

## Post-Deployment Checklist

- [ ] All services healthy (API, Database, Redis)
- [ ] SSL certificate working
- [ ] API responding on all endpoints
- [ ] WebSocket connections functional
- [ ] Database backups scheduled
- [ ] Monitoring and alerting active
- [ ] Health checks passing
- [ ] Load balancing working
- [ ] Nginx caching optimized
- [ ] Security headers present
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Logs being collected
- [ ] Metrics being scraped
