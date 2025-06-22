'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MASPStats {
  totalShieldedBalance: number;
  activeShieldedAddresses: number;
  anonymitySetSize: number;
  privacyTransactions24h: number;
  averageAnonymitySet: number;
  shieldedTokenTypes: number;
}

interface PrivacyTransaction {
  id: string;
  type: 'shield' | 'unshield' | 'transfer';
  amount: string;
  denom: string;
  timestamp: number;
  anonymitySet: number;
  fee: string;
}

interface PrivacyMetricsProps {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default function PrivacyMetrics({
  isMinimized = false,
  isMaximized = false,
  onMinimize,
  onMaximize
}: PrivacyMetricsProps) {
  const [maspStats, setMaspStats] = useState<MASPStats>({
    totalShieldedBalance: 0,
    activeShieldedAddresses: 0,
    anonymitySetSize: 0,
    privacyTransactions24h: 0,
    averageAnonymitySet: 0,
    shieldedTokenTypes: 0
  });
  const [privacyTransactions, setPrivacyTransactions] = useState<PrivacyTransaction[]>([]);
  const [anonymitySetHistory, setAnonymitySetHistory] = useState<{ timestamp: number; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState<'all' | 'shield' | 'unshield' | 'transfer'>('all');

  // Mock data generation for MASP analytics
  useEffect(() => {
    const generateMockData = () => {
      // Generate MASP statistics
      const mockMaspStats: MASPStats = {
        totalShieldedBalance: Math.random() * 10000000 + 5000000, // 5-15M
        activeShieldedAddresses: Math.floor(Math.random() * 5000) + 1000,
        anonymitySetSize: Math.floor(Math.random() * 10000) + 5000,
        privacyTransactions24h: Math.floor(Math.random() * 1000) + 100,
        averageAnonymitySet: Math.floor(Math.random() * 100) + 50,
        shieldedTokenTypes: Math.floor(Math.random() * 10) + 5
      };

      // Generate privacy transactions
      const transactionTypes: ('shield' | 'unshield' | 'transfer')[] = ['shield', 'unshield', 'transfer'];
      const denoms = ['NAM', 'ATOM', 'OSMO', 'TIA', 'INJ', 'USDC'];
      
      const mockTransactions: PrivacyTransaction[] = Array.from({ length: 100 }, (_, i) => ({
        id: `privacy-${Date.now()}-${i}`,
        type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        amount: (Math.random() * 10000).toFixed(2),
        denom: denoms[Math.floor(Math.random() * denoms.length)],
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        anonymitySet: Math.floor(Math.random() * 1000) + 100,
        fee: (Math.random() * 10).toFixed(4)
      }));

      // Generate anonymity set history
      const mockAnonymityHistory = Array.from({ length: 50 }, (_, i) => ({
        timestamp: Date.now() - (50 - i) * 60 * 60 * 1000, // Last 50 hours
        value: Math.floor(Math.random() * 5000) + 3000
      }));

      setMaspStats(mockMaspStats);
      setPrivacyTransactions(mockTransactions);
      setAnonymitySetHistory(mockAnonymityHistory);
      setLoading(false);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const filteredTransactions = privacyTransactions.filter(transaction => {
    const now = Date.now();
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    const matchesTimeframe = transaction.timestamp >= now - timeframes[selectedTimeframe];
    const matchesSearch = searchQuery === '' || 
      transaction.denom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.includes(searchQuery) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTransactionType === 'all' || transaction.type === selectedTransactionType;
    
    return matchesTimeframe && matchesSearch && matchesType;
  });

  const chartData = {
    labels: anonymitySetHistory.map((_, index) => `Point ${index + 1}`),
    datasets: [
      {
        label: 'Anonymity Set Size',
        data: anonymitySetHistory.map(point => point.value),
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF620',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Anonymity Set Size Over Time',
        color: '#000',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#000',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `Anonymity Set: ${formatNumber(context.parsed.y)} addresses`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#000',
          borderColor: '#000',
        },
        ticks: {
          color: '#000',
          font: {
            size: 10,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#000',
          borderColor: '#000',
        },
        ticks: {
          color: '#000',
          font: {
            size: 10,
          },
          callback: function(value: any) {
            return formatNumber(value);
          },
        },
        title: {
          display: true,
          text: 'Addresses',
          color: '#000',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
  };

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#8B5CF6] border border-black"></div>
            <span>Privacy Metrics</span>
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
          <div className="win95-icon bg-[#8B5CF6] border border-black"></div>
          <span>Privacy Metrics (MASP Analytics)</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-6">
        {/* MASP Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Total Shielded Balance</div>
            <div className="text-2xl font-bold text-black">{formatCurrency(maspStats.totalShieldedBalance)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Active Shielded Addresses</div>
            <div className="text-2xl font-bold text-black">{formatNumber(maspStats.activeShieldedAddresses)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Anonymity Set Size</div>
            <div className="text-2xl font-bold text-black">{formatNumber(maspStats.anonymitySetSize)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Privacy Transactions (24h)</div>
            <div className="text-2xl font-bold text-black">{formatNumber(maspStats.privacyTransactions24h)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Average Anonymity Set</div>
            <div className="text-2xl font-bold text-black">{formatNumber(maspStats.averageAnonymitySet)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Shielded Token Types</div>
            <div className="text-2xl font-bold text-black">{formatNumber(maspStats.shieldedTokenTypes)}</div>
          </div>
        </div>

        {/* Timeframe Controls */}
        <div className="win95-window-inset p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-black text-sm font-bold mb-2">Timeframe:</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="win95-select w-full"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <div>
              <label className="text-black text-sm font-bold mb-2">Search:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by denom, amount, or type..."
                className="win95-input w-full"
              />
            </div>
            <div>
              <label className="text-black text-sm font-bold mb-2">Transaction Type:</label>
              <select
                value={selectedTransactionType}
                onChange={(e) => setSelectedTransactionType(e.target.value as any)}
                className="win95-select w-full"
              >
                <option value="all">All Types</option>
                <option value="shield">Shield</option>
                <option value="unshield">Unshield</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-black text-sm">
                Showing {filteredTransactions.length} of {privacyTransactions.length} transactions
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anonymity Set Chart */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Anonymity Set Size Over Time</h3>
            <div style={{ height: '300px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Privacy Transactions */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Recent Privacy Transactions</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTransactions.slice(0, 15).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 bg-white border border-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'shield' ? 'bg-green-500' :
                      transaction.type === 'unshield' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <div className="text-sm font-bold text-black capitalize">
                        {transaction.type} {transaction.denom}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatTime(transaction.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-black">
                      {formatNumber(parseFloat(transaction.amount))} {transaction.denom}
                    </div>
                    <div className="text-xs text-gray-600">
                      Anonymity: {formatNumber(transaction.anonymitySet)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Metrics Breakdown */}
        <div className="win95-window-inset p-4 mt-6">
          <h3 className="text-lg font-bold text-black mb-4">Privacy Metrics Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-bold text-black mb-2">Transaction Types Distribution</h4>
              <div className="space-y-2">
                {['shield', 'unshield', 'transfer'].map(type => {
                  const count = filteredTransactions.filter(t => t.type === type).length;
                  const percentage = filteredTransactions.length > 0 ? (count / filteredTransactions.length * 100).toFixed(1) : '0';
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-black capitalize">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-black text-sm">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="text-md font-bold text-black mb-2">Anonymity Set Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-black">Current Size:</span>
                  <span className="text-black font-bold">{formatNumber(maspStats.anonymitySetSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Average Size:</span>
                  <span className="text-black font-bold">{formatNumber(maspStats.averageAnonymitySet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Privacy Level:</span>
                  <span className="text-black font-bold">
                    {maspStats.anonymitySetSize > 10000 ? 'Very High' :
                     maspStats.anonymitySetSize > 5000 ? 'High' :
                     maspStats.anonymitySetSize > 1000 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 