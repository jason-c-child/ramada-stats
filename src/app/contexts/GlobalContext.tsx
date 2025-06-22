'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NetworkPollingConfig {
  namada: number;
  solana: number;
}

interface GlobalContextType {
  pollingIntervals: NetworkPollingConfig;
  setPollingInterval: (network: keyof NetworkPollingConfig, interval: number) => void;
  localStorageEnabled: boolean;
  setLocalStorageEnabled: (enabled: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [pollingIntervals, setPollingIntervalsState] = useState<NetworkPollingConfig>({
    namada: 10000, // Default 10 seconds for Namada
    solana: 60000  // Default 60 seconds for Solana (minimum)
  });
  const [localStorageEnabled, setLocalStorageEnabledState] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on client side
    const savedNamadaInterval = localStorage.getItem('global-namada-polling-interval');
    const savedSolanaInterval = localStorage.getItem('global-solana-polling-interval');
    const savedLocalStorage = localStorage.getItem('global-local-storage-enabled');
    
    if (savedNamadaInterval) {
      setPollingIntervalsState(prev => ({
        ...prev,
        namada: parseInt(savedNamadaInterval)
      }));
    }
    
    if (savedSolanaInterval) {
      const solanaInterval = parseInt(savedSolanaInterval);
      // Ensure Solana interval is at least 60 seconds
      setPollingIntervalsState(prev => ({
        ...prev,
        solana: Math.max(solanaInterval, 60000)
      }));
    }
    
    if (savedLocalStorage) {
      const enabled = JSON.parse(savedLocalStorage);
      setLocalStorageEnabledState(enabled);
    }
  }, []);

  const setPollingInterval = (network: keyof NetworkPollingConfig, interval: number) => {
    // Ensure Solana interval is at least 60 seconds
    const validatedInterval = network === 'solana' ? Math.max(interval, 60000) : interval;
    
    setPollingIntervalsState(prev => ({
      ...prev,
      [network]: validatedInterval
    }));
    
    localStorage.setItem(`global-${network}-polling-interval`, validatedInterval.toString());
  };

  const setLocalStorageEnabled = (enabled: boolean) => {
    setLocalStorageEnabledState(enabled);
    localStorage.setItem('global-local-storage-enabled', JSON.stringify(enabled));
  };

  return (
    <GlobalContext.Provider value={{
      pollingIntervals,
      setPollingInterval,
      localStorageEnabled,
      setLocalStorageEnabled
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
} 