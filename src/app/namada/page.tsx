import Dashboard from '../components/Dashboard';
import Link from 'next/link';

export default function NamadaDashboardPage() {
  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gradient-to-br from-[#008080] to-[#00D4AA]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="win95-button text-xs sm:text-sm px-2 py-1">← Back to Dashboard Selector</Link>
        </div>
        <Dashboard />
      </div>
    </div>
  );
} 