'use client';

import { useState, useEffect, useRef } from 'react';
import { timeSeriesStore, TimeSeriesData } from '../lib/time-series-store';
import TimeSeriesChart from './TimeSeriesChart';

export default function ChartsDashboard() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [chartData, setChartData] = useState<TimeSeriesData>({
    blockTime: [],
    activeValidators: [],
    totalVotingPower: [],
    averageVotingPower: [],
  });
  const [updateCounter, setUpdateCounter] = useState(0);
  
  // Store references to all charts
  const chartRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    console.log('ChartsDashboard: Setting up subscription');
    
    // Subscribe to time series data updates
    const unsubscribe = timeSeriesStore.subscribe(() => {
      const newData = timeSeriesStore.getData();
      console.log('ChartsDashboard received new data:', newData);
      setChartData(newData);
      setUpdateCounter(prev => prev + 1); // Force re-render
    });

    // Get initial data
    const initialData = timeSeriesStore.getData();
    console.log('ChartsDashboard initial data:', initialData);
    setChartData(initialData);

    return unsubscribe;
  }, []);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const formatVotingPower = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const handleChartReady = (chartId: string, chart: any) => {
    chartRefs.current[chartId] = chart;
  };

  const resetAllCharts = () => {
    Object.values(chartRefs.current).forEach(chart => {
      if (chart && chart.resetZoom) {
        chart.resetZoom();
      } else if (chart && chart.scales) {
        // Manual reset if resetZoom is not available
        chart.scales.x.reset();
        chart.scales.y.reset();
        chart.update('none');
      }
    });
  };

  if (isMinimized) {
    return (
      <div className="win95-window">
        <div className="win95-title-bar flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="win95-icon bg-[#ff8000] border border-black"></div>
            <span>Network Charts</span>
          </div>
          <div className="flex space-x-1">
            <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">□</button>
            <button onClick={handleMaximize} className="win95-button text-xs px-2 py-1">□</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`win95-window ${isMaximized ? 'fixed inset-4 z-50' : ''}`}>
      <div className="win95-title-bar flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="win95-icon bg-[#ff8000] border border-black"></div>
          <span>Network Charts</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">_</button>
          <button onClick={handleMaximize} className="win95-button text-xs px-2 py-1">□</button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Block Time Chart */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Block Time Over Time</h3>
            <TimeSeriesChart
              key={`block-time-${updateCounter}`}
              title="Block Time"
              data={chartData.blockTime}
              color="#0000ff"
              yAxisLabel="Seconds"
              formatValue={(value) => `${value.toFixed(2)}s`}
              autoScale={true}
              onChartReady={(chart) => handleChartReady('block-time', chart)}
            />
          </div>

          {/* Active Validators Chart */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Active Validators Over Time</h3>
            <TimeSeriesChart
              key={`active-validators-${updateCounter}`}
              title="Active Validators"
              data={chartData.activeValidators}
              color="#008000"
              yAxisLabel="Validators"
              formatValue={(value) => new Intl.NumberFormat().format(value)}
              autoScale={false}
              onChartReady={(chart) => handleChartReady('active-validators', chart)}
            />
          </div>

          {/* Total Voting Power Chart */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Total Voting Power Over Time</h3>
            <TimeSeriesChart
              key={`total-voting-power-${updateCounter}`}
              title="Total Voting Power"
              data={chartData.totalVotingPower}
              color="#800080"
              yAxisLabel="Voting Power"
              formatValue={formatVotingPower}
              autoScale={true}
              onChartReady={(chart) => handleChartReady('total-voting-power', chart)}
            />
          </div>

          {/* Average Voting Power Chart */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Average Voting Power Over Time</h3>
            <TimeSeriesChart
              key={`average-voting-power-${updateCounter}`}
              title="Average Voting Power"
              data={chartData.averageVotingPower}
              color="#ff8000"
              yAxisLabel="Voting Power"
              formatValue={formatVotingPower}
              autoScale={true}
              onChartReady={(chart) => handleChartReady('average-voting-power', chart)}
            />
          </div>
        </div>

        {/* Chart Controls */}
        <div className="mt-6 pt-4 border-t border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => timeSeriesStore.clear()} 
                className="win95-button text-sm px-3 py-1"
              >
                Clear Data
              </button>
              <button 
                onClick={resetAllCharts} 
                className="win95-button text-sm px-3 py-1"
              >
                Reset View
              </button>
              <span className="text-black text-sm">
                Data points: {chartData.blockTime.length}
              </span>
            </div>
            <div className="text-black text-sm">
              Charts update every 10 seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 