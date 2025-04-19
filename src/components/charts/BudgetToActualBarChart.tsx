'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useBudgetStore } from '@/store/useBudgetStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Vibrant color palette (Duolingo-inspired)
const appColors = {
  primary: 'rgba(88, 204, 2, 0.7)',     // Bright green 
  secondary: 'rgba(77, 56, 202, 0.7)',  // Indigo
  accent1: 'rgba(255, 88, 0, 0.7)',     // Orange
  accent2: 'rgba(255, 63, 128, 0.7)',   // Magenta
  accent3: 'rgba(0, 184, 216, 0.7)',    // Teal
  accent4: 'rgba(255, 200, 0, 0.7)',    // Yellow
  accent5: 'rgba(175, 82, 222, 0.7)',   // Purple
  gray: 'rgba(240, 240, 240, 0.7)'      // Light gray
};

// Sample budget data (in a real app, this would come from the store or API)
const budgetData: Record<string, number> = {
  'Housing': 1200,
  'Food': 500,
  'Transportation': 300,
  'Utilities': 200,
  'Entertainment': 150,
  'Healthcare': 250,
  'Debt Payments': 400,
  'Savings': 300,
  'Other': 100
};

export default function BudgetToActualBarChart() {
  const expenses = useBudgetStore((state) => state.expenses);

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
  const expensesByCategory = useMemo(() => {
    const result: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category;
      const monthlyAmount = calculateMonthlyAmount(expense);
      
      if (result[category]) {
        result[category] += monthlyAmount;
      } else {
        result[category] = monthlyAmount;
      }
    });
    return result;
  }, [expenses]);

  // Get all unique categories (both from budget and expenses)
  const allCategories = useMemo(() => {
    return [...new Set([...Object.keys(budgetData), ...Object.keys(expensesByCategory)])];
  }, [expensesByCategory]);

  // Prepare data for the chart
  const chartData = {
    labels: allCategories,
    datasets: [
      {
        label: 'Budget',
        data: allCategories.map(category => budgetData[category] || 0),
        backgroundColor: appColors.secondary,
        borderColor: 'rgba(77, 56, 202, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Actual',
        data: allCategories.map(category => Math.round(expensesByCategory[category] || 0)),
        backgroundColor: appColors.accent2,
        borderColor: 'rgba(255, 63, 128, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          callback: function(value: any) {
            return '$' + value;
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          usePointStyle: true,
          padding: 20,
          color: '#4b5563'
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
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          }
        }
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart' as const
    }
  };

  // If there are no expenses, show a message
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200 h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No expense data to display</p>
          <p className="text-sm text-gray-400">Add expenses to compare with your budget</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
      
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Budget vs. Actual Spending</h3>
      </div>
      
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
} 