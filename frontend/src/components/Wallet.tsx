import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Balance {
  currency: string;
  available: number;
  locked: number;
  total: number;
}

export const Wallet = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    try {
      setLoading(true);
      const data = await api.getWallets();
      setBalances(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDeposit(selectedCurrency, parseFloat(amount));
      alert('Deposit request submitted successfully!');
      setShowDeposit(false);
      setAmount('');
      loadBalances();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWithdrawal(selectedCurrency, parseFloat(amount), address);
      alert('Withdrawal request submitted successfully!');
      setShowWithdraw(false);
      setAmount('');
      setAddress('');
      loadBalances();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">Loading wallets...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Wallets</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowDeposit(true)}
            className="btn btn-primary"
          >
            Deposit
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="btn btn-secondary"
          >
            Withdraw
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Currency</th>
              <th className="text-right py-3 px-4">Available</th>
              <th className="text-right py-3 px-4">Locked</th>
              <th className="text-right py-3 px-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance) => (
              <tr key={balance.currency} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{balance.currency}</td>
                <td className="text-right py-3 px-4">{balance.available.toFixed(8)}</td>
                <td className="text-right py-3 px-4 text-gray-500">{balance.locked.toFixed(8)}</td>
                <td className="text-right py-3 px-4 font-bold">{balance.total.toFixed(8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Deposit</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="label">Currency</label>
                <select
                  className="input"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  required
                >
                  <option value="">Select currency</option>
                  {balances.map((b) => (
                    <option key={b.currency} value={b.currency}>
                      {b.currency}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  step="0.00000001"
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="btn btn-primary flex-1">
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeposit(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Withdraw</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="label">Currency</label>
                <select
                  className="input"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  required
                >
                  <option value="">Select currency</option>
                  {balances.map((b) => (
                    <option key={b.currency} value={b.currency}>
                      {b.currency}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  step="0.00000001"
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Withdrawal Address</label>
                <input
                  type="text"
                  className="input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter withdrawal address"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="btn btn-primary flex-1">
                  Withdraw
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
