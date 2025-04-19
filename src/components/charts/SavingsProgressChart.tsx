'use client';

import { Doughnut } from 'react-chartjs-2';
import { useBudgetStore } from '@/store/useBudgetStore';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Sample savings goal data (in a real app, this would come from the store or API)
const savingsGoal = {
  name: 'Emergency Fund',
  target: 10000,
  current: 3500,
  icon: '💰'
};

export default function SavingsProgressChart() {
  // Calculate percentage
  const percentage = Math.min(Math.round((savingsGoal.current / savingsGoal.target) * 100), 100);
  const remaining = savingsGoal.target - savingsGoal.current;

  // Create data for the doughnut chart
  const chartData = {
    labels: ['Saved', 'Remaining'],
    datasets: [
      {
        data: [savingsGoal.current, remaining],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green for saved
          'rgba(229, 231, 235, 0.6)'  // Gray for remaining
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(229, 231, 235, 1)'
        ],
        borderWidth: 1,
        borderRadius: 4,
        spacing: 2
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    circumference: 360,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#374151',
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13
        },
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 'bold' as const
        },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 8,
        borderColor: 'rgba(229, 231, 235, 1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart' as const
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{savingsGoal.name}</h3>
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-2">{savingsGoal.icon}</div>
        <div className="text-sm text-gray-600">
          Savings Progress
        </div>
      </div>

      <div className="h-56 relative">
        <Doughnut data={chartData} options={chartOptions} />
        
        {/* Center overlay with percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">{percentage}%</div>
          <div className="text-sm text-gray-500">completed</div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-4">
        <div className="text-center bg-green-50 p-2 rounded-lg">
          <div className="text-sm text-gray-600">Saved</div>
          <div className="text-xl font-semibold text-green-600">${savingsGoal.current.toLocaleString()}</div>
        </div>
        <div className="text-center bg-gray-50 p-2 rounded-lg">
          <div className="text-sm text-gray-600">Target</div>
          <div className="text-xl font-semibold text-gray-700">${savingsGoal.target.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
} 