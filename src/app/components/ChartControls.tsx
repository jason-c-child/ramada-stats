'use client';

interface ChartControlsProps {
  timeframe: '1h' | '6h' | '24h' | '7d' | '30d' | 'all';
  onTimeframeChange: (timeframe: '1h' | '6h' | '24h' | '7d' | '30d' | 'all') => void;
  showTrendLine: boolean;
  onTrendLineToggle: (show: boolean) => void;
  showMovingAverage: boolean;
  onMovingAverageToggle: (show: boolean) => void;
  movingAveragePeriod: number;
  onMovingAveragePeriodChange: (period: number) => void;
  onExportData: () => void;
}

export default function ChartControls({
  timeframe,
  onTimeframeChange,
  showTrendLine,
  onTrendLineToggle,
  showMovingAverage,
  onMovingAverageToggle,
  movingAveragePeriod,
  onMovingAveragePeriodChange,
  onExportData
}: ChartControlsProps) {
  const timeframes = [
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const maPeriods = [3, 5, 7, 10, 14, 20];

  return (
    <div className="win95-window-inset p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Timeframe Selection */}
        <div>
          <label className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value as '1h' | '6h' | '24h' | '7d' | '30d' | 'all')}
            className="win95-select w-full text-xs sm:text-sm"
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>
                {tf.label}
              </option>
            ))}
          </select>
        </div>

        {/* Analysis Options */}
        <div>
          <label className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2">Analysis</label>
          <div className="space-y-1 sm:space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTrendLine}
                onChange={(e) => onTrendLineToggle(e.target.checked)}
                className="win95-checkbox mr-2"
              />
              <span className="text-black text-xs sm:text-sm">Trend Line</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showMovingAverage}
                onChange={(e) => onMovingAverageToggle(e.target.checked)}
                className="win95-checkbox mr-2"
              />
              <span className="text-black text-xs sm:text-sm">Moving Average</span>
            </label>
          </div>
        </div>

        {/* Moving Average Period */}
        {showMovingAverage && (
          <div>
            <label className="block text-black text-xs sm:text-sm font-bold mb-1 sm:mb-2">MA Period</label>
            <select
              value={movingAveragePeriod}
              onChange={(e) => onMovingAveragePeriodChange(parseInt(e.target.value))}
              className="win95-select w-full text-xs sm:text-sm"
            >
              {maPeriods.map(period => (
                <option key={period} value={period}>
                  {period} points
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Export Button */}
        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            onClick={onExportData}
            className="win95-button w-full text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
} 