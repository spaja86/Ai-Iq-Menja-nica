# AI IQ Crypto Exchange Platform

Enterprise-grade cryptocurrency exchange platform with production-ready security, compliance, and trading features.

## 🚀 Features

### Backend (FastAPI)
- JWT authentication + 2FA (TOTP)
- KYC/AML integration
- Production-grade trading engine with order matching
- Multi-currency wallet management
- Payment processing (Stripe, PayPal, Crypto)
- Real-time WebSocket feeds
- Comprehensive audit logging
- Rate limiting and DDoS protection

### Frontend (React + TypeScript)
- Modern UI with Tailwind CSS
- Real-time trading interface
- WebSocket integration for live updates
- Portfolio analytics and visualization
- Admin dashboard
- Dark/Light theme support
- Mobile responsive design

### Mobile App (React Native/Expo)
- Cross-platform (iOS/Android)
- Biometric authentication
- Push notifications
- Offline support

### Infrastructure
- Docker containerization
- Kubernetes orchestration
- PostgreSQL with HA setup
- Redis for caching
- Automated backups
- SSL/TLS encryption

### Monitoring & Observability
- Prometheus metrics
- Grafana dashboards
- ELK stack for logging
- Sentry error tracking
- Alert management

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Kubernetes (for production)
- PostgreSQL 15+
- Redis 7+

## 🛠️ Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

### Docker Compose (All Services)

```bash
docker-compose up -d
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security Best Practices](docs/SECURITY.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Compliance](docs/COMPLIANCE.md)

## 🔒 Security

- AES-256 encryption for sensitive data
- HTTPS/TLS only
- KYC/AML verification
- GDPR compliance
- Regular security audits
- Rate limiting per user
- SQL injection prevention
- CORS policy enforcement

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📦 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed production deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📝 License

Copyright © 2026 AI IQ Exchange. All rights reserved.

## 📧 Contact

- Email: spajicn@yahoo.com, spajicn@gmail.com
- Issues: GitHub Issues
