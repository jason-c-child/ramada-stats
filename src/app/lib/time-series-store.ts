export interface TimeSeriesData {
  blockTime: { timestamp: number; value: number }[];
  activeValidators: { timestamp: number; value: number }[];
  totalVotingPower: { timestamp: number; value: number }[];
  averageVotingPower: { timestamp: number; value: number }[];
}

interface TimeSeriesStoreConfig {
  localStorageEnabled: boolean;
  maxDataPoints: number;
}

class TimeSeriesStore {
  private data: TimeSeriesData = {
    blockTime: [],
    activeValidators: [],
    totalVotingPower: [],
    averageVotingPower: [],
  };
  
  private subscribers: (() => void)[] = [];
  private config: TimeSeriesStoreConfig = {
    localStorageEnabled: false,
    maxDataPoints: 1000,
  };

  constructor() {
    // Only load from localStorage on client side
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  private saveToLocalStorage() {
    if (this.config.localStorageEnabled && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('namada-time-series-data', JSON.stringify(this.data));
        localStorage.setItem('namada-time-series-config', JSON.stringify(this.config));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  private loadFromLocalStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedData = localStorage.getItem('namada-time-series-data');
        const savedConfig = localStorage.getItem('namada-time-series-config');
        
        if (savedData) {
          this.data = JSON.parse(savedData);
        }
        
        if (savedConfig) {
          this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
      }
    }
  }

  private trimData(dataArray: { timestamp: number; value: number }[]) {
    if (dataArray.length > this.config.maxDataPoints) {
      return dataArray.slice(-this.config.maxDataPoints);
    }
    return dataArray;
  }

  addDataPoint(
    blockHeight: number,
    blockTime: number,
    activeValidators: number,
    totalVotingPower: number,
    averageVotingPower: number
  ) {
    const timestamp = Date.now();
    
    console.log('TimeSeriesStore: Adding data point:', {
      timestamp,
      blockHeight,
      blockTime,
      activeValidators,
      totalVotingPower,
      averageVotingPower
    });
    
    // Add block time data
    this.data.blockTime.push({ timestamp, value: blockTime });
    this.data.blockTime = this.trimData(this.data.blockTime);
    
    // Add active validators data
    this.data.activeValidators.push({ timestamp, value: activeValidators });
    this.data.activeValidators = this.trimData(this.data.activeValidators);
    
    // Add total voting power data
    this.data.totalVotingPower.push({ timestamp, value: totalVotingPower });
    this.data.totalVotingPower = this.trimData(this.data.totalVotingPower);
    
    // Add average voting power data
    this.data.averageVotingPower.push({ timestamp, value: averageVotingPower });
    this.data.averageVotingPower = this.trimData(this.data.averageVotingPower);

    console.log('TimeSeriesStore: Current data state:', {
      blockTimeLength: this.data.blockTime.length,
      activeValidatorsLength: this.data.activeValidators.length,
      totalVotingPowerLength: this.data.totalVotingPower.length,
      averageVotingPowerLength: this.data.averageVotingPower.length
    });

    // Save to localStorage if enabled
    this.saveToLocalStorage();
    
    // Notify subscribers
    this.subscribers.forEach(callback => callback());
  }

  getData(): TimeSeriesData {
    return { ...this.data };
  }

  clear() {
    this.data = {
      blockTime: [],
      activeValidators: [],
      totalVotingPower: [],
      averageVotingPower: [],
    };
    
    if (this.config.localStorageEnabled && typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('namada-time-series-data');
    }
    
    this.subscribers.forEach(callback => callback());
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  setConfig(config: Partial<TimeSeriesStoreConfig>) {
    this.config = { ...this.config, ...config };
    this.saveToLocalStorage();
  }

  getConfig(): TimeSeriesStoreConfig {
    return { ...this.config };
  }
}

export const timeSeriesStore = new TimeSeriesStore();

// Make it available globally for the Control Panel
if (typeof window !== 'undefined') {
  (window as any).timeSeriesStore = timeSeriesStore;
} 