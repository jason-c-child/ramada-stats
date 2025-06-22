'use client';

import { useState } from 'react';
import ThemeSwitcher from './ThemeSwitcher';

interface ControlPanelProps {
  onPollingIntervalChange: (interval: number) => void;
  onLocalStorageToggle: (enabled: boolean) => void;
  currentPollingInterval: number;
  localStorageEnabled: boolean;
}

export default function ControlPanel({
  onPollingIntervalChange,
  onLocalStorageToggle,
  currentPollingInterval,
  localStorageEnabled
}: ControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState<string | null>(null);

  const pollingOptions = [
    { value: 5000, label: '5 seconds' },
    { value: 10000, label: '10 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' }
  ];

  const clearTimeSeriesData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('namada-time-series-data');
      localStorage.removeItem('namada-time-series-config');
      // Also clear the in-memory store
      if ((window as any).timeSeriesStore) {
        (window as any).timeSeriesStore.clear();
      }
      alert('Time series data cleared successfully!');
    }
  };

  const clearAlertData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('namada-alerts');
      localStorage.removeItem('namada-notifications');
      localStorage.removeItem('namada-alert-triggers');
      alert('Alert data cleared successfully!');
    }
  };

  const clearAllLocalData = () => {
    if (typeof window !== 'undefined') {
      // Clear all Namada-related localStorage items
      const keysToRemove = [
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
    
    const namadaKeys = [
      'namada-time-series-data',
      'namada-time-series-config',
      'namada-alerts',
      'namada-notifications',
      'namada-alert-triggers',
      'namada-polling-interval',
      'namada-local-storage-enabled',
      'namada-webhooks'
    ];
    
    namadaKeys.forEach(key => {
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
        pollingInterval: currentPollingInterval,
        localStorageEnabled: localStorageEnabled,
        timeSeriesData: localStorage.getItem('namada-time-series-data'),
        timeSeriesConfig: localStorage.getItem('namada-time-series-config'),
        alerts: localStorage.getItem('namada-alerts'),
        notifications: localStorage.getItem('namada-notifications'),
        alertTriggers: localStorage.getItem('namada-alert-triggers'),
        webhooks: localStorage.getItem('namada-webhooks')
      }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `namada-analytics-config-${new Date().toISOString().split('T')[0]}.json`;
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
            // Restore configuration
            if (config.data.pollingInterval) {
              onPollingIntervalChange(config.data.pollingInterval);
            }
            if (config.data.localStorageEnabled !== undefined) {
              onLocalStorageToggle(config.data.localStorageEnabled);
            }
            
            // Restore data
            Object.entries(config.data).forEach(([key, value]) => {
              if (value && key !== 'pollingInterval' && key !== 'localStorageEnabled') {
                localStorage.setItem(`namada-${key}`, value as string);
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
          <span>Control Panel</span>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="win95-button text-xs px-2 py-1"
          >
            {isExpanded ? '_' : '□'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Polling Interval Control */}
            <div className="win95-window-inset p-4">
              <h3 className="text-black font-bold mb-4">Data Refresh Rate</h3>
              <div className="space-y-2">
                {pollingOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="pollingInterval"
                      value={option.value}
                      checked={currentPollingInterval === option.value}
                      onChange={(e) => onPollingIntervalChange(parseInt(e.target.value))}
                      className="win95-radio"
                    />
                    <span className="text-black text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Local Storage Control */}
            <div className="win95-window-inset p-4">
              <h3 className="text-black font-bold mb-4">Data Persistence</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localStorageEnabled}
                    onChange={(e) => onLocalStorageToggle(e.target.checked)}
                    className="win95-checkbox"
                  />
                  <span className="text-black text-sm">Enable Local Storage</span>
                </label>
                <p className="text-black text-xs">
                  Store time series data locally for offline viewing
                </p>
                
                {/* Storage Stats */}
                <div className="mt-3 p-2 bg-gray-100 border border-gray-300">
                  <div className="text-black text-xs">
                    <div><strong>Storage Usage:</strong> {formatBytes(stats.totalSize)}</div>
                    <div><strong>Items Stored:</strong> {stats.itemCount}</div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="win95-button text-xs px-2 py-1 mt-2"
                  >
                    Refresh Stats
                  </button>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="win95-window-inset p-4 md:col-span-2">
              <h3 className="text-black font-bold mb-4">Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-black font-semibold text-sm mb-2">Time Series Data</h4>
                  <p className="text-black text-xs mb-2">
                    Historical network metrics and charts data
                  </p>
                  <button
                    onClick={() => setShowClearConfirm('timeSeries')}
                    className="win95-button text-xs px-3 py-1 bg-yellow-600 text-white"
                  >
                    Clear Time Series
                  </button>
                </div>
                
                <div>
                  <h4 className="text-black font-semibold text-sm mb-2">Alert Data</h4>
                  <p className="text-black text-xs mb-2">
                    Custom alerts, notifications, and trigger history
                  </p>
                  <button
                    onClick={() => setShowClearConfirm('alerts')}
                    className="win95-button text-xs px-3 py-1 bg-orange-600 text-white"
                  >
                    Clear Alerts
                  </button>
                </div>
                
                <div>
                  <h4 className="text-black font-semibold text-sm mb-2">All Data</h4>
                  <p className="text-black text-xs mb-2">
                    Clear all locally stored data and settings
                  </p>
                  <button
                    onClick={() => setShowClearConfirm('all')}
                    className="win95-button text-xs px-3 py-1 bg-red-600 text-white"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
              
              {/* Export/Import Section */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <h4 className="text-black font-semibold text-sm mb-2">Configuration Backup</h4>
                <p className="text-black text-xs mb-3">
                  Export your configuration and data for backup, or import from a previous backup
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={exportConfiguration}
                    className="win95-button text-xs px-3 py-1 bg-green-600 text-white"
                  >
                    Export Config
                  </button>
                  <button
                    onClick={importConfiguration}
                    className="win95-button text-xs px-3 py-1 bg-blue-600 text-white"
                  >
                    Import Config
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="win95-window-inset p-4 md:col-span-2">
              <ThemeSwitcher />
            </div>
          </div>

          {/* Confirmation Dialogs */}
          {showClearConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="win95-window max-w-md">
                <div className="win95-title-bar flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="win95-icon bg-[#ff0000] border border-black"></div>
                    <span>Confirm Action</span>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => setShowClearConfirm(null)}
                      className="win95-button text-xs px-2 py-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-black font-bold mb-4">
                    {showClearConfirm === 'timeSeries' && 'Clear Time Series Data'}
                    {showClearConfirm === 'alerts' && 'Clear Alert Data'}
                    {showClearConfirm === 'all' && 'Clear All Local Data'}
                  </h3>
                  <p className="text-black text-sm mb-4">
                    {showClearConfirm === 'timeSeries' && 
                      'This will permanently delete all stored time series data including historical charts and metrics. This action cannot be undone.'}
                    {showClearConfirm === 'alerts' && 
                      'This will permanently delete all custom alerts, notifications, and trigger history. This action cannot be undone.'}
                    {showClearConfirm === 'all' && 
                      'This will permanently delete ALL locally stored data including settings, alerts, time series data, and configurations. The page will refresh after clearing. This action cannot be undone.'}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (showClearConfirm === 'timeSeries') {
                          clearTimeSeriesData();
                        } else if (showClearConfirm === 'alerts') {
                          clearAlertData();
                        } else if (showClearConfirm === 'all') {
                          clearAllLocalData();
                        }
                        setShowClearConfirm(null);
                      }}
                      className="win95-button bg-red-600 text-white"
                    >
                      Confirm Clear
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(null)}
                      className="win95-button"
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