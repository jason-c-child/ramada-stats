'use client';

import { useState, useEffect } from 'react';
import { indexerClient, ValidatorStats } from '../lib/indexer-client';

interface Validator {
  address: string;
  voting_power: string;
  proposer_priority: string;
  pub_key: {
    type: string;
    value: string;
  };
  name?: string;
  commission?: string;
  status?: string;
}

interface ValidatorExplorerProps {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default function ValidatorExplorer({
  isMinimized = false,
  isMaximized = false,
  onMinimize,
  onMaximize
}: ValidatorExplorerProps) {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'voting_power' | 'name' | 'commission'>('voting_power');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);

  useEffect(() => {
    const fetchValidators = async () => {
      try {
        setLoading(true);
        setError(null);
        const allValidators = await indexerClient.getAllValidators();
        setValidators(allValidators);
      } catch (err) {
        console.error('Failed to fetch validators:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch validators');
      } finally {
        setLoading(false);
      }
    };

    fetchValidators();
    const interval = setInterval(fetchValidators, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: string | number) => {
    const value = typeof num === 'string' ? parseInt(num) : num;
    return new Intl.NumberFormat().format(value);
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  };

  const sortedValidators = validators
    .filter(validator => 
      validator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validator.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'voting_power':
          aValue = parseInt(a.voting_power || '0');
          bValue = parseInt(b.voting_power || '0');
          break;
        case 'commission':
          aValue = parseFloat(a.commission || '0');
          bValue = parseFloat(b.commission || '0');
          break;
        case 'name':
          aValue = a.name || a.address;
          bValue = b.name || b.address;
          break;
        default:
          aValue = parseInt(a.voting_power || '0');
          bValue = parseInt(b.voting_power || '0');
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

  const totalVotingPower = validators.reduce((sum, v) => sum + parseInt(v.voting_power || '0'), 0);
  const activeValidators = validators.filter(v => v.voting_power !== '0').length;

  const handleSort = (column: 'voting_power' | 'name' | 'commission') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#800080] border border-black"></div>
            <span>Validator Explorer</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">□</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`win95-window ${isMaximized ? 'fixed inset-4 z-50' : ''}`}>
      <div className="win95-title-bar flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="win95-icon bg-[#800080] border border-black"></div>
          <span>Validator Explorer</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Total Validators</div>
            <div className="text-2xl font-bold text-black">{formatNumber(validators.length)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Active Validators</div>
            <div className="text-2xl font-bold text-black">{formatNumber(activeValidators)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Total Voting Power</div>
            <div className="text-2xl font-bold text-black">{formatNumber(totalVotingPower)}</div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="win95-window-inset p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-black text-sm font-bold mb-2">Search Validators</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or address..."
                className="win95-input w-full"
              />
            </div>
            <div>
              <label className="block text-black text-sm font-bold mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="win95-select"
              >
                <option value="voting_power">Voting Power</option>
                <option value="name">Name</option>
                <option value="commission">Commission</option>
              </select>
            </div>
            <div>
              <label className="block text-black text-sm font-bold mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="win95-select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Validators Table */}
        <div className="win95-window-inset">
          {loading ? (
            <div className="p-8 text-center">
              <div className="win95-progress-bar mx-auto mb-4 w-64">
                <div className="win95-progress-fill" style={{ width: '60%' }}></div>
              </div>
              <div className="text-black">Loading validators...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">Error: {error}</div>
              <button 
                onClick={() => window.location.reload()} 
                className="win95-button"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="win95-table">
                <thead>
                  <tr>
                    <th 
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('name')}
                    >
                      Validator {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('voting_power')}
                    >
                      Voting Power {sortBy === 'voting_power' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('commission')}
                    >
                      Commission {sortBy === 'commission' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedValidators.slice(0, 50).map((validator, index) => (
                    <tr key={validator.address} className="hover:bg-gray-100">
                      <td>
                        <div>
                          <div className="font-bold">{validator.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-600">{validator.address.slice(0, 8)}...{validator.address.slice(-6)}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="font-bold">{formatNumber(validator.voting_power)}</div>
                          <div className="text-xs text-gray-600">
                            {formatPercentage((parseInt(validator.voting_power || '0') / totalVotingPower) * 100)}
                          </div>
                        </div>
                      </td>
                      <td>{validator.commission || 'N/A'}</td>
                      <td>
                        <span className={`px-2 py-1 text-xs rounded ${
                          validator.voting_power !== '0' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {validator.voting_power !== '0' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedValidator(validator)}
                          className="win95-button text-xs px-2 py-1"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Validator Details Modal */}
        {selectedValidator && (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="win95-window max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="win95-title-bar flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="win95-icon bg-[#0000ff] border border-black"></div>
                  <span>Validator Details</span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setSelectedValidator(null)} 
                    className="win95-button text-xs px-2 py-1"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-4">{selectedValidator.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-black font-bold">Address:</span>
                        <div className="text-sm font-mono text-gray-600">{selectedValidator.address}</div>
                      </div>
                      <div>
                        <span className="text-black font-bold">Voting Power:</span>
                        <div className="text-sm">{formatNumber(selectedValidator.voting_power)}</div>
                      </div>
                      <div>
                        <span className="text-black font-bold">Commission:</span>
                        <div className="text-sm">{selectedValidator.commission || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-black font-bold">Status:</span>
                        <div className="text-sm capitalize">{selectedValidator.status}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 