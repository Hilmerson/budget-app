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
          'rgba(255, 99, 132, 0.7)',   // Pink
          'rgba(54, 162, 235, 0.7)',   // Blue
          'rgba(255, 206, 86, 0.7)',   // Yellow
          'rgba(75, 192, 192, 0.7)',   // Teal
          'rgba(153, 102, 255, 0.7)',  // Purple
          'rgba(255, 159, 64, 0.7)',   // Orange
          'rgba(94, 234, 212, 0.7)',   // Turquoise
          'rgba(249, 115, 22, 0.7)',   // Amber
          'rgba(16, 185, 129, 0.7)',   // Green
          'rgba(168, 85, 247, 0.7)',   // Lavender
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(94, 234, 212, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(168, 85, 247, 1)',
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
          weight: 'bold'
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
      easing: 'easeOutQuart'
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expenses by Category</h3>
      <div className="h-64">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
} 