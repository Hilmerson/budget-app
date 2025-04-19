'use client';

import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useBudgetStore } from '@/store/useBudgetStore';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  Colors
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  Colors
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
  accent6: 'rgba(255, 138, 76, 0.8)',   // Coral
  accent7: 'rgba(46, 196, 182, 0.8)',   // Turquoise
  accent8: 'rgba(231, 29, 54, 0.8)',    // Red
  gray: 'rgba(240, 240, 240, 0.8)'      // Light gray
};

// Corresponding border colors (more solid versions)
const borderColors = {
  primary: 'rgba(88, 204, 2, 1)',
  secondary: 'rgba(77, 56, 202, 1)',
  accent1: 'rgba(255, 88, 0, 1)',
  accent2: 'rgba(255, 63, 128, 1)',
  accent3: 'rgba(0, 184, 216, 1)',
  accent4: 'rgba(255, 200, 0, 1)',
  accent5: 'rgba(175, 82, 222, 1)',
  accent6: 'rgba(255, 138, 76, 1)',
  accent7: 'rgba(46, 196, 182, 1)',
  accent8: 'rgba(231, 29, 54, 1)',
  gray: 'rgba(240, 240, 240, 1)'
};

export default function ExpensePieChart() {
  const expenses = useBudgetStore((state) => state.expenses);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Calculate monthly amounts for each expense
  const calculateMonthlyAmount = (expense: any) => {
    if (expense.frequency === 'one-time') return expense.amount / 12;
    if (expense.frequency === 'yearly') return expense.amount / 12;
    if (expense.frequency === 'quarterly') return expense.amount / 3;
    if (expense.frequency === 'weekly') return expense.amount * 4.33;
    if (expense.frequency === 'bi-weekly') return expense.amount * 2.17;
    return expense.amount; // Monthly amount
  };

  // Group expenses by category and sum their monthly amounts
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(expense => {
    const category = expense.category;
    const monthlyAmount = calculateMonthlyAmount(expense);
    
    if (expensesByCategory[category]) {
      expensesByCategory[category] += monthlyAmount;
    } else {
      expensesByCategory[category] = monthlyAmount;
    }
  });

  // Create data for the pie chart
  const chartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          appColors.primary,
          appColors.secondary,
          appColors.accent1,
          appColors.accent2,
          appColors.accent3,
          appColors.accent4,
          appColors.accent5,
          appColors.accent6,
          appColors.accent7,
          appColors.accent8,
        ],
        borderColor: [
          borderColors.primary,
          borderColors.secondary,
          borderColors.accent1,
          borderColors.accent2,
          borderColors.accent3,
          borderColors.accent4,
          borderColors.accent5,
          borderColors.accent6,
          borderColors.accent7,
          borderColors.accent8,
        ],
        borderWidth: 2,
        hoverOffset: 15
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
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
          },
          title: function(context: any) {
            return 'Monthly Expense';
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 800,
      easing: 'easeOutQuart' as const
    }
  };

  // If there are no expenses, show a message
  if (Object.keys(expensesByCategory).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No expense data to display</p>
          <p className="text-sm text-gray-400">Add expenses to see your spending breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
            <path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path>
            <path d="M12 12l8.5 8.5"></path>
            <path d="M12 12l-8.5 8.5"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Monthly Expenses by Category</h3>
      </div>
      
      <div className="h-64">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
} 