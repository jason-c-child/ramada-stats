'use client';

import { useState, useEffect } from 'react';
import { timeSeriesStore } from '../lib/time-series-store';

interface IBCTransfer {
  id: string;
  sourceChain: string;
  destinationChain: string;
  amount: string;
  denom: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

interface BridgeActivity {
  chain: string;
  volume24h: number;
  transfers24h: number;
  activeConnections: number;
  lastActivity: number;
}

interface CrossChainAnalyticsProps {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default function CrossChainAnalytics({
  isMinimized = false,
  isMaximized = false,
  onMinimize,
  onMaximize
}: CrossChainAnalyticsProps) {
  const [ibcTransfers, setIbcTransfers] = useState<IBCTransfer[]>([]);
  const [bridgeActivity, setBridgeActivity] = useState<BridgeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Mock data for demonstration - in real implementation, this would come from IBC APIs
  useEffect(() => {
    const generateMockData = () => {
      const chains = ['Namada', 'Cosmos Hub', 'Osmosis', 'Celestia', 'Injective'];
      const denoms = ['NAM', 'ATOM', 'OSMO', 'TIA', 'INJ'];
      
      // Generate mock IBC transfers
      const mockTransfers: IBCTransfer[] = Array.from({ length: 50 }, (_, i) => ({
        id: `ibc-${Date.now()}-${i}`,
        sourceChain: chains[Math.floor(Math.random() * chains.length)],
        destinationChain: chains[Math.floor(Math.random() * chains.length)],
        amount: (Math.random() * 10000).toFixed(2),
        denom: denoms[Math.floor(Math.random() * denoms.length)],
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Last 7 days
        status: Math.random() > 0.1 ? 'completed' : Math.random() > 0.5 ? 'pending' : 'failed'
      }));

      // Generate mock bridge activity
      const mockBridgeActivity: BridgeActivity[] = chains.map(chain => ({
        chain,
        volume24h: Math.random() * 1000000,
        transfers24h: Math.floor(Math.random() * 1000),
        activeConnections: Math.floor(Math.random() * 50) + 10,
        lastActivity: Date.now() - Math.random() * 24 * 60 * 60 * 1000
      }));

      setIbcTransfers(mockTransfers);
      setBridgeActivity(mockBridgeActivity);
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

  const filteredTransfers = ibcTransfers.filter(transfer => {
    const now = Date.now();
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    return transfer.timestamp >= now - timeframes[selectedTimeframe];
  });

  const totalVolume = filteredTransfers.reduce((sum, transfer) => sum + parseFloat(transfer.amount), 0);
  const totalTransfers = filteredTransfers.length;
  const successRate = filteredTransfers.length > 0 
    ? (filteredTransfers.filter(t => t.status === 'completed').length / filteredTransfers.length * 100).toFixed(1)
    : '0';

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#008000] border border-black"></div>
            <span>Cross-Chain Analytics</span>
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
          <div className="win95-icon bg-[#008000] border border-black"></div>
          <span>Cross-Chain Analytics</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Total Volume</div>
            <div className="text-2xl font-bold text-black">{formatCurrency(totalVolume)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Total Transfers</div>
            <div className="text-2xl font-bold text-black">{formatNumber(totalTransfers)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-black">{successRate}%</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Active Bridges</div>
            <div className="text-2xl font-bold text-black">{bridgeActivity.length}</div>
          </div>
        </div>

        {/* Timeframe Controls */}
        <div className="win95-window-inset p-4 mb-4">
          <div className="flex items-center space-x-4">
            <label className="text-black text-sm font-bold">Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="win95-select"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bridge Activity */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Bridge Activity</h3>
            <div className="space-y-3">
              {bridgeActivity.map((bridge, index) => (
                <div key={bridge.chain} className="flex items-center justify-between p-3 bg-white border border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-bold text-black">{bridge.chain}</div>
                      <div className="text-xs text-gray-600">
                        {bridge.activeConnections} active connections
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">{formatCurrency(bridge.volume24h)}</div>
                    <div className="text-xs text-gray-600">
                      {formatNumber(bridge.transfers24h)} transfers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent IBC Transfers */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Recent IBC Transfers</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTransfers.slice(0, 20).map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-2 bg-white border border-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      transfer.status === 'completed' ? 'bg-green-500' :
                      transfer.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="text-sm font-bold text-black">
                        {transfer.sourceChain} → {transfer.destinationChain}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatTime(transfer.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-black">
                      {formatNumber(parseFloat(transfer.amount))} {transfer.denom}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {transfer.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 