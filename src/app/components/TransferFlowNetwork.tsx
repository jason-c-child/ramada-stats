'use client';

import { useState, useEffect, useRef } from 'react';

interface TransferFlow {
  id: string;
  source: string;
  destination: string;
  amount: string;
  token: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'internal' | 'ibc' | 'cross-chain';
  txHash: string;
}

interface NetworkNode {
  id: string;
  name: string;
  type: 'validator' | 'wallet' | 'exchange' | 'bridge';
  volume: number;
  connections: number;
  status: 'active' | 'inactive';
}

interface FlowMetrics {
  totalTransfers: number;
  totalVolume: number;
  averageTransferSize: number;
  activeConnections: number;
  ibcTransfers: number;
  crossChainTransfers: number;
  successRate: number;
}

export default function TransferFlowNetwork({
  isMinimized = false,
  isMaximized = false,
  onMinimize,
  onMaximize
}: {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'network' | 'flows' | 'analytics'>('network');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedToken, setSelectedToken] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<TransferFlow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock data for transfer flows
  const [transferFlows] = useState<TransferFlow[]>([
    {
      id: '1',
      source: 'namada1abc...xyz',
      destination: 'namada1def...uvw',
      amount: '1250.50',
      token: 'NAM',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed',
      type: 'internal',
      txHash: '0x1234...5678'
    },
    {
      id: '2',
      source: 'namada1abc...xyz',
      destination: 'cosmos1ghi...rst',
      amount: '500.00',
      token: 'NAM',
      timestamp: '2024-01-15T11:15:00Z',
      status: 'completed',
      type: 'ibc',
      txHash: '0x2345...6789'
    },
    {
      id: '3',
      source: 'namada1def...uvw',
      destination: 'ethereum1jkl...mno',
      amount: '750.25',
      token: 'NAM',
      timestamp: '2024-01-15T12:00:00Z',
      status: 'pending',
      type: 'cross-chain',
      txHash: '0x3456...7890'
    },
    {
      id: '4',
      source: 'cosmos1ghi...rst',
      destination: 'namada1pqr...stu',
      amount: '300.00',
      token: 'ATOM',
      timestamp: '2024-01-15T12:45:00Z',
      status: 'completed',
      type: 'ibc',
      txHash: '0x4567...8901'
    },
    {
      id: '5',
      source: 'namada1pqr...stu',
      destination: 'namada1vwx...yza',
      amount: '1000.00',
      token: 'NAM',
      timestamp: '2024-01-15T13:30:00Z',
      status: 'failed',
      type: 'internal',
      txHash: '0x5678...9012'
    }
  ]);

  // Mock data for network nodes
  const [networkNodes] = useState<NetworkNode[]>([
    { id: '1', name: 'Validator Alpha', type: 'validator', volume: 5000, connections: 15, status: 'active' },
    { id: '2', name: 'Exchange Beta', type: 'exchange', volume: 12000, connections: 25, status: 'active' },
    { id: '3', name: 'Bridge Gamma', type: 'bridge', volume: 8000, connections: 8, status: 'active' },
    { id: '4', name: 'Wallet Delta', type: 'wallet', volume: 3000, connections: 12, status: 'active' },
    { id: '5', name: 'Validator Epsilon', type: 'validator', volume: 4000, connections: 10, status: 'inactive' }
  ]);

  // Mock metrics
  const [metrics] = useState<FlowMetrics>({
    totalTransfers: 1250,
    totalVolume: 45000,
    averageTransferSize: 36,
    activeConnections: 70,
    ibcTransfers: 180,
    crossChainTransfers: 95,
    successRate: 94.2
  });

  useEffect(() => {
    if (canvasRef.current && activeTab === 'network') {
      drawNetworkGraph();
    }
  }, [activeTab, selectedTimeframe]);

  const drawNetworkGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw network nodes
    networkNodes.forEach((node, index) => {
      const x = 100 + (index * 150);
      const y = canvas.height / 2;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = node.status === 'active' ? '#10b981' : '#9ca3af';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#000000';
      ctx.font = '12px MS Sans Serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name.split(' ')[0], x, y + 50);

      // Volume indicator
      const volumeHeight = (node.volume / 12000) * 40;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x - 20, y + 60, 40, volumeHeight);
    });

    // Draw connections
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Draw some sample connections
    for (let i = 0; i < networkNodes.length - 1; i++) {
      const x1 = 100 + (i * 150);
      const y1 = canvas.height / 2;
      const x2 = 100 + ((i + 1) * 150);
      const y2 = canvas.height / 2;

      ctx.beginPath();
      ctx.moveTo(x1 + 30, y1);
      ctx.lineTo(x2 - 30, y2);
      ctx.stroke();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'internal': return '🔄';
      case 'ibc': return '🌐';
      case 'cross-chain': return '🔗';
      default: return '📊';
    }
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat().format(parseFloat(amount));
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  const filteredFlows = transferFlows.filter(flow => {
    const matchesSearch = flow.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flow.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flow.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesToken = selectedToken === 'all' || flow.token === selectedToken;
    const matchesStatus = selectedStatus === 'all' || flow.status === selectedStatus;
    return matchesSearch && matchesToken && matchesStatus;
  });

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#3b82f6] border border-black"></div>
            <span>Transfer Flow Network</span>
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
          <div className="win95-icon bg-[#3b82f6] border border-black"></div>
          <span>Transfer Flow Network</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
          <button onClick={onMaximize} className="win95-button text-xs px-2 py-1">□</button>
        </div>
      </div>

      <div className="p-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('network')}
              className={`win95-button ${activeTab === 'network' ? 'bg-[#d0d0d0]' : ''}`}
            >
              Network Graph
            </button>
            <button
              onClick={() => setActiveTab('flows')}
              className={`win95-button ${activeTab === 'flows' ? 'bg-[#d0d0d0]' : ''}`}
            >
              Transfer Flows
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`win95-button ${activeTab === 'analytics' ? 'bg-[#d0d0d0]' : ''}`}
            >
              Analytics
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="win95-select"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="win95-button"
            >
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="win95-window-inset p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-black text-sm font-bold mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search addresses, tx hashes..."
                  className="win95-input w-full"
                />
              </div>
              <div>
                <label className="block text-black text-sm font-bold mb-2">Token</label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="win95-select w-full"
                >
                  <option value="all">All Tokens</option>
                  <option value="NAM">NAM</option>
                  <option value="ATOM">ATOM</option>
                  <option value="OSMO">OSMO</option>
                </select>
              </div>
              <div>
                <label className="block text-black text-sm font-bold mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="win95-select w-full"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            {/* Network Graph */}
            <div className="win95-window-inset p-4">
              <h3 className="text-black font-bold mb-4">Network Visualization</h3>
              <canvas
                ref={canvasRef}
                className="w-full h-96 border border-black"
                style={{ background: 'white' }}
              />
            </div>

            {/* Network Nodes */}
            <div className="win95-window-inset p-4">
              <h3 className="text-black font-bold mb-4">Network Nodes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {networkNodes.map((node) => (
                  <div key={node.id} className="border border-black p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-black font-bold">{node.name}</span>
                      <div className={`w-3 h-3 rounded-full ${node.status === 'active' ? 'bg-[#10b981]' : 'bg-[#9ca3af]'}`}></div>
                    </div>
                    <div className="text-black text-sm">
                      <div>Type: {node.type}</div>
                      <div>Volume: {formatAmount(node.volume.toString())}</div>
                      <div>Connections: {node.connections}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flows' && (
          <div className="space-y-6">
            {/* Transfer Flows Table */}
            <div className="win95-window-inset p-4">
              <h3 className="text-black font-bold mb-4">Transfer Flows</h3>
              <div className="overflow-x-auto">
                <table className="win95-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Amount</th>
                      <th>Token</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlows.map((flow) => (
                      <tr key={flow.id} className="validator-row">
                        <td>
                          <span className="mr-2">{getTypeIcon(flow.type)}</span>
                          {flow.type}
                        </td>
                        <td className="font-mono text-sm">{formatAddress(flow.source)}</td>
                        <td className="font-mono text-sm">{formatAddress(flow.destination)}</td>
                        <td>{formatAmount(flow.amount)}</td>
                        <td>{flow.token}</td>
                        <td>
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: getStatusColor(flow.status) }}
                            ></div>
                            {flow.status}
                          </div>
                        </td>
                        <td>{new Date(flow.timestamp).toLocaleTimeString()}</td>
                        <td>
                          <button
                            onClick={() => setSelectedFlow(flow)}
                            className="win95-button text-xs"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="win95-window-inset p-4">
                <div className="text-black text-sm font-bold mb-1">Total Transfers</div>
                <div className="text-2xl font-bold text-black">{formatAmount(metrics.totalTransfers.toString())}</div>
                <div className="text-black text-xs">Last {selectedTimeframe}</div>
              </div>
              <div className="win95-window-inset p-4">
                <div className="text-black text-sm font-bold mb-1">Total Volume</div>
                <div className="text-2xl font-bold text-black">{formatAmount(metrics.totalVolume.toString())}</div>
                <div className="text-black text-xs">NAM tokens</div>
              </div>
              <div className="win95-window-inset p-4">
                <div className="text-black text-sm font-bold mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-black">{metrics.successRate}%</div>
                <div className="text-black text-xs">Completed transfers</div>
              </div>
              <div className="win95-window-inset p-4">
                <div className="text-black text-sm font-bold mb-1">Active Connections</div>
                <div className="text-2xl font-bold text-black">{metrics.activeConnections}</div>
                <div className="text-black text-xs">Network nodes</div>
              </div>
            </div>

            {/* Flow Type Breakdown */}
            <div className="win95-window-inset p-4">
              <h3 className="text-black font-bold mb-4">Flow Type Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">🔄</div>
                  <div className="text-black font-bold">Internal Transfers</div>
                  <div className="text-black text-sm">{metrics.totalTransfers - metrics.ibcTransfers - metrics.crossChainTransfers}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">🌐</div>
                  <div className="text-black font-bold">IBC Transfers</div>
                  <div className="text-black text-sm">{metrics.ibcTransfers}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-black mb-2">🔗</div>
                  <div className="text-black font-bold">Cross-Chain</div>
                  <div className="text-black text-sm">{metrics.crossChainTransfers}</div>
                </div>
              </div>
            </div>

            {/* Volume Trends */}
            <div className="win95-window-inset p-4">
              <h3 className="text-black font-bold mb-4">Volume Trends</h3>
              <div className="h-64 bg-white border border-black flex items-center justify-center">
                <div className="text-black text-center">
                  <div className="text-lg font-bold mb-2">Volume Chart</div>
                  <div className="text-sm">Chart visualization would be implemented here</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flow Details Modal */}
        {selectedFlow && (
          <div className="modal-overlay" onClick={() => setSelectedFlow(null)}>
            <div className="win95-window max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="win95-title-bar flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="win95-icon bg-[#3b82f6] border border-black"></div>
                  <span>Transfer Details</span>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => setSelectedFlow(null)} className="win95-button text-xs px-2 py-1">×</button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-black font-bold mb-2">Source</div>
                    <div className="font-mono text-sm bg-white border border-black p-2">{selectedFlow.source}</div>
                  </div>
                  <div>
                    <div className="text-black font-bold mb-2">Destination</div>
                    <div className="font-mono text-sm bg-white border border-black p-2">{selectedFlow.destination}</div>
                  </div>
                  <div>
                    <div className="text-black font-bold mb-2">Amount</div>
                    <div className="bg-white border border-black p-2">{formatAmount(selectedFlow.amount)} {selectedFlow.token}</div>
                  </div>
                  <div>
                    <div className="text-black font-bold mb-2">Status</div>
                    <div className="flex items-center bg-white border border-black p-2">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getStatusColor(selectedFlow.status) }}
                      ></div>
                      {selectedFlow.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-black font-bold mb-2">Transaction Hash</div>
                    <div className="font-mono text-sm bg-white border border-black p-2">{selectedFlow.txHash}</div>
                  </div>
                  <div>
                    <div className="text-black font-bold mb-2">Timestamp</div>
                    <div className="bg-white border border-black p-2">{new Date(selectedFlow.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setSelectedFlow(null)} className="win95-button">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 