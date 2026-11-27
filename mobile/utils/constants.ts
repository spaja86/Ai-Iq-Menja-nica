// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'https://api.cryptoexchange.com',
  WS_URL: process.env.WS_URL || 'wss://api.cryptoexchange.com/ws',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Crypto Exchange',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  ENABLE_LOGS: process.env.NODE_ENV !== 'production',
};

// Feature Flags
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  PUSH_NOTIFICATIONS: true,
  ADVANCED_TRADING: true,
  DARK_MODE: true,
  PRICE_ALERTS: true,
  TWO_FACTOR_AUTH: true,
};

// Trading Configuration
export const TRADING_CONFIG = {
  MIN_ORDER_SIZE: 0.0001,
  MAX_ORDER_SIZE: 1000,
  DEFAULT_PRICE_DECIMALS: 2,
  DEFAULT_AMOUNT_DECIMALS: 8,
  ORDER_BOOK_DEPTH: 20,
  RECENT_TRADES_LIMIT: 50,
  REFRESH_INTERVAL: 5000, // ms
};

// Wallet Configuration
export const WALLET_CONFIG = {
  SHOW_ZERO_BALANCES: false,
  DEFAULT_CURRENCY: 'USD',
  TRANSACTION_HISTORY_LIMIT: 50,
  MIN_WITHDRAWAL_AMOUNT: 0.001,
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  ENABLED: true,
  SOUND: true,
  BADGE: true,
  VIBRATE: true,
};

// Security Configuration
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  BIOMETRIC_CREDENTIALS: 'biometric_credentials',
  THEME: 'theme',
  LANGUAGE: 'language',
  CURRENCY: 'currency',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
};

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  PRICE_UPDATE: 'price_update',
  ORDER_UPDATE: 'order_update',
  TRADE_UPDATE: 'trade_update',
  BALANCE_UPDATE: 'balance_update',
};

export default {
  API_CONFIG,
  APP_CONFIG,
  FEATURES,
  TRADING_CONFIG,
  WALLET_CONFIG,
  NOTIFICATION_CONFIG,
  SECURITY_CONFIG,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  WS_EVENTS,
};
