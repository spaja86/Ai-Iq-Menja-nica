# Ai IQ Menjačnica - Production-Ready Exchange Platform

A complete, production-grade full-stack cryptocurrency and fiat exchange platform built with modern technologies and industry-standard security practices.

## 🚀 Features

### Core Platform
- ✅ **Full-Stack Exchange**: Complete trading platform for crypto and fiat currencies
- ✅ **Multiple Trading Pairs**: BTC, ETH, USDT, USD, EUR, RSD support
- ✅ **Order Matching Engine**: Limit and market orders with FIFO matching
- ✅ **Real-Time Orderbook**: Live market data and price feeds
- ✅ **Multi-Provider Payments**: Stripe, PayPal, Coinbase, BitPay integration
- ✅ **On-Chain Deposits**: Bitcoin and Ethereum blockchain monitoring
- ✅ **Digital Ledger Stamps**: Ed25519-signed transaction verification

### Security & Compliance
- ✅ **JWT Authentication**: Access + refresh tokens with JTI tracking
- ✅ **2FA (TOTP)**: Time-based one-time password authentication
- ✅ **Argon2 Password Hashing**: Industry-standard password security
- ✅ **Ed25519 Signatures**: Cryptographic transaction stamps
- ✅ **Rate Limiting**: Protection against brute force attacks
- ✅ **Audit Logging**: Complete activity tracking
- ✅ **Webhook Idempotency**: Duplicate payment prevention
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **CORS Protection**: Restricted cross-origin access

### Technical Stack

**Backend**
- FastAPI 0.110+ (Python web framework)
- SQLAlchemy 2.0+ (ORM with PostgreSQL/SQLite)
- Redis 7 (Caching and session management)
- Pydantic v2 (Data validation)
- PyNaCl (Ed25519 signatures)

**Database**
- PostgreSQL 16 (Production)
- SQLite (Development)
- Alembic (Migrations)

**Payments & Blockchain**
- Stripe, PayPal, Coinbase Commerce, BitPay
- Bitcoin Core RPC
- Web3.py (Ethereum)

## 📋 Quick Start

### Prerequisites
- Python 3.11+
- Docker & Docker Compose (optional)
- PostgreSQL 16 (for production)
- Redis 7

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/spaja86/Ai-Iq-Menja-nica.git
cd Ai-Iq-Menja-nica

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Start services
docker-compose up -d

# API will be available at http://localhost:8000
```

#### Option 2: Manual Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up environment
cp ../.env.example ../.env
# Edit .env with your settings

# Initialize database
python -c "from app.db.session import init_db; init_db()"

# Run application
uvicorn app.main:app --reload

# API will be available at http://localhost:8000
```

### First Run Setup

1. **Access API Documentation**: http://localhost:8000/docs

2. **Default Admin Account**:
   - Email: `spajicn@yahoo.com`
   - Password: `ChangeMe123!` (CHANGE IMMEDIATELY!)

3. **Generate Ed25519 Key** (for ledger stamps):
```python
import secrets
import base64
seed = secrets.token_bytes(32)
print(base64.b64encode(seed).decode())
# Add to .env as ED25519_SEED_B64
```

4. **Configure Payment Providers** (optional):
   - Add API keys to `.env` for Stripe, PayPal, etc.

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "totp_code": "123456"  // Optional, required if 2FA enabled
}

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Market Endpoints

#### Get All Assets
```http
GET /api/v1/market/assets

Response:
[
  {
    "id": 1,
    "symbol": "BTC",
    "name": "Bitcoin",
    "is_crypto": true,
    "decimals": 8,
    "min_withdrawal": 0.0001,
    "withdrawal_fee": 0.0005
  },
  ...
]
```

#### Get Markets
```http
GET /api/v1/market/markets

Response:
[
  {
    "id": 1,
    "symbol": "BTC-USD",
    "base_asset": {...},
    "quote_asset": {...},
    "min_order_size": 0.0001
  },
  ...
]
```

#### Get Orderbook
```http
GET /api/v1/market/markets/1/orderbook?depth=20

Response:
{
  "market_id": 1,
  "market_symbol": "BTC-USD",
  "bids": [
    {"price": 45000.00, "quantity": 0.5, "total": 22500.00},
    ...
  ],
  "asks": [
    {"price": 45100.00, "quantity": 0.3, "total": 13530.00},
    ...
  ],
  "last_trade_price": 45050.00
}
```

### Trading Endpoints

#### Create Order
```http
POST /api/v1/trading/orders
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "market_id": 1,
  "order_type": "limit",
  "side": "buy",
  "price": 45000.00,
  "quantity": 0.1
}

Response:
{
  "id": 123,
  "status": "pending",
  "created_at": "2024-01-01T12:00:00Z",
  ...
}
```

#### Get Balances
```http
GET /api/v1/trading/balances
Authorization: Bearer {access_token}

Response:
[
  {
    "asset": {"symbol": "BTC", ...},
    "available": 1.5,
    "reserved": 0.2,
    "total": 1.7
  },
  ...
]
```

## 🏗️ Project Structure

```
Ai-Iq-Menja-nica/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration and security
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/             # Database models and session
│   │   │   ├── models.py
│   │   │   ├── session.py
│   │   │   └── bootstrap.py
│   │   ├── api/            # API routers and schemas
│   │   │   ├── routers/
│   │   │   │   ├── auth.py
│   │   │   │   ├── market.py
│   │   │   │   └── trading.py
│   │   │   └── schemas.py
│   │   ├── services/       # Business logic
│   │   ├── workers/        # Background workers
│   │   └── main.py         # FastAPI app entry
│   ├── requirements.txt
│   └── Dockerfile
├── mobile/                 # React Native app (coming soon)
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🗃️ Database Schema

### Core Tables
- `users` - User accounts with 2FA
- `assets` - Tradeable currencies (BTC, ETH, USD, etc.)
- `markets` - Trading pairs (BTC-USD, ETH-EUR, etc.)
- `balances` - User balances per asset
- `orders` - Trading orders (limit/market)
- `trades` - Executed trades
- `payments` - Deposits and withdrawals
- `ledger_entries` - Transaction ledger with digital stamps
- `audit_logs` - Security audit trail
- `webhook_events` - Payment webhook idempotency

## 🔒 Security Best Practices

### Implemented Security Measures

1. **Authentication**
   - JWT with access + refresh tokens
   - Token rotation and invalidation
   - 2FA (TOTP) support
   - Argon2 password hashing

2. **API Security**
   - Rate limiting (10/min login, 5/min register)
   - CORS restrictions
   - Input validation (Pydantic)
   - SQL injection prevention

3. **Data Protection**
   - Environment-based secrets
   - Ed25519 digital signatures
   - Audit logging for all actions
   - Webhook idempotency

4. **Database**
   - Foreign key constraints
   - Unique indexes
   - Transaction isolation
   - Parameterized queries

### Pre-Production Checklist

- [ ] Change all default secrets in `.env`
- [ ] Set up HTTPS with valid SSL certificate
- [ ] Generate production Ed25519 key
- [ ] Configure payment provider API keys
- [ ] Set up monitoring (Sentry recommended)
- [ ] Configure database backups
- [ ] Review and adjust rate limits
- [ ] Set up load balancer
- [ ] Configure CORS for production domains
- [ ] Implement KYC/AML workflows
- [ ] Review legal compliance (Terms, Privacy Policy)

## 🧪 Development

### Running Tests
```bash
# Unit tests
pytest backend/tests/ -v

# With coverage
pytest --cov=app backend/tests/
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Code Quality
```bash
# Format code
black backend/app/

# Lint
flake8 backend/app/
```

## 📊 Monitoring & Logging

### Health Check
```http
GET /health

Response:
{
  "status": "healthy",
  "timestamp": 1704110400.0
}
```

### Audit Logs
All sensitive actions are logged to `audit_logs` table:
- User registration/login
- 2FA enable/disable
- Order creation/cancellation
- Balance changes
- Administrative actions

## 🚢 Deployment

### Docker Production Deployment

```bash
# Build production image
docker build -t aiiq-exchange:latest ./backend

# Run with PostgreSQL
docker-compose -f docker-compose.yml up -d
```

### Environment Variables (Production)

Critical environment variables for production:
- `SECRET_KEY` - Unique secret for JWT signing
- `ED25519_SEED_B64` - Production signing key
- `POSTGRES_*` - Database credentials
- `REDIS_URL` - Redis connection
- Payment provider keys (Stripe, PayPal, etc.)

## 📱 Mobile App (Coming Soon)

React Native mobile application with:
- Cross-platform (iOS & Android)
- Real-time market data
- Order placement
- Portfolio management
- 2FA setup

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

### Development Setup
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 📧 Contact

- Email: spajicn@yahoo.com, spajicn@gmail.com
- Project: [https://github.com/spaja86/Ai-Iq-Menja-nica](https://github.com/spaja86/Ai-Iq-Menja-nica)

## ⚠️ Disclaimer

This is a demonstration exchange platform. Before using in production:
- Obtain necessary financial licenses
- Implement full KYC/AML procedures
- Consult with legal counsel
- Undergo security audit
- Ensure regulatory compliance

## 🙏 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [Pydantic](https://docs.pydantic.dev/)
- [Redis](https://redis.io/)
- [PyNaCl](https://pynacl.readthedocs.io/)

---

**Status**: ✅ Production-Ready Backend | 🚧 Mobile App In Development

Last Updated: January 2024
