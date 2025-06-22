'use client';

import { useState, useEffect } from 'react';
import { getSolanaStats } from '../lib/solana-client';
import { useGlobal } from '../contexts/GlobalContext';

interface SolanaDashboardProps {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
}

export default function SolanaDashboard({
  isMinimized = false,
  isMaximized = false,
  onMinimize
}: SolanaDashboardProps) {
  const { pollingIntervals } = useGlobal();
  const [solanaStats, setSolanaStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real data from Solana RPC
        const stats = await getSolanaStats();
        setSolanaStats(stats);
      } catch (err) {
        console.error('Failed to fetch Solana data:', err);
        setError('Failed to fetch Solana data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, pollingIntervals.solana);
    return () => clearInterval(interval);
  }, [pollingIntervals.solana]);

  useEffect(() => {
    setFormattedTime(new Date().toLocaleTimeString());
  }, [solanaStats]);

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#9945FF] border border-black"></div>
            <span>Solana Dashboard</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">□</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`win95-window ${isMaximized ? 'fixed inset-4 z-50' : ''}`}>
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#9945FF] border border-black"></div>
            <span>Solana Dashboard</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
          </div>
        </div>
        <div className="p-6">
          <div className="win95-window-inset p-8 text-center">
            <div className="text-black">Loading Solana data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`win95-window ${isMaximized ? 'fixed inset-4 z-50' : ''}`}>
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#9945FF] border border-black"></div>
            <span>Solana Dashboard</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
          </div>
        </div>
        <div className="p-6">
          <div className="win95-window-inset p-8 text-center">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="win95-button px-4 py-2"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`win95-window ${isMaximized ? 'fixed inset-4 z-50' : ''}`}>
      <div className="win95-title-bar flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="win95-icon bg-[#9945FF] border border-black"></div>
          <span>Solana Dashboard</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Network Stats */}
          {solanaStats && (
            <>
              <div className="win95-window-inset p-4 md:p-6">
                <h3 className="text-lg font-bold text-black mb-4">Network Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black">Latest Block:</span>
                    <span className="text-black font-mono">{solanaStats.blockHeight?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Current Slot:</span>
                    <span className="text-black font-mono">{solanaStats.slot?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Current Epoch:</span>
                    <span className="text-black">{solanaStats.epoch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Total Validators:</span>
                    <span className="text-black">{solanaStats.totalValidators}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Active Validators:</span>
                    <span className="text-black">{solanaStats.activeValidators}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Total Stake:</span>
                    <span className="text-black">{solanaStats.totalStake?.toFixed(2)} SOL</span>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              {solanaStats.price && (
                <div className="win95-window-inset p-4 md:p-6">
                  <h3 className="text-lg font-bold text-black mb-4">SOL Price</h3>
                  <div className="text-2xl font-bold text-black mb-2">
                    ${solanaStats.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Real-time from CoinGecko
                  </div>
                  {solanaStats.marketCap && (
                    <div className="text-sm text-black">
                      Market Cap: ${(solanaStats.marketCap / 1e9).toFixed(2)}B
                    </div>
                  )}
                  <div className="text-sm text-black">
                    Supply: {solanaStats.circulatingSupply?.toFixed(0)} SOL
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Data Availability Notice */}
          <div className="win95-window-inset p-4 md:p-6">
            <h3 className="text-lg font-bold text-black mb-4">Data Availability</h3>
            <div className="text-sm text-black space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 border border-black mr-2"></div>
                <span>Network Stats (RPC)</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 border border-black mr-2"></div>
                <span>SOL Price (CoinGecko)</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 border border-black mr-2"></div>
                <span>Validator Count (RPC)</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 border border-black mr-2"></div>
                <span>Total Stake (RPC)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="win95-status-bar flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0 p-2 sm:p-3 mt-4 sm:mt-6">
          <span className="text-xs sm:text-sm">
            Last updated: {formattedTime}
          </span>
          <span className="flex items-center text-xs sm:text-sm">
            <div className="w-2 h-2 bg-[#008000] border border-black mr-2"></div>
            Solana mainnet (updates every {pollingIntervals.solana / 1000}s)
          </span>
        </div>
      </div>
    </div>
  );
} 