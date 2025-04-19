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

// Vibrant color palette (Duolingo-inspired)
const appColors = {
  primary: 'rgba(88, 204, 2, 0.8)',     // Bright green 
  secondary: 'rgba(77, 56, 202, 0.8)',  // Indigo
  accent1: 'rgba(255, 88, 0, 0.8)',     // Orange
  accent2: 'rgba(255, 63, 128, 0.8)',   // Magenta
  accent3: 'rgba(0, 184, 216, 0.8)',    // Teal
  accent4: 'rgba(255, 200, 0, 0.8)',    // Yellow
  accent5: 'rgba(175, 82, 222, 0.8)',   // Purple
  gray: 'rgba(240, 240, 240, 0.8)'      // Light gray
};

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
          appColors.primary,   // Green for saved
          appColors.gray       // Gray for remaining
        ],
        borderColor: [
          'rgba(88, 204, 2, 1)',
          'rgba(240, 240, 240, 1)'
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-green-400 to-emerald-500"></div>
      
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{savingsGoal.name}</h3>
          <p className="text-sm text-gray-600">Savings Progress</p>
        </div>
      </div>

      <div className="h-56 relative">
        <Doughnut data={chartData} options={chartOptions} />
        
        {/* Center overlay with percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-green-600">{percentage}%</div>
          <div className="text-sm text-gray-500">completed</div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-4">
        <div className="text-center bg-green-50 p-2 rounded-lg border border-green-100">
          <div className="text-sm text-gray-600">Saved</div>
          <div className="text-xl font-semibold text-green-600">${savingsGoal.current.toLocaleString()}</div>
        </div>
        <div className="text-center bg-gray-50 p-2 rounded-lg border border-gray-100">
          <div className="text-sm text-gray-600">Target</div>
          <div className="text-xl font-semibold text-gray-700">${savingsGoal.target.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
} 