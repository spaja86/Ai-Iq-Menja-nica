# Component Architecture

## Directory Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Trading.tsx      # Order placement form
│   │   ├── OrderBook.tsx    # Order book visualization
│   │   ├── Wallet.tsx       # Wallet management UI
│   │   ├── KYC.tsx          # KYC verification form
│   │   └── Admin.tsx        # Admin dashboard
│   │
│   ├── pages/               # Route-level pages
│   │   ├── Login.tsx        # Authentication page
│   │   ├── Dashboard.tsx    # User dashboard
│   │   ├── Trade.tsx        # Trading interface
│   │   └── Settings.tsx     # User settings
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication state & actions
│   │   ├── useWebSocket.ts  # WebSocket subscriptions
│   │   └── useTrading.ts    # Trading operations
│   │
│   ├── services/            # External services
│   │   ├── api.ts           # REST API client
│   │   └── ws.ts            # WebSocket service
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # All type exports
│   │
│   ├── App.tsx              # Main app component & routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles & Tailwind
│
├── public/                  # Static assets
├── dist/                    # Production build output
└── Configuration files...
```

## Component Hierarchy

```
App
├── AuthProvider
│   └── Layout
│       ├── Navigation
│       │   ├── Logo
│       │   ├── NavLinks
│       │   └── UserMenu
│       │
│       └── Routes
│           ├── Login
│           │   ├── LoginForm
│           │   └── RegisterForm
│           │
│           ├── Dashboard
│           │   ├── BalanceCard
│           │   ├── PerformanceChart
│           │   ├── TopBalances
│           │   └── RecentOrders
│           │
│           ├── Trade
│           │   ├── PairSelector
│           │   ├── PriceChart
│           │   ├── Trading (Component)
│           │   │   ├── OrderTypeSelector
│           │   │   ├── OrderForm
│           │   │   └── OrderSummary
│           │   ├── OrderBook (Component)
│           │   │   ├── AsksTable
│           │   │   ├── SpreadIndicator
│           │   │   └── BidsTable
│           │   ├── MyOrders
│           │   └── RecentTrades
│           │
│           └── Settings
│               ├── TabNavigation
│               ├── ProfileTab
│               ├── WalletTab (Uses Wallet Component)
│               │   ├── BalanceTable
│               │   ├── DepositModal
│               │   └── WithdrawModal
│               ├── KYCTab (Uses KYC Component)
│               │   ├── PersonalInfoForm
│               │   ├── AddressForm
│               │   ├── DocumentUpload
│               │   └── StatusDisplay
│               ├── SecurityTab
│               │   ├── 2FASetup
│               │   └── PasswordChange
│               └── AdminTab (Uses Admin Component)
│                   ├── StatsCards
│                   ├── UsersTable
│                   └── KYCReviewTable
```

## Data Flow

### Authentication Flow
```
Login Page
    ↓
useAuth Hook
    ↓
api.login()
    ↓
Store JWT in localStorage
    ↓
Set user state
    ↓
Connect WebSocket
    ↓
Redirect to Dashboard
```

### Trading Flow
```
Trade Page
    ↓
Select Trading Pair
    ↓
useTrading Hook
    ↓
Subscribe to WebSocket (Order Book, Trades)
    ↓
Real-time Updates
    ↓
User Places Order
    ↓
api.createOrder()
    ↓
WebSocket Notification
    ↓
Update Order List
```

### WebSocket Flow
```
User Login
    ↓
wsService.connect(token)
    ↓
Subscribe to Channels
    ├── Order Book
    ├── Trades
    ├── Ticker
    ├── User Orders
    └── User Trades
    ↓
Receive Messages
    ↓
useWebSocket Hook
    ↓
Update Component State
    ↓
Re-render UI
```

## State Management

### Global State (Context)
- **AuthContext**: User authentication state, login/logout methods
- Shared across all components via `useAuth` hook

### Local State (Component)
- Form inputs
- Loading states
- Error messages
- UI toggles (modals, tabs, etc.)

### Server State (API)
- Fetched via `api.ts` service
- Cached in component state
- Updated via WebSocket subscriptions

## Key Patterns

### Custom Hooks Pattern
```typescript
// useTrading.ts
export const useTrading = (pair: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = async (...) => {
    // Implementation
  };

  return { loading, error, placeOrder, ... };
};
```

### Protected Route Pattern
```typescript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};
```

### WebSocket Subscription Pattern
```typescript
useEffect(() => {
  const unsubscribe = subscribeToOrderBook(pair, (data) => {
    setOrderBook(data);
  });
  
  return unsubscribe; // Cleanup on unmount
}, [pair]);
```

## Component Communication

### Parent-Child
- Props for data down
- Callbacks for events up

### Sibling Components
- Lift state to common parent
- Use Context for deeply nested data

### Cross-Component
- Context API for authentication
- WebSocket service for real-time data
- API service for CRUD operations

## Styling Architecture

### Tailwind Utility Classes
- Inline utilities for one-off styles
- Component variants (btn-primary, btn-secondary)

### Custom Components (CSS)
```css
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Grid layouts for complex UIs

## Performance Optimizations

1. **Code Splitting**: React Router automatic splitting
2. **Memoization**: Consider React.memo for expensive components
3. **WebSocket Efficiency**: Single connection, multiple subscriptions
4. **Debouncing**: For search/filter inputs
5. **Virtual Scrolling**: For long lists (if needed)

## Error Handling

### API Errors
```typescript
try {
  await api.someAction();
} catch (err: any) {
  setError(err.message);
  // Display error to user
}
```

### WebSocket Errors
- Automatic reconnection with exponential backoff
- Error state in component
- Fallback to polling if WebSocket fails

### Form Validation
- HTML5 validation attributes
- Custom validation logic
- Display inline error messages

## Testing Strategy

### Unit Tests
- Test custom hooks
- Test utility functions
- Test API service methods

### Integration Tests
- Test component interactions
- Test form submissions
- Test navigation flows

### E2E Tests
- Test complete user journeys
- Test critical paths (login, trade, withdraw)

## Future Enhancements

1. **State Management Library**: Consider Redux Toolkit or Zustand for complex state
2. **React Query**: For better server state management
3. **Form Library**: React Hook Form for complex forms
4. **Animation Library**: Framer Motion for transitions
5. **Chart Improvements**: TradingView charts for advanced analysis
6. **Internationalization**: i18next for multi-language support
7. **Progressive Web App**: Service workers for offline support
8. **Advanced Charts**: Candlestick charts, volume charts
9. **Notifications**: Toast notifications for events
10. **Dark Mode**: Theme switcher

## Dependencies Overview

### Core
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool

### Routing
- **React Router**: Client-side routing

### Styling
- **Tailwind CSS**: Utility-first CSS
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

### Data & API
- **Axios**: HTTP client
- **WebSocket API**: Real-time updates

### Charts
- **Recharts**: React chart library

### Development
- **ESLint**: Code linting
- **TypeScript ESLint**: TS-specific linting
- **Vite plugins**: React support

## Best Practices

1. **TypeScript**: Use strict mode, avoid `any`
2. **Components**: Keep them small and focused
3. **Hooks**: Extract reusable logic into custom hooks
4. **Props**: Use TypeScript interfaces for prop types
5. **Error Handling**: Always handle errors gracefully
6. **Loading States**: Show loading indicators for async operations
7. **Security**: Never store sensitive data in localStorage (except JWT)
8. **Accessibility**: Use semantic HTML, ARIA labels
9. **Performance**: Avoid unnecessary re-renders
10. **Code Style**: Follow consistent naming conventions
