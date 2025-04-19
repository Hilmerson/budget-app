'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Time period filter options
type TimePeriod = '7days' | '30days' | '90days' | '6months' | '1year' | 'all';

// Placeholder components - these will be implemented with real data
function OverviewTab({ timePeriod }: { timePeriod: TimePeriod }) {
  const { calculations, gamification } = useBudgetStore();
  
  return (
    <div className="space-y-8">
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialMetricCard 
          title="Monthly Balance" 
          value={calculations.monthlyBalance || 0} 
          trend={10} 
          isPositive={calculations.monthlyBalance > 0}
        />
        <FinancialMetricCard 
          title="Financial Health Score" 
          value={gamification.healthScore || 0} 
          maxValue={100}
          isScore={true}
        />
        <FinancialMetricCard 
          title="Savings Rate" 
          value={calculations.monthlyBalance > 0 ? 
            ((calculations.monthlyBalance / calculations.totalMonthlyIncome) * 100) || 0 : 0}
          suffix="%"
          isPositive={calculations.monthlyBalance > 0}
        />
      </div>

      {/* Income vs Expenses Trend */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Income vs Expenses Trend</h3>
        <div className="h-80">
          <IncomeExpenseTrend timePeriod={timePeriod} />
        </div>
      </div>
      
      {/* Placeholder for Financial Health Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Financial Health Breakdown</h3>
        <div className="text-center py-10 text-gray-500">
          Detailed breakdown of factors affecting your financial health score
        </div>
      </div>
    </div>
  );
}

function SpendingTab({ timePeriod }: { timePeriod: TimePeriod }) {
  return (
    <div className="space-y-8">
      {/* Placeholder for Top spending categories */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Top Spending Categories</h3>
        <div className="text-center py-10 text-gray-500">
          Analysis of your highest spending categories
        </div>
      </div>
      
      {/* Placeholder for Spending trends */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
        <div className="text-center py-10 text-gray-500">
          How your spending has changed over time
        </div>
      </div>
      
      {/* Placeholder for spending types */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Discretionary vs Essential Spending</h3>
        <div className="text-center py-10 text-gray-500">
          Breakdown of necessary vs optional expenses
        </div>
      </div>
    </div>
  );
}

function IncomeTab({ timePeriod }: { timePeriod: TimePeriod }) {
  return (
    <div className="space-y-8">
      {/* Placeholder for Income Sources */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Income Sources</h3>
        <div className="text-center py-10 text-gray-500">
          Breakdown of your income streams
        </div>
      </div>
      
      {/* Placeholder for Income Stability */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Income Stability</h3>
        <div className="text-center py-10 text-gray-500">
          Analysis of how reliable your income sources are
        </div>
      </div>
      
      {/* Placeholder for Income Projection */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Income Growth Projection</h3>
        <div className="text-center py-10 text-gray-500">
          Estimated future income based on current trends
        </div>
      </div>
    </div>
  );
}

function SavingsTab({ timePeriod }: { timePeriod: TimePeriod }) {
  return (
    <div className="space-y-8">
      {/* Placeholder for Savings Goals */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Savings Goals Progress</h3>
        <div className="text-center py-10 text-gray-500">
          Track progress toward your financial targets
        </div>
      </div>
      
      {/* Placeholder for Savings Growth */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Savings Growth</h3>
        <div className="text-center py-10 text-gray-500">
          How your savings have grown over time
        </div>
      </div>
      
      {/* Placeholder for Emergency Fund */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Emergency Fund Coverage</h3>
        <div className="text-center py-10 text-gray-500">
          How many months your emergency fund will cover
        </div>
      </div>
    </div>
  );
}

// Components for metric cards and charts
interface FinancialMetricCardProps {
  title: string;
  value: number;
  trend?: number;
  suffix?: string;
  prefix?: string;
  isPositive?: boolean;
  isScore?: boolean;
  maxValue?: number;
}

function FinancialMetricCard({ 
  title, 
  value, 
  trend, 
  suffix = '', 
  prefix = '$', 
  isPositive = true,
  isScore = false,
  maxValue = 100
}: FinancialMetricCardProps) {
  
  const formattedValue = isScore 
    ? Math.round(value) 
    : value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  
  const displayPrefix = isScore ? '' : prefix;
  
  const getBackgroundColor = () => {
    if (isScore) {
      if (value >= 0.8 * maxValue) return 'bg-green-50';
      if (value >= 0.6 * maxValue) return 'bg-blue-50';
      if (value >= 0.4 * maxValue) return 'bg-yellow-50';
      return 'bg-red-50';
    }
    
    return isPositive ? 'bg-green-50' : 'bg-red-50';
  };
  
  const getTextColor = () => {
    if (isScore) {
      if (value >= 0.8 * maxValue) return 'text-green-700';
      if (value >= 0.6 * maxValue) return 'text-blue-700';
      if (value >= 0.4 * maxValue) return 'text-yellow-700';
      return 'text-red-700';
    }
    
    return isPositive ? 'text-green-700' : 'text-red-700';
  };
  
  return (
    <div className={`${getBackgroundColor()} rounded-lg p-6 shadow-sm transition-all duration-300 hover:shadow-md`}>
      <h4 className="text-gray-700 font-medium mb-2">{title}</h4>
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-bold ${getTextColor()}`}>
          {displayPrefix}{formattedValue}{suffix}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414l3.293 3.293A1 1 0 0012 13z" clipRule="evenodd" />
              </svg>
            )}
            <span className="ml-1 text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function IncomeExpenseTrend({ timePeriod }: { timePeriod: TimePeriod }) {
  // Generate mock time-series data (replace with real data)
  const generateTimeData = () => {
    const now = new Date();
    const data = [];
    
    let daysToShow = 30;
    if (timePeriod === '7days') daysToShow = 7;
    if (timePeriod === '90days') daysToShow = 90;
    if (timePeriod === '6months') daysToShow = 180;
    if (timePeriod === '1year') daysToShow = 365;
    
    for (let i = daysToShow; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // In a real implementation, you would filter actual income/expense data
      const incomeValue = 3000 + Math.random() * 500;
      const expenseValue = 2200 + Math.random() * 800;
      
      data.push({
        date: date.toISOString().split('T')[0],
        income: incomeValue,
        expenses: expenseValue,
        balance: incomeValue - expenseValue
      });
    }
    
    return data;
  };
  
  const timeData = generateTimeData();
  
  const chartData = {
    labels: timeData.map(d => d.date),
    datasets: [
      {
        label: 'Income',
        data: timeData.map(d => d.income),
        borderColor: 'rgba(88, 204, 2, 1)',
        backgroundColor: 'rgba(88, 204, 2, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: timeData.map(d => d.expenses),
        borderColor: 'rgba(255, 63, 128, 1)',
        backgroundColor: 'rgba(255, 63, 128, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Balance',
        data: timeData.map(d => d.balance),
        borderColor: 'rgba(77, 56, 202, 1)',
        backgroundColor: 'rgba(77, 56, 202, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#374151',
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
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };
  
  return <Line data={chartData} options={chartOptions} />;
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'spending' | 'income' | 'savings'>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30days');
  
  return (
    <div className="space-y-6">
      <div className="relative mb-8 pb-4 border-b border-gray-100">
        <div className="h-1 w-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 absolute bottom-0 left-0 rounded-full"></div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
        <p className="text-gray-600 mt-1">Deeper analysis of your financial data</p>
      </div>
      
      {/* Tab navigation */}
      <div className="flex space-x-2 border-b">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('spending')}
          className={`px-4 py-2 font-medium ${activeTab === 'spending' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Spending Analysis
        </button>
        <button 
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 font-medium ${activeTab === 'income' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Income Insights
        </button>
        <button 
          onClick={() => setActiveTab('savings')}
          className={`px-4 py-2 font-medium ${activeTab === 'savings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Savings Goals
        </button>
      </div>
      
      {/* Time period filter */}
      <div className="flex justify-end">
        <div className="bg-white rounded-lg border border-gray-200 flex p-1">
          {(['7days', '30days', '90days', '6months', '1year', 'all'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1 text-sm rounded-md ${
                timePeriod === period 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period === '7days' ? '7D' : 
               period === '30days' ? '30D' : 
               period === '90days' ? '90D' : 
               period === '6months' ? '6M' : 
               period === '1year' ? '1Y' : 'All'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content based on active tab */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab timePeriod={timePeriod} />}
        {activeTab === 'spending' && <SpendingTab timePeriod={timePeriod} />}
        {activeTab === 'income' && <IncomeTab timePeriod={timePeriod} />}
        {activeTab === 'savings' && <SavingsTab timePeriod={timePeriod} />}
      </div>
    </div>
  );
} 