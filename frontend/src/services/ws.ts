const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  connect(token: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(`${WS_URL}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, data } = message;

        const handlers = this.handlers.get(type);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }

        const allHandlers = this.handlers.get('*');
        if (allHandlers) {
          allHandlers.forEach((handler) => handler(message));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(token);
    };
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting to reconnect in ${delay}ms...`);
    this.reconnectTimeout = setTimeout(() => {
      this.connect(token);
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.handlers.clear();
  }

  subscribe(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => this.unsubscribe(type, handler);
  }

  unsubscribe(type: string, handler: MessageHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    }
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  subscribeToOrderBook(pair: string, handler: MessageHandler) {
    this.send('subscribe', { channel: 'orderbook', pair });
    return this.subscribe('orderbook', handler);
  }

  subscribeToTrades(pair: string, handler: MessageHandler) {
    this.send('subscribe', { channel: 'trades', pair });
    return this.subscribe('trades', handler);
  }

  subscribeToTicker(pair: string, handler: MessageHandler) {
    this.send('subscribe', { channel: 'ticker', pair });
    return this.subscribe('ticker', handler);
  }

  subscribeToUserOrders(handler: MessageHandler) {
    this.send('subscribe', { channel: 'user_orders' });
    return this.subscribe('user_orders', handler);
  }

  subscribeToUserTrades(handler: MessageHandler) {
    this.send('subscribe', { channel: 'user_trades' });
    return this.subscribe('user_trades', handler);
  }
}

export const wsService = new WebSocketService();
export default wsService;
