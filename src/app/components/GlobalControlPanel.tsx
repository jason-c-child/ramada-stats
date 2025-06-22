'use client';

import { useState } from 'react';
import { useGlobal } from '../contexts/GlobalContext';
import ThemeSwitcher from './ThemeSwitcher';

export default function GlobalControlPanel() {
  const { pollingIntervals, setPollingInterval, localStorageEnabled, setLocalStorageEnabled } = useGlobal();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState<string | null>(null);

  const namadaPollingOptions = [
    { value: 5000, label: '5 seconds' },
    { value: 10000, label: '10 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' }
  ];

  const solanaPollingOptions = [
    { value: 60000, label: '1 minute' },
    { value: 120000, label: '2 minutes' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' }
  ];

  const clearAllLocalData = () => {
    if (typeof window !== 'undefined') {
      // Clear all localStorage items
      const keysToRemove = [
        'global-namada-polling-interval',
        'global-solana-polling-interval',
        'global-local-storage-enabled',
        'namada-time-series-data',
        'namada-time-series-config',
        'namada-alerts',
        'namada-notifications',
        'namada-alert-triggers',
        'namada-polling-interval',
        'namada-local-storage-enabled',
        'namada-webhooks'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear the in-memory store
      if ((window as any).timeSeriesStore) {
        (window as any).timeSeriesStore.clear();
      }
      
      alert('All local data cleared successfully! The page will refresh to apply changes.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const getLocalStorageStats = () => {
    if (typeof window === 'undefined') return { totalSize: 0, itemCount: 0 };
    
    let totalSize = 0;
    let itemCount = 0;
    
    const allKeys = [
      'global-namada-polling-interval',
      'global-solana-polling-interval',
      'global-local-storage-enabled',
      'namada-time-series-data',
      'namada-time-series-config',
      'namada-alerts',
      'namada-notifications',
      'namada-alert-triggers',
      'namada-polling-interval',
      'namada-local-storage-enabled',
      'namada-webhooks'
    ];
    
    allKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
        itemCount++;
      }
    });
    
    return { totalSize, itemCount };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const exportConfiguration = () => {
    if (typeof window === 'undefined') return;
    
    const config = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        globalNamadaPollingInterval: pollingIntervals.namada,
        globalSolanaPollingInterval: pollingIntervals.solana,
        globalLocalStorageEnabled: localStorageEnabled,
        namadaTimeSeriesData: localStorage.getItem('namada-time-series-data'),
        namadaTimeSeriesConfig: localStorage.getItem('namada-time-series-config'),
        namadaAlerts: localStorage.getItem('namada-alerts'),
        namadaNotifications: localStorage.getItem('namada-notifications'),
        namadaAlertTriggers: localStorage.getItem('namada-alert-triggers'),
        namadaWebhooks: localStorage.getItem('namada-webhooks')
      }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-dashboard-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Configuration exported successfully!');
  };

  const importConfiguration = () => {
    if (typeof window === 'undefined') return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          
          if (config.version && config.data) {
            // Restore global configuration
            if (config.data.globalNamadaPollingInterval) {
              setPollingInterval('namada', config.data.globalNamadaPollingInterval);
            }
            if (config.data.globalSolanaPollingInterval) {
              setPollingInterval('solana', config.data.globalSolanaPollingInterval);
            }
            if (config.data.globalLocalStorageEnabled !== undefined) {
              setLocalStorageEnabled(config.data.globalLocalStorageEnabled);
            }
            
            // Restore data
            Object.entries(config.data).forEach(([key, value]) => {
              if (value && !key.startsWith('global')) {
                localStorage.setItem(`namada-${key.replace(/^namada/, '')}`, value as string);
              }
            });
            
            alert('Configuration imported successfully! The page will refresh to apply changes.');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            alert('Invalid configuration file format.');
          }
        } catch (error) {
          alert('Error importing configuration: ' + error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const stats = getLocalStorageStats();

  return (
    <div className="win95-window">
      <div className="win95-title-bar flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="win95-icon bg-[#0000ff] border border-black"></div>
          <span className="text-sm sm:text-base">Global Settings</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={() => setIsExpanded(!isExpanded)} className="win95-button text-xs px-1 sm:px-2 py-1">
            {isExpanded ? '_' : '□'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Namada Polling Interval */}
            <div className="win95-window-inset p-3 sm:p-4">
              <h3 className="text-base font-bold text-black mb-3">Namada Polling Rate</h3>
              <div className="space-y-2">
                {namadaPollingOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="namadaPollingInterval"
                      value={option.value}
                      checked={pollingIntervals.namada === option.value}
                      onChange={(e) => setPollingInterval('namada', parseInt(e.target.value))}
                      className="win95-radio"
                    />
                    <span className="text-sm text-black">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Solana Polling Interval */}
            <div className="win95-window-inset p-3 sm:p-4">
              <h3 className="text-base font-bold text-black mb-3">Solana Polling Rate</h3>
              <div className="space-y-2">
                {solanaPollingOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="solanaPollingInterval"
                      value={option.value}
                      checked={pollingIntervals.solana === option.value}
                      onChange={(e) => setPollingInterval('solana', parseInt(e.target.value))}
                      className="win95-radio"
                    />
                    <span className="text-sm text-black">{option.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600">
                Minimum 60 seconds for rate limiting
              </div>
            </div>

            {/* Local Storage */}
            <div className="win95-window-inset p-3 sm:p-4">
              <h3 className="text-base font-bold text-black mb-3">Data Storage</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localStorageEnabled}
                    onChange={(e) => setLocalStorageEnabled(e.target.checked)}
                    className="win95-checkbox"
                  />
                  <span className="text-sm text-black">Enable Local Storage</span>
                </label>
                
                <div className="text-xs text-gray-600">
                  <div>Storage used: {formatBytes(stats.totalSize)}</div>
                  <div>Items stored: {stats.itemCount}</div>
                </div>
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="win95-window-inset p-3 sm:p-4">
              <h3 className="text-base font-bold text-black mb-3">Theme</h3>
              <ThemeSwitcher />
            </div>

            {/* Data Management */}
            <div className="win95-window-inset p-3 sm:p-4">
              <h3 className="text-base font-bold text-black mb-3">Data Management</h3>
              <div className="space-y-2">
                <button
                  onClick={exportConfiguration}
                  className="win95-button text-xs w-full px-2 py-1"
                >
                  Export Config
                </button>
                <button
                  onClick={importConfiguration}
                  className="win95-button text-xs w-full px-2 py-1"
                >
                  Import Config
                </button>
                <button
                  onClick={() => setShowClearConfirm('all')}
                  className="win95-button text-xs w-full px-2 py-1 bg-red-600 text-white"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>

          {/* Clear Confirmation */}
          {showClearConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="win95-window max-w-md mx-4">
                <div className="win95-title-bar flex items-center justify-between">
                  <span className="text-sm font-bold">Confirm Action</span>
                  <button
                    onClick={() => setShowClearConfirm(null)}
                    className="win95-button text-xs px-2 py-1"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-black mb-4">
                    Are you sure you want to clear all local data? This action cannot be undone.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        clearAllLocalData();
                        setShowClearConfirm(null);
                      }}
                      className="win95-button text-xs px-3 py-1 bg-red-600 text-white"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(null)}
                      className="win95-button text-xs px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 