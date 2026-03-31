import { useState, useEffect } from 'react';
import { useTrading } from '../hooks/useTrading';
import { useWebSocket } from '../hooks/useWebSocket';

interface TradingProps {
  pair: string;
}

export const Trading = ({ pair }: TradingProps) => {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  
  const { placeOrder, loading, error } = useTrading(pair);
  const { subscribeToTicker } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribeToTicker(pair, (data) => {
      setCurrentPrice(data.price);
      if (orderType === 'market') {
        setPrice(data.price.toString());
      }
    });

    return unsubscribe;
  }, [pair, orderType, subscribeToTicker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await placeOrder(
        orderType,
        side,
        parseFloat(amount),
        orderType === 'limit' ? parseFloat(price) : undefined
      );
      
      setAmount('');
      setPrice('');
      alert('Order placed successfully!');
    } catch (err) {
      console.error('Failed to place order:', err);
    }
  };

  const baseCurrency = pair.split('/')[0];
  const quoteCurrency = pair.split('/')[1];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Place Order</h2>
      
      <div className="flex space-x-2 mb-6">
        <button
          className={`flex-1 py-2 rounded-lg font-medium ${
            side === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setSide('buy')}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-2 rounded-lg font-medium ${
            side === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setSide('sell')}
        >
          Sell
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          className={`flex-1 py-2 rounded-lg ${
            orderType === 'limit' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setOrderType('limit')}
        >
          Limit
        </button>
        <button
          className={`flex-1 py-2 rounded-lg ${
            orderType === 'market' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setOrderType('market')}
        >
          Market
        </button>
      </div>

      {currentPrice > 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="text-xl font-bold">${currentPrice.toFixed(2)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {orderType === 'limit' && (
          <div>
            <label className="label">Price ({quoteCurrency})</label>
            <input
              type="number"
              step="0.01"
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        )}

        <div>
          <label className="label">Amount ({baseCurrency})</label>
          <input
            type="number"
            step="0.00000001"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00000000"
            required
          />
        </div>

        {orderType === 'limit' && price && amount && (
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-bold">
              {(parseFloat(price) * parseFloat(amount)).toFixed(2)} {quoteCurrency}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full btn ${side === 'buy' ? 'btn-success' : 'btn-danger'}`}
        >
          {loading ? 'Placing Order...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${baseCurrency}`}
        </button>
      </form>
    </div>
  );
};
