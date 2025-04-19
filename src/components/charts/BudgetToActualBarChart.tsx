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
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Actual',
        data: allCategories.map(category => Math.round(expensesByCategory[category] || 0)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs. Actual Spending</h3>
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
} 