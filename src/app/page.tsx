import Link from 'next/link';
import GlobalControlPanel from './components/GlobalControlPanel';

export default function DashboardSelector() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#008080] to-[#9945FF] p-2 sm:p-4">
      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        {/* Global Control Panel */}
        <div className="w-full">
          <GlobalControlPanel />
        </div>
        {/* Dashboard Selection */}
        <div className="win95-window w-full p-0 text-center">
          <div className="win95-title-bar flex items-center justify-center mb-0">
            <span className="text-lg font-bold">Select a Dashboard</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4">
            <Link href="/namada" className="win95-window-inset p-6 flex flex-col items-center hover:bg-[#e0f7fa] transition cursor-pointer shadow-md rounded-md">
              <div className="win95-icon bg-[#0000ff] border border-black mb-2"></div>
              <span className="text-xl font-bold text-black mb-1">Namada</span>
              <span className="text-xs text-gray-700">View Namada network analytics</span>
            </Link>
            <Link href="/solana" className="win95-window-inset p-6 flex flex-col items-center hover:bg-[#f3e8ff] transition cursor-pointer shadow-md rounded-md">
              <div className="win95-icon bg-[#9945FF] border border-black mb-2"></div>
              <span className="text-xl font-bold text-black mb-1">Solana</span>
              <span className="text-xs text-gray-700">View Solana network analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
