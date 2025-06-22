'use client';

import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
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

interface TPSDataPoint {
  timestamp: number;
  tps: number;
}

interface SolanaTimeSeriesChartProps {
  data: TPSDataPoint[];
  title: string;
}

export default function SolanaTimeSeriesChart({ 
  data, 
  title 
}: SolanaTimeSeriesChartProps) {
  const chartRef = useRef<ChartJS | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  console.log('SolanaTimeSeriesChart received data:', { 
    title, 
    data, 
    dataLength: data.length,
    dataValues: data.map(d => ({ timestamp: d.timestamp, tps: d.tps }))
  });

  // Transform data for Chart.js
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      console.log('SolanaTimeSeriesChart: No data, returning empty datasets');
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    
    console.log('SolanaTimeSeriesChart: Processing chart data for', title, 'with', sortedData.length, 'points');

    const labels = sortedData.map(point => new Date(point.timestamp));
    const values = sortedData.map(point => point.tps);

    return {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          borderColor: '#ff8000',
          backgroundColor: '#ff800020',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
          pointBackgroundColor: '#ff8000',
          pointBorderColor: '#000',
          pointBorderWidth: 1,
        }
      ]
    };
  }, [data, title]);

  // Calculate y-axis range for better scaling
  const yAxisRange = useMemo(() => {
    if (data.length === 0) {
      console.log('SolanaTimeSeriesChart: No data, using default range');
      return { min: 0, max: 100 };
    }
    
    const values = data.map(point => point.tps);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    console.log('SolanaTimeSeriesChart: Y-axis range calculation:', { min, max, range, values });
    
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

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false, // We handle the title in the parent component
      },
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#000',
        borderWidth: 1,
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].label);
            return date.toLocaleString();
          },
          label: (context: any) => {
            return `${title}: ${context.parsed.y.toFixed(2)} TPS`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const,
          displayFormats: {
            minute: 'HH:mm',
            hour: 'MMM dd HH:mm'
          }
        },
        grid: {
          color: '#ccc',
          drawBorder: true,
          borderColor: '#000'
        },
        ticks: {
          color: '#000',
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        min: yAxisRange.min,
        max: yAxisRange.max,
        grid: {
          color: '#ccc',
          drawBorder: true,
          borderColor: '#000'
        },
        ticks: {
          color: '#000',
          font: {
            size: 10
          },
          callback: (value: any) => `${value.toFixed(1)} TPS`
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  }), [title, yAxisRange]);

  const handleChartReady = useCallback((chart: any) => {
    chartRef.current = chart;
    console.log('SolanaTimeSeriesChart: Chart ready', chart);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-black text-sm">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-black">
          <div className="text-sm text-gray-600">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Line
        data={chartData}
        options={options}
        ref={handleChartReady}
      />
    </div>
  );
} 