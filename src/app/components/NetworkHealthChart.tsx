'use client';

import React, { useRef, useMemo, useCallback } from 'react';
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
  TooltipItem,
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

interface NetworkHealthChartProps {
  blockTime: { timestamp: number; value: number }[];
  activeValidators: { timestamp: number; value: number }[];
  onChartReady?: (chart: ChartJS<'line'>) => void;
}

export default function NetworkHealthChart({ 
  blockTime, 
  activeValidators,
  onChartReady
}: NetworkHealthChartProps) {
  const chartRef = useRef<ChartJS<'line'> | null>(null);
  
  console.log('NetworkHealthChart received data:', { 
    blockTime: blockTime.length, 
    activeValidators: activeValidators.length 
  });

  // Calculate y-axis range for better scaling
  const yAxisRange = useMemo(() => {
    const blockTimeValues = blockTime?.map(point => point.value) || [];
    const validatorValues = activeValidators?.map(point => point.value) || [];
    
    if (blockTimeValues.length === 0 && validatorValues.length === 0) {
      return {
        blockTime: { min: 0, max: 10 },
        validators: { min: 0, max: 100 }
      };
    }
    
    // For block time, we want to show small variations
    const blockTimeMin = blockTimeValues.length > 0 ? Math.min(...blockTimeValues) : 0;
    const blockTimeMax = blockTimeValues.length > 0 ? Math.max(...blockTimeValues) : 10;
    
    // For validators, we want to show the full range
    const validatorMin = validatorValues.length > 0 ? Math.min(...validatorValues) : 0;
    const validatorMax = validatorValues.length > 0 ? Math.max(...validatorValues) : 100;
    
    // Use separate scales for the two metrics
    return {
      blockTime: {
        min: Math.max(0, blockTimeMin - (blockTimeMax - blockTimeMin) * 0.1),
        max: blockTimeMax + (blockTimeMax - blockTimeMin) * 0.1
      },
      validators: {
        min: Math.max(0, validatorMin - (validatorMax - validatorMin) * 0.1),
        max: validatorMax + (validatorMax - validatorMin) * 0.1
      }
    };
  }, [blockTime, activeValidators]);

  // Use useMemo to create chart data and ensure it updates when data changes
  const chartData = useMemo(() => {
    const blockTimeData = blockTime || [];
    const activeValidatorsData = activeValidators || [];
    
    if (blockTimeData.length === 0 && activeValidatorsData.length === 0) {
      return {
        datasets: []
      };
    }

    const processedData = {
      datasets: [
        {
          label: 'Block Time (seconds)',
          data: blockTimeData.map(point => ({
            x: new Date(point.timestamp),
            y: point.value
          })),
          borderColor: '#ff0000',
          backgroundColor: '#ff000020',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#ff0000',
          pointBorderColor: '#000',
          pointBorderWidth: 1,
          yAxisID: 'y-blocktime',
        },
        {
          label: 'Active Validators',
          data: activeValidatorsData.map(point => ({
            x: new Date(point.timestamp),
            y: point.value
          })),
          borderColor: '#00ff00',
          backgroundColor: '#00ff0020',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#00ff00',
          pointBorderColor: '#000',
          pointBorderWidth: 1,
          yAxisID: 'y-validators',
        },
      ],
    };

    console.log('NetworkHealthChart processed chart data:', processedData);
    return processedData;
  }, [blockTime, activeValidators]);

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
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Network Health Overview',
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
          label: function(context: TooltipItem<'line'>) {
            if (context.dataset.label === 'Block Time (seconds)') {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}s`;
            } else {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
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
      'y-blocktime': {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: yAxisRange.blockTime.min,
        max: yAxisRange.blockTime.max,
        grid: {
          color: '#000',
          borderColor: '#000',
        },
        ticks: {
          color: '#ff0000',
          font: {
            size: 10,
          },
          callback: function(value: string | number) {
            return `${Number(value).toFixed(2)}s`;
          },
        },
        title: {
          display: true,
          text: 'Block Time (seconds)',
          color: '#ff0000',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      'y-validators': {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: yAxisRange.validators.min,
        max: yAxisRange.validators.max,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#00ff00',
          font: {
            size: 10,
          },
        },
        title: {
          display: true,
          text: 'Active Validators',
          color: '#00ff00',
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

  const blockTimeData = blockTime || [];
  const activeValidatorsData = activeValidators || [];

  if (blockTimeData.length === 0 && activeValidatorsData.length === 0) {
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