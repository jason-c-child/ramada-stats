'use client';

interface NetworkStats {
  latestBlock: any;
  currentEpoch: any;
  totalValidators: any;
}

interface NetworkStatsCardProps {
  stats: NetworkStats;
  pollingInterval?: number;
}

export default function NetworkStatsCard({ stats, pollingInterval = 10000 }: NetworkStatsCardProps) {
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  const formatPollingInterval = (interval: number) => {
    if (interval < 1000) {
      return `${interval}ms`;
    } else if (interval < 60000) {
      return `${interval / 1000} seconds`;
    } else {
      return `${interval / 60000} minutes`;
    }
  };

  const getBlockStatus = (blockHeight: number) => {
    const now = Date.now();
    const blockTime = 5;
    const expectedTime = blockHeight * blockTime * 1000;
    const timeDiff = now - expectedTime;
    
    if (timeDiff < 30000) return { status: 'active', color: 'success', text: 'Active' };
    if (timeDiff < 60000) return { status: 'slow', color: 'warning', text: 'Slow' };
    return { status: 'stalled', color: 'error', text: 'Stalled' };
  };

  const getEpochProgress = (epoch: number) => {
    const blocksInEpoch = epoch % 1000;
    const progress = (blocksInEpoch / 1000) * 100;
    return Math.min(progress, 100);
  };

  const blockStatus = getBlockStatus(parseInt(stats.latestBlock));
  const epochProgress = getEpochProgress(parseInt(stats.currentEpoch));

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Network Statistics</h3>
            <p className="card-subtitle">Real-time network metrics and performance</p>
          </div>
          <div className={`status status-${blockStatus.color}`}>
            {blockStatus.text}
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="stats-grid">
          {/* Latest Block */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon blue">📦</div>
            </div>
            <div className="stat-value">
              {formatNumber(stats.latestBlock)}
            </div>
            <div className="stat-label">Latest Block</div>
            <div className="stat-description">
              Current block height with ~5 second block time
            </div>
          </div>
          
          {/* Current Epoch */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon green">⏱️</div>
            </div>
            <div className="stat-value">
              {formatNumber(stats.currentEpoch)}
            </div>
            <div className="stat-label">Current Epoch</div>
            <div className="progress">
              <div 
                className="progress-bar"
                style={{ width: `${epochProgress}%` }}
              ></div>
            </div>
            <div className="stat-description">
              {epochProgress.toFixed(1)}% complete • 1000 blocks per epoch
            </div>
          </div>
          
          {/* Total Validators */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon orange">👥</div>
            </div>
            <div className="stat-value">
              {formatNumber(stats.totalValidators)}
            </div>
            <div className="stat-label">Total Validators</div>
            <div className="stat-description">
              Active network consensus participants
            </div>
          </div>
        </div>
        
        {/* Network Status */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm font-medium text-primary">Network Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-secondary">Block Production Active</span>
              </div>
            </div>
            <div className="text-sm text-secondary">
              Auto-refresh every {formatPollingInterval(pollingInterval)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 