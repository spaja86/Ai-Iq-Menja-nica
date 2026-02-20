import { useState, useCallback } from 'react';
import { api } from '../services/api';

export interface Order {
  id: string;
  pair: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  filled: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  createdAt: string;
}

export const useTrading = (pair: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = useCallback(async (
    type: 'limit' | 'market',
    side: 'buy' | 'sell',
    amount: number,
    price?: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const order = await api.createOrder({
        pair,
        type,
        side,
        amount,
        price,
      });
      return order;
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pair]);

  const cancelOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.cancelOrder(orderId);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrders = useCallback(async (filters?: { status?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const orders = await api.getOrders({ ...filters, pair });
      return orders;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pair]);

  const getOrderBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orderBook = await api.getOrderBook(pair);
      return orderBook;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order book');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pair]);

  const getTrades = useCallback(async (limit = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const trades = await api.getTrades(pair, limit);
      return trades;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trades');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pair]);

  return {
    loading,
    error,
    placeOrder,
    cancelOrder,
    getOrders,
    getOrderBook,
    getTrades,
  };
};
