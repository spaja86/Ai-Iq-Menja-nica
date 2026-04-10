// User & Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export interface BiometricAuthConfig {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | null;
}

// Crypto & Trading Types
export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  icon?: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply?: number;
  rank: number;
}

export interface TradingPair {
  id: string;
  baseAsset: string;
  quoteAsset: string;
  symbol: string;
  lastPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  bid: number;
  ask: number;
}

export interface OrderBook {
  bids: [number, number][]; // [price, quantity]
  asks: [number, number][];
  lastUpdateId: number;
}

export interface Trade {
  id: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

export type OrderType = 'market' | 'limit' | 'stop-limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'open' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  price?: number;
  stopPrice?: number;
  quantity: number;
  filledQuantity: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  fee?: number;
  feeAsset?: string;
}

export interface CreateOrderParams {
  symbol: string;
  type: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  stopPrice?: number;
}

// Wallet & Balance Types
export interface WalletBalance {
  asset: string;
  available: number;
  locked: number;
  total: number;
  usdValue: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee';
  asset: string;
  amount: number;
  fee?: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: string;
  txHash?: string;
  address?: string;
  memo?: string;
}

export interface DepositAddress {
  asset: string;
  address: string;
  memo?: string;
  network: string;
}

export interface WithdrawalParams {
  asset: string;
  address: string;
  amount: number;
  network: string;
  memo?: string;
  twoFactorCode?: string;
}

// Chart & Market Data Types
export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

export interface MarketStats {
  symbol: string;
  priceChange: number;
  priceChangePercent: number;
  weightedAvgPrice: number;
  prevClosePrice: number;
  lastPrice: number;
  lastQty: number;
  bidPrice: number;
  askPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  openTime: number;
  closeTime: number;
  count: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'trade' | 'deposit' | 'withdrawal' | 'security' | 'announcement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface PushNotificationSettings {
  enabled: boolean;
  tradeExecuted: boolean;
  depositReceived: boolean;
  withdrawalCompleted: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
  announcements: boolean;
}

// Settings Types
export interface UserSettings {
  language: string;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  biometricAuth: BiometricAuthConfig;
  pushNotifications: PushNotificationSettings;
  tradingPreferences: {
    defaultOrderType: OrderType;
    confirmOrders: boolean;
    showAdvancedOptions: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Trade: { symbol?: string };
  Wallet: undefined;
  Settings: undefined;
  OrderDetails: { orderId: string };
  TransactionDetails: { transactionId: string };
  Deposit: { asset?: string };
  Withdrawal: { asset?: string };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Trade: undefined;
  Wallet: undefined;
  Settings: undefined;
};

// Store Types (Zustand)
export interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export interface MarketStore {
  selectedPair: TradingPair | null;
  pairs: TradingPair[];
  orderBook: OrderBook | null;
  recentTrades: Trade[];
  isLoading: boolean;
  error: string | null;
  fetchPairs: () => Promise<void>;
  selectPair: (symbol: string) => Promise<void>;
  fetchOrderBook: (symbol: string) => Promise<void>;
  fetchRecentTrades: (symbol: string) => Promise<void>;
}

export interface WalletStore {
  balances: WalletBalance[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchBalances: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  deposit: (asset: string) => Promise<DepositAddress>;
  withdraw: (params: WithdrawalParams) => Promise<void>;
}

export interface OrderStore {
  orders: Order[];
  activeOrders: Order[];
  orderHistory: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (params: CreateOrderParams) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
}
