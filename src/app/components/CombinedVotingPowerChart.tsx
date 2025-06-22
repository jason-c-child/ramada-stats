'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface CombinedVotingPowerChartProps {
  totalVotingPower: { timestamp: number; value: number }[];
  averageVotingPower: { timestamp: number; value: number }[];
  onChartReady?: (chart: ChartJS<'bar'>) => void;
}


export default function CombinedVotingPowerChart({ 
  totalVotingPower, 
  averageVotingPower,
  onChartReady
}: CombinedVotingPowerChartProps) {
  const chartRef = useRef<ChartJS<'bar'> | null>(null);
  
  console.log('CombinedVotingPowerChart received data:', { 
    totalVotingPower: totalVotingPower.length, 
    averageVotingPower: averageVotingPower.length 
  });

  const formatVotingPower = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Calculate y-axis range for better scaling
  const yAxisRange = useMemo(() => {
    const totalVotingPowerValues = totalVotingPower?.map(point => point.value) || [];
    const averageVotingPowerValues = averageVotingPower?.map(point => point.value) || [];
    
    if (totalVotingPowerValues.length === 0 && averageVotingPowerValues.length === 0) {
      return { min: 0, max: 100 };
    }
    
    const allValues = [
      ...totalVotingPowerValues,
      ...averageVotingPowerValues
    ];
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
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
  }, [totalVotingPower, averageVotingPower]);

  // Use useMemo to create chart data and ensure it updates when data changes
  const chartData = useMemo(() => {
    const totalVotingPowerData = totalVotingPower || [];
    const averageVotingPowerData = averageVotingPower || [];
    
    if (totalVotingPowerData.length === 0 && averageVotingPowerData.length === 0) {
      return {
        datasets: []
      };
    }

    // For stacked bars, we need to calculate the difference
    const processedData = {
      datasets: [
        {
          label: 'Average Voting Power',
          data: averageVotingPowerData.map(point => point.value),
          backgroundColor: '#ff8000',
          borderColor: '#ff8000',
          borderWidth: 1,
          stack: 'stack0',
        },
        {
          label: 'Additional Voting Power',
          data: totalVotingPowerData.map((point, index) => {
            const avgPoint = averageVotingPowerData[index];
            const additional = avgPoint ? point.value - avgPoint.value : 0;
            return Math.max(0, additional);
          }),
          backgroundColor: '#800080',
          borderColor: '#800080',
          borderWidth: 1,
          stack: 'stack0',
        },
      ],
    };

    console.log('CombinedVotingPowerChart processed chart data:', processedData);
    return processedData;
  }, [totalVotingPower, averageVotingPower]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#000',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          usePointStyle: true,
          pointStyle: 'rect',
        },
      },
      title: {
        display: true,
        text: 'Voting Power Comparison',
        color: '#000',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#000',
        borderWidth: 1,
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            return `${context.dataset.label}: ${formatVotingPower(context.parsed.y)}`;
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
        beginAtZero: true,
        min: yAxisRange.min,
        max: yAxisRange.max,
        grid: {
          color: '#000',
          borderColor: '#000',
        },
        ticks: {
          color: '#000',
          font: {
            size: 10,
          },
          callback: function(value: string | number) {
            return formatVotingPower(Number(value));
          },
        },
        title: {
          display: true,
          text: 'Voting Power',
          color: '#000',
          font: {
            size: 12,
            weight: 'bold' as const,
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

  const totalVotingPowerData = totalVotingPower || [];
  const averageVotingPowerData = averageVotingPower || [];

  if (totalVotingPowerData.length === 0 && averageVotingPowerData.length === 0) {
    return (
      <div className="win95-window-inset p-8 text-center">
        <div className="text-black">No data available</div>
      </div>
    );
  }

  return (
    <div className="win95-window-inset p-4" style={{ height: '300px' }}>
      <Bar 
        ref={handleChartRef}
        data={chartData} 
        options={options}
      />
    </div>
  );
} 