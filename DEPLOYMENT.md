# Deployment Guide - Ai IQ Menjačnica Exchange Platform

Complete deployment instructions for production environment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Deployment](#development-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Backend Server**:
- Ubuntu 22.04 LTS or newer
- 4+ CPU cores
- 8GB+ RAM
- 50GB+ SSD storage
- Python 3.11+
- PostgreSQL 16
- Redis 7

**Domain & SSL**:
- Registered domain name
- Valid SSL/TLS certificate (Let's Encrypt recommended)

**External Services**:
- Stripe account (for payments)
- PayPal business account
- Coinbase Commerce account
- BitPay account (optional)

---

## Development Deployment

### Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/spaja86/Ai-Iq-Menja-nica.git
cd Ai-Iq-Menja-nica

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Access API
# http://localhost:8000/docs
```

### Manual Development Setup

```bash
# 1. Install dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Set up environment
cp ../.env.example ../.env
# Edit .env with your settings

# 3. Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# 4. Run application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Access API documentation
# http://localhost:8000/docs
```

---

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3.11-venv python3-pip \
    postgresql postgresql-contrib redis-server \
    nginx certbot python3-certbot-nginx

# Create application user
sudo useradd -m -s /bin/bash aiiq
sudo su - aiiq
```

### 2. Application Installation

```bash
# Clone repository
git clone https://github.com/spaja86/Ai-Iq-Menja-nica.git
cd Ai-Iq-Menja-nica

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
pip install gunicorn
```

### 3. Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres psql

-- In PostgreSQL console:
CREATE DATABASE aiiq_exchange;
CREATE USER exchange_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE aiiq_exchange TO exchange_user;
\q
```

### 4. Environment Configuration

```bash
# Create production .env file
nano .env
```

**Production .env template**:
```bash
# App
APP_NAME="Ai IQ Menjačnica"
DEBUG=false

# Security
SECRET_KEY=generate_with_openssl_rand_hex_32
ED25519_SEED_B64=generate_with_python_secrets

# Database
POSTGRES_SERVER=localhost
POSTGRES_USER=exchange_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=aiiq_exchange
POSTGRES_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ORIGINS=https://aiiqmenjacnica.com,https://www.aiiqmenjacnica.com

# Payment Providers
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

PAYPAL_MODE=live
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

COINBASE_API_KEY=...
COINBASE_WEBHOOK_SECRET=...

# Admin
ADMIN_EMAIL=admin@aiiqmenjacnica.com
ADMIN_PASSWORD=CHANGE_ME_IMMEDIATELY
```

**Generate secrets**:
```bash
# SECRET_KEY
openssl rand -hex 32

# ED25519_SEED_B64
python3 -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"
```

### 5. Initialize Database

```bash
source venv/bin/activate
cd backend
python -c "from app.db.session import init_db; init_db()"
```

### 6. Systemd Service

Create `/etc/systemd/system/aiiq-exchange.service`:

```ini
[Unit]
Description=Ai IQ Menjačnica Exchange API
After=network.target postgresql.service redis.service

[Service]
User=aiiq
Group=aiiq
WorkingDirectory=/home/aiiq/Ai-Iq-Menja-nica/backend
Environment="PATH=/home/aiiq/Ai-Iq-Menja-nica/venv/bin"
EnvironmentFile=/home/aiiq/Ai-Iq-Menja-nica/.env
ExecStart=/home/aiiq/Ai-Iq-Menja-nica/venv/bin/gunicorn \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    app.main:app

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable aiiq-exchange
sudo systemctl start aiiq-exchange
sudo systemctl status aiiq-exchange
```

### 7. Nginx Configuration

Create `/etc/nginx/sites-available/aiiq-exchange`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;
    server_name aiiqmenjacnica.com www.aiiqmenjacnica.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aiiqmenjacnica.com www.aiiqmenjacnica.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/aiiqmenjacnica.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aiiqmenjacnica.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API Proxy
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }

    # Static files (frontend - if needed)
    location / {
        root /var/www/aiiq-exchange;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/aiiq-exchange /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Certificate

```bash
sudo certbot --nginx -d aiiqmenjacnica.com -d www.aiiqmenjacnica.com
```

### 9. Firewall Setup

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Mobile App Deployment

### iOS Deployment

```bash
cd mobile

# Install dependencies
npm install

# Build for iOS
expo build:ios

# Upload to App Store Connect
```

### Android Deployment

```bash
cd mobile

# Install dependencies
npm install

# Build APK
expo build:android

# Upload to Google Play Console
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# API Health
curl https://aiiqmenjacnica.com/health

# Database Connection
sudo -u postgres psql -d aiiq_exchange -c "SELECT COUNT(*) FROM users;"

# Redis Connection
redis-cli ping
```

### Log Monitoring

```bash
# Application logs
sudo journalctl -u aiiq-exchange -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backups

```bash
# Create backup script
cat > /home/aiiq/backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/aiiq/backups"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U exchange_user aiiq_exchange > $BACKUP_DIR/db_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /home/aiiq/backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /home/aiiq/backup.sh
```

### Updates

```bash
# Pull latest code
cd /home/aiiq/Ai-Iq-Menja-nica
git pull origin main

# Update dependencies
source venv/bin/activate
pip install -r backend/requirements.txt

# Run migrations (if any)
alembic upgrade head

# Restart service
sudo systemctl restart aiiq-exchange
```

---

## Troubleshooting

### Application won't start

```bash
# Check logs
sudo journalctl -u aiiq-exchange -n 100

# Common issues:
# 1. Database connection
sudo systemctl status postgresql

# 2. Redis connection
sudo systemctl status redis-server

# 3. Environment variables
cat .env
```

### High CPU usage

```bash
# Increase worker processes in gunicorn
# Edit /etc/systemd/system/aiiq-exchange.service
# Change -w 4 to -w 8
sudo systemctl restart aiiq-exchange
```

### Database issues

```bash
# Check connections
sudo -u postgres psql -d aiiq_exchange -c "SELECT * FROM pg_stat_activity;"

# Restart database
sudo systemctl restart postgresql
```

### SSL certificate renewal

```bash
# Manual renewal
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Performance Optimization

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_orders_market_status ON orders(market_id, status);
CREATE INDEX idx_trades_created ON trades(created_at);
CREATE INDEX idx_balances_user ON balances(user_id);

-- Analyze tables
ANALYZE users;
ANALYZE orders;
ANALYZE trades;
```

### Redis Optimization

Edit `/etc/redis/redis.conf`:
```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

Restart Redis:
```bash
sudo systemctl restart redis-server
```

---

## Support

For deployment issues:
- Email: spajicn@yahoo.com
- Documentation: README.md, CONTRIBUTING.md
- Security: SECURITY.md

---

**Last Updated**: 2024-01-18  
**Version**: 1.0.0
