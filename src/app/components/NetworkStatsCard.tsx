'use client';

import { useState } from 'react';

interface NetworkStats {
  latestBlock: any;
  currentEpoch: any;
  totalValidators: any;
}

export default function NetworkStatsCard({ stats }: { stats: NetworkStats }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

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
            <div className="win95-icon bg-[#0000ff] border border-black"></div>
            <span>Network Statistics</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">□</button>
            <button onClick={handleMaximize} className="win95-button text-xs px-2 py-1">□</button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`win95-window ${isMaximized ? 'fixed inset-4 z-50' : ''}`}>
      <div className="win95-title-bar flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="win95-icon bg-[#0000ff] border border-black"></div>
          <span>Network Statistics</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">_</button>
          <button onClick={handleMaximize} className="win95-button text-xs px-2 py-1">□</button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Latest Block */}
          <div className="win95-window-inset p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="win95-icon bg-[#0000ff] border border-black"></div>
              <div className="w-2 h-2 bg-[#0000ff] border border-black"></div>
            </div>
            <div className="text-black text-sm font-bold mb-1">Latest Block</div>
            <div className="text-2xl font-bold text-black mb-1">
              {formatNumber(stats.latestBlock)}
            </div>
            <div className="text-black text-xs">Current block height</div>
          </div>
          
          {/* Current Epoch */}
          <div className="win95-window-inset p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="win95-icon bg-[#008000] border border-black"></div>
              <div className="w-2 h-2 bg-[#008000] border border-black"></div>
            </div>
            <div className="text-black text-sm font-bold mb-1">Current Epoch</div>
            <div className="text-2xl font-bold text-black mb-1">
              {formatNumber(stats.currentEpoch)}
            </div>
            <div className="text-black text-xs">Active epoch number</div>
          </div>
          
          {/* Total Validators */}
          <div className="win95-window-inset p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="win95-icon bg-[#800080] border border-black"></div>
              <div className="w-2 h-2 bg-[#800080] border border-black"></div>
            </div>
            <div className="text-black text-sm font-bold mb-1">Total Validators</div>
            <div className="text-2xl font-bold text-black mb-1">
              {formatNumber(stats.totalValidators)}
            </div>
            <div className="text-black text-xs">Active validators</div>
          </div>
        </div>
        
        {/* Network Status */}
        <div className="mt-6 pt-4 border-t border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#008000] border border-black"></div>
                <div className="w-2 h-2 bg-[#008000] border border-black"></div>
                <div className="w-2 h-2 bg-[#008000] border border-black"></div>
              </div>
              <span className="text-black text-sm font-bold">Network Online</span>
            </div>
            <div className="text-black text-sm">
              Data refreshes every 30 seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  