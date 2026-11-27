import { useEffect, useCallback } from 'react';
import { wsService, MessageHandler } from '../services/ws';

export const useWebSocket = () => {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      wsService.connect(token);
    }

    return () => {
      // Don't disconnect on unmount, only when user logs out
    };
  }, []);

  const subscribe = useCallback((type: string, handler: MessageHandler) => {
    return wsService.subscribe(type, handler);
  }, []);

  const send = useCallback((type: string, data: any) => {
    wsService.send(type, data);
  }, []);

  const subscribeToOrderBook = useCallback((pair: string, handler: MessageHandler) => {
    return wsService.subscribeToOrderBook(pair, handler);
  }, []);

  const subscribeToTrades = useCallback((pair: string, handler: MessageHandler) => {
    return wsService.subscribeToTrades(pair, handler);
  }, []);

  const subscribeToTicker = useCallback((pair: string, handler: MessageHandler) => {
    return wsService.subscribeToTicker(pair, handler);
  }, []);

  const subscribeToUserOrders = useCallback((handler: MessageHandler) => {
    return wsService.subscribeToUserOrders(handler);
  }, []);

  const subscribeToUserTrades = useCallback((handler: MessageHandler) => {
    return wsService.subscribeToUserTrades(handler);
  }, []);

  return {
    subscribe,
    send,
    subscribeToOrderBook,
    subscribeToTrades,
    subscribeToTicker,
    subscribeToUserOrders,
    subscribeToUserTrades,
  };
};
