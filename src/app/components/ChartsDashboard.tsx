'use client';

import { useState, useEffect, useRef } from 'react';
import { timeSeriesStore, TimeSeriesData } from '../lib/time-series-store';
import TimeSeriesChart from './TimeSeriesChart';
import ChartControls from './ChartControls';

export default function ChartsDashboard() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [chartData, setChartData] = useState<TimeSeriesData>({
    blockTime: [],
    activeValidators: [],
    totalVotingPower: [],
    averageVotingPower: [],
  });
  const [updateCounter, setUpdateCounter] = useState(0);
  const chartRefs = useRef<{ [key: string]: unknown }>({});

  // Chart control states
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h' | '7d' | '30d' | 'all'>('all');
  const [showTrendLine, setShowTrendLine] = useState(false);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [movingAveragePeriod, setMovingAveragePeriod] = useState(7);

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

  const handleChartReady = (chartId: string, chart: unknown) => {
    chartRefs.current[chartId] = chart;
  };

  const exportChartData = () => {
    const data = {
      blockTime: chartData.blockTime,
      activeValidators: chartData.activeValidators,
      totalVotingPower: chartData.totalVotingPower,
      averageVotingPower: chartData.averageVotingPower,
      exportTime: new Date().toISOString(),
      timeframe,
      settings: {
        showTrendLine,
        showMovingAverage,
        movingAveragePeriod
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `namada-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`win95-window`}>
      <div className="win95-title-bar flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="win95-icon bg-[#ff8000] border border-black"></div>
          <span>Network Charts</span>
        </div>
        <div className="flex space-x-1">
          <button onClick={handleMinimize} className="win95-button text-xs px-2 py-1">_</button>
          
        </div>
      </div>
      
      <div className="p-6">
        {/* Chart Controls */}
        <ChartControls
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          showTrendLine={showTrendLine}
          onTrendLineToggle={setShowTrendLine}
          showMovingAverage={showMovingAverage}
          onMovingAverageToggle={setShowMovingAverage}
          movingAveragePeriod={movingAveragePeriod}
          onMovingAveragePeriodChange={setMovingAveragePeriod}
          onExportData={exportChartData}
        />

        <div className="grid grid-cols-1 gap-6">
          {/* Block Time Chart */}
          <div className="win95-window-inset p-4">
            <h3 className="text-lg font-bold text-black mb-4">Block Time Over Time</h3>
            <TimeSeriesChart
              key={`block-time-${updateCounter}-${timeframe}-${showTrendLine}-${showMovingAverage}-${movingAveragePeriod}`}
              title="Block Time"
              data={chartData.blockTime}
              color="#0000ff"
              yAxisLabel="Seconds"
              formatValue={(value) => `${value.toFixed(2)}s`}
              autoScale={true}
              timeframe={timeframe}
              showTrendLine={showTrendLine}
              showMovingAverage={showMovingAverage}
              movingAveragePeriod={movingAveragePeriod}
              onChartReady={(chart) => handleChartReady('block-time', chart)}
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