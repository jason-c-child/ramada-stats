'use client';

import { useState, useEffect, useRef } from 'react';
import { indexerClient, ValidatorStats } from '../lib/indexer-client';
import { timeSeriesStore } from '../lib/time-series-store';
import { useTheme } from '../contexts/ThemeContext';
import NetworkStatsCard from './NetworkStatsCard';
import ValidatorStatsCard from './ValidatorStatsCard';
import ChartsDashboard from './ChartsDashboard';
import ControlPanel from './ControlPanel';
import ValidatorExplorer from './ValidatorExplorer';
import CrossChainAnalytics from './CrossChainAnalytics';
import PrivacyMetrics from './PrivacyMetrics';
import GovernanceDashboard from './GovernanceDashboard';
import AlertSystem from './AlertSystem';
import TransferFlowNetwork from './TransferFlowNetwork';

interface NetworkStats {
  latestBlock: string;
  currentEpoch: number;
  totalValidators: number;
  blockTime?: string;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [validatorStats, setValidatorStats] = useState<ValidatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(10000); // Default 10 seconds
  const [localStorageEnabled, setLocalStorageEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const lastBlockTimeRef = useRef<Date | null>(null);
  
  // Component minimize/maximize states
  const [validatorExplorerMinimized, setValidatorExplorerMinimized] = useState(false);
  const [validatorExplorerMaximized, setValidatorExplorerMaximized] = useState(false);
  const [crossChainAnalyticsMinimized, setCrossChainAnalyticsMinimized] = useState(false);
  const [crossChainAnalyticsMaximized, setCrossChainAnalyticsMaximized] = useState(false);
  const [privacyMetricsMinimized, setPrivacyMetricsMinimized] = useState(false);
  const [privacyMetricsMaximized, setPrivacyMetricsMaximized] = useState(false);
  const [governanceDashboardMinimized, setGovernanceDashboardMinimized] = useState(false);
  const [governanceDashboardMaximized, setGovernanceDashboardMaximized] = useState(false);
  const [alertSystemMinimized, setAlertSystemMinimized] = useState(false);
  const [alertSystemMaximized, setAlertSystemMaximized] = useState(false);
  const [transferFlowNetworkMinimized, setTransferFlowNetworkMinimized] = useState(false);
  const [transferFlowNetworkMaximized, setTransferFlowNetworkMaximized] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Load settings from localStorage only on client
    const savedInterval = localStorage.getItem('namada-polling-interval');
    const savedLocalStorage = localStorage.getItem('namada-local-storage-enabled');
    
    if (savedInterval) {
      setPollingInterval(parseInt(savedInterval));
    }
    
    if (savedLocalStorage) {
      const enabled = JSON.parse(savedLocalStorage);
      setLocalStorageEnabled(enabled);
      timeSeriesStore.setConfig({ localStorageEnabled: enabled });
    }
  }, []);

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
    const interval = setInterval(fetchData, pollingInterval);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handlePollingIntervalChange = (newInterval: number) => {
    setPollingInterval(newInterval);
    localStorage.setItem('namada-polling-interval', newInterval.toString());
  };

  const handleLocalStorageToggle = (enabled: boolean) => {
    setLocalStorageEnabled(enabled);
    localStorage.setItem('namada-local-storage-enabled', JSON.stringify(enabled));
    timeSeriesStore.setConfig({ localStorageEnabled: enabled });
  };

  if (error && !networkStats) {
    return (
      <div className={`min-h-screen p-4 flex items-center justify-center ${theme === 'win95' ? 'bg-[#008080]' : theme === 'winxp' ? 'bg-gradient-to-br from-[#245edc] to-[#1e3a8a]' : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]'}`}>
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
      <div className={`min-h-screen p-4 ${theme === 'win95' ? 'bg-[#008080]' : theme === 'winxp' ? 'bg-gradient-to-br from-[#245edc] to-[#1e3a8a]' : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="win95-window mb-4">
            <div className="win95-title-bar flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="win95-icon bg-[#0000ff] border border-black"></div>
                <span>Namada Analytics Dashboard</span>
              </div>
              
              <div className="flex space-x-1">
                <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">□</button>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMaximized ? 'fixed inset-0' : 'min-h-screen'} p-4 ${theme === 'win95' ? 'bg-[#008080]' : theme === 'winxp' ? 'bg-gradient-to-br from-[#245edc] to-[#1e3a8a]' : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]'}`}>
      <div className={`${isMaximized ? 'h-full' : 'max-w-7xl'} mx-auto`}>
        {/* Main Window */}
        <div className="win95-window mb-4">
          <div className="win95-title-bar flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="win95-icon bg-[#0000ff] border border-black"></div>
              <span>Namada Analytics Dashboard</span>
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
                {/* Core Network Stats */}
                <NetworkStatsCard stats={networkStats} pollingInterval={pollingInterval} />
                <ValidatorStatsCard stats={validatorStats} />
                
                {/* Charts Dashboard */}
                <ChartsDashboard />
                
                {/* Phase 3 Advanced Analytics */}
                <PrivacyMetrics
                  isMinimized={privacyMetricsMinimized}
                  isMaximized={privacyMetricsMaximized}
                  onMinimize={() => setPrivacyMetricsMinimized(!privacyMetricsMinimized)}
                  onMaximize={() => setPrivacyMetricsMaximized(!privacyMetricsMaximized)}
                />
                
                <GovernanceDashboard
                  isMinimized={governanceDashboardMinimized}
                  isMaximized={governanceDashboardMaximized}
                  onMinimize={() => setGovernanceDashboardMinimized(!governanceDashboardMinimized)}
                  onMaximize={() => setGovernanceDashboardMaximized(!governanceDashboardMaximized)}
                />
                
                <AlertSystem
                  isMinimized={alertSystemMinimized}
                  isMaximized={alertSystemMaximized}
                  onMinimize={() => setAlertSystemMinimized(!alertSystemMinimized)}
                  onMaximize={() => setAlertSystemMaximized(!alertSystemMaximized)}
                />
                
                <TransferFlowNetwork
                  isMinimized={transferFlowNetworkMinimized}
                  isMaximized={transferFlowNetworkMaximized}
                  onMinimize={() => setTransferFlowNetworkMinimized(!transferFlowNetworkMinimized)}
                  onMaximize={() => setTransferFlowNetworkMaximized(!transferFlowNetworkMaximized)}
                />
                
                {/* Phase 2 Components */}
                <ValidatorExplorer
                  isMinimized={validatorExplorerMinimized}
                  isMaximized={validatorExplorerMaximized}
                  onMinimize={() => setValidatorExplorerMinimized(!validatorExplorerMinimized)}
                  onMaximize={() => setValidatorExplorerMaximized(!validatorExplorerMaximized)}
                />
                
                <CrossChainAnalytics
                  isMinimized={crossChainAnalyticsMinimized}
                  isMaximized={crossChainAnalyticsMaximized}
                  onMinimize={() => setCrossChainAnalyticsMinimized(!crossChainAnalyticsMinimized)}
                  onMaximize={() => setCrossChainAnalyticsMaximized(!crossChainAnalyticsMaximized)}
                />
                
                {/* Control Panel */}
                {isClient && (
                  <ControlPanel
                    onPollingIntervalChange={handlePollingIntervalChange}
                    onLocalStorageToggle={handleLocalStorageToggle}
                    currentPollingInterval={pollingInterval}
                    localStorageEnabled={localStorageEnabled}
                  />
                )}
                
                {/* Status Bar */}
                <div className="win95-status-bar flex items-center justify-between">
                  <span>Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Unknown'}</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-[#008000] border border-black mr-2"></div>
                    Live data (updates every {pollingInterval / 1000}s)
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
