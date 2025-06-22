'use client';

interface NetworkStats {
  latestBlock: string;
  currentEpoch: number;
  totalValidators: number;
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
  const epochProgress = getEpochProgress(stats.currentEpoch);

  return (
    <div className="win95-window">
      <div className="win95-title-bar flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="win95-icon bg-[#0000ff] border border-black"></div>
          <span className="text-sm sm:text-base">Network Statistics</span>
        </div>
        <div className="flex space-x-1">
          <div className={`w-2 h-2 border border-black ${blockStatus.color === 'success' ? 'bg-[#008000]' : blockStatus.color === 'warning' ? 'bg-[#ff8000]' : 'bg-[#ff0000]'}`}></div>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Latest Block */}
          <div className="win95-window-inset p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="win95-icon bg-[#0000ff] border border-black"></div>
              <div className="w-2 h-2 bg-[#0000ff] border border-black"></div>
            </div>
            <div className="text-black text-xs sm:text-sm font-bold mb-1">Latest Block</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-1">
              {formatNumber(parseInt(stats.latestBlock))}
            </div>
            <div className="text-black text-xs">~5 second block time</div>
          </div>
          
          {/* Current Epoch */}
          <div className="win95-window-inset p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="win95-icon bg-[#008000] border border-black"></div>
              <div className="w-2 h-2 bg-[#008000] border border-black"></div>
            </div>
            <div className="text-black text-xs sm:text-sm font-bold mb-1">Current Epoch</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-1">
              {formatNumber(stats.currentEpoch)}
            </div>
            <div className="win95-progress-bar mb-1">
              <div 
                className="win95-progress-fill"
                style={{ width: `${epochProgress}%` }}
              ></div>
            </div>
            <div className="text-black text-xs">
              {epochProgress.toFixed(1)}% complete • 1000 blocks
            </div>
          </div>
          
          {/* Total Validators */}
          <div className="win95-window-inset p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="win95-icon bg-[#ff8000] border border-black"></div>
              <div className="w-2 h-2 bg-[#ff8000] border border-black"></div>
            </div>
            <div className="text-black text-xs sm:text-sm font-bold mb-1">Total Validators</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-1">
              {formatNumber(stats.totalValidators)}
            </div>
            <div className="text-black text-xs">Active consensus participants</div>
          </div>
        </div>
        
        {/* Network Status */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-black">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#008000] border border-black"></div>
                <span className="text-xs sm:text-sm font-medium text-black">Network Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#0000ff] border border-black"></div>
                <span className="text-xs sm:text-sm text-black">Block Production Active</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-black">
              Auto-refresh every {formatPollingInterval(pollingInterval)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 