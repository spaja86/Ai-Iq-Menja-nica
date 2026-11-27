// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  twoFactorEnabled: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  requiresTwoFactor?: boolean;
  user?: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Trading types
export interface Order {
  id: string;
  userId: string;
  pair: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  filled: number;
  remaining: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  orderId: string;
  pair: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
  maker: string;
  taker: string;
}

export interface OrderBook {
  pair: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: string;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface Ticker {
  pair: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: string;
}

// Wallet types
export interface Balance {
  currency: string;
  available: number;
  locked: number;
  total: number;
  usdValue?: number;
}

export interface Deposit {
  id: string;
  userId: string;
  currency: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  currency: string;
  amount: number;
  address: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
}

// KYC types
export interface KYCSubmission {
  id: string;
  userId: string;
  userEmail?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  idDocument?: string;
  proofOfAddress?: string;
  selfie?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

// Admin types
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  pendingKYC: number;
  totalVolume: number;
  totalOrders: number;
  totalTrades: number;
}

// WebSocket message types
export interface WSMessage {
  type: string;
  data: any;
}

export interface WSSubscription {
  channel: string;
  pair?: string;
}

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
}

export interface OrderFormData {
  pair: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  amount: string;
  price?: string;
}

export interface KYCFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Chart data types
export interface ChartDataPoint {
  timestamp: string;
  price: number;
  volume?: number;
}

export interface CandlestickData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
