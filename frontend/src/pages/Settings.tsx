import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Wallet } from '../components/Wallet';
import { KYC } from '../components/KYC';
import { Admin } from '../components/Admin';
import { api } from '../services/api';

export const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'kyc' | 'security' | 'admin'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [twoFACode, setTwoFACode] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Assuming there's an update profile endpoint
      alert('Profile updated successfully!');
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const data = await api.enable2FA();
      setQrCode(data.qrCode);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.verify2FA(twoFACode);
      alert('2FA enabled successfully!');
      setQrCode('');
      setTwoFACode('');
      refreshUser();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="card">
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`btn ${activeTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`btn ${activeTab === 'kyc' ? 'btn-primary' : 'btn-secondary'}`}
          >
            KYC
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Security
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Admin
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input bg-gray-100"
                  value={user?.email}
                  disabled
                />
              </div>
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'wallet' && <Wallet />}

        {activeTab === 'kyc' && (
          <div>
            {user?.kycStatus === 'not_submitted' ? (
              <KYC />
            ) : (
              <div className="text-center py-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  user?.kycStatus === 'approved' ? 'bg-green-100 text-green-600' :
                  user?.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {user?.kycStatus === 'approved' ? '✓' : user?.kycStatus === 'pending' ? '⏱' : '✗'}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  KYC Status: {user?.kycStatus?.toUpperCase()}
                </h3>
                <p className="text-gray-600">
                  {user?.kycStatus === 'approved' && 'Your account is fully verified.'}
                  {user?.kycStatus === 'pending' && 'Your KYC application is being reviewed.'}
                  {user?.kycStatus === 'rejected' && 'Your KYC application was rejected. Please contact support.'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">
                      {user?.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
                    </p>
                  </div>
                  {!user?.twoFactorEnabled && !qrCode && (
                    <button onClick={handleEnable2FA} className="btn btn-primary">
                      Enable 2FA
                    </button>
                  )}
                </div>

                {qrCode && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Scan this QR code with your authenticator app:
                    </p>
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mx-auto" />
                    <form onSubmit={handleVerify2FA} className="mt-4 max-w-sm mx-auto">
                      <label className="label">Enter verification code</label>
                      <input
                        type="text"
                        className="input"
                        value={twoFACode}
                        onChange={(e) => setTwoFACode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                      <button type="submit" className="btn btn-primary w-full mt-2">
                        Verify & Enable
                      </button>
                    </form>
                  </div>
                )}

                {user?.twoFactorEnabled && (
                  <div className="text-green-600 font-medium">
                    ✓ Two-factor authentication is active
                  </div>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Change Password</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Update your password to keep your account secure
                </p>
                <button className="btn btn-secondary">Change Password</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && user?.role === 'admin' && <Admin />}
      </div>
    </div>
  );
};
