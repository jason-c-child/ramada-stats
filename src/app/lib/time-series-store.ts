interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

interface TimeSeriesData {
  blockTime: TimeSeriesPoint[];
  activeValidators: TimeSeriesPoint[];
  totalVotingPower: TimeSeriesPoint[];
  averageVotingPower: TimeSeriesPoint[];
}

class TimeSeriesStore {
  private data: TimeSeriesData = {
    blockTime: [],
    activeValidators: [],
    totalVotingPower: [],
    averageVotingPower: [],
  };

  private maxPoints = 50; // Keep last 50 data points
  private listeners: (() => void)[] = [];
  private lastBlockHeight: number | null = null;
  private lastBlockTime: number | null = null;

  addDataPoint(
    blockHeight: number,
    blockTime: string,
    activeValidators: number,
    totalVotingPower: number,
    averageVotingPower: number
  ) {
    const timestamp = Date.now();
    let blockTimeSeconds = 0;

    // Calculate block time if we have previous data
    if (this.lastBlockHeight !== null && this.lastBlockTime !== null) {
      const heightDiff = blockHeight - this.lastBlockHeight;
      const timeDiff = new Date(blockTime).getTime() - this.lastBlockTime;
      
      if (heightDiff > 0 && timeDiff > 0) {
        blockTimeSeconds = timeDiff / 1000; // Convert to seconds
      }
    }

    // Update last values
    this.lastBlockHeight = blockHeight;
    this.lastBlockTime = new Date(blockTime).getTime();

    // Add new data points
    this.data.blockTime.push({ timestamp, value: blockTimeSeconds });
    this.data.activeValidators.push({ timestamp, value: activeValidators });
    this.data.totalVotingPower.push({ timestamp, value: totalVotingPower });
    this.data.averageVotingPower.push({ timestamp, value: averageVotingPower });

    console.log('TimeSeriesStore: Added data point', {
      timestamp,
      blockHeight,
      blockTimeSeconds,
      activeValidators,
      totalVotingPower,
      averageVotingPower,
      totalPoints: this.data.blockTime.length
    });

    // Keep only the last maxPoints
    if (this.data.blockTime.length > this.maxPoints) {
      this.data.blockTime = this.data.blockTime.slice(-this.maxPoints);
      this.data.activeValidators = this.data.activeValidators.slice(-this.maxPoints);
      this.data.totalVotingPower = this.data.totalVotingPower.slice(-this.maxPoints);
      this.data.averageVotingPower = this.data.averageVotingPower.slice(-this.maxPoints);
    }

    // Notify listeners
    this.notifyListeners();
  }

  getData() {
    return { ...this.data };
  }

  subscribe(listener: () => void) {
    console.log('TimeSeriesStore: Adding listener, total listeners:', this.listeners.length + 1);
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
        console.log('TimeSeriesStore: Removed listener, total listeners:', this.listeners.length);
      }
    };
  }

  private notifyListeners() {
    console.log('TimeSeriesStore: Notifying listeners, count:', this.listeners.length);
    this.listeners.forEach((listener, index) => {
      try {
        listener();
        console.log(`TimeSeriesStore: Listener ${index} notified successfully`);
      } catch (error) {
        console.error(`TimeSeriesStore: Error notifying listener ${index}:`, error);
      }
    });
  }

  clear() {
    this.data = {
      blockTime: [],
      activeValidators: [],
      totalVotingPower: [],
      averageVotingPower: [],
    };
    this.lastBlockHeight = null;
    this.lastBlockTime = null;
    this.notifyListeners();
  }
}

export const timeSeriesStore = new TimeSeriesStore();
export type { TimeSeriesData, TimeSeriesPoint }; 