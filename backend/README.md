# Backend - AI IQ Crypto Exchange

FastAPI-based backend for the crypto exchange platform.

## Features

- **Authentication**: JWT tokens, 2FA (TOTP), password hashing
- **Trading Engine**: FIFO order matching, market/limit orders
- **Wallet Management**: Multi-currency support, transaction history
- **Payment Processing**: Stripe, PayPal integration
- **KYC/AML**: Document verification, compliance
- **WebSocket**: Real-time price feeds, order book updates
- **Admin Panel**: User management, analytics, KYC review
- **Security**: Rate limiting, encryption, audit logging

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis
- **Auth**: JWT with python-jose, TOTP with pyotp
- **Monitoring**: Prometheus metrics
- **Testing**: pytest

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

Create a `.env` file:

```env
# Application
APP_NAME=AI IQ Crypto Exchange
ENVIRONMENT=development
DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_exchange

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Payment Providers
STRIPE_API_KEY=sk_test_...
PAYPAL_CLIENT_ID=...

# KYC Provider
KYC_API_KEY=...
```

### Database Migration

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Run migration
alembic upgrade head
```

### Running the Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/2fa/enable` - Enable 2FA
- `GET /api/auth/2fa/setup` - Get 2FA QR code
- `POST /api/auth/2fa/disable` - Disable 2FA

### Trading
- `POST /api/trading/orders` - Place new order
- `GET /api/trading/orders` - Get user orders
- `GET /api/trading/orders/{order_id}` - Get specific order
- `DELETE /api/trading/orders/{order_id}` - Cancel order
- `GET /api/trading/trades` - Get trade history
- `GET /api/trading/orderbook/{pair}` - Get order book
- `GET /api/trading/pairs` - Get trading pairs

### Wallet
- `GET /api/wallet/balances` - Get all balances
- `GET /api/wallet/balance/{currency}` - Get specific balance
- `GET /api/wallet/transactions/{currency}` - Get transactions
- `GET /api/wallet/addresses` - Get deposit addresses

### Payments
- `POST /api/payments/deposit` - Create deposit
- `POST /api/payments/withdraw` - Create withdrawal
- `GET /api/payments/history` - Get payment history

### Admin (requires admin role)
- `GET /api/admin/users` - List all users
- `GET /api/admin/kyc/pending` - Get pending KYC
- `POST /api/admin/kyc/review` - Review KYC submission
- `GET /api/admin/analytics` - Get platform analytics
- `POST /api/admin/users/{id}/activate` - Activate user
- `POST /api/admin/users/{id}/deactivate` - Deactivate user

### WebSocket
- `WS /ws` - WebSocket connection for real-time updates

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_trading.py
```

## Docker

```bash
# Build image
docker build -t crypto-exchange-backend .

# Run container
docker run -p 8000:8000 --env-file .env crypto-exchange-backend

# Using docker-compose
docker-compose up -d
```

## Project Structure

```
backend/
├── app/
│   ├── core/           # Core configuration
│   ├── models/         # Database models
│   ├── api/            # API routes
│   ├── services/       # Business logic
│   ├── tests/          # Test files
│   └── main.py         # Application entry point
├── alembic/            # Database migrations
├── requirements.txt    # Python dependencies
├── Dockerfile          # Docker configuration
└── README.md           # This file
```

## Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens expire after 30 minutes
- 2FA strongly recommended for all users
- API rate limiting enabled
- SQL injection prevention via ORM
- CORS properly configured
- Sensitive data encrypted at rest

## Production Deployment

See [DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production deployment instructions.

## License

Copyright © 2026 AI IQ Exchange. All rights reserved.
