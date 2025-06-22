'use client';

import { useState, useEffect } from 'react';
import { indexerClient, ValidatorStats } from '../lib/indexer-client';
import NetworkStatsCard from './NetworkStatsCard';
import ValidatorStatsCard from './ValidatorStatsCard';

interface NetworkStats {
  latestBlock: any;
  currentEpoch: any;
  totalValidators: any;
  blockTime?: string;
}

export default function Dashboard() {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [validatorStats, setValidatorStats] = useState<ValidatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setError(null);
        
        const [network, validators] = await Promise.all([
          indexerClient.getNetworkStats(),
          indexerClient.getValidatorStats()
        ]);
        
        if (isMounted) {
          setNetworkStats(network);
          setValidatorStats(validators);
          setLastUpdate(new Date());
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
          setError(errorMessage);
          setNetworkStats(null);
          setValidatorStats(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (error && !networkStats) {
    return (
      <div className="min-h-screen bg-[#008080] p-4 flex items-center justify-center">
        <div className="win95-window max-w-md">
          <div className="win95-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="win95-icon bg-[#ff0000] border border-black"></div>
              <span>Error</span>
            </div>
            <div className="flex space-x-1">
              <button className="win95-button text-xs px-2 py-1">_</button>
              <button className="win95-button text-xs px-2 py-1">□</button>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="mb-4">
              <div className="win95-icon bg-[#ff0000] border border-black mx-auto mb-2"></div>
              <h1 className="text-lg font-bold text-black mb-2">Network Unavailable</h1>
              <p className="text-black mb-4">{error}</p>
            </div>
            <div className="text-sm text-black mb-6 text-left">
              <p className="mb-2">We're unable to connect to any Namada RPC endpoints.</p>
              <p className="mb-2">This could be due to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Network connectivity issues</li>
                <li>RPC endpoints being temporarily down</li>
                <li>High network congestion</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="win95-button"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="min-h-screen bg-[#008080] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="win95-window mb-4">
            <div className="win95-title-bar flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="win95-icon bg-[#0000ff] border border-black"></div>
                <span>Namada Analytics Dashboard</span>
              </div>
              <div className="flex space-x-1">
                <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">□</button>
                <button onClick={handleMaximize} className="win95-button text-xs px-2 py-1">□</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMaximized ? 'fixed inset-0' : 'min-h-screen'} bg-[#008080] p-4`}>
      <div className={`${isMaximized ? 'h-full' : 'max-w-7xl'} mx-auto`}>
        {/* Main Window */}
        <div className="win95-window mb-4">
          <div className="win95-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="win95-icon bg-[#0000ff] border border-black"></div>
              <span>Namada Analytics Dashboard</span>
            </div>
            <div className="flex space-x-1">
              <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">_</button>
              <button onClick={handleMaximize} className="win95-button text-xs px-2 py-1">□</button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="win95-window-inset inline-block p-4 mb-4">
                <div className="win95-icon bg-[#0000ff] border border-black mx-auto mb-2"></div>
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Namada Analytics
              </h1>
              <p className="text-black text-lg">
                Real-time blockchain metrics and network insights
              </p>
            </div>
            
            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <div className="win95-progress-bar mx-auto mb-4 w-64">
                  <div className="win95-progress-fill" style={{ width: '60%' }}></div>
                </div>
                <div className="text-black text-lg mb-2">Loading network data...</div>
                <div className="text-black text-sm">Connecting to Namada RPC endpoints</div>
              </div>
            ) : networkStats && validatorStats ? (
              <div className="space-y-6">
                <NetworkStatsCard stats={networkStats} />
                <ValidatorStatsCard stats={validatorStats} />
                
                {/* Status Bar */}
                <div className="win95-status-bar flex items-center justify-between">
                  <span>Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Unknown'}</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-[#008000] border border-black mr-2"></div>
                    Live data
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="win95-window-inset inline-block p-8">
                  <div className="win95-icon bg-[#ff0000] border border-black mx-auto mb-4"></div>
                  <h2 className="text-xl font-bold text-black mb-2">No Data Available</h2>
                  <p className="text-black">Unable to load network statistics</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
