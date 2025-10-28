import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import authService, { type APIKey } from '../services/authService';
import { FiCopy, FiTrash2, FiPlus } from 'react-icons/fi';
import Sidebar from './Sidebar';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    setLoading(true);
    const response = await authService.getAPIKeys();
    if (response.success) {
      setApiKeys(response.data);
    }
    setLoading(false);
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for your API key');
      return;
    }

    setCreatingKey(true);
    setError('');

    const response = await authService.createAPIKey(newKeyName);

    if (response.success && response.data) {
      setNewKeyValue(response.data.apiKey);
      setNewKeyName('');
      fetchAPIKeys();
    } else {
      setError(response.error || 'Failed to create API key');
      setShowNewKeyModal(false);
    }

    setCreatingKey(false);
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    const response = await authService.deleteAPIKey(keyId);
    if (response.success) {
      fetchAPIKeys();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleLogout = () => {
    logout();
    navigate('/developer/login');
  };

  const closeModal = () => {
    setShowNewKeyModal(false);
    setNewKeyValue('');
    setNewKeyName('');
    setError('');
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0e0d13' }}>
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-20 px-8 border-b" style={{ borderColor: '#252538ff' }}>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6b7280' }}>Welcome, {user?.username}</span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="flex gap-8">
            {/* Left Column */}
            <div className="w-1/3">
              {/* Stats Cards */}
              <div className="space-y-6">
                <div className="rounded-xl p-6" style={{ backgroundColor: '#181824' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#6b7280' }}>Active API Keys</h3>
                  <p className="text-3xl font-bold text-white">{apiKeys.filter(k => k.isActive).length}</p>
                </div>
                <div className="rounded-xl p-6" style={{ backgroundColor: '#181824' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#6b7280' }}>Total Requests</h3>
                  <p className="text-3xl font-bold text-white">{apiKeys.reduce((sum, k) => sum + k.usageCount, 0)}</p>
                </div>
                <div className="rounded-xl p-6" style={{ backgroundColor: '#181824' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#6b7280' }}>Rate Limit</h3>
                  <p className="text-3xl font-bold text-white">500/15min</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-2/3">
              {/* API Keys Section */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: '#181824' }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Your API Keys</h2>
                  <button
                    onClick={() => setShowNewKeyModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition hover:opacity-80"
                    style={{ borderColor: '#35da9a', borderWidth: '1px' }}
                  >
                    <FiPlus /> Create New Key
                  </button>
                </div>

                {error && (
                  <div className="border px-4 py-3 rounded-lg mb-4" style={{ backgroundColor: '#ff000020', borderColor: '#ff0000', color: '#ffcccc' }}>
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-8" style={{ color: '#6b7280' }}>Loading...</div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="mb-4" style={{ color: '#6b7280' }}>No API keys yet. Create one to get started!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                      <thead className="text-xs uppercase" style={{ backgroundColor: '#0e0d13' }}>
                        <tr>
                          <th scope="col" className="px-6 py-3">Name</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3">Usage</th>
                          <th scope="col" className="px-6 py-3">Last Used</th>
                          <th scope="col" className="px-6 py-3">Created</th>
                          <th scope="col" className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map((key) => (
                          <tr key={key.id} className="border-b" style={{ borderColor: '#252538ff' }}>
                            <td className="px-6 py-4 font-medium text-white">{key.name}</td>
                            <td className="px-6 py-4">
                              <span style={{ color: key.isActive ? '#35da9a' : '#ff0000' }}>
                                {key.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">{key.usageCount} requests</td>
                            <td className="px-6 py-4">{key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}</td>
                            <td className="px-6 py-4">{new Date(key.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteKey(key.id)}
                                className="p-2" 
                                style={{ color: '#ff0000' }}
                                title="Revoke key"
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create New Key Modal */}
      {showNewKeyModal && !newKeyValue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ backgroundColor: '#181824' }}>
            <h3 className="text-2xl font-bold text-white mb-4">Create New API Key</h3>

            {error && (
              <div className="border px-4 py-3 rounded-lg mb-4" style={{ backgroundColor: '#ff000020', borderColor: '#ff0000', color: '#ffcccc' }}>
                {error}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="keyName" className="block text-sm font-medium text-white mb-2">
                Key Name
              </label>
              <input
                type="text"
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none transition"
                style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
                placeholder="My Production Key"
                disabled={creatingKey}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={creatingKey}
                className="flex-1 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: '#0e0d13' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={creatingKey}
                className="flex-1 px-4 py-2 rounded-lg font-semibold transition hover:opacity-80 disabled:opacity-50"
                style={{ borderColor: '#35da9a', borderWidth: '1px' }}
              >
                {creatingKey ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show New Key Modal */}
      {newKeyValue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl p-6 max-w-lg w-full" style={{ backgroundColor: '#181824' }}>
            <h3 className="text-2xl font-bold text-white mb-4">API Key Created!</h3>

            <div className="border px-4 py-3 rounded-lg mb-4" style={{ backgroundColor: '#ffff0020', borderColor: '#ffff00', color: '#ffffcc' }}>
              <strong>Important:</strong> Copy this key now. You won't be able to see it again!
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Your API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyValue}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-lg text-white font-mono text-sm"
                  style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
                />
                <button
                  onClick={() => copyToClipboard(newKeyValue)}
                  className="px-4 py-2 rounded-lg transition-all"
                  style={{ backgroundColor: '#35da9a' }}
                  title="Copy to clipboard"
                >
                  <FiCopy />
                </button>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="w-full px-4 py-2 rounded-lg font-semibold transition hover:opacity-80"
              style={{ borderColor: '#35da9a', borderWidth: '1px' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;