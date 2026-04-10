# Crypto Exchange Frontend

A modern, production-ready React + TypeScript + Vite frontend for a cryptocurrency exchange platform.

## Features

- 🔐 **Authentication & Security**
  - JWT-based authentication
  - Two-factor authentication (2FA) support
  - Protected routes and role-based access control

- 📊 **Trading Interface**
  - Real-time order book visualization
  - Live price charts with Recharts
  - Market and limit order placement
  - Order management and cancellation

- 💼 **Wallet Management**
  - Multi-currency wallet support
  - Deposit and withdrawal functionality
  - Real-time balance updates

- ✅ **KYC Verification**
  - Complete KYC form submission
  - Document upload support
  - Status tracking

- 👨‍💼 **Admin Dashboard**
  - User management
  - KYC approval/rejection
  - System statistics
  - Transaction monitoring

- 🔄 **Real-time Updates**
  - WebSocket integration for live data
  - Order book updates
  - Trade notifications
  - Price ticker

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Recharts** - Charting library
- **WebSocket** - Real-time communication

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Trading.tsx     # Trading order form
│   │   ├── OrderBook.tsx   # Order book display
│   │   ├── Wallet.tsx      # Wallet management
│   │   ├── KYC.tsx         # KYC verification form
│   │   └── Admin.tsx       # Admin dashboard
│   ├── pages/              # Page components
│   │   ├── Login.tsx       # Login/Register page
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── Trade.tsx       # Trading page
│   │   └── Settings.tsx    # Settings page
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication hook
│   │   ├── useWebSocket.ts # WebSocket hook
│   │   └── useTrading.ts   # Trading operations hook
│   ├── services/           # API and services
│   │   ├── api.ts          # API client
│   │   └── ws.ts           # WebSocket service
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind config
└── .env.example            # Environment variables template
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Running backend API (default: http://localhost:8000)

## Installation

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the API URLs:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_WS_URL=ws://localhost:8000/ws
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **The build output will be in the `dist/` directory**

3. **Preview the production build**
   ```bash
   npm run preview
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:8000/ws` |

## Features Details

### Authentication

- Login and registration with email/password
- 2FA setup and verification
- JWT token management
- Automatic token refresh
- Protected routes

### Trading

- Multiple trading pairs (BTC/USD, ETH/USD, etc.)
- Market and limit orders
- Real-time order book
- Live price charts
- Order history and management
- Trade history

### Wallet

- View balances for all currencies
- Deposit funds
- Withdraw funds
- Transaction history
- Real-time balance updates via WebSocket

### KYC

- Multi-step verification form
- Document upload (ID, proof of address, selfie)
- Status tracking (pending, approved, rejected)
- Admin review interface

### Admin Panel

- User management (view, activate, suspend)
- KYC review and approval
- System statistics
- Platform monitoring

## API Integration

The frontend communicates with the backend API using:

- **REST API** for CRUD operations
- **WebSocket** for real-time updates

All API calls are centralized in `src/services/api.ts` with automatic:
- JWT token injection
- Error handling
- Request/response interceptors

## WebSocket Events

The application subscribes to these WebSocket events:

- `orderbook` - Order book updates
- `trades` - Recent trades
- `ticker` - Price ticker
- `user_orders` - User's order updates
- `user_trades` - User's trade notifications

## Styling

The application uses Tailwind CSS with custom utility classes:

- `.btn` - Base button styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.btn-success` - Success button (buy)
- `.btn-danger` - Danger button (sell)
- `.input` - Form input
- `.card` - Card container
- `.label` - Form label

## TypeScript

The project is fully typed with TypeScript for:

- Type safety
- Better IDE support
- Reduced runtime errors
- Enhanced maintainability

## Error Handling

- API errors are caught and displayed to users
- Loading states for all async operations
- Form validation
- WebSocket reconnection logic

## Security Best Practices

- JWT tokens stored in localStorage
- Automatic logout on 401 responses
- CSRF protection
- Input sanitization
- Secure WebSocket connections

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React Router
- Lazy loading of components
- Optimized bundle size with Vite
- Efficient re-renders with React hooks
- WebSocket connection pooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checking
5. Submit a pull request

## Troubleshooting

### Cannot connect to backend
- Ensure backend is running on the correct port
- Check CORS settings on the backend
- Verify `.env` file configuration

### WebSocket disconnects frequently
- Check network stability
- Verify WebSocket URL in `.env`
- Ensure backend supports WebSocket connections

### Build fails
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf .vite`
- Check Node.js version compatibility

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Contact support team
- Check documentation at `/docs`
