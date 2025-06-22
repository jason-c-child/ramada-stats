'use client';

import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GovernanceDashboardProps {
  isMinimized?: boolean;
  isMaximized?: boolean;
  onMinimize?: () => void;
}

export default function GovernanceDashboard({
  isMinimized = false,
  isMaximized = false,
  onMinimize
}: GovernanceDashboardProps) {
  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#10B981] border border-black"></div>
            <span>Governance Dashboard</span>
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
          <div className="win95-icon bg-[#10B981] border border-black"></div>
          <span>Governance Dashboard</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={onMinimize} className="win95-button text-xs px-2 py-1">_</button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="win95-window-inset p-8 text-center">
          <div className="text-2xl font-bold text-black mb-4">Governance Data Unavailable</div>
          <div className="text-black mb-4">
            Governance data is not available from standard Namada RPC endpoints.
          </div>
          <div className="text-sm text-gray-600">
            This feature requires access to governance-specific APIs that are not currently available.
          </div>
        </div>
      </div>
    </div>
  );
} 