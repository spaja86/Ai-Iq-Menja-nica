import { useState, useEffect } from 'react';
import { Trading } from '../components/Trading';
import { OrderBook } from '../components/OrderBook';
import { useTrading } from '../hooks/useTrading';
import { useWebSocket } from '../hooks/useWebSocket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AVAILABLE_PAIRS = ['BTC/USD', 'ETH/USD', 'BNB/USD', 'SOL/USD'];

interface Trade {
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

export const Trade = () => {
  const [selectedPair, setSelectedPair] = useState('BTC/USD');
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [priceData, setPriceData] = useState<any[]>([]);
  
  const { getOrders, cancelOrder } = useTrading(selectedPair);
  const { subscribeToTrades, subscribeToUserOrders } = useWebSocket();

  useEffect(() => {
    loadUserOrders();
  }, [selectedPair]);

  useEffect(() => {
    const unsubscribeTrades = subscribeToTrades(selectedPair, (data) => {
      setRecentTrades((prev) => [data, ...prev.slice(0, 19)]);
      setPriceData((prev) => [...prev.slice(-29), { time: new Date().toLocaleTimeString(), price: data.price }]);
    });

    const unsubscribeOrders = subscribeToUserOrders(() => {
      loadUserOrders();
    });

    return () => {
      unsubscribeTrades();
      unsubscribeOrders();
    };
  }, [selectedPair, subscribeToTrades, subscribeToUserOrders]);

  const loadUserOrders = async () => {
    try {
      const orders = await getOrders();
      setUserOrders(orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      loadUserOrders();
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trading</h1>
        <div className="flex space-x-2">
          {AVAILABLE_PAIRS.map((pair) => (
            <button
              key={pair}
              onClick={() => setSelectedPair(pair)}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedPair === pair
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pair}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Price Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Trading pair={selectedPair} />
          
          <div className="card mt-6">
            <h2 className="text-xl font-bold mb-4">My Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Pair</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Side</th>
                    <th className="text-right py-2 px-4">Amount</th>
                    <th className="text-right py-2 px-4">Price</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{order.pair}</td>
                      <td className="py-2 px-4">{order.type}</td>
                      <td className="py-2 px-4">
                        <span className={order.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                          {order.side}
                        </span>
                      </td>
                      <td className="text-right py-2 px-4">{order.amount}</td>
                      <td className="text-right py-2 px-4">${order.price?.toFixed(2) || 'Market'}</td>
                      <td className="py-2 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'filled' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {userOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <OrderBook pair={selectedPair} />
          
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentTrades.map((trade, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                    ${trade.price.toFixed(2)}
                  </span>
                  <span className="text-gray-600">{trade.amount.toFixed(8)}</span>
                  <span className="text-gray-400 text-xs">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
              {recentTrades.length === 0 && (
                <div className="text-center py-4 text-gray-400">No trades yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
