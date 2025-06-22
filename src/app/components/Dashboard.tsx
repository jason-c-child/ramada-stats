'use client';

import { useState, useEffect, useRef } from 'react';
import { indexerClient, ValidatorStats } from '../lib/indexer-client';
import { timeSeriesStore } from '../lib/time-series-store';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobal } from '../contexts/GlobalContext';
import NetworkStatsCard from './NetworkStatsCard';
import ValidatorStatsCard from './ValidatorStatsCard';
import ChartsDashboard from './ChartsDashboard';
import ValidatorExplorer from './ValidatorExplorer';
import AlertSystem from './AlertSystem';

interface NetworkStats {
  latestBlock: string;
  currentEpoch: number;
  totalValidators: number;
  blockTime?: string;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const { pollingIntervals, localStorageEnabled } = useGlobal();
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [validatorStats, setValidatorStats] = useState<ValidatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastBlockTimeRef = useRef<Date | null>(null);
  const [formattedTime, setFormattedTime] = useState('');
  
  // Component minimize/maximize states
  const [validatorExplorerMinimized, setValidatorExplorerMinimized] = useState(false);
  const [alertSystemMinimized, setAlertSystemMinimized] = useState(false);

  useEffect(() => {
    if (lastUpdate) setFormattedTime(lastUpdate.toLocaleTimeString());
  }, [lastUpdate]);

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

          // Calculate block time in seconds
          const currentBlockTime = new Date(network.blockTime);
          let blockTimeSeconds = 0;
          
          if (lastBlockTimeRef.current) {
            const timeDiff = currentBlockTime.getTime() - lastBlockTimeRef.current.getTime();
            blockTimeSeconds = timeDiff / 1000; // Convert to seconds
          } else {
            // For the first data point, use a default block time (e.g., 5 seconds)
            blockTimeSeconds = 5;
          }
          
          lastBlockTimeRef.current = currentBlockTime;

          // Add data to time series store
          timeSeriesStore.addDataPoint(
            parseInt(network.latestBlock),
            blockTimeSeconds,
            validators.activeValidators,
            parseInt(validators.totalVotingPower),
            parseInt(validators.averageVotingPower)
          );
          console.log('Added data point to time series store:', {
            blockHeight: parseInt(network.latestBlock),
            blockTimeSeconds,
            activeValidators: validators.activeValidators,
            totalVotingPower: parseInt(validators.totalVotingPower),
            averageVotingPower: parseInt(validators.averageVotingPower)
          });
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
    const interval = setInterval(fetchData, pollingIntervals.namada);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollingIntervals.namada]);

  useEffect(() => {
    // Update time series store config when global localStorage setting changes
    timeSeriesStore.setConfig({ localStorageEnabled });
  }, [localStorageEnabled]);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (error && !networkStats) {
    return (
      <div className={`min-h-screen p-2 sm:p-4 flex items-center justify-center ${theme === 'win95' ? 'bg-[#008080]' : theme === 'winxp' ? 'bg-gradient-to-br from-[#245edc] to-[#1e3a8a]' : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]'}`}>
        <div className="win95-window w-full max-w-md mx-2">
          <div className="win95-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="win95-icon bg-[#ff0000] border border-black"></div>
              <span className="text-sm sm:text-base">Error</span>
            </div>
            <div className="flex space-x-1">
              <button className="win95-button text-xs px-1 sm:px-2 py-1">_</button>
              <button className="win95-button text-xs px-1 sm:px-2 py-1">□</button>
            </div>
          </div>
          <div className="p-3 sm:p-6 text-center">
            <div className="mb-4">
              <div className="win95-icon bg-[#ff0000] border border-black mx-auto mb-2"></div>
              <h1 className="text-base sm:text-lg font-bold text-black mb-2">Network Unavailable</h1>
              <p className="text-black mb-4 text-sm sm:text-base">{error}</p>
            </div>
            <div className="text-xs sm:text-sm text-black mb-6 text-left">
              <p className="mb-2">We&apos;re unable to connect to any Namada RPC endpoints.</p>
              <p className="mb-2">This could be due to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Network connectivity issues</li>
                <li>RPC endpoints being temporarily down</li>
                <li>High network congestion</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="win95-button text-sm sm:text-base px-3 sm:px-4 py-2"
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
      <div className={`min-h-screen p-2 sm:p-4 ${theme === 'win95' ? 'bg-[#008080]' : theme === 'winxp' ? 'bg-gradient-to-br from-[#245edc] to-[#1e3a8a]' : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="win95-window mb-4">
            <div className="win95-title-bar flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="win95-icon bg-[#0000ff] border border-black"></div>
                <span className="text-sm sm:text-base">Namada Analytics Dashboard</span>
              </div>
              
              <div className="flex space-x-1">
                <button onClick={handleMinimize} className="win95-button text-xs px-1 sm:px-2 py-1">□</button>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-1 sm:p-2 md:p-4 ${theme === 'win95' ? 'bg-[#008080]' : theme === 'winxp' ? 'bg-gradient-to-br from-[#245edc] to-[#1e3a8a]' : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]'}`}>
      <div className={`max-w-7xl mx-auto`}>
        {/* Main Window */}
        <div className="win95-window mb-2 sm:mb-4">
          <div className="win95-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="win95-icon bg-[#0000ff] border border-black"></div>
              <span className="text-xs sm:text-sm md:text-base truncate">Namada Analytics Dashboard</span>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 md:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <div className="win95-window-inset inline-block p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4">
                <div className="win95-icon bg-[#0000ff] border border-black mx-auto mb-2"></div>
              </div>
              <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-black mb-1 sm:mb-2">
                Namada Analytics
              </h1>
              <p className="text-black text-xs sm:text-sm md:text-lg px-2">
                Real-time blockchain metrics and network insights
              </p>
            </div>
            
            {/* Content */}
            {loading ? (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <div className="win95-progress-bar mx-auto mb-4 w-32 sm:w-48 md:w-64">
                  <div className="win95-progress-fill" style={{ width: '60%' }}></div>
                </div>
                <div className="text-black text-sm sm:text-base md:text-lg mb-2">Loading network data...</div>
                <div className="text-black text-xs sm:text-sm">Connecting to Namada RPC endpoints</div>
              </div>
            ) : networkStats && validatorStats ? (
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* Core Network Stats */}
                <NetworkStatsCard stats={networkStats} pollingInterval={pollingIntervals.namada} />
                <ValidatorStatsCard stats={validatorStats} />
                
                {/* Charts Dashboard */}
                <ChartsDashboard />
                
                {/* Available Data Note */}
                <div className="win95-window-inset p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-black mb-2">Available Data</h3>
                  <div className="text-black text-xs sm:text-sm">
                    <p className="mb-2">This dashboard currently displays real-time data from Namada RPC endpoints:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 sm:ml-4">
                      <li>Network statistics (block height, epoch, validator count)</li>
                      <li>Validator information and voting power</li>
                      <li>Time series charts of network metrics</li>
                      <li>Validator explorer with real validator data</li>
                    </ul>
                    <p className="mt-2 mb-2">Solana dashboards are also available with:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 sm:ml-4">
                      <li>Solana network statistics (slot, epoch, TPS, validators)</li>
                      <li>Market data (price, market cap, circulating supply)</li>
                      <li>Time series charts for Solana metrics</li>
                      <li>Real-time performance monitoring</li>
                    </ul>
                    <p className="mt-2 text-gray-600">
                      Advanced features like governance, privacy metrics, and cross-chain analytics require additional APIs that are not currently available.
                    </p>
                  </div>
                </div>
                
                <AlertSystem
                  isMinimized={alertSystemMinimized}
                  onMinimize={() => setAlertSystemMinimized(!alertSystemMinimized)}
                />
                
                {/* Phase 2 Components */}
                <ValidatorExplorer
                  isMinimized={validatorExplorerMinimized}
                  onMinimize={() => setValidatorExplorerMinimized(!validatorExplorerMinimized)}
                />
                
                {/* Status Bar */}
                <div className="win95-status-bar flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-1 sm:space-y-0 p-2 sm:p-3">
                  <span className="text-xs sm:text-sm">Last updated: {formattedTime || 'Unknown'}</span>
                  <span className="flex items-center text-xs sm:text-sm">
                    <div className="w-2 h-2 bg-[#008000] border border-black mr-2"></div>
                    Live data (updates every {pollingIntervals.namada / 1000}s)
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <div className="win95-window-inset inline-block p-4 sm:p-6 md:p-8">
                  <div className="win95-icon bg-[#ff0000] border border-black mx-auto mb-4"></div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-black mb-2">No Data Available</h2>
                  <p className="text-black text-xs sm:text-sm md:text-base">Unable to load network statistics</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
