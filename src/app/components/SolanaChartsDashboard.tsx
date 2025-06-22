'use client';

import { useState, useEffect } from 'react';
import { useGlobal } from '../contexts/GlobalContext';
import SolanaTimeSeriesChart from './SolanaTimeSeriesChart';

interface TPSDataPoint {
  timestamp: number;
  tps: number;
}

export default function SolanaChartsDashboard() {
  const { pollingIntervals } = useGlobal();
  const [tpsData, setTpsData] = useState<TPSDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/solana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'getTimeSeries' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      if (data.success && data.data) {
        setTpsData(data.data);
        setLastUpdate(new Date());
        console.log('SolanaChartsDashboard: Received TPS data:', data.data);
      } else {
        const errorMsg = data.error || data.message || 'Failed to fetch Solana data';
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Failed to fetch Solana data:', err);
      let errorMessage = 'Failed to fetch Solana data';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollingIntervals.solana);
    return () => clearInterval(interval);
  }, [pollingIntervals.solana]);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchData();
  };

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#ff8000] border border-black"></div>
            <span className="text-sm sm:text-base">Solana Charts</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={handleMinimize} className="win95-button text-xs px-1 sm:px-2 py-1">□</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#ff8000] border border-black"></div>
            <span className="text-sm sm:text-base">Solana Charts</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={handleMinimize} className="win95-button text-xs px-1 sm:px-2 py-1">_</button>
          </div>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          <div className="win95-window-inset p-4 md:p-6 lg:p-8 text-center">
            <div className="win95-progress-bar mx-auto mb-3 md:mb-4 w-32 sm:w-48">
              <div className="win95-progress-fill" style={{ width: '60%' }}></div>
            </div>
            <div className="text-black mb-2">Loading Solana data...</div>
            <div className="text-sm text-gray-600">Connecting to Solana RPC endpoints</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#ff8000] border border-black"></div>
            <span className="text-sm sm:text-base">Solana Charts</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={handleMinimize} className="win95-button text-xs px-1 sm:px-2 py-1">_</button>
          </div>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          <div className="win95-window-inset p-4 md:p-6 lg:p-8 text-center">
            <div className="text-red-600 mb-3 md:mb-4">
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-black mb-2">Failed to load Solana data</div>
            <div className="text-sm text-gray-600 mb-3 md:mb-4">{error}</div>
            <button 
              onClick={handleRetry}
              className="win95-button px-3 py-1 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="win95-window">
      <div className="win95-title-bar flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="win95-icon bg-[#ff8000] border border-black"></div>
          <span className="text-sm sm:text-base">Solana Charts</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={handleMinimize} className="win95-button text-xs px-1 sm:px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* TPS Chart */}
          {tpsData.length > 0 ? (
            <div className="win95-window-inset p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Transactions Per Second</h3>
              <div className="h-48 sm:h-64 md:h-80 lg:h-96">
                <SolanaTimeSeriesChart 
                  data={tpsData} 
                  title="TPS"
                />
              </div>
            </div>
          ) : (
            <div className="win95-window-inset p-3 sm:p-4">
              <div className="text-center text-black">
                <div className="text-base sm:text-lg font-bold mb-2">No Data Available</div>
                <div className="text-sm text-gray-600">
                  TPS data will appear here once available from Solana RPC endpoints.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Controls */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-black">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-black text-xs sm:text-sm">
                Data points: {tpsData.length}
              </span>
              {lastUpdate && (
                <span className="text-black text-xs sm:text-sm">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="text-black text-xs sm:text-sm">
              Charts update every {pollingIntervals.solana / 1000} seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 