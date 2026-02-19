import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Balance {
  currency: string;
  total: number;
  usdValue: number;
}

interface RecentOrder {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  status: string;
  createdAt: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [walletsData, ordersData] = await Promise.all([
        api.getWallets(),
        api.getOrders({ status: 'all' }),
      ]);

      setBalances(walletsData.slice(0, 5));
      setRecentOrders(ordersData.slice(0, 5));
      
      const total = walletsData.reduce((sum: number, b: any) => sum + (b.usdValue || 0), 0);
      setTotalBalance(total);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const mockChartData = [
    { date: '1/1', value: 10000 },
    { date: '1/2', value: 12000 },
    { date: '1/3', value: 11500 },
    { date: '1/4', value: 13000 },
    { date: '1/5', value: 14500 },
    { date: '1/6', value: 13800 },
    { date: '1/7', value: 15200 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Here's your trading overview</p>
        </div>
        <Link to="/trade" className="btn btn-primary">
          Start Trading
        </Link>
      </div>

      {user?.kycStatus === 'not_submitted' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-1">Complete KYC Verification</h3>
          <p className="text-yellow-700 text-sm mb-2">
            Verify your identity to unlock full trading features and higher limits.
          </p>
          <Link to="/settings" className="text-yellow-800 font-medium hover:underline">
            Complete KYC →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-2">Total Balance</h3>
          <p className="text-3xl font-bold">${totalBalance.toLocaleString()}</p>
          <p className="text-green-600 text-sm mt-2">+12.5% this month</p>
        </div>
        
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-2">24h Volume</h3>
          <p className="text-3xl font-bold">$45,230</p>
          <p className="text-gray-500 text-sm mt-2">Across all pairs</p>
        </div>
        
        <div className="card">
          <h3 className="text-gray-600 text-sm mb-2">Open Orders</h3>
          <p className="text-3xl font-bold">{recentOrders.filter(o => o.status === 'pending').length}</p>
          <p className="text-gray-500 text-sm mt-2">Active trades</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Top Balances</h2>
            <Link to="/wallet" className="text-primary-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {balances.map((balance) => (
              <div key={balance.currency} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{balance.currency}</p>
                  <p className="text-sm text-gray-500">{balance.total.toFixed(8)}</p>
                </div>
                <p className="font-bold">${balance.usdValue?.toFixed(2) || '0.00'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link to="/trade" className="text-primary-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.pair}</p>
                  <p className="text-sm text-gray-500">
                    {order.side === 'buy' ? '📈' : '📉'} {order.amount} @ ${order.price}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  order.status === 'filled' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
