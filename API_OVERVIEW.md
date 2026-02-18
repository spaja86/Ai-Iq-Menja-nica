# API Overview - Ai IQ Menjačnica Exchange Platform

Complete API reference for the production-ready exchange platform.

---

## Base URL

**Development**: `http://localhost:8000/api/v1`  
**Production**: `https://aiiqmenjacnica.com/api/v1`

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-18T12:00:00Z"
}
```

---

### POST /auth/login
Login with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "totp_code": "123456"  // Optional, required if 2FA enabled
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

### POST /auth/refresh
Refresh access token using refresh token.

**Request**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response**: `200 OK`
```json
{
  "access_token": "new_access_token...",
  "refresh_token": "new_refresh_token...",
  "token_type": "bearer"
}
```

---

## 📊 Market Data Endpoints

### GET /market/assets
Get all available assets/currencies.

**Query Parameters**:
- `active_only` (boolean): Filter to active assets only (default: true)

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "symbol": "BTC",
    "name": "Bitcoin",
    "is_crypto": true,
    "decimals": 8,
    "min_withdrawal": 0.0001,
    "withdrawal_fee": 0.0005,
    "is_active": true
  },
  {
    "id": 2,
    "symbol": "USD",
    "name": "US Dollar",
    "is_fiat": true,
    "decimals": 2,
    "min_withdrawal": 10.0,
    "withdrawal_fee": 2.0,
    "is_active": true
  }
]
```

---

### GET /market/markets
Get all trading markets.

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "symbol": "BTC-USD",
    "base_asset": {
      "id": 1,
      "symbol": "BTC",
      "name": "Bitcoin"
    },
    "quote_asset": {
      "id": 2,
      "symbol": "USD",
      "name": "US Dollar"
    },
    "is_active": true,
    "min_order_size": 0.0001
  }
]
```

---

### GET /market/markets/{market_id}/orderbook
Get orderbook for a specific market.

**Query Parameters**:
- `depth` (integer): Number of price levels (default: 20)

**Response**: `200 OK`
```json
{
  "market_id": 1,
  "market_symbol": "BTC-USD",
  "bids": [
    {
      "price": 45000.00,
      "quantity": 0.5,
      "total": 22500.00
    }
  ],
  "asks": [
    {
      "price": 45100.00,
      "quantity": 0.3,
      "total": 13530.00
    }
  ],
  "last_trade_price": 45050.00
}
```

---

## 💰 Trading Endpoints

**Authentication Required**: Bearer token in `Authorization` header

### GET /trading/balances
Get user's balances for all assets.

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "asset_id": 1,
    "asset": {
      "symbol": "BTC",
      "name": "Bitcoin"
    },
    "available": 1.5,
    "reserved": 0.2,
    "total": 1.7
  }
]
```

---

### POST /trading/orders
Create a new trading order.

**Request**:
```json
{
  "market_id": 1,
  "order_type": "limit",  // "limit" or "market"
  "side": "buy",          // "buy" or "sell"
  "price": 45000.00,      // Required for limit orders
  "quantity": 0.1
}
```

**Response**: `201 Created`
```json
{
  "id": 123,
  "user_id": 1,
  "market_id": 1,
  "order_type": "limit",
  "side": "buy",
  "status": "pending",
  "price": 45000.00,
  "quantity": 0.1,
  "filled_quantity": 0.0,
  "created_at": "2024-01-18T12:00:00Z"
}
```

---

### GET /trading/orders
Get user's orders.

**Query Parameters**:
- `market_id` (integer): Filter by market
- `status` (string): Filter by status
- `limit` (integer): Max results (default: 50)

**Response**: `200 OK`
```json
[
  {
    "id": 123,
    "market_id": 1,
    "order_type": "limit",
    "side": "buy",
    "status": "open",
    "price": 45000.00,
    "quantity": 0.1,
    "filled_quantity": 0.0
  }
]
```

---

### DELETE /trading/orders/{order_id}
Cancel an open order.

**Response**: `200 OK`
```json
{
  "message": "Order cancelled successfully",
  "order_id": 123
}
```

---

### GET /trading/trades
Get user's trade history.

**Query Parameters**:
- `market_id` (integer): Filter by market
- `limit` (integer): Max results (default: 50)

**Response**: `200 OK`
```json
[
  {
    "id": 456,
    "order_id": 123,
    "market_id": 1,
    "price": 45000.00,
    "quantity": 0.1,
    "buyer_id": 1,
    "seller_id": 2,
    "buyer_fee": 9.0,
    "seller_fee": 4.5,
    "created_at": "2024-01-18T12:00:00Z"
  }
]
```

---

## 💳 Payment Webhooks

### POST /payments/webhooks/stripe
Stripe payment webhook handler.

**Headers**:
```
Stripe-Signature: {signature}
```

---

### POST /payments/webhooks/paypal
PayPal payment webhook handler.

---

### POST /payments/webhooks/coinbase
Coinbase Commerce webhook handler.

**Headers**:
```
X-CC-Webhook-Signature: {signature}
```

---

### POST /payments/webhooks/bitpay
BitPay webhook handler.

---

## 🔐 Ledger Stamps

### GET /ledger/entries/{entry_id}
Get a specific ledger entry with digital signature.

**Response**: `200 OK`
```json
{
  "id": 789,
  "transaction_type": "trade",
  "amount": 0.1,
  "asset_id": 1,
  "signature": "base64_signature...",
  "public_key": "base64_public_key...",
  "created_at": "2024-01-18T12:00:00Z"
}
```

---

### GET /ledger/entries/{entry_id}/qr
Get QR code for ledger entry.

**Query Parameters**:
- `format` (string): Image format - "png" or "jpeg"
- `theme` (string): Color theme - "light" or "dark"

**Response**: `200 OK`
```
Content-Type: image/png

[QR Code Image]
```

---

### GET /ledger/verify/{entry_id}
Publicly verify a ledger entry signature.

**Response**: `200 OK`
```json
{
  "valid": true,
  "entry_id": 789,
  "transaction_type": "trade",
  "amount": "0.1",
  "asset": "BTC",
  "timestamp": "2024-01-18T12:00:00Z",
  "signature": "base64_signature...",
  "public_key": "base64_public_key...",
  "message": "Transaction signature is valid"
}
```

---

### GET /ledger/public-key
Get the exchange's public Ed25519 key for verification.

**Response**: `200 OK`
```json
{
  "public_key": "base64_public_key...",
  "algorithm": "Ed25519",
  "usage": "Transaction signature verification"
}
```

---

## 👨‍💼 Admin Endpoints

**Authentication Required**: Admin access token

### GET /admin/users
List all users.

**Query Parameters**:
- `skip` (integer): Pagination offset
- `limit` (integer): Max results (default: 100)
- `is_active` (boolean): Filter by active status

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "is_active": true,
    "is_verified": true,
    "created_at": "2024-01-18T12:00:00Z"
  }
]
```

---

### PATCH /admin/users/{user_id}
Update user account.

**Request**:
```json
{
  "is_active": true,
  "is_verified": true,
  "is_admin": false
}
```

---

### GET /admin/stats
Get system statistics.

**Response**: `200 OK`
```json
{
  "total_users": 1000,
  "active_users_30d": 250,
  "total_trades": 5000,
  "total_volume": 1500000.00,
  "pending_orders": 120,
  "total_deposits": 800
}
```

---

### GET /admin/audit-logs
Get audit logs.

**Query Parameters**:
- `skip` (integer): Pagination offset
- `limit` (integer): Max results
- `user_id` (integer): Filter by user
- `action` (string): Filter by action type

---

### GET /admin/balances
Get all user balances for auditing.

**Query Parameters**:
- `asset_id` (integer): Filter by asset

**Response**: `200 OK`
```json
{
  "total_available": 1000.5,
  "total_reserved": 50.3,
  "total": 1050.8,
  "count": 150,
  "balances": [...]
}
```

---

## 📝 Error Responses

All endpoints may return these error codes:

### 400 Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "detail": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## 🔒 Authentication

Most endpoints require authentication using JWT tokens:

1. Login to get access and refresh tokens
2. Include access token in `Authorization` header:
   ```
   Authorization: Bearer {access_token}
   ```
3. When access token expires, use refresh token to get new tokens
4. Tokens expire after:
   - Access token: 30 minutes
   - Refresh token: 7 days

---

## 📚 Additional Resources

- **Interactive API Docs**: `https://aiiqmenjacnica.com/docs`
- **OpenAPI Schema**: `https://aiiqmenjacnica.com/openapi.json`
- **ReDoc Documentation**: `https://aiiqmenjacnica.com/redoc`

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-18
