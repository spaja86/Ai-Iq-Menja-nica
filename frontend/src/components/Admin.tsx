import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
}

interface KYCSubmission {
  id: string;
  userId: string;
  userEmail: string;
  status: string;
  submittedAt: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingKYC: number;
  totalVolume: number;
}

export const Admin = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'kyc' | 'stats'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await api.getUsers();
        setUsers(data);
      } else if (activeTab === 'kyc') {
        const data = await api.getKYCSubmissions();
        setKycSubmissions(data);
      } else if (activeTab === 'stats') {
        const data = await api.getSystemStats();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async (kycId: string) => {
    try {
      await api.approveKYC(kycId);
      alert('KYC approved successfully!');
      loadData();
    } catch (err: any) {
      alert(`Failed to approve KYC: ${err.message}`);
    }
  };

  const handleRejectKYC = async (kycId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.rejectKYC(kycId, reason);
      alert('KYC rejected successfully!');
      loadData();
    } catch (err: any) {
      alert(`Failed to reject KYC: ${err.message}`);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      await api.updateUserStatus(userId, status);
      alert('User status updated successfully!');
      loadData();
    } catch (err: any) {
      alert(`Failed to update user status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`btn ${activeTab === 'kyc' ? 'btn-primary' : 'btn-secondary'}`}
          >
            KYC Submissions
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-8">Loading...</div>
      ) : (
        <>
          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <h3 className="text-gray-600 text-sm mb-2">Total Users</h3>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="card">
                <h3 className="text-gray-600 text-sm mb-2">Active Users</h3>
                <p className="text-3xl font-bold">{stats.activeUsers}</p>
              </div>
              <div className="card">
                <h3 className="text-gray-600 text-sm mb-2">Pending KYC</h3>
                <p className="text-3xl font-bold">{stats.pendingKYC}</p>
              </div>
              <div className="card">
                <h3 className="text-gray-600 text-sm mb-2">Total Volume</h3>
                <p className="text-3xl font-bold">${stats.totalVolume.toLocaleString()}</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleUpdateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                            className="btn btn-secondary text-xs"
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">KYC Submissions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User Email</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Submitted</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycSubmissions.map((kyc) => (
                      <tr key={kyc.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{kyc.userEmail}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            kyc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            kyc.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {kyc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(kyc.submittedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 space-x-2">
                          {kyc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveKYC(kyc.id)}
                                className="btn btn-success text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectKYC(kyc.id)}
                                className="btn btn-danger text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
