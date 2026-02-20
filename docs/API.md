# API Documentation

## Overview

AI IQ Crypto Exchange provides a comprehensive RESTful API for cryptocurrency trading, wallet management, payments, and user authentication. All endpoints use JSON for request and response payloads.

**Base URL:** `https://api.aiiqexchange.com`  
**API Version:** v1.0.0  
**Documentation:** `https://api.aiiqexchange.com/api/docs`

## Authentication

### JWT Bearer Token

All authenticated endpoints require a JWT bearer token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Types

- **Access Token**: Valid for 30 minutes, used for API requests
- **Refresh Token**: Valid for 7 days, used to obtain new access tokens

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "phone_number": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `400 Bad Request`: Email already registered or validation error
- `422 Unprocessable Entity`: Invalid request format

---

### Login

Authenticate user and obtain JWT tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "totp_code": "123456"
}
```

**Note:** `totp_code` is required only if 2FA is enabled.

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials or 2FA code
- `403 Forbidden`: Account is inactive

---

### Get Current User

Retrieve current authenticated user information.

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 123,
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone_number": "+1234567890",
  "role": "user",
  "kyc_status": "approved",
  "two_fa_enabled": true,
  "is_verified": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Setup 2FA

Get 2FA setup information including QR code URI.

**Endpoint:** `GET /api/auth/2fa/setup`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_uri": "otpauth://totp/AI%20IQ%20Crypto%20Exchange:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AI%20IQ%20Crypto%20Exchange"
}
```

---

### Enable 2FA

Enable two-factor authentication for the account.

**Endpoint:** `POST /api/auth/2fa/enable`  
**Authentication:** Required

**Request Body:**
```json
{
  "totp_code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "2FA enabled successfully"
}
```

**Error Responses:**
- `400 Bad Request`: 2FA already enabled or invalid code

---

### Disable 2FA

Disable two-factor authentication.

**Endpoint:** `POST /api/auth/2fa/disable`  
**Authentication:** Required

**Request Body:**
```json
{
  "totp_code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "2FA disabled successfully"
}
```

---

## Trading Endpoints

### Create Order

Place a new trading order.

**Endpoint:** `POST /api/trading/orders`  
**Authentication:** Required

**Request Body:**
```json
{
  "trading_pair": "BTC/USD",
  "side": "buy",
  "order_type": "limit",
  "price": 45000.00,
  "quantity": 0.5
}
```

**Parameters:**
- `trading_pair`: Trading pair symbol (e.g., "BTC/USD", "ETH/USD")
- `side`: Order side - `"buy"` or `"sell"`
- `order_type`: Order type - `"limit"` or `"market"`
- `price`: Limit price (required for limit orders, optional for market orders)
- `quantity`: Order quantity in base currency

**Response:** `200 OK`
```json
{
  "id": 12345,
  "trading_pair": "BTC/USD",
  "side": "buy",
  "order_type": "limit",
  "status": "open",
  "price": 45000.00,
  "quantity": 0.5,
  "filled_quantity": 0.0,
  "remaining_quantity": 0.5,
  "total_fee": 0.0,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid order parameters
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient funds

---

### Get Orders

Retrieve user's orders with optional filtering.

**Endpoint:** `GET /api/trading/orders`  
**Authentication:** Required

**Query Parameters:**
- `trading_pair` (optional): Filter by trading pair
- `status_filter` (optional): Filter by status (`open`, `filled`, `cancelled`, `partially_filled`)
- `limit` (optional): Number of results (default: 50, max: 100)

**Response:** `200 OK`
```json
[
  {
    "id": 12345,
    "trading_pair": "BTC/USD",
    "side": "buy",
    "order_type": "limit",
    "status": "filled",
    "price": 45000.00,
    "quantity": 0.5,
    "filled_quantity": 0.5,
    "remaining_quantity": 0.0,
    "total_fee": 22.50,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Get Order Details

Retrieve details of a specific order.

**Endpoint:** `GET /api/trading/orders/{order_id}`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 12345,
  "trading_pair": "BTC/USD",
  "side": "buy",
  "order_type": "limit",
  "status": "filled",
  "price": 45000.00,
  "quantity": 0.5,
  "filled_quantity": 0.5,
  "remaining_quantity": 0.0,
  "total_fee": 22.50,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Order not found

---

### Cancel Order

Cancel an open order.

**Endpoint:** `DELETE /api/trading/orders/{order_id}`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Order cancelled successfully",
  "order_id": 12345
}
```

**Error Responses:**
- `404 Not Found`: Order not found or already completed

---

### Get Trade History

Retrieve user's executed trades.

**Endpoint:** `GET /api/trading/trades`  
**Authentication:** Required

**Query Parameters:**
- `trading_pair` (optional): Filter by trading pair
- `limit` (optional): Number of results (default: 50)

**Response:** `200 OK`
```json
[
  {
    "id": 67890,
    "trading_pair": "BTC/USD",
    "price": 45000.00,
    "quantity": 0.5,
    "total_value": 22500.00,
    "fee": 22.50,
    "executed_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Get Order Book

Retrieve current order book for a trading pair.

**Endpoint:** `GET /api/trading/orderbook/{trading_pair}`

**Query Parameters:**
- `depth` (optional): Number of levels (default: 20)

**Response:** `200 OK`
```json
{
  "trading_pair": "BTC/USD",
  "bids": [
    {"price": 44999.00, "quantity": 1.5},
    {"price": 44998.00, "quantity": 2.0}
  ],
  "asks": [
    {"price": 45001.00, "quantity": 1.2},
    {"price": 45002.00, "quantity": 0.8}
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Get Trading Pairs

Retrieve available trading pairs.

**Endpoint:** `GET /api/trading/pairs`

**Response:** `200 OK`
```json
{
  "pairs": [
    {"symbol": "BTC/USD", "base": "BTC", "quote": "USD"},
    {"symbol": "ETH/USD", "base": "ETH", "quote": "USD"},
    {"symbol": "BTC/EUR", "base": "BTC", "quote": "EUR"},
    {"symbol": "ETH/EUR", "base": "ETH", "quote": "EUR"}
  ]
}
```

---

## Wallet Endpoints

### Get All Balances

Retrieve all wallet balances for the current user.

**Endpoint:** `GET /api/wallet/balances`  
**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "currency": "BTC",
    "balance": 1.5,
    "locked_balance": 0.5,
    "available_balance": 1.0
  },
  {
    "id": 2,
    "currency": "USD",
    "balance": 50000.00,
    "locked_balance": 10000.00,
    "available_balance": 40000.00
  }
]
```

---

### Get Balance by Currency

Retrieve wallet balance for a specific currency.

**Endpoint:** `GET /api/wallet/balance/{currency}`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "currency": "BTC",
  "balance": 1.5,
  "locked_balance": 0.5,
  "available_balance": 1.0
}
```

---

### Get Transaction History

Retrieve transaction history for a currency.

**Endpoint:** `GET /api/wallet/transactions/{currency}`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)

**Response:** `200 OK`
```json
[
  {
    "id": 123,
    "transaction_type": "deposit",
    "amount": 1.0,
    "balance_after": 1.5,
    "status": "completed",
    "description": "Fiat deposit via Stripe",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### Get Deposit Addresses

Retrieve cryptocurrency deposit addresses.

**Endpoint:** `GET /api/wallet/addresses`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "addresses": {
    "BTC": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "ETH": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```

---

## Payment Endpoints

### Create Deposit

Create a fiat deposit via payment provider.

**Endpoint:** `POST /api/payments/deposit`  
**Authentication:** Required

**Request Body:**
```json
{
  "amount": 1000.00,
  "currency": "USD",
  "payment_method": "stripe"
}
```

**Parameters:**
- `amount`: Deposit amount
- `currency`: Currency code (USD, EUR)
- `payment_method`: Payment provider (`stripe`, `paypal`)

**Response:** `200 OK`
```json
{
  "id": 456,
  "payment_method": "stripe",
  "payment_type": "deposit",
  "amount": 1000.00,
  "currency": "USD",
  "status": "pending",
  "provider_transaction_id": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid amount or payment method

---

### Create Withdrawal

Create a fiat withdrawal.

**Endpoint:** `POST /api/payments/withdraw`  
**Authentication:** Required

**Request Body:**
```json
{
  "amount": 500.00,
  "currency": "USD",
  "payment_method": "paypal"
}
```

**Response:** `200 OK`
```json
{
  "id": 457,
  "payment_method": "paypal",
  "payment_type": "withdrawal",
  "amount": 500.00,
  "currency": "USD",
  "status": "pending",
  "provider_transaction_id": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Insufficient funds or invalid parameters

---

### Get Payment History

Retrieve payment history.

**Endpoint:** `GET /api/payments/history`  
**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)

**Response:** `200 OK`
```json
[
  {
    "id": 456,
    "payment_method": "stripe",
    "payment_type": "deposit",
    "amount": 1000.00,
    "currency": "USD",
    "status": "completed",
    "provider_transaction_id": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## Admin Endpoints

**Note:** All admin endpoints require admin role authentication.

### List Users

Retrieve all users (admin only).

**Endpoint:** `GET /api/admin/users`  
**Authentication:** Required (Admin)

**Query Parameters:**
- `skip` (optional): Offset (default: 0)
- `limit` (optional): Number of results (default: 100)

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": 123,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "kyc_status": "approved",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1500
}
```

---

### Get Pending KYC Submissions

Retrieve pending KYC submissions for review.

**Endpoint:** `GET /api/admin/kyc/pending`  
**Authentication:** Required (Admin)

**Response:** `200 OK`
```json
{
  "submissions": [
    {
      "id": 789,
      "user_id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "document_type": "passport",
      "submitted_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Review KYC Submission

Approve or reject a KYC submission.

**Endpoint:** `POST /api/admin/kyc/review`  
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "submission_id": 789,
  "approved": true,
  "rejection_reason": null
}
```

**Response:** `200 OK`
```json
{
  "message": "KYC reviewed successfully",
  "status": "approved"
}
```

---

### Get Analytics

Retrieve platform analytics.

**Endpoint:** `GET /api/admin/analytics`  
**Authentication:** Required (Admin)

**Response:** `200 OK`
```json
{
  "total_users": 15000,
  "total_orders": 250000,
  "total_trades": 180000,
  "daily_trading_volume": 5000000.00,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Activate User

Activate a user account.

**Endpoint:** `POST /api/admin/users/{user_id}/activate`  
**Authentication:** Required (Admin)

**Response:** `200 OK`
```json
{
  "message": "User activated successfully"
}
```

---

### Deactivate User

Deactivate a user account.

**Endpoint:** `POST /api/admin/users/{user_id}/deactivate`  
**Authentication:** Required (Admin)

**Response:** `200 OK`
```json
{
  "message": "User deactivated successfully"
}
```

---

## WebSocket API

### Real-time Market Data

Connect to WebSocket for real-time updates.

**Endpoint:** `wss://api.aiiqexchange.com/ws`

**Authentication:** Send JWT token in initial message

**Subscribe to Trading Pair:**
```json
{
  "action": "subscribe",
  "channel": "orderbook",
  "trading_pair": "BTC/USD"
}
```

**Order Book Update:**
```json
{
  "channel": "orderbook",
  "trading_pair": "BTC/USD",
  "data": {
    "bids": [{"price": 44999.00, "quantity": 1.5}],
    "asks": [{"price": 45001.00, "quantity": 1.2}]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Subscribe to Trades:**
```json
{
  "action": "subscribe",
  "channel": "trades",
  "trading_pair": "BTC/USD"
}
```

**Trade Update:**
```json
{
  "channel": "trades",
  "trading_pair": "BTC/USD",
  "data": {
    "price": 45000.00,
    "quantity": 0.5,
    "side": "buy",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Rate Limiting

- **Per Minute:** 60 requests
- **Per Hour:** 1000 requests

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1642248000
```

When rate limit is exceeded:
```json
{
  "detail": "Rate limit exceeded. Try again in 30 seconds."
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## SDK Examples

### Python

```python
import requests

BASE_URL = "https://api.aiiqexchange.com"

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": "user@example.com",
    "password": "SecurePassword123!"
})
tokens = response.json()
access_token = tokens["access_token"]

# Get balances
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(f"{BASE_URL}/api/wallet/balances", headers=headers)
balances = response.json()
print(balances)

# Place order
response = requests.post(
    f"{BASE_URL}/api/trading/orders",
    headers=headers,
    json={
        "trading_pair": "BTC/USD",
        "side": "buy",
        "order_type": "limit",
        "price": 45000.00,
        "quantity": 0.5
    }
)
order = response.json()
print(order)
```

### JavaScript

```javascript
const BASE_URL = "https://api.aiiqexchange.com";

// Login
const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({
    email: "user@example.com",
    password: "SecurePassword123!"
  })
});
const { access_token } = await loginResponse.json();

// Get balances
const balancesResponse = await fetch(`${BASE_URL}/api/wallet/balances`, {
  headers: {"Authorization": `Bearer ${access_token}`}
});
const balances = await balancesResponse.json();
console.log(balances);

// Place order
const orderResponse = await fetch(`${BASE_URL}/api/trading/orders`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${access_token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    trading_pair: "BTC/USD",
    side: "buy",
    order_type: "limit",
    price: 45000.00,
    quantity: 0.5
  })
});
const order = await orderResponse.json();
console.log(order);
```

---

## API Versioning

The API uses URL versioning. The current version is v1. Future versions will be accessible via:

- `/api/v2/...`
- `/api/v3/...`

Version 1 will be supported for at least 12 months after a new version is released.

---

## Support

- **Documentation:** https://docs.aiiqexchange.com
- **API Status:** https://status.aiiqexchange.com
- **Support Email:** api-support@aiiqexchange.com
- **Developer Forum:** https://developers.aiiqexchange.com
