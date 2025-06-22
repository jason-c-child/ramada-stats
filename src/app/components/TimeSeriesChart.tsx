'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
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
  TimeScale
);

interface TimeSeriesChartProps {
  title: string;
  data: { timestamp: number; value: number }[];
  color: string;
  yAxisLabel?: string;
  formatValue?: (value: number) => string;
  autoScale?: boolean;
  onChartReady?: (chart: any) => void;
}

export default function TimeSeriesChart({ 
  title, 
  data, 
  color, 
  yAxisLabel = 'Value',
  formatValue = (value: number) => value.toString(),
  autoScale = true,
  onChartReady
}: TimeSeriesChartProps) {
  const chartRef = useRef<any>(null);
  
  console.log('TimeSeriesChart received data:', { title, data, dataLength: data.length });

  // Calculate y-axis range for better scaling
  const yAxisRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 100 };
    
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
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
    if (data.length === 0) {
      return {
        datasets: []
      };
    }

    const processedData = {
      datasets: [
        {
          label: title,
          data: data.map(point => ({
            x: new Date(point.timestamp),
            y: point.value
          })),
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#000',
          pointBorderWidth: 1,
        },
      ],
    };

    console.log('TimeSeriesChart processed chart data:', processedData);
    return processedData;
  }, [data, title, color]);

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
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#000',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatValue(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const,
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM dd',
          },
        },
        grid: {
          color: '#000',
          borderColor: '#000',
        },
        ticks: {
          color: '#000',
          font: {
            size: 10,
          },
          maxTicksLimit: 8,
        },
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
            size: 10,
          },
          callback: function(value: any) {
            return formatValue(value);
          },
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: '#000',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const handleChartRef = useCallback((chart: any) => {
    if (chart) {
      chartRef.current = chart;
      if (onChartReady) {
        onChartReady(chart);
      }
    }
  }, [onChartReady]);

  if (data.length === 0) {
    return (
      <div className="win95-window-inset p-8 text-center">
        <div className="text-black">No data available</div>
      </div>
    );
  }

  return (
    <div className="win95-window-inset p-4" style={{ height: '300px' }}>
      <Line 
        ref={handleChartRef}
        data={chartData} 
        options={options}
      />
    </div>
  );
} 