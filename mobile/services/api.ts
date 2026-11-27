import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import {
  ApiResponse,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  User,
  TradingPair,
  OrderBook,
  Trade,
  CreateOrderParams,
  Order,
  WalletBalance,
  Transaction,
  DepositAddress,
  WithdrawalParams,
  CandlestickData,
  TimeInterval,
  MarketStats,
  Notification,
  UserSettings,
} from '../types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://api.cryptoexchange.com';

class ApiService {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.handleTokenRefresh();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            await this.clearTokens();
            throw refreshError;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async handleTokenRefresh(): Promise<string> {
    if (!this.refreshTokenPromise) {
      this.refreshTokenPromise = (async () => {
        try {
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          if (!refreshToken) throw new Error('No refresh token available');

          const response = await axios.post<ApiResponse<AuthTokens>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          if (response.data.success && response.data.data) {
            await this.saveTokens(response.data.data);
            return response.data.data.accessToken;
          }
          throw new Error('Token refresh failed');
        } finally {
          this.refreshTokenPromise = null;
        }
      })();
    }
    return this.refreshTokenPromise;
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const message = (error.response.data as any)?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }

  // Token management
  private async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('accessToken');
  }

  private async saveTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
  }

  private async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }

  // Authentication APIs
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/login',
      credentials
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Login failed');
    }
    await this.saveTokens(response.data.data.tokens);
    return response.data.data;
  }

  async register(credentials: RegisterCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/register',
      credentials
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Registration failed');
    }
    await this.saveTokens(response.data.data.tokens);
    return response.data.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/auth/me');
    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to fetch user data');
    }
    return response.data.data;
  }

  // Market Data APIs
  async getTradingPairs(): Promise<TradingPair[]> {
    const response = await this.client.get<ApiResponse<TradingPair[]>>('/market/pairs');
    return response.data.data || [];
  }

  async getTradingPair(symbol: string): Promise<TradingPair> {
    const response = await this.client.get<ApiResponse<TradingPair>>(`/market/pairs/${symbol}`);
    if (!response.data.data) throw new Error('Trading pair not found');
    return response.data.data;
  }

  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBook> {
    const response = await this.client.get<ApiResponse<OrderBook>>(`/market/orderbook/${symbol}`, {
      params: { limit },
    });
    if (!response.data.data) throw new Error('Failed to fetch order book');
    return response.data.data;
  }

  async getRecentTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
    const response = await this.client.get<ApiResponse<Trade[]>>(`/market/trades/${symbol}`, {
      params: { limit },
    });
    return response.data.data || [];
  }

  async getCandlestickData(
    symbol: string,
    interval: TimeInterval,
    limit: number = 100
  ): Promise<CandlestickData[]> {
    const response = await this.client.get<ApiResponse<CandlestickData[]>>(
      `/market/klines/${symbol}`,
      { params: { interval, limit } }
    );
    return response.data.data || [];
  }

  async getMarketStats(symbol: string): Promise<MarketStats> {
    const response = await this.client.get<ApiResponse<MarketStats>>(`/market/stats/${symbol}`);
    if (!response.data.data) throw new Error('Failed to fetch market stats');
    return response.data.data;
  }

  // Trading APIs
  async createOrder(params: CreateOrderParams): Promise<Order> {
    const response = await this.client.post<ApiResponse<Order>>('/trading/orders', params);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create order');
    }
    return response.data.data;
  }

  async getOrders(status?: string): Promise<Order[]> {
    const response = await this.client.get<ApiResponse<Order[]>>('/trading/orders', {
      params: { status },
    });
    return response.data.data || [];
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await this.client.get<ApiResponse<Order>>(`/trading/orders/${orderId}`);
    if (!response.data.data) throw new Error('Order not found');
    return response.data.data;
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.client.delete(`/trading/orders/${orderId}`);
  }

  // Wallet APIs
  async getBalances(): Promise<WalletBalance[]> {
    const response = await this.client.get<ApiResponse<WalletBalance[]>>('/wallet/balances');
    return response.data.data || [];
  }

  async getTransactions(limit: number = 50): Promise<Transaction[]> {
    const response = await this.client.get<ApiResponse<Transaction[]>>('/wallet/transactions', {
      params: { limit },
    });
    return response.data.data || [];
  }

  async getDepositAddress(asset: string, network: string = 'mainnet'): Promise<DepositAddress> {
    const response = await this.client.get<ApiResponse<DepositAddress>>(
      `/wallet/deposit-address/${asset}`,
      { params: { network } }
    );
    if (!response.data.data) throw new Error('Failed to get deposit address');
    return response.data.data;
  }

  async withdraw(params: WithdrawalParams): Promise<Transaction> {
    const response = await this.client.post<ApiResponse<Transaction>>('/wallet/withdraw', params);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Withdrawal failed');
    }
    return response.data.data;
  }

  // Notifications APIs
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const response = await this.client.get<ApiResponse<Notification[]>>('/notifications', {
      params: { limit },
    });
    return response.data.data || [];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.client.patch(`/notifications/${notificationId}/read`);
  }

  // Settings APIs
  async getSettings(): Promise<UserSettings> {
    const response = await this.client.get<ApiResponse<UserSettings>>('/settings');
    if (!response.data.data) throw new Error('Failed to fetch settings');
    return response.data.data;
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await this.client.patch<ApiResponse<UserSettings>>('/settings', settings);
    if (!response.data.data) throw new Error('Failed to update settings');
    return response.data.data;
  }
}

export default new ApiService();
