import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface Validator {
  address: string;
  voting_power: string;
  proposer_priority: string;
  pub_key: {
    type: string;
    value: string;
  };
  name?: string;
  commission?: string;
  status?: string;
}

interface ValidatorStats {
  totalValidators: number;
  activeValidators: number;
  totalVotingPower: string;
  averageVotingPower: string;
  topValidators: Validator[];
}

class NamadaIndexerClient {
  private primaryClient: AxiosInstance;
  private backupClients: AxiosInstance[];
  
  constructor() {
    const config: AxiosRequestConfig = {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Primary endpoint
    this.primaryClient = axios.create({
      baseURL: 'https://namada-mainnet-rpc.itrocket.net',
      ...config,
    });

    // Backup endpoints
    this.backupClients = [
      axios.create({
        baseURL: 'https://indexer-mainnet-namada.grandvalleys.com',
        ...config,
      }),
      axios.create({
        baseURL: 'https://namada.rpc.kjnodes.com',
        ...config,
      }),
      axios.create({
        baseURL: 'https://namada-rpc.stakely.io',
        ...config,
      }),
    ];
  }

  private async makeRequestWithFallback<T>(requestFn: (client: AxiosInstance) => Promise<T>): Promise<T> {
    // Try primary endpoint first
    try {
      console.log('Trying primary endpoint...');
      return await requestFn(this.primaryClient);
    } catch (primaryError: any) {
      console.warn('Primary endpoint failed, trying backups:', primaryError.message);
      
      // Try backup endpoints
      for (const [index, backupClient] of this.backupClients.entries()) {
        try {
          console.log(`Trying backup endpoint ${index + 1}...`);
          return await requestFn(backupClient);
        } catch (backupError: any) {
          console.warn(`Backup ${index + 1} failed:`, backupError.message);
        }
      }
      
      console.error('All endpoints failed');
      throw new Error('All Namada RPC endpoints are currently unavailable. Please try again later.');
    }
  }

  async getNetworkStats() {
    const [statusResponse, validatorsResponse] = await Promise.all([
      this.makeRequestWithFallback(async (client) => {
        return await client.get('/status');
      }),
      this.makeRequestWithFallback(async (client) => {
        return await client.get('/validators');
      })
    ]);
    
    console.log('Network stats responses:', {
      status: statusResponse.data,
      validators: validatorsResponse.data
    });

    return {
      latestBlock: statusResponse.data.result.sync_info.latest_block_height,
      currentEpoch: Math.floor(statusResponse.data.result.sync_info.latest_block_height / 100), // Approximate
      totalValidators: validatorsResponse.data.result.validators.length,
      blockTime: statusResponse.data.result.sync_info.latest_block_time,
    };
  }

  async getValidatorStats(): Promise<ValidatorStats> {
    const validatorsResponse = await this.makeRequestWithFallback(async (client) => {
      return await client.get('/validators');
    });

    const validators: Validator[] = validatorsResponse.data.result.validators;
    
    // Calculate statistics
    const totalValidators = validators.length;
    const activeValidators = validators.filter(v => v.voting_power !== '0').length;
    
    const totalVotingPower = validators.reduce((sum, v) => {
      return sum + parseInt(v.voting_power || '0');
    }, 0).toString();
    
    const averageVotingPower = totalValidators > 0 
      ? Math.floor(parseInt(totalVotingPower) / totalValidators).toString()
      : '0';
    
    // Get top 10 validators by voting power
    const topValidators = validators
      .sort((a, b) => parseInt(b.voting_power || '0') - parseInt(a.voting_power || '0'))
      .slice(0, 10)
      .map(validator => ({
        ...validator,
        name: this.getValidatorName(validator.address),
        commission: this.getValidatorCommission(validator.address),
        status: validator.voting_power !== '0' ? 'Active' : 'Inactive'
      }));

    return {
      totalValidators,
      activeValidators,
      totalVotingPower,
      averageVotingPower,
      topValidators
    };
  }

  async getAllValidators(): Promise<Validator[]> {
    const validatorsResponse = await this.makeRequestWithFallback(async (client) => {
      return await client.get('/validators');
    });

    const validators: Validator[] = validatorsResponse.data.result.validators;
    
    return validators.map(validator => ({
      ...validator,
      name: this.getValidatorName(validator.address),
      commission: this.getValidatorCommission(validator.address),
      status: validator.voting_power !== '0' ? 'Active' : 'Inactive'
    }));
  }

  private getValidatorName(address: string): string {
    // This would ideally come from a validator registry or API
    // For now, we'll use a simple mapping or truncate the address
    const knownValidators: { [key: string]: string } = {
      // Add known validator names here
    };
    
    return knownValidators[address] || `${address.slice(0, 8)}...${address.slice(-6)}`;
  }

  private getValidatorCommission(address: string): string {
    // This would come from validator metadata
    // For now, return a placeholder
    return '5.0%';
  }

  async getMaspStats() {
    // For now, throw error since the endpoints might not have MASP endpoints
    throw new Error('MASP statistics are not currently available from RPC endpoints.');
  }
}

export const indexerClient = new NamadaIndexerClient();
export type { Validator, ValidatorStats };