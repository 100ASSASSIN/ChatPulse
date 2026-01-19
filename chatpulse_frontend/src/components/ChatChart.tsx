// src/components/ChatChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChatChartProps {
  data: {
    dates: string[];
    active_users_count: number[];
    new_users_count: number[];
  };
}

const ChatChart: React.FC<ChatChartProps> = ({ data }) => {
  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: 'Active Users',
        data: data.active_users_count,
        backgroundColor: 'rgba(54, 162, 235, 0.7)', // Blue
      },
      {
        label: 'New Users',
        data: data.new_users_count,
        backgroundColor: 'rgba(255, 159, 64, 0.7)', // Orange
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'WhatsApp Group Chat Analytics (Last 7 Days)',
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default ChatChart;
