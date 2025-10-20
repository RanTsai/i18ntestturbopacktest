"use client";
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function RadarChart({ data }: { data: number[] }) {
  const chartData = {
    labels: ['Visual', 'Clarity', 'Relevance', 'CTR', 'Branding'],
    datasets: [
      {
        label: 'Aspect Ratings',
        data,
        backgroundColor: 'rgba(106, 90, 205, 0.3)',
        borderColor: '#6a5acd',
        pointBackgroundColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: '#aaa',
        },
        grid: {
          color: '#333',
        },
        pointLabels: {
          color: '#fff',
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Radar data={chartData} options={chartOptions} className="w-full h-full" />;
}

export default React.memo(RadarChart);