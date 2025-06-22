const SOLANA_RPC_URL = '/api/solana';

/**
 * Get current Solana TPS using getRecentPerformanceSamples
 * Based on the recommended approach from Solana documentation
 * 
 * @param samples - Number of performance samples to fetch (default: 1)
 * @returns Current TPS as a number, or null if calculation fails
 * 
 * @example
 * ```typescript
 * const tps = await getCurrentSolanaTPS();
 * console.log(`Current Solana TPS: ${tps}`);
 * ```
 */
export async function getCurrentSolanaTPS(samples: number = 1): Promise<number | null> {
  try {
    const perf = await solanaRpc('getRecentPerformanceSamples', samples);
    
    if (!perf.result || !Array.isArray(perf.result) || perf.result.length === 0) {
      console.warn('Invalid performance samples response:', perf);
      return null;
    }
    
    // Calculate TPS from the most recent sample
    const latestSample = perf.result[perf.result.length - 1];
    const tps = latestSample.numTransactions / latestSample.samplePeriodSecs;
    
    // Validate the result
    if (isNaN(tps) || tps < 0 || tps > 100000) { // Reasonable TPS range
      console.warn('Invalid TPS calculation:', { tps, sample: latestSample });
      return null;
    }
    
    return tps;
  } catch (error) {
    console.error('Failed to fetch current Solana TPS:', error);
    return null;
  }
}

export async function getSolanaTimeSeries(metric: 'tps' | 'activeValidators' | 'totalStake' | 'averageBlockTime' | 'slot', points: number = 60) {
  try {
    // Only fetch real data from Solana RPC
    if (metric === 'tps') {
      const perf = await solanaRpc('getRecentPerformanceSamples', points);
      
      if (!perf.result || !Array.isArray(perf.result)) {
        console.warn('Invalid performance samples response:', perf);
        return [];
      }
      
      const now = Date.now();
      return perf.result.map((sample: any, index: number) => {
        // Calculate timestamp: work backwards from now
        const timestamp = now - (perf.result.length - index - 1) * (sample.samplePeriodSecs * 1000);
        
        // Calculate TPS: numTransactions / samplePeriodSecs
        const tps = sample.numTransactions / sample.samplePeriodSecs;
        
        // Validate TPS calculation
        const validTps = (isNaN(tps) || tps < 0 || tps > 100000) ? 0 : tps;
        
        return {
          timestamp,
          tps: validTps,
          slot: sample.slot,
          activeValidators: 0, // Not available in performance samples
          totalStake: 0, // Not available in performance samples
          averageBlockTime: sample.samplePeriodSecs / sample.numSlots || 0.4,
        };
      }).filter((point: any) => point.tps > 0); // Filter out invalid TPS points
    }
    
    // For other metrics, return empty arrays since they're not available from RPC
    // These would require additional APIs or indexers
    return [];
  } catch (error) {
    console.error('Failed to fetch Solana time series:', error);
    return [];
  }
}

async function solanaRpc(method: string, params?: any) {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params: params ? [params] : [],
  };
  
  try {
    console.log(`SolanaRPC: Making request to ${SOLANA_RPC_URL} with method ${method}`);
    
    const res = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (data.error) {
      throw new Error(`RPC Error: ${data.error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Solana RPC call failed for method ${method}:`, error);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to Solana RPC endpoints. Please check your internet connection and try again.');
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout: Solana RPC endpoints are taking too long to respond. Please try again later.');
    }
    
    throw error;
  }
}

export async function getSolanaStats() {
  try {
    // Fetch slot, block height, epoch, and supply
    const [slot, blockHeight, epochInfo, supply, voteAccounts] = await Promise.all([
      solanaRpc('getSlot'),
      solanaRpc('getBlockHeight'),
      solanaRpc('getEpochInfo'),
      solanaRpc('getSupply'),
      solanaRpc('getVoteAccounts'),
    ]);

    // Fetch price and market cap from CoinGecko
    const priceData = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true').then(r => r.json());
    const price = priceData?.solana?.usd || null;
    const marketCap = priceData?.solana?.usd_market_cap || null;

    // Calculate total and active validators
    const totalValidators = voteAccounts?.result?.current?.length + voteAccounts?.result?.delinquent?.length || 0;
    const activeValidators = voteAccounts?.result?.current?.length || 0;
    const totalStake = voteAccounts?.result?.current?.reduce((sum: number, v: any) => sum + Number(v.activatedStake), 0) / 1e9; // in SOL

    // Get current TPS
    const tps = await getCurrentSolanaTPS(1);

    return {
      slot: slot.result,
      blockHeight: blockHeight.result,
      epoch: epochInfo.result.epoch,
      totalValidators,
      activeValidators,
      totalStake,
      averageBlockTime: epochInfo.result.slotDuration || 0.4, // fallback
      tps,
      price,
      marketCap,
      circulatingSupply: supply.result.value.circulating / 1e9, // in SOL
    };
  } catch (error) {
    console.error('Failed to fetch Solana stats:', error);
    throw new Error('Unable to fetch Solana network data. Please try again later.');
  }
} 