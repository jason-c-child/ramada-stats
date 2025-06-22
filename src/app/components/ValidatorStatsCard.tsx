import { ValidatorStats } from '../lib/indexer-client';

export default function ValidatorStatsCard({ stats }: { stats: ValidatorStats }) {
  const formatNumber = (num: number | string) => new Intl.NumberFormat().format(Number(num));
  const formatVotingPower = (power: string) => {
    const num = parseInt(power);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Validator Statistics
          </h2>
          <p className="text-gray-400 mt-2">Network consensus and validator metrics</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      
      {/* Validator Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Validators */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-blue-400 text-sm font-medium mb-2">Total Validators</div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(stats.totalValidators)}
            </div>
            <div className="text-blue-300/60 text-xs">Registered validators</div>
          </div>
        </div>

        {/* Active Validators */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-6 rounded-2xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-green-400 text-sm font-medium mb-2">Active Validators</div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatNumber(stats.activeValidators)}
            </div>
            <div className="text-green-300/60 text-xs">Currently validating</div>
          </div>
        </div>

        {/* Total Voting Power */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-600/10 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-purple-400 text-sm font-medium mb-2">Total Voting Power</div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatVotingPower(stats.totalVotingPower)}
            </div>
            <div className="text-purple-300/60 text-xs">Combined stake</div>
          </div>
        </div>

        {/* Average Voting Power */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-gradient-to-br from-orange-500/10 to-red-600/10 p-6 rounded-2xl border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-orange-400 text-sm font-medium mb-2">Avg Voting Power</div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatVotingPower(stats.averageVotingPower)}
            </div>
            <div className="text-orange-300/60 text-xs">Per validator</div>
          </div>
        </div>
      </div>

      {/* Top Validators Table */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Top 10 Validators by Voting Power</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Validator</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Voting Power</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Commission</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.topValidators.map((validator, index) => (
                <tr key={validator.address} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">#{index + 1}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-white font-medium">{validator.name}</div>
                      <div className="text-gray-400 text-sm font-mono">{validator.address.slice(0, 12)}...</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {formatVotingPower(validator.voting_power)}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{validator.commission}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      validator.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {validator.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 