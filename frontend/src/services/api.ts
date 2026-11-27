import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      return {
        message: (error.response.data as any)?.message || 'An error occurred',
        status: error.response.status,
        errors: (error.response.data as any)?.errors,
      };
    }
    return {
      message: error.message || 'Network error',
    };
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, name: string) {
    const response = await this.client.post('/auth/register', { email, password, name });
    return response.data;
  }

  async enable2FA() {
    const response = await this.client.post('/auth/2fa/enable');
    return response.data;
  }

  async verify2FA(code: string) {
    const response = await this.client.post('/auth/2fa/verify', { code });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/user/profile');
    return response.data;
  }

  async getWallets() {
    const response = await this.client.get('/wallets');
    return response.data;
  }

  async getWalletBalance(currency: string) {
    const response = await this.client.get(`/wallets/${currency}`);
    return response.data;
  }

  async createDeposit(currency: string, amount: number) {
    const response = await this.client.post('/deposits', { currency, amount });
    return response.data;
  }

  async createWithdrawal(currency: string, amount: number, address: string) {
    const response = await this.client.post('/withdrawals', { currency, amount, address });
    return response.data;
  }

  async getOrders(params?: { status?: string; pair?: string }) {
    const response = await this.client.get('/orders', { params });
    return response.data;
  }

  async createOrder(data: {
    pair: string;
    type: 'limit' | 'market';
    side: 'buy' | 'sell';
    amount: number;
    price?: number;
  }) {
    const response = await this.client.post('/orders', data);
    return response.data;
  }

  async cancelOrder(orderId: string) {
    const response = await this.client.delete(`/orders/${orderId}`);
    return response.data;
  }

  async getOrderBook(pair: string) {
    const response = await this.client.get(`/orderbook/${pair}`);
    return response.data;
  }

  async getTrades(pair: string, limit = 50) {
    const response = await this.client.get(`/trades/${pair}`, { params: { limit } });
    return response.data;
  }

  async getMarketData(pair: string) {
    const response = await this.client.get(`/market/${pair}`);
    return response.data;
  }

  async submitKYC(data: FormData) {
    const response = await this.client.post('/kyc/submit', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getKYCStatus() {
    const response = await this.client.get('/kyc/status');
    return response.data;
  }

  // Admin endpoints
  async getUsers(params?: { page?: number; limit?: number; status?: string }) {
    const response = await this.client.get('/admin/users', { params });
    return response.data;
  }

  async updateUserStatus(userId: string, status: string) {
    const response = await this.client.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  }

  async getKYCSubmissions(params?: { page?: number; limit?: number; status?: string }) {
    const response = await this.client.get('/admin/kyc', { params });
    return response.data;
  }

  async approveKYC(kycId: string) {
    const response = await this.client.post(`/admin/kyc/${kycId}/approve`);
    return response.data;
  }

  async rejectKYC(kycId: string, reason: string) {
    const response = await this.client.post(`/admin/kyc/${kycId}/reject`, { reason });
    return response.data;
  }

  async getSystemStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }
}

export const api = new ApiService();
export default api;
