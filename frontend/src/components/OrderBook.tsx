import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface OrderBookProps {
  pair: string;
}

interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export const OrderBook = ({ pair }: OrderBookProps) => {
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const { subscribeToOrderBook } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribeToOrderBook(pair, (data) => {
      if (data.bids) {
        setBids(data.bids.slice(0, 15));
      }
      if (data.asks) {
        setAsks(data.asks.slice(0, 15));
      }
    });

    return unsubscribe;
  }, [pair, subscribeToOrderBook]);

  const renderOrderLevel = (level: OrderBookLevel, isBid: boolean) => {
    const maxTotal = Math.max(...bids.map(b => b.total), ...asks.map(a => a.total));
    const percentage = (level.total / maxTotal) * 100;

    return (
      <div
        key={`${level.price}-${level.amount}`}
        className="relative flex justify-between py-1 px-2 text-sm hover:bg-gray-100"
      >
        <div
          className={`absolute inset-0 ${isBid ? 'bg-green-100' : 'bg-red-100'} opacity-30`}
          style={{ width: `${percentage}%` }}
        />
        <span className={`relative z-10 ${isBid ? 'text-green-600' : 'text-red-600'} font-medium`}>
          {level.price.toFixed(2)}
        </span>
        <span className="relative z-10 text-gray-700">{level.amount.toFixed(8)}</span>
        <span className="relative z-10 text-gray-500">{level.total.toFixed(8)}</span>
      </div>
    );
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Order Book</h2>
      
      <div className="flex justify-between px-2 mb-2 text-xs text-gray-500 font-medium">
        <span>Price</span>
        <span>Amount</span>
        <span>Total</span>
      </div>

      <div className="space-y-px">
        <div className="max-h-64 overflow-y-auto">
          {asks.length > 0 ? (
            [...asks].reverse().map((ask) => renderOrderLevel(ask, false))
          ) : (
            <div className="text-center py-4 text-gray-400">No asks</div>
          )}
        </div>

        <div className="py-3 px-2 bg-gray-100 font-bold text-center">
          {asks.length > 0 && bids.length > 0 ? (
            <span className="text-lg">
              ${((asks[0]?.price + bids[0]?.price) / 2).toFixed(2)}
            </span>
          ) : (
            <span className="text-gray-400">--</span>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto">
          {bids.length > 0 ? (
            bids.map((bid) => renderOrderLevel(bid, true))
          ) : (
            <div className="text-center py-4 text-gray-400">No bids</div>
          )}
        </div>
      </div>
    </div>
  );
};
