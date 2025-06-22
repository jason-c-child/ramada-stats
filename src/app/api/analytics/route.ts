import { NextRequest, NextResponse } from 'next/server';

// Mock data generators
const generateNetworkStats = () => ({
  latestBlock: Math.floor(Math.random() * 1000000) + 5000000,
  currentEpoch: Math.floor(Math.random() * 1000) + 100,
  totalValidators: Math.floor(Math.random() * 200) + 100,
  blockTime: new Date().toISOString(),
  averageBlockTime: (Math.random() * 5 + 2).toFixed(2),
  totalTransactions: Math.floor(Math.random() * 10000000) + 5000000,
  activeAddresses: Math.floor(Math.random() * 50000) + 10000,
});

const generateValidatorStats = () => ({
  totalValidators: Math.floor(Math.random() * 200) + 100,
  activeValidators: Math.floor(Math.random() * 150) + 80,
  totalVotingPower: Math.floor(Math.random() * 10000000) + 5000000,
  averageVotingPower: Math.floor(Math.random() * 100000) + 50000,
  topValidator: {
    address: `validator-${Math.floor(Math.random() * 100)}`,
    votingPower: Math.floor(Math.random() * 500000) + 100000,
    commission: (Math.random() * 20 + 5).toFixed(2),
  },
});

const generateTimeSeriesData = (points: number = 100) => {
  return Array.from({ length: points }, (_, i) => ({
    timestamp: Date.now() - (points - i) * 60000, // Every minute
    blockHeight: Math.floor(Math.random() * 1000000) + 5000000 + i,
    blockTime: Math.random() * 5 + 2,
    activeValidators: Math.floor(Math.random() * 50) + 80,
    totalVotingPower: Math.floor(Math.random() * 2000000) + 5000000,
    averageVotingPower: Math.floor(Math.random() * 50000) + 50000,
  }));
};

const generatePrivacyMetrics = () => ({
  totalShieldedBalance: Math.random() * 10000000 + 5000000,
  activeShieldedAddresses: Math.floor(Math.random() * 5000) + 1000,
  anonymitySetSize: Math.floor(Math.random() * 10000) + 5000,
  privacyTransactions24h: Math.floor(Math.random() * 1000) + 100,
  averageAnonymitySet: Math.floor(Math.random() * 100) + 50,
  shieldedTokenTypes: Math.floor(Math.random() * 10) + 5,
  privacyTransactions: Array.from({ length: 50 }, (_, i) => ({
    id: `privacy-${Date.now()}-${i}`,
    type: ['shield', 'unshield', 'transfer'][Math.floor(Math.random() * 3)],
    amount: (Math.random() * 10000).toFixed(2),
    denom: ['NAM', 'ATOM', 'OSMO', 'TIA', 'INJ', 'USDC'][Math.floor(Math.random() * 6)],
    timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    anonymitySet: Math.floor(Math.random() * 1000) + 100,
    fee: (Math.random() * 10).toFixed(4),
  })),
});

const generateGovernanceData = () => ({
  proposals: Array.from({ length: 20 }, (_, i) => ({
    id: `proposal-${i + 1}`,
    title: [
      'Increase Minimum Validator Commission',
      'Add New Token to MASP',
      'Update Protocol Parameters',
      'Emergency Security Patch',
      'Community Treasury Allocation',
    ][Math.floor(Math.random() * 5)],
    description: 'This proposal aims to improve the Namada ecosystem.',
    status: ['active', 'passed', 'rejected', 'pending'][Math.floor(Math.random() * 4)],
    votingStart: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    votingEnd: Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000,
    totalVotes: Math.floor(Math.random() * 1000000) + 100000,
    yesVotes: Math.floor(Math.random() * 500000) + 50000,
    noVotes: Math.floor(Math.random() * 300000) + 10000,
    abstainVotes: Math.floor(Math.random() * 200000) + 5000,
    turnout: Math.random() * 20 + 10,
    proposer: `validator-${Math.floor(Math.random() * 100)}`,
    deposit: (Math.random() * 1000 + 100).toFixed(2),
  })),
  stats: {
    totalProposals: 20,
    activeProposals: Math.floor(Math.random() * 5) + 1,
    passedProposals: Math.floor(Math.random() * 10) + 5,
    totalVotingPower: 10000000,
    averageTurnout: Math.random() * 20 + 10,
    participationRate: Math.random() * 30 + 15,
  },
});

const generateCrossChainData = () => ({
  ibcTransfers: Array.from({ length: 50 }, (_, i) => ({
    id: `ibc-${Date.now()}-${i}`,
    sourceChain: ['Cosmos Hub', 'Osmosis', 'Celestia', 'Injective'][Math.floor(Math.random() * 4)],
    destinationChain: ['Namada', 'Cosmos Hub', 'Osmosis', 'Celestia'][Math.floor(Math.random() * 4)],
    amount: (Math.random() * 10000).toFixed(2),
    denom: ['ATOM', 'OSMO', 'TIA', 'INJ', 'NAM'][Math.floor(Math.random() * 5)],
    timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
    fee: (Math.random() * 5).toFixed(4),
  })),
  bridgeActivity: {
    totalTransfers: Math.floor(Math.random() * 10000) + 5000,
    totalVolume: Math.random() * 100000000 + 50000000,
    activeBridges: Math.floor(Math.random() * 10) + 5,
    averageTransferSize: Math.random() * 10000 + 1000,
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const timeframe = searchParams.get('timeframe') || '24h';
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    switch (endpoint) {
      case 'network-stats':
        return NextResponse.json({
          success: true,
          data: generateNetworkStats(),
          timestamp: new Date().toISOString(),
        });

      case 'validator-stats':
        return NextResponse.json({
          success: true,
          data: generateValidatorStats(),
          timestamp: new Date().toISOString(),
        });

      case 'time-series':
        return NextResponse.json({
          success: true,
          data: generateTimeSeriesData(limit),
          timestamp: new Date().toISOString(),
        });

      case 'privacy-metrics':
        return NextResponse.json({
          success: true,
          data: generatePrivacyMetrics(),
          timestamp: new Date().toISOString(),
        });

      case 'governance':
        return NextResponse.json({
          success: true,
          data: generateGovernanceData(),
          timestamp: new Date().toISOString(),
        });

      case 'cross-chain':
        return NextResponse.json({
          success: true,
          data: generateCrossChainData(),
          timestamp: new Date().toISOString(),
        });

      case 'all':
        return NextResponse.json({
          success: true,
          data: {
            networkStats: generateNetworkStats(),
            validatorStats: generateValidatorStats(),
            timeSeries: generateTimeSeriesData(limit),
            privacyMetrics: generatePrivacyMetrics(),
            governance: generateGovernanceData(),
            crossChain: generateCrossChainData(),
          },
          timestamp: new Date().toISOString(),
        });

      case 'transfer-flows':
        return getTransferFlows(searchParams);
      
      case 'network-nodes':
        return getNetworkNodes(searchParams);
      
      case 'flow-metrics':
        return getFlowMetrics(searchParams);
      
      case 'flow-details':
        return getFlowDetails(searchParams);

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid endpoint',
            availableEndpoints: [
              'network-stats',
              'validator-stats', 
              'time-series',
              'privacy-metrics',
              'governance',
              'cross-chain',
              'all',
              'transfer-flows',
              'network-nodes',
              'flow-metrics',
              'flow-details'
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'subscribe':
        // Mock subscription endpoint
        return NextResponse.json({
          success: true,
          message: 'Successfully subscribed to updates',
          subscriptionId: `sub-${Date.now()}`,
        });

      case 'alert':
        // Mock alert creation endpoint
        return NextResponse.json({
          success: true,
          message: 'Alert created successfully',
          alertId: `alert-${Date.now()}`,
        });

      case 'test-webhook':
        // Test webhook endpoint
        try {
          const { webhookUrl, alertData } = data;
          
          if (!webhookUrl) {
            return NextResponse.json(
              {
                success: false,
                error: 'Webhook URL is required',
              },
              { status: 400 }
            );
          }

          const testPayload = {
            alert: {
              id: 'test-alert',
              name: alertData?.name || 'Test Alert',
              description: alertData?.description || 'Test alert for webhook verification',
              type: alertData?.type || 'block-height',
              condition: alertData?.condition || 'above',
              threshold: alertData?.threshold || 0
            },
            trigger: {
              id: `test-${Date.now()}`,
              message: 'Test webhook notification from Namada Analytics Dashboard',
              value: alertData?.threshold || 0,
              timestamp: Date.now()
            },
            network: {
              timestamp: new Date().toISOString(),
              source: 'Namada Analytics Dashboard'
            }
          };

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Namada-Analytics-Dashboard/1.0'
            },
            body: JSON.stringify(testPayload)
          });

          if (response.ok) {
            return NextResponse.json({
              success: true,
              message: 'Webhook test successful',
              statusCode: response.status,
              statusText: response.statusText
            });
          } else {
            return NextResponse.json({
              success: false,
              error: 'Webhook test failed',
              statusCode: response.status,
              statusText: response.statusText
            }, { status: 400 });
          }
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Webhook test failed: ' + (error as Error).message
          }, { status: 500 });
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            availableActions: ['subscribe', 'alert', 'test-webhook'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Transfer Flow Network functions
async function getTransferFlows(searchParams: URLSearchParams) {
  const timeframe = searchParams.get('timeframe') || '24h';
  const token = searchParams.get('token') || 'all';
  const status = searchParams.get('status') || 'all';
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Mock data for transfer flows
  const mockTransferFlows = [
    {
      id: '1',
      source: 'namada1abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567',
      destination: 'namada1def456ghi789jkl012mno345pqr678stu901vwx234yza567abc123',
      amount: '1250.50',
      token: 'NAM',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed',
      type: 'internal',
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    },
    {
      id: '2',
      source: 'namada1abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567',
      destination: 'cosmos1ghi789jkl012mno345pqr678stu901vwx234yza567abc123def456',
      amount: '500.00',
      token: 'NAM',
      timestamp: '2024-01-15T11:15:00Z',
      status: 'completed',
      type: 'ibc',
      txHash: '0x2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef234'
    },
    {
      id: '3',
      source: 'namada1def456ghi789jkl012mno345pqr678stu901vwx234yza567abc123',
      destination: 'ethereum1jkl012mno345pqr678stu901vwx234yza567abc123def456ghi789',
      amount: '750.25',
      token: 'NAM',
      timestamp: '2024-01-15T12:00:00Z',
      status: 'pending',
      type: 'cross-chain',
      txHash: '0x3456789012cdef3456789012cdef3456789012cdef3456789012cdef345678'
    },
    {
      id: '4',
      source: 'cosmos1ghi789jkl012mno345pqr678stu901vwx234yza567abc123def456',
      destination: 'namada1pqr678stu901vwx234yza567abc123def456ghi789jkl012mno345',
      amount: '300.00',
      token: 'ATOM',
      timestamp: '2024-01-15T12:45:00Z',
      status: 'completed',
      type: 'ibc',
      txHash: '0x4567890123def4567890123def4567890123def4567890123def4567890123'
    },
    {
      id: '5',
      source: 'namada1pqr678stu901vwx234yza567abc123def456ghi789jkl012mno345',
      destination: 'namada1vwx234yza567abc123def456ghi789jkl012mno345pqr678stu901',
      amount: '1000.00',
      token: 'NAM',
      timestamp: '2024-01-15T13:30:00Z',
      status: 'failed',
      type: 'internal',
      txHash: '0x5678901234ef5678901234ef5678901234ef5678901234ef5678901234ef56'
    },
    {
      id: '6',
      source: 'namada1vwx234yza567abc123def456ghi789jkl012mno345pqr678stu901',
      destination: 'osmosis1stu901vwx234yza567abc123def456ghi789jkl012mno345pqr678',
      amount: '250.75',
      token: 'NAM',
      timestamp: '2024-01-15T14:15:00Z',
      status: 'completed',
      type: 'ibc',
      txHash: '0x6789012345f6789012345f6789012345f6789012345f6789012345f6789012'
    },
    {
      id: '7',
      source: 'ethereum1jkl012mno345pqr678stu901vwx234yza567abc123def456ghi789',
      destination: 'namada1abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567',
      amount: '1500.00',
      token: 'ETH',
      timestamp: '2024-01-15T15:00:00Z',
      status: 'pending',
      type: 'cross-chain',
      txHash: '0x7890123456f7890123456f7890123456f7890123456f7890123456f7890123'
    },
    {
      id: '8',
      source: 'namada1def456ghi789jkl012mno345pqr678stu901vwx234yza567abc123',
      destination: 'namada1ghi789jkl012mno345pqr678stu901vwx234yza567abc123def456',
      amount: '75.25',
      token: 'NAM',
      timestamp: '2024-01-15T15:45:00Z',
      status: 'completed',
      type: 'internal',
      txHash: '0x8901234567f8901234567f8901234567f8901234567f8901234567f8901234'
    }
  ];

  // Filter based on parameters
  let filteredFlows = mockTransferFlows;
  
  if (token !== 'all') {
    filteredFlows = filteredFlows.filter(flow => flow.token === token);
  }
  
  if (status !== 'all') {
    filteredFlows = filteredFlows.filter(flow => flow.status === status);
  }

  // Apply pagination
  const paginatedFlows = filteredFlows.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    data: {
      flows: paginatedFlows,
      pagination: {
        total: filteredFlows.length,
        limit,
        offset,
        hasMore: offset + limit < filteredFlows.length
      }
    }
  });
}

async function getNetworkNodes(searchParams: URLSearchParams) {
  const type = searchParams.get('type') || 'all';
  const status = searchParams.get('status') || 'all';

  // Mock data for network nodes
  const mockNetworkNodes = [
    {
      id: '1',
      name: 'Validator Alpha',
      type: 'validator',
      volume: 5000,
      connections: 15,
      status: 'active',
      address: 'namada1validatoralpha123456789abcdefghijklmnopqrstuvwxyz',
      uptime: 99.8,
      commission: 0.05
    },
    {
      id: '2',
      name: 'Exchange Beta',
      type: 'exchange',
      volume: 12000,
      connections: 25,
      status: 'active',
      address: 'namada1exchangebeta123456789abcdefghijklmnopqrstuvwxyz',
      uptime: 99.9,
      commission: 0.02
    },
    {
      id: '3',
      name: 'Bridge Gamma',
      type: 'bridge',
      volume: 8000,
      connections: 8,
      status: 'active',
      address: 'namada1bridgegamma123456789abcdefghijklmnopqrstuvwxyz',
      uptime: 99.5,
      commission: 0.01
    },
    {
      id: '4',
      name: 'Wallet Delta',
      type: 'wallet',
      volume: 3000,
      connections: 12,
      status: 'active',
      address: 'namada1walletdelta123456789abcdefghijklmnopqrstuvwxyz',
      uptime: 99.7,
      commission: 0.0
    },
    {
      id: '5',
      name: 'Validator Epsilon',
      type: 'validator',
      volume: 4000,
      connections: 10,
      status: 'inactive',
      address: 'namada1validatorepsilon123456789abcdefghijklmnopqrstuvwxyz',
      uptime: 85.2,
      commission: 0.08
    },
    {
      id: '6',
      name: 'DEX Zeta',
      type: 'exchange',
      volume: 9000,
      connections: 18,
      status: 'active',
      address: 'namada1dexzeta123456789abcdefghijklmnopqrstuvwxyz',
      uptime: 99.6,
      commission: 0.03
    },
    {
      id: '7',
      name: 'Bridge Eta',
      type: 'bridge',
      volume: 6000,
      connections: 6,
      status: 'active',
      address: 'namada1bridgeeta123456789abcdefghijklmnopqrstuvwxyz',
      uptime: 99.4,
      commission: 0.015
    },
    {
      id: '8',
      name: 'Staking Pool Theta',
      type: 'wallet',
      volume: 2000,
      connections: 8,
      status: 'active',
      address: 'namada1stakingpooltheta123456789abcdefghijklmnopqrstuvwxyz',
      uptime: 99.8,
      commission: 0.0
    }
  ];

  // Filter based on parameters
  let filteredNodes = mockNetworkNodes;
  
  if (type !== 'all') {
    filteredNodes = filteredNodes.filter(node => node.type === type);
  }
  
  if (status !== 'all') {
    filteredNodes = filteredNodes.filter(node => node.status === status);
  }

  return NextResponse.json({
    success: true,
    data: {
      nodes: filteredNodes,
      summary: {
        total: filteredNodes.length,
        active: filteredNodes.filter(n => n.status === 'active').length,
        inactive: filteredNodes.filter(n => n.status === 'inactive').length,
        totalVolume: filteredNodes.reduce((sum, node) => sum + node.volume, 0),
        totalConnections: filteredNodes.reduce((sum, node) => sum + node.connections, 0)
      }
    }
  });
}

async function getFlowMetrics(searchParams: URLSearchParams) {
  const timeframe = searchParams.get('timeframe') || '24h';

  // Mock metrics data
  const mockMetrics = {
    totalTransfers: 1250,
    totalVolume: 45000,
    averageTransferSize: 36,
    activeConnections: 70,
    ibcTransfers: 180,
    crossChainTransfers: 95,
    successRate: 94.2,
    averageTransferTime: 2.5,
    topTokens: [
      { token: 'NAM', volume: 35000, transfers: 980 },
      { token: 'ATOM', volume: 8000, transfers: 200 },
      { token: 'OSMO', volume: 2000, transfers: 70 }
    ],
    topSources: [
      { address: 'namada1abc...xyz', volume: 5000, transfers: 45 },
      { address: 'cosmos1ghi...rst', volume: 3000, transfers: 32 },
      { address: 'namada1def...uvw', volume: 2500, transfers: 28 }
    ],
    topDestinations: [
      { address: 'namada1pqr...stu', volume: 4500, transfers: 42 },
      { address: 'osmosis1stu...vwx', volume: 2800, transfers: 35 },
      { address: 'namada1vwx...yza', volume: 2200, transfers: 25 }
    ],
    hourlyData: [
      { hour: '00:00', transfers: 45, volume: 1800 },
      { hour: '01:00', transfers: 38, volume: 1500 },
      { hour: '02:00', transfers: 32, volume: 1200 },
      { hour: '03:00', transfers: 28, volume: 1100 },
      { hour: '04:00', transfers: 25, volume: 900 },
      { hour: '05:00', transfers: 30, volume: 1200 },
      { hour: '06:00', transfers: 42, volume: 1600 },
      { hour: '07:00', transfers: 55, volume: 2200 },
      { hour: '08:00', transfers: 68, volume: 2800 },
      { hour: '09:00', transfers: 75, volume: 3200 },
      { hour: '10:00', transfers: 82, volume: 3500 },
      { hour: '11:00', transfers: 78, volume: 3300 },
      { hour: '12:00', transfers: 85, volume: 3800 },
      { hour: '13:00', transfers: 88, volume: 4000 },
      { hour: '14:00', transfers: 92, volume: 4200 },
      { hour: '15:00', transfers: 95, volume: 4500 },
      { hour: '16:00', transfers: 88, volume: 4100 },
      { hour: '17:00', transfers: 82, volume: 3800 },
      { hour: '18:00', transfers: 75, volume: 3400 },
      { hour: '19:00', transfers: 68, volume: 3000 },
      { hour: '20:00', transfers: 62, volume: 2800 },
      { hour: '21:00', transfers: 58, volume: 2600 },
      { hour: '22:00', transfers: 52, volume: 2400 },
      { hour: '23:00', transfers: 48, volume: 2000 }
    ]
  };

  return NextResponse.json({
    success: true,
    data: mockMetrics
  });
}

async function getFlowDetails(searchParams: URLSearchParams) {
  const flowId = searchParams.get('id');
  const txHash = searchParams.get('txHash');

  if (!flowId && !txHash) {
    return NextResponse.json({
      success: false,
      error: 'Flow ID or transaction hash is required'
    }, { status: 400 });
  }

  // Mock detailed flow data
  const mockFlowDetails = {
    id: flowId || '1',
    source: 'namada1abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567',
    destination: 'namada1def456ghi789jkl012mno345pqr678stu901vwx234yza567abc123',
    amount: '1250.50',
    token: 'NAM',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    type: 'internal',
    txHash: txHash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockHeight: 1234567,
    gasUsed: 150000,
    gasPrice: '0.000001',
    fee: '0.15',
    confirmations: 12,
    route: [
      { chain: 'Namada', address: 'namada1abc123def456ghi789jkl012mno345pqr678stu901vwx234yza567' },
      { chain: 'Namada', address: 'namada1def456ghi789jkl012mno345pqr678stu901vwx234yza567abc123' }
    ],
    events: [
      {
        type: 'transfer',
        timestamp: '2024-01-15T10:30:05Z',
        description: 'Token transfer initiated'
      },
      {
        type: 'confirmation',
        timestamp: '2024-01-15T10:30:12Z',
        description: 'Transaction confirmed on blockchain'
      },
      {
        type: 'completion',
        timestamp: '2024-01-15T10:30:15Z',
        description: 'Transfer completed successfully'
      }
    ],
    metadata: {
      memo: 'Payment for services',
      tags: ['internal', 'payment'],
      sourceApp: 'Namada Wallet',
      destinationApp: 'Namada Wallet'
    }
  };

  return NextResponse.json({
    success: true,
    data: mockFlowDetails
  });
} 