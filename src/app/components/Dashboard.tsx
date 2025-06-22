'use client';

import { useState, useEffect } from 'react';
import { indexerClient } from '../lib/indexer-client';
import NetworkStatsCard from './NetworkStatsCard';

interface NetworkStats {
  latestBlock: any;
  currentEpoch: any;
  totalValidators: any;
  blockTime?: string;
}

export default function Dashboard() {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setError(null);
        
        const network = await indexerClient.getNetworkStats();
        
        if (isMounted) {
          setNetworkStats(network);
          setLastUpdate(new Date());
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
          setError(errorMessage);
          setNetworkStats(null);
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

  if (error && !networkStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Network Unavailable</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="text-sm text-gray-400 mb-6">
            <p>We're unable to connect to any Namada RPC endpoints.</p>
            <p>This could be due to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Network connectivity issues</li>
              <li>RPC endpoints being temporarily down</li>
              <li>High network congestion</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Namada Analytics
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real-time blockchain metrics and network insights
          </p>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-xl text-gray-300">Loading network data...</div>
              <div className="text-sm text-gray-500 mt-2">Connecting to Namada RPC endpoints</div>
            </div>
          </div>
        ) : networkStats ? (
          <div className="grid gap-8 max-w-6xl mx-auto">
            <NetworkStatsCard stats={networkStats} />
            
            {/* Additional info */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Unknown'}</span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  Live data
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
              <p className="text-gray-400">Unable to load network statistics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
