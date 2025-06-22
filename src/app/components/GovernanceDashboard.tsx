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

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votingStart: number;
  votingEnd: number;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  turnout: number;
  proposer: string;
  deposit: string;
}

interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  totalVotingPower: number;
  averageTurnout: number;
  participationRate: number;
}

interface GovernanceDashboardProps {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default function GovernanceDashboard({
  isMinimized = false,
  isMaximized = false,
  onMinimize,
  onMaximize
}: GovernanceDashboardProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [governanceStats, setGovernanceStats] = useState<GovernanceStats>({
    totalProposals: 0,
    activeProposals: 0,
    passedProposals: 0,
    totalVotingPower: 0,
    averageTurnout: 0,
    participationRate: 0
  });
  const [participationHistory, setParticipationHistory] = useState<{ timestamp: number; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');

  // Mock data generation for governance analytics
  useEffect(() => {
    const generateMockData = () => {
      const proposalTitles = [
        'Increase Minimum Validator Commission',
        'Add New Token to MASP',
        'Update Protocol Parameters',
        'Emergency Security Patch',
        'Community Treasury Allocation',
        'Validator Set Expansion',
        'Cross-chain Bridge Enhancement',
        'Privacy Feature Upgrade'
      ];

      const mockProposals: Proposal[] = Array.from({ length: 20 }, (_, i) => {
        const statuses: ('active' | 'passed' | 'rejected' | 'pending')[] = ['active', 'passed', 'rejected', 'pending'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const votingStart = Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000; // Last 30 days
        const votingEnd = votingStart + (7 * 24 * 60 * 60 * 1000); // 7 days duration
        const totalVotes = Math.floor(Math.random() * 1000000) + 100000;
        const yesVotes = Math.floor(totalVotes * (0.3 + Math.random() * 0.4)); // 30-70%
        const noVotes = Math.floor(totalVotes * (0.1 + Math.random() * 0.3)); // 10-40%
        const abstainVotes = totalVotes - yesVotes - noVotes;
        const turnout = (totalVotes / 10000000) * 100; // Assuming 10M total voting power

        return {
          id: `proposal-${i + 1}`,
          title: proposalTitles[Math.floor(Math.random() * proposalTitles.length)],
          description: `This proposal aims to improve the Namada ecosystem by implementing various enhancements and optimizations.`,
          status,
          votingStart,
          votingEnd,
          totalVotes,
          yesVotes,
          noVotes,
          abstainVotes,
          turnout,
          proposer: `validator-${Math.floor(Math.random() * 100)}`,
          deposit: (Math.random() * 1000 + 100).toFixed(2)
        };
      });

      // Generate governance statistics
      const totalProposals = mockProposals.length;
      const activeProposals = mockProposals.filter(p => p.status === 'active').length;
      const passedProposals = mockProposals.filter(p => p.status === 'passed').length;
      const totalVotingPower = 10000000; // Mock total voting power
      const averageTurnout = mockProposals.reduce((sum, p) => sum + p.turnout, 0) / mockProposals.length;
      const participationRate = (mockProposals.reduce((sum, p) => sum + p.totalVotes, 0) / (totalProposals * totalVotingPower)) * 100;

      // Generate participation history
      const mockParticipationHistory = Array.from({ length: 30 }, (_, i) => ({
        timestamp: Date.now() - (30 - i) * 24 * 60 * 60 * 1000, // Last 30 days
        value: Math.random() * 20 + 10 // 10-30% participation
      }));

      setProposals(mockProposals);
      setGovernanceStats({
        totalProposals,
        activeProposals,
        passedProposals,
        totalVotingPower,
        averageTurnout,
        participationRate
      });
      setParticipationHistory(mockParticipationHistory);
      setLoading(false);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;
  const formatTime = (timestamp: number) => new Date(timestamp).toLocaleDateString();

  const filteredProposals = proposals.filter(proposal => 
    filterStatus === 'all' || proposal.status === filterStatus
  );

  const participationChartData = {
    labels: participationHistory.map((_, index) => `Day ${index + 1}`),
    datasets: [
      {
        label: 'Participation Rate',
        data: participationHistory.map(point => point.value),
        borderColor: '#10B981',
        backgroundColor: '#10B98120',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
      }
    ]
  };

  const participationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Governance Participation Over Time',
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
            return `Participation: ${formatPercentage(context.parsed.y)}`;
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
        max: 100,
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
            return `${value}%`;
          },
        },
        title: {
          display: true,
          text: 'Participation Rate (%)',
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
            <div className="win95-icon bg-[#10B981] border border-black"></div>
            <span>Governance Dashboard</span>
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
          <div className="win95-icon bg-[#10B981] border border-black"></div>
          <span>Governance Dashboard</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Governance Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Total Proposals</div>
            <div className="text-2xl font-bold text-black">{formatNumber(governanceStats.totalProposals)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Active Proposals</div>
            <div className="text-2xl font-bold text-black">{formatNumber(governanceStats.activeProposals)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Passed Proposals</div>
            <div className="text-2xl font-bold text-black">{formatNumber(governanceStats.passedProposals)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Total Voting Power</div>
            <div className="text-2xl font-bold text-black">{formatNumber(governanceStats.totalVotingPower)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Average Turnout</div>
            <div className="text-2xl font-bold text-black">{formatPercentage(governanceStats.averageTurnout)}</div>
          </div>
          <div className="win95-window-inset p-4">
            <div className="text-black text-sm font-bold mb-1">Participation Rate</div>
            <div className="text-2xl font-bold text-black">{formatPercentage(governanceStats.participationRate)}</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="win95-window-inset p-4 mb-4">
          <div className="flex items-center space-x-4">
            <label className="text-black text-sm font-bold">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="win95-select"
            >
              <option value="all">All Proposals</option>
              <option value="active">Active</option>
              <option value="passed">Passed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Participation Chart */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Governance Participation</h3>
            <div style={{ height: '300px' }}>
              <Line data={participationChartData} options={participationChartOptions} />
            </div>
          </div>

          {/* Proposals List */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Recent Proposals</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProposals.slice(0, 10).map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between p-2 bg-white border border-gray-300">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      proposal.status === 'active' ? 'bg-yellow-500' :
                      proposal.status === 'passed' ? 'bg-green-500' :
                      proposal.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="text-sm font-bold text-black">
                        {proposal.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatTime(proposal.votingStart)} - {formatTime(proposal.votingEnd)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-black capitalize">
                      {proposal.status}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatPercentage(proposal.turnout)} turnout
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="win95-window-inset p-4 mt-6">
          <h3 className="text-lg font-bold text-black mb-4">All Proposals</h3>
          <div className="overflow-x-auto">
            <table className="win95-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Voting Period</th>
                  <th>Yes Votes</th>
                  <th>No Votes</th>
                  <th>Turnout</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-100">
                    <td className="font-bold">{proposal.id}</td>
                    <td>{proposal.title}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded capitalize ${
                        proposal.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                        proposal.status === 'passed' ? 'bg-green-100 text-green-800' :
                        proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {proposal.status}
                      </span>
                    </td>
                    <td className="text-sm">
                      {formatTime(proposal.votingStart)} - {formatTime(proposal.votingEnd)}
                    </td>
                    <td>{formatNumber(proposal.yesVotes)}</td>
                    <td>{formatNumber(proposal.noVotes)}</td>
                    <td>{formatPercentage(proposal.turnout)}</td>
                    <td>
                      <button
                        onClick={() => setSelectedProposal(proposal)}
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
        </div>

        {/* Proposal Details Modal */}
        {selectedProposal && (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="win95-window max-w-4xl w-full mx-4">
              <div className="win95-title-bar flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="win95-icon bg-[#10B981] border border-black"></div>
                  <span>Proposal Details</span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setSelectedProposal(null)} 
                    className="win95-button text-xs px-2 py-1"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-4">{selectedProposal.title}</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-black font-bold">Description:</span>
                        <div className="text-sm text-gray-600 mt-1">{selectedProposal.description}</div>
                      </div>
                      <div>
                        <span className="text-black font-bold">Status:</span>
                        <div className="text-sm capitalize">{selectedProposal.status}</div>
                      </div>
                      <div>
                        <span className="text-black font-bold">Proposer:</span>
                        <div className="text-sm">{selectedProposal.proposer}</div>
                      </div>
                      <div>
                        <span className="text-black font-bold">Deposit:</span>
                        <div className="text-sm">{selectedProposal.deposit} NAM</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-black mb-2">Voting Results</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-black">Yes Votes:</span>
                        <span className="text-black font-bold">{formatNumber(selectedProposal.yesVotes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">No Votes:</span>
                        <span className="text-black font-bold">{formatNumber(selectedProposal.noVotes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Abstain:</span>
                        <span className="text-black font-bold">{formatNumber(selectedProposal.abstainVotes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Total Votes:</span>
                        <span className="text-black font-bold">{formatNumber(selectedProposal.totalVotes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Turnout:</span>
                        <span className="text-black font-bold">{formatPercentage(selectedProposal.turnout)}</span>
                      </div>
                    </div>
                    
                    {/* Voting Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-black">Voting Progress</span>
                        <span className="text-black">{formatPercentage(selectedProposal.turnout)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${selectedProposal.turnout}%` }}
                        ></div>
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