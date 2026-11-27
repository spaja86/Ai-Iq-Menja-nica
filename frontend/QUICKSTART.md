# Quick Start Guide

Get your Crypto Exchange frontend up and running in minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A running backend API

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` to match your backend:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_WS_URL=ws://localhost:8000/ws
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Visit `http://localhost:3000`

## First Time Setup

### 1. Register a New Account

- Click on "Register" tab on the login page
- Enter your name, email, and password
- Click "Register"

### 2. Explore the Dashboard

After logging in, you'll see:
- Portfolio overview
- Recent orders
- Balance summary
- Quick actions

### 3. Complete KYC (Optional)

To unlock full features:
- Go to Settings → KYC tab
- Fill out the verification form
- Upload required documents
- Submit for review

### 4. Start Trading

Navigate to the Trade page:
- Select a trading pair (BTC/USD, ETH/USD, etc.)
- View real-time order book
- Place your first order
- Monitor your orders in the table below

## Available Pages

### Dashboard (`/dashboard`)
- Portfolio overview
- Recent activity
- Quick stats
- Balance summary

### Trade (`/trade`)
- Trading interface
- Order book visualization
- Order placement form
- Order history
- Recent trades

### Settings (`/settings`)
- Profile management
- Wallet overview
- KYC verification
- Security settings (2FA)
- Admin panel (for admin users)

## Key Features

### Authentication
- **Login/Register:** Secure authentication with JWT tokens
- **2FA:** Enable two-factor authentication for extra security
- **Session Management:** Automatic token refresh

### Trading
- **Order Types:** Market and limit orders
- **Real-time Updates:** Live order book and price updates via WebSocket
- **Order Management:** View, cancel, and track your orders
- **Multiple Pairs:** Trade BTC, ETH, BNB, SOL and more

### Wallet
- **Multi-currency:** Support for multiple cryptocurrencies
- **Deposits:** Fund your account
- **Withdrawals:** Withdraw to external wallets
- **Balance Tracking:** Real-time balance updates

### Admin Features
For admin users:
- User management
- KYC approval/rejection
- System statistics
- Platform monitoring

## Common Tasks

### Enable 2FA

1. Go to Settings → Security
2. Click "Enable 2FA"
3. Scan QR code with authenticator app
4. Enter verification code
5. Click "Verify & Enable"

### Deposit Funds

1. Go to Settings → Wallet
2. Click "Deposit"
3. Select currency
4. Enter amount
5. Click "Deposit"

### Place an Order

1. Go to Trade page
2. Select trading pair
3. Choose order type (Market/Limit)
4. Choose side (Buy/Sell)
5. Enter amount and price
6. Click "Buy" or "Sell"

### Cancel an Order

1. Go to Trade page
2. Find your order in "My Orders" table
3. Click "Cancel" button

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000/ws` |

## Troubleshooting

### Cannot connect to backend

**Problem:** API requests fail with network errors

**Solution:**
- Verify backend is running
- Check API URL in `.env` file
- Ensure CORS is configured on backend
- Check browser console for detailed errors

### WebSocket disconnects

**Problem:** Real-time updates stop working

**Solution:**
- Check WebSocket URL in `.env`
- Verify backend WebSocket support
- Check browser console for connection errors
- Check network connectivity

### Build fails

**Problem:** `npm run build` fails with errors

**Solution:**
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Try build again
npm run build
```

### Port already in use

**Problem:** Port 3000 is already in use

**Solution:**
```bash
# Use a different port
PORT=3001 npm run dev

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill
```

## Next Steps

1. **Customize the UI:** Edit Tailwind configuration in `tailwind.config.js`
2. **Add more features:** Extend components in `src/components/`
3. **Configure deployment:** See `DEPLOYMENT.md` for deployment options
4. **Read full documentation:** Check `README.md` for detailed information

## Support

- **Documentation:** See `README.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Issues:** Create an issue on GitHub
- **Backend Setup:** Check backend documentation

## Security Note

⚠️ **Important:** Never commit your `.env` file to version control. It contains sensitive configuration that should remain private.

The `.env.example` file is provided as a template - copy it to `.env` and update with your actual values.

---

Happy trading! 🚀
