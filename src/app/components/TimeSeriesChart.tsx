'use client';

import { useMemo, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimeSeriesChartProps {
  title: string;
  data: { timestamp: number; value: number }[];
  color: string;
  yAxisLabel?: string;
  formatValue?: (value: number) => string;
  autoScale?: boolean;
  onChartReady?: (chart: ChartJS | null) => void;
  timeframe?: '1h' | '6h' | '24h' | '7d' | '30d' | 'all';
  showTrendLine?: boolean;
  showMovingAverage?: boolean;
  movingAveragePeriod?: number;
}

export default function TimeSeriesChart({ 
  title, 
  data, 
  color, 
  yAxisLabel = 'Value',
  formatValue = (value: number) => value.toString(),
  autoScale = true,
  onChartReady,
  timeframe = 'all',
  showTrendLine = false,
  showMovingAverage = false,
  movingAveragePeriod = 7
}: TimeSeriesChartProps) {
  const chartRef = useRef<ChartJS | null>(null);
  
  console.log('TimeSeriesChart received data:', { 
    title, 
    data, 
    dataLength: data.length,
    dataValues: data.map(d => ({ timestamp: d.timestamp, value: d.value }))
  });

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    if (timeframe === 'all') return data;
    
    const now = Date.now();
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = now - timeframes[timeframe];
    return data.filter(point => point.timestamp >= cutoff);
  }, [data, timeframe]);

  // Calculate moving average
  const movingAverageData = useMemo(() => {
    if (!showMovingAverage || filteredData.length < movingAveragePeriod) return [];
    
    const result = [];
    for (let i = movingAveragePeriod - 1; i < filteredData.length; i++) {
      const sum = filteredData
        .slice(i - movingAveragePeriod + 1, i + 1)
        .reduce((acc, point) => acc + point.value, 0);
      const average = sum / movingAveragePeriod;
      result.push({
        timestamp: filteredData[i].timestamp,
        value: average
      });
    }
    return result;
  }, [filteredData, showMovingAverage, movingAveragePeriod]);

  // Calculate trend line
  const trendLineData = useMemo(() => {
    if (!showTrendLine || filteredData.length < 2) return [];
    
    const n = filteredData.length;
    const sumX = filteredData.reduce((acc, _, i) => acc + i, 0);
    const sumY = filteredData.reduce((acc, point) => acc + point.value, 0);
    const sumXY = filteredData.reduce((acc, point, i) => acc + i * point.value, 0);
    const sumXX = filteredData.reduce((acc, _, i) => acc + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return filteredData.map((point, i) => ({
      timestamp: point.timestamp,
      value: slope * i + intercept
    }));
  }, [filteredData, showTrendLine]);

  // Calculate y-axis range for better scaling
  const yAxisRange = useMemo(() => {
    if (data.length === 0) {
      console.log('TimeSeriesChart: No data, using default range');
      return { min: 0, max: 100 };
    }
    
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    console.log('TimeSeriesChart: Y-axis range calculation:', { min, max, range, values });
    
    // If range is very small, expand it to make changes visible
    if (range === 0) {
      return { min: min * 0.95, max: min * 1.05 };
    }
    
    // For very small ranges, use percentage-based scaling
    if (range / max < 0.01) {
      const center = (min + max) / 2;
      const expandedRange = center * 0.02; // 2% of center value
      return {
        min: Math.max(0, center - expandedRange),
        max: center + expandedRange
      };
    }
    
    // For small ranges, use more padding
    if (range / max < 0.1) {
      const padding = range * 0.5; // 50% padding for small changes
      return {
        min: Math.max(0, min - padding),
        max: max + padding
      };
    }
    
    // Normal padding for larger ranges
    const padding = range * 0.1;
    return {
      min: Math.max(0, min - padding),
      max: max + padding
    };
  }, [data]);

  // Use useMemo to create chart data and ensure it updates when data changes
  const chartData = useMemo(() => {
    console.log('TimeSeriesChart: Processing chart data for', title, 'with', filteredData.length, 'points');
    
    if (filteredData.length === 0) {
      console.log('TimeSeriesChart: No data, returning empty datasets');
      return {
        labels: [],
        datasets: []
      };
    }

    const datasets = [
      {
        label: title,
        data: filteredData.map(point => point.value),
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: '#000',
        pointBorderWidth: 1,
      }
    ];

    // Add moving average dataset
    if (showMovingAverage && movingAverageData.length > 0) {
      datasets.push({
        label: `${title} (${movingAveragePeriod}-point MA)`,
        data: movingAverageData.map(point => point.value),
        borderColor: '#ff6b6b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#ff6b6b',
        pointBorderColor: '#000',
        pointBorderWidth: 1,
      });
    }

    // Add trend line dataset
    if (showTrendLine && trendLineData.length > 0) {
      datasets.push({
        label: `${title} (Trend)`,
        data: trendLineData.map(point => point.value),
        borderColor: '#4ecdc4',
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: '#4ecdc4',
        pointBorderColor: '#000',
        pointBorderWidth: 1,
      });
    }

    const processedData = {
      labels: filteredData.map((_, index) => `Point ${index + 1}`),
      datasets
    };

    console.log('TimeSeriesChart processed chart data:', {
      title,
      datasetCount: processedData.datasets.length,
      dataPoints: processedData.datasets[0].data.length,
      firstPoint: processedData.datasets[0].data[0],
      lastPoint: processedData.datasets[0].data[processedData.datasets[0].data.length - 1]
    });
    return processedData;
  }, [filteredData, title, color, showMovingAverage, movingAverageData, showTrendLine, trendLineData, movingAveragePeriod]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: '#000',
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 10
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#000',
        borderWidth: 1,
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        },
        callbacks: {
          label: function(tooltipItem: any) {
            return `${tooltipItem.dataset.label}: ${formatValue(tooltipItem.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          color: '#000',
          borderColor: '#000',
        },
        ticks: {
          color: '#000',
          font: {
            size: 9,
          },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
        title: {
          display: false,
        }
      },
      y: {
        beginAtZero: !autoScale,
        min: autoScale ? yAxisRange.min : undefined,
        max: autoScale ? yAxisRange.max : undefined,
        grid: {
          color: '#000',
          borderColor: '#000',
        },
        ticks: {
          color: '#000',
          font: {
            size: 9,
          },
          maxTicksLimit: 5,
          callback: function(value: string | number) {
            return formatValue(Number(value));
          },
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: '#000',
          font: {
            size: 10,
            weight: 'bold' as const,
          },
          padding: {
            top: 5,
            bottom: 5
          }
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4,
      },
      line: {
        tension: 0.4,
      }
    },
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    }
  };

  const handleChartRef = useCallback((chart: any) => {
    console.log('TimeSeriesChart: Chart ref callback called for', title, 'with chart:', chart);
    if (chart) {
      chartRef.current = chart;
      if (onChartReady) {
        onChartReady(chart);
      }
    }
  }, [onChartReady, title]);

  console.log('TimeSeriesChart: Rendering chart for', title, 'with', data.length, 'data points');

  return (
    <div className="win95-window-inset p-2 sm:p-3 md:p-4 h-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
      {(() => {
        try {
          return (
            <Line 
              ref={handleChartRef}
              data={chartData} 
              options={options}
            />
          );
        } catch (error) {
          console.error('TimeSeriesChart: Error rendering chart for', title, error);
          return (
            <div className="text-red-600 text-center text-xs sm:text-sm p-4">
              Error rendering chart: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          );
        }
      })()}
    </div>
  );
} 