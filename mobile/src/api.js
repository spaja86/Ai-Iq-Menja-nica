/**
 * API Client for Ai IQ Menjačnica Exchange
 * Handles all API requests with authentication
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;

          await AsyncStorage.setItem('access_token', access_token);
          await AsyncStorage.setItem('refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        // Navigate to login screen
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password, fullName) => 
    api.post('/auth/register', { email, password, full_name: fullName }),
  
  login: (email, password, totpCode = null) =>
    api.post('/auth/login', { email, password, totp_code: totpCode }),
  
  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  },
};

// Market API
export const marketAPI = {
  getAssets: () => api.get('/market/assets'),
  getMarkets: () => api.get('/market/markets'),
  getMarket: (marketId) => api.get(`/market/markets/${marketId}`),
  getOrderbook: (marketId, depth = 20) => 
    api.get(`/market/markets/${marketId}/orderbook?depth=${depth}`),
};

// Trading API
export const tradingAPI = {
  getBalances: () => api.get('/trading/balances'),
  
  createOrder: (orderData) => api.post('/trading/orders', orderData),
  
  getOrders: (marketId = null, status = null) => {
    let url = '/trading/orders?';
    if (marketId) url += `market_id=${marketId}&`;
    if (status) url += `status=${status}&`;
    return api.get(url);
  },
  
  getOrder: (orderId) => api.get(`/trading/orders/${orderId}`),
  
  cancelOrder: (orderId) => api.delete(`/trading/orders/${orderId}`),
  
  getTrades: (marketId = null) => {
    let url = '/trading/trades?';
    if (marketId) url += `market_id=${marketId}&`;
    return api.get(url);
  },
};

export default api;
