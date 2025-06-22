'use client';

import { useState, useEffect, useRef } from 'react';

interface Alert {
  id: string;
  name: string;
  description: string;
  type: 'block-height' | 'voting-power' | 'validator-count' | 'privacy-metrics' | 'governance' | 'cross-chain';
  condition: 'above' | 'below' | 'equals' | 'changes';
  threshold: number;
  enabled: boolean;
  lastTriggered?: number;
  lastValue?: number;
  notificationMethod: 'browser' | 'webhook';
  webhookUrl?: string;
  email?: string;
  createdAt: number;
  cooldown?: number; // Cooldown period in minutes
  triggerCount: number;
}

interface AlertTrigger {
  id: string;
  alertId: string;
  alertName: string;
  message: string;
  value: number;
  threshold: number;
  condition: string;
  timestamp: number;
  notificationSent: boolean;
}

interface AlertSystemProps {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface NetworkData {
  networkStats?: any;
  validatorStats?: any;
  privacyMetrics?: any;
  governance?: any;
  crossChain?: any;
}

export default function AlertSystem({
  isMinimized = false,
  isMaximized = false,
  onMinimize,
  onMaximize
}: AlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    name: '',
    description: '',
    type: 'block-height',
    condition: 'above',
    threshold: 0,
    enabled: true,
    notificationMethod: 'browser',
    cooldown: 5,
    triggerCount: 0
  });
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: number;
    read: boolean;
  }>>([]);
  const [alertTriggers, setAlertTriggers] = useState<AlertTrigger[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [checkInterval, setCheckInterval] = useState(30000); // 30 seconds default
  const [webhookStatus, setWebhookStatus] = useState<{[key: string]: 'success' | 'error' | 'pending'}>({});
  
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastValuesRef = useRef<{[key: string]: number}>({});

  // Load alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem('namada-alerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }

    const savedNotifications = localStorage.getItem('namada-notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedTriggers = localStorage.getItem('namada-alert-triggers');
    if (savedTriggers) {
      setAlertTriggers(JSON.parse(savedTriggers));
    }
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('namada-alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('namada-notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save alert triggers to localStorage
  useEffect(() => {
    localStorage.setItem('namada-alert-triggers', JSON.stringify(alertTriggers));
  }, [alertTriggers]);

  // Start alert checking interval
  useEffect(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(() => {
      checkAlerts();
    }, checkInterval);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [alerts, checkInterval]);

  const fetchNetworkData = async (): Promise<NetworkData> => {
    try {
      const [networkResponse, validatorResponse, privacyResponse, governanceResponse, crossChainResponse] = await Promise.all([
        fetch('/api/analytics?endpoint=network-stats'),
        fetch('/api/analytics?endpoint=validator-stats'),
        fetch('/api/analytics?endpoint=privacy-metrics'),
        fetch('/api/analytics?endpoint=governance'),
        fetch('/api/analytics?endpoint=cross-chain')
      ]);

      const data: NetworkData = {};
      
      if (networkResponse.ok) {
        const result = await networkResponse.json();
        data.networkStats = result.data;
      }
      
      if (validatorResponse.ok) {
        const result = await validatorResponse.json();
        data.validatorStats = result.data;
      }
      
      if (privacyResponse.ok) {
        const result = await privacyResponse.json();
        data.privacyMetrics = result.data;
      }
      
      if (governanceResponse.ok) {
        const result = await governanceResponse.json();
        data.governance = result.data;
      }
      
      if (crossChainResponse.ok) {
        const result = await crossChainResponse.json();
        data.crossChain = result.data;
      }

      return data;
    } catch (error) {
      console.error('Error fetching network data:', error);
      return {};
    }
  };

  const getCurrentValue = (alert: Alert, data: NetworkData): number | null => {
    switch (alert.type) {
      case 'block-height':
        return data.networkStats?.latestBlock || null;
      case 'voting-power':
        return data.validatorStats?.totalVotingPower || null;
      case 'validator-count':
        return data.validatorStats?.totalValidators || null;
      case 'privacy-metrics':
        return data.privacyMetrics?.totalShieldedBalance || null;
      case 'governance':
        return data.governance?.stats?.activeProposals || null;
      case 'cross-chain':
        return data.crossChain?.bridgeActivity?.totalTransfers || null;
      default:
        return null;
    }
  };

  const checkAlertCondition = (alert: Alert, currentValue: number, lastValue?: number): boolean => {
    const cooldownExpired = !alert.lastTriggered || 
      (Date.now() - alert.lastTriggered) > (alert.cooldown || 5) * 60 * 1000;

    if (!cooldownExpired) return false;

    switch (alert.condition) {
      case 'above':
        return currentValue > alert.threshold;
      case 'below':
        return currentValue < alert.threshold;
      case 'equals':
        return Math.abs(currentValue - alert.threshold) < 0.01;
      case 'changes':
        return lastValue !== undefined && Math.abs(currentValue - lastValue) > 0.01;
      default:
        return false;
    }
  };

  const sendWebhookNotification = async (alert: Alert, trigger: AlertTrigger): Promise<boolean> => {
    if (!alert.webhookUrl) return false;

    try {
      setWebhookStatus(prev => ({ ...prev, [alert.id]: 'pending' }));

      const webhookData = {
        alert: {
          id: alert.id,
          name: alert.name,
          description: alert.description,
          type: alert.type,
          condition: alert.condition,
          threshold: alert.threshold
        },
        trigger: {
          id: trigger.id,
          message: trigger.message,
          value: trigger.value,
          timestamp: trigger.timestamp
        },
        network: {
          timestamp: new Date().toISOString(),
          source: 'Namada Analytics Dashboard'
        }
      };

      const response = await fetch(alert.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Namada-Analytics-Dashboard/1.0'
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        setWebhookStatus(prev => ({ ...prev, [alert.id]: 'success' }));
        return true;
      } else {
        setWebhookStatus(prev => ({ ...prev, [alert.id]: 'error' }));
        return false;
      }
    } catch (error) {
      console.error('Webhook notification failed:', error);
      setWebhookStatus(prev => ({ ...prev, [alert.id]: 'error' }));
      return false;
    }
  };

  const sendBrowserNotification = (alert: Alert, trigger: AlertTrigger) => {
    // Check if Notification API is available
    if (!('Notification' in window)) {
      console.error('Notification API not supported');
      addNotification('Browser notifications not supported in this browser', 'error');
      return;
    }

    // Check permission status
    if (Notification.permission === 'denied') {
      console.error('Notification permission denied');
      addNotification('Browser notifications are blocked. Please enable them in your browser settings.', 'error');
      return;
    }

    if (Notification.permission === 'default') {
      console.log('Requesting notification permission...');
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Retry sending notification after permission is granted
          sendBrowserNotification(alert, trigger);
        } else {
          addNotification('Browser notifications denied by user', 'error');
        }
      });
      return;
    }

    // Permission is granted, send notification
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(`🚨 ${alert.name}`, {
          body: trigger.message,
          icon: '/favicon.ico',
          tag: `alert-${alert.id}`,
          requireInteraction: true,
          data: {
            alertId: alert.id,
            triggerId: trigger.id
          }
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        notification.onerror = (error) => {
          console.error('Notification error:', error);
          addNotification('Failed to send browser notification', 'error');
        };

        console.log('Browser notification sent successfully');
      } catch (error) {
        console.error('Error creating notification:', error);
        addNotification('Failed to create browser notification', 'error');
      }
    }
  };

  const checkAlerts = async () => {
    if (isChecking || alerts.filter(a => a.enabled).length === 0) return;

    setIsChecking(true);
    setLastCheckTime(new Date());

    try {
      const data = await fetchNetworkData();
      const triggeredAlerts: AlertTrigger[] = [];

      for (const alert of alerts.filter(a => a.enabled)) {
        const currentValue = getCurrentValue(alert, data);
        if (currentValue === null) continue;

        const lastValue = lastValuesRef.current[alert.id];
        const shouldTrigger = checkAlertCondition(alert, currentValue, lastValue);

        if (shouldTrigger) {
          const trigger: AlertTrigger = {
            id: `trigger-${Date.now()}-${alert.id}`,
            alertId: alert.id,
            alertName: alert.name,
            message: `${alert.name}: ${alert.type.replace('-', ' ')} is ${alert.condition} ${alert.threshold} (Current: ${currentValue})`,
            value: currentValue,
            threshold: alert.threshold,
            condition: alert.condition,
            timestamp: Date.now(),
            notificationSent: false
          };

          triggeredAlerts.push(trigger);

          // Update alert with trigger info
          setAlerts(prev => prev.map(a => 
            a.id === alert.id ? {
              ...a,
              lastTriggered: Date.now(),
              lastValue: currentValue,
              triggerCount: a.triggerCount + 1
            } : a
          ));

          // Send notifications
          if (alert.notificationMethod === 'webhook') {
            const webhookSuccess = await sendWebhookNotification(alert, trigger);
            trigger.notificationSent = webhookSuccess;
          } else if (alert.notificationMethod === 'browser') {
            console.log(`Sending browser notification for alert: ${alert.name}`);
            sendBrowserNotification(alert, trigger);
            trigger.notificationSent = true;
            console.log(`Browser notification sent for alert: ${alert.name}`);
          }

          // Add to notifications list
          addNotification(trigger.message, 'warning');
        }

        // Update last value for change detection
        lastValuesRef.current[alert.id] = currentValue;
      }

      if (triggeredAlerts.length > 0) {
        setAlertTriggers(prev => [...triggeredAlerts, ...prev].slice(0, 100)); // Keep last 100 triggers
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
      addNotification('Error checking alerts: ' + (error as Error).message, 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const createAlert = () => {
    if (!newAlert.name || !newAlert.description || newAlert.threshold === undefined) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }

    if (newAlert.notificationMethod === 'webhook' && !newAlert.webhookUrl) {
      addNotification('Webhook URL is required for webhook notifications', 'error');
      return;
    }

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      name: newAlert.name!,
      description: newAlert.description!,
      type: newAlert.type!,
      condition: newAlert.condition!,
      threshold: newAlert.threshold!,
      enabled: newAlert.enabled!,
      notificationMethod: newAlert.notificationMethod!,
      webhookUrl: newAlert.webhookUrl,
      email: newAlert.email,
      createdAt: Date.now(),
      cooldown: newAlert.cooldown || 5,
      triggerCount: 0
    };

    setAlerts([...alerts, alert]);
    setNewAlert({
      name: '',
      description: '',
      type: 'block-height',
      condition: 'above',
      threshold: 0,
      enabled: true,
      notificationMethod: 'browser',
      cooldown: 5,
      triggerCount: 0
    });
    setShowCreateForm(false);

    addNotification(`Alert "${alert.name}" created successfully`, 'success');
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    setAlertTriggers(prev => prev.filter(trigger => trigger.alertId !== id));
    addNotification('Alert deleted successfully', 'info');
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const testWebhook = async (alert: Alert) => {
    if (!alert.webhookUrl) {
      addNotification('No webhook URL configured', 'error');
      return;
    }

    try {
      setWebhookStatus(prev => ({ ...prev, [alert.id]: 'pending' }));

      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-webhook',
          data: {
            webhookUrl: alert.webhookUrl,
            alertData: {
              name: alert.name,
              description: alert.description,
              type: alert.type,
              condition: alert.condition,
              threshold: alert.threshold
            }
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setWebhookStatus(prev => ({ ...prev, [alert.id]: 'success' }));
        addNotification('Webhook test successful', 'success');
      } else {
        setWebhookStatus(prev => ({ ...prev, [alert.id]: 'error' }));
        addNotification(`Webhook test failed: ${result.error}`, 'error');
      }
    } catch (error) {
      setWebhookStatus(prev => ({ ...prev, [alert.id]: 'error' }));
      addNotification(`Webhook test failed: ${(error as Error).message}`, 'error');
    }
  };

  const addNotification = (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
    const notification = {
      id: `notification-${Date.now()}`,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    setNotifications([notification, ...notifications]);

    // Show browser notification for warnings and errors
    if (type === 'warning' || type === 'error') {
      // Check if Notification API is available
      if (!('Notification' in window)) {
        console.error('Notification API not supported');
        return;
      }

      // Check permission status
      if (Notification.permission === 'denied') {
        console.error('Notification permission denied');
        return;
      }

      if (Notification.permission === 'default') {
        // Don't request permission here, let the main alert system handle it
        return;
      }

      // Permission is granted, send notification
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification('Namada Analytics Alert', {
            body: message,
            icon: '/favicon.ico',
            tag: `notification-${type}`,
            requireInteraction: type === 'error'
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          notification.onerror = (error) => {
            console.error('Notification error:', error);
          };
        } catch (error) {
          console.error('Error creating notification:', error);
        }
      }
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const clearAlertTriggers = () => {
    setAlertTriggers([]);
  };

  const requestNotificationPermission = () => {
    // Check if Notification API is available
    if (!('Notification' in window)) {
      addNotification('Browser notifications not supported in this browser', 'error');
      return;
    }

    if (Notification.permission === 'granted') {
      addNotification('Browser notifications are already enabled', 'info');
      return;
    }

    if (Notification.permission === 'denied') {
      addNotification('Browser notifications are blocked. Please enable them in your browser settings and refresh the page.', 'error');
      return;
    }

    // Request permission
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        addNotification('Browser notifications enabled successfully!', 'success');
        // Send a test notification
        try {
          const testNotification = new Notification('Namada Analytics', {
            body: 'Browser notifications are now working!',
            icon: '/favicon.ico',
            tag: 'test-notification'
          });
          
          testNotification.onclick = () => {
            window.focus();
            testNotification.close();
          };
        } catch (error) {
          console.error('Error sending test notification:', error);
        }
      } else {
        addNotification('Browser notifications were denied. You can enable them later in your browser settings.', 'error');
      }
    }).catch(error => {
      console.error('Error requesting notification permission:', error);
      addNotification('Failed to request notification permission', 'error');
    });
  };

  const getAlertTypeIcon = (type: Alert['type']) => {
    const icons = {
      'block-height': '📊',
      'voting-power': '⚡',
      'validator-count': '👥',
      'privacy-metrics': '🔒',
      'governance': '🗳️',
      'cross-chain': '🌐'
    };
    return icons[type];
  };

  const getConditionSymbol = (condition: Alert['condition']) => {
    const symbols = {
      'above': '>',
      'below': '<',
      'equals': '=',
      'changes': '≠'
    };
    return symbols[condition];
  };

  const getWebhookStatusIcon = (status?: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const getNotificationStatus = () => {
    if (!('Notification' in window)) {
      return { status: 'unsupported', text: 'Not Supported', color: 'text-red-600' };
    }
    
    switch (Notification.permission) {
      case 'granted':
        return { status: 'granted', text: 'Enabled', color: 'text-green-600' };
      case 'denied':
        return { status: 'denied', text: 'Blocked', color: 'text-red-600' };
      case 'default':
        return { status: 'default', text: 'Not Set', color: 'text-yellow-600' };
      default:
        return { status: 'unknown', text: 'Unknown', color: 'text-gray-600' };
    }
  };

  const testBrowserNotification = () => {
    if (!('Notification' in window)) {
      addNotification('Browser notifications not supported in this browser', 'error');
      return;
    }

    if (Notification.permission !== 'granted') {
      addNotification('Please enable browser notifications first', 'error');
      return;
    }

    try {
      const testNotification = new Notification('🧪 Test Notification', {
        body: 'This is a test notification from Namada Analytics Dashboard. If you can see this, browser notifications are working correctly!',
        icon: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: true
      });

      testNotification.onclick = () => {
        window.focus();
        testNotification.close();
      };

      addNotification('Test notification sent successfully', 'success');
    } catch (error) {
      console.error('Error sending test notification:', error);
      addNotification('Failed to send test notification', 'error');
    }
  };

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#FF6B35] border border-black"></div>
            <span>Alert System</span>
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
          <div className="win95-icon bg-[#FF6B35] border border-black"></div>
          <span>Alert System</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-black">Custom Alerts</h2>
            <p className="text-sm text-gray-600">Monitor network metrics and get notified</p>
            <div className="flex items-center space-x-4 mt-2 text-xs">
              <span className="text-black">
                Status: {isChecking ? 'Checking...' : 'Idle'}
              </span>
              <span className="text-black">
                Last Check: {lastCheckTime ? lastCheckTime.toLocaleTimeString() : 'Never'}
              </span>
              <span className="text-black">
                Check Interval: {checkInterval / 1000}s
              </span>
              <span className={`${getNotificationStatus().color}`}>
                Notifications: {getNotificationStatus().text}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={requestNotificationPermission}
              className="win95-button text-sm px-3 py-1"
            >
              {getNotificationStatus().status === 'granted' ? 'Notifications Enabled' : 
               getNotificationStatus().status === 'denied' ? 'Enable in Settings' : 
               'Enable Notifications'}
            </button>
            {getNotificationStatus().status === 'granted' && (
              <button
                onClick={testBrowserNotification}
                className="win95-button text-sm px-3 py-1 bg-blue-600 text-white"
              >
                Test Notification
              </button>
            )}
            <button
              onClick={() => setShowCreateForm(true)}
              className="win95-button text-sm px-3 py-1"
            >
              Create Alert
            </button>
            <button
              onClick={checkAlerts}
              disabled={isChecking}
              className="win95-button text-sm px-3 py-1"
            >
              {isChecking ? 'Checking...' : 'Check Now'}
            </button>
            <a
              href="/webhook-receiver.html"
              target="_blank"
              rel="noopener noreferrer"
              className="win95-button text-sm px-3 py-1"
            >
              Test Webhook
            </a>
          </div>
        </div>

        {/* Create Alert Form */}
        {showCreateForm && (
          <div className="win95-window-inset p-4 mb-6">
            <h3 className="text-lg font-bold text-black mb-4">Create New Alert</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-black text-sm font-bold mb-1">Alert Name</label>
                <input
                  type="text"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                  className="win95-input w-full"
                  placeholder="e.g., High Block Time Alert"
                />
              </div>
              <div>
                <label className="block text-black text-sm font-bold mb-1">Alert Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as Alert['type'] })}
                  className="win95-select w-full"
                >
                  <option value="block-height">Block Height</option>
                  <option value="voting-power">Voting Power</option>
                  <option value="validator-count">Validator Count</option>
                  <option value="privacy-metrics">Privacy Metrics</option>
                  <option value="governance">Governance</option>
                  <option value="cross-chain">Cross-Chain</option>
                </select>
              </div>
              <div>
                <label className="block text-black text-sm font-bold mb-1">Condition</label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as Alert['condition'] })}
                  className="win95-select w-full"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="equals">Equals</option>
                  <option value="changes">Changes</option>
                </select>
              </div>
              <div>
                <label className="block text-black text-sm font-bold mb-1">Threshold</label>
                <input
                  type="number"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) })}
                  className="win95-input w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-black text-sm font-bold mb-1">Notification Method</label>
                <select
                  value={newAlert.notificationMethod}
                  onChange={(e) => setNewAlert({ ...newAlert, notificationMethod: e.target.value as Alert['notificationMethod'] })}
                  className="win95-select w-full"
                >
                  <option value="browser">Browser Notification</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
              <div>
                <label className="block text-black text-sm font-bold mb-1">Cooldown (minutes)</label>
                <input
                  type="number"
                  value={newAlert.cooldown}
                  onChange={(e) => setNewAlert({ ...newAlert, cooldown: parseInt(e.target.value) })}
                  className="win95-input w-full"
                  placeholder="5"
                  min="1"
                  max="1440"
                />
              </div>
              {newAlert.notificationMethod === 'webhook' && (
                <div>
                  <label className="block text-black text-sm font-bold mb-1">Webhook URL</label>
                  <input
                    type="url"
                    value={newAlert.webhookUrl}
                    onChange={(e) => setNewAlert({ ...newAlert, webhookUrl: e.target.value })}
                    className="win95-input w-full"
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-black text-sm font-bold mb-1">Description</label>
              <textarea
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                className="win95-input w-full"
                rows={3}
                placeholder="Describe what this alert monitors..."
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <button onClick={createAlert} className="win95-button">
                Create Alert
              </button>
              <button onClick={() => setShowCreateForm(false)} className="win95-button">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="win95-window-inset p-4 mb-6">
          <h3 className="text-lg font-bold text-black mb-4">Active Alerts ({alerts.filter(a => a.enabled).length})</h3>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No alerts configured</div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="win95-button"
              >
                Create Your First Alert
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-white border border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getAlertTypeIcon(alert.type)}</div>
                    <div>
                      <div className="font-bold text-black">{alert.name}</div>
                      <div className="text-sm text-gray-600">{alert.description}</div>
                      <div className="text-xs text-gray-500">
                        {alert.type.replace('-', ' ')} {getConditionSymbol(alert.condition)} {alert.threshold}
                        {alert.lastValue !== undefined && ` (Last: ${alert.lastValue})`}
                      </div>
                      <div className="text-xs text-gray-400">
                        Triggered {alert.triggerCount} times • Cooldown: {alert.cooldown}m
                        {alert.lastTriggered && ` • Last: ${new Date(alert.lastTriggered).toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${alert.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {alert.notificationMethod === 'webhook' && (
                      <span className="text-sm">{getWebhookStatusIcon(webhookStatus[alert.id])}</span>
                    )}
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className="win95-button text-xs px-2 py-1"
                    >
                      {alert.enabled ? 'Disable' : 'Enable'}
                    </button>
                    {alert.notificationMethod === 'webhook' && (
                      <button
                        onClick={() => testWebhook(alert)}
                        className="win95-button text-xs px-2 py-1 bg-blue-600 text-white"
                      >
                        Test
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="win95-button text-xs px-2 py-1 bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Triggers */}
        <div className="win95-window-inset p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">
              Recent Triggers ({alertTriggers.length})
            </h3>
            <button
              onClick={clearAlertTriggers}
              className="win95-button text-xs px-2 py-1"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alertTriggers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No triggers yet
              </div>
            ) : (
              alertTriggers.slice(0, 10).map((trigger) => (
                <div
                  key={trigger.id}
                  className="flex items-center justify-between p-2 border bg-white border-gray-300"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div>
                      <div className="text-sm text-black font-bold">{trigger.alertName}</div>
                      <div className="text-xs text-gray-600">{trigger.message}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(trigger.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {trigger.notificationSent ? '✅ Sent' : '❌ Failed'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="win95-window-inset p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">
              Notifications ({notifications.filter(n => !n.read).length} unread)
            </h3>
            <button
              onClick={clearAllNotifications}
              className="win95-button text-xs px-2 py-1"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center justify-between p-2 border ${
                    notification.read ? 'bg-gray-50' : 'bg-white'
                  } border-gray-300`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      notification.type === 'error' ? 'bg-red-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <div className={`text-sm ${notification.read ? 'text-gray-500' : 'text-black'}`}>
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markNotificationRead(notification.id)}
                      className="win95-button text-xs px-2 py-1"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="win95-window-inset p-4 mt-6">
          <h3 className="text-lg font-bold text-black mb-4">Alert Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{alerts.length}</div>
              <div className="text-sm text-gray-600">Total Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{alerts.filter(a => a.enabled).length}</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{alertTriggers.length}</div>
              <div className="text-sm text-gray-600">Total Triggers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total Notifications</div>
            </div>
          </div>
        </div>

        {/* Notification Help */}
        <div className="win95-window-inset p-4 mt-6">
          <h3 className="text-lg font-bold text-black mb-4">Browser Notification Help</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <div>
              <strong>Current Status:</strong> {getNotificationStatus().text}
            </div>
            <div>
              <strong>How to enable notifications:</strong>
              <ul className="list-disc list-inside mt-1 ml-4">
                <li>Click "Enable Notifications" button above</li>
                <li>Allow notifications when prompted by your browser</li>
                <li>Use the "Test Notification" button to verify it's working</li>
              </ul>
            </div>
            <div>
              <strong>If notifications aren't working:</strong>
              <ul className="list-disc list-inside mt-1 ml-4">
                <li>Check your browser's notification settings</li>
                <li>Make sure the site is not blocked in your browser</li>
                <li>Try refreshing the page after enabling notifications</li>
                <li>Check the browser console for error messages</li>
              </ul>
            </div>
            <div>
              <strong>Browser Requirements:</strong>
              <ul className="list-disc list-inside mt-1 ml-4">
                <li>Modern browser with Notification API support</li>
                <li>HTTPS connection (required for notifications)</li>
                <li>User interaction required to request permission</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 