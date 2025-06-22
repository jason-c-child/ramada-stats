'use client';

import { useState } from 'react';
import { ValidatorStats } from '../lib/indexer-client';

export default function ValidatorStatsCard({ stats }: { stats: ValidatorStats }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const formatNumber = (num: number | string) => new Intl.NumberFormat().format(Number(num));
  const formatVotingPower = (power: string) => {
    const num = parseInt(power);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#800080] border border-black"></div>
            <span>Validator Statistics</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">□</button>
            
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
          <span>Validator Statistics</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">_</button>
          
        </div>
      </div>
      
      <div className="p-6">
        {/* Validator Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Validators */}
          <div className="win95-window-inset p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="win95-icon bg-[#0000ff] border border-black"></div>
              <div className="w-2 h-2 bg-[#0000ff] border border-black"></div>
            </div>
            <div className="text-black text-sm font-bold mb-1">Total Validators</div>
            <div className="text-2xl font-bold text-black mb-1">
              {formatNumber(stats.totalValidators)}
            </div>
            <div className="text-black text-xs">Registered validators</div>
          </div>

          {/* Active Validators */}
          <div className="win95-window-inset p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="win95-icon bg-[#008000] border border-black"></div>
              <div className="w-2 h-2 bg-[#008000] border border-black"></div>
            </div>
            <div className="text-black text-sm font-bold mb-1">Active Validators</div>
            <div className="text-2xl font-bold text-black mb-1">
              {formatNumber(stats.activeValidators)}
            </div>
            <div className="text-black text-xs">Currently validating</div>
          </div>

          {/* Total Voting Power */}
          <div className="win95-window-inset p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="win95-icon bg-[#800080] border border-black"></div>
              <div className="w-2 h-2 bg-[#800080] border border-black"></div>
            </div>
            <div className="text-black text-sm font-bold mb-1">Total Voting Power</div>
            <div className="text-2xl font-bold text-black mb-1">
              {formatVotingPower(stats.totalVotingPower)}
            </div>
            <div className="text-black text-xs">Combined stake</div>
          </div>

          {/* Average Voting Power */}
          <div className="win95-window-inset p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="win95-icon bg-[#ff8000] border border-black"></div>
              <div className="w-2 h-2 bg-[#ff8000] border border-black"></div>
            </div>
            <div className="text-black text-sm font-bold mb-1">Avg Voting Power</div>
            <div className="text-2xl font-bold text-black mb-1">
              {formatVotingPower(stats.averageVotingPower)}
            </div>
            <div className="text-black text-xs">Per validator</div>
          </div>
        </div>

        {/* Top Validators Table */}
        <div className="win95-window-inset p-4">
          <h3 className="text-lg font-bold text-black mb-4">Top 10 Validators by Voting Power</h3>
          <div className="overflow-x-auto">
            <table className="win95-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Validator</th>
                  <th>Voting Power</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.topValidators.map((validator, index) => (
                  <tr key={validator.address}>
                    <td className="font-bold">#{index + 1}</td>
                    <td>
                      <div>
                        <div className="font-bold text-black">{validator.name}</div>
                        <div className="text-xs text-black font-mono">{validator.address.slice(0, 12)}...</div>
                      </div>
                    </td>
                    <td className="font-bold text-black">
                      {formatVotingPower(validator.voting_power)}
                    </td>
                    <td className="text-black">{validator.commission}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-bold ${
                        validator.status === 'Active' 
                          ? 'bg-[#008000] text-white border border-black' 
                          : 'bg-[#ff0000] text-white border border-black'
                      }`}>
                        {validator.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 