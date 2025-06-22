'use client';

import React from 'react';

interface CrossChainAnalyticsProps {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
}

export default function CrossChainAnalytics({
  isMinimized = false,
  isMaximized = false,
  onMinimize
}: CrossChainAnalyticsProps) {
  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#F59E0B] border border-black"></div>
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
          <div className="win95-icon bg-[#F59E0B] border border-black"></div>
          <span>Cross-Chain Analytics</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="win95-window-inset p-8 text-center">
          <div className="text-2xl font-bold text-black mb-4">Cross-Chain Data Unavailable</div>
          <div className="text-black mb-4">
            IBC (Inter-Blockchain Communication) data is not available from standard Namada RPC endpoints.
          </div>
          <div className="text-sm text-gray-600">
            This feature requires access to cross-chain APIs that are not currently available.
          </div>
        </div>
      </div>
    </div>
  );
} 