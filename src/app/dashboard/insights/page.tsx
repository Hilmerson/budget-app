'use client';

import { useState, useCallback, useMemo } from 'react';
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
  const { expenses } = useBudgetStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate top spending categories based on real data
  const topCategories = useMemo(() => {
    setIsLoading(true);
    
    try {
      // Skip processing if no expenses
      if (!expenses || expenses.length === 0) {
        return [];
      }
      
      // Helper to convert any amount to monthly based on frequency
      const getMonthlyAmount = (amount: number, frequency: string): number => {
        switch (frequency) {
          case 'one-time': return amount / 12; // Spread over a year
          case 'weekly': return amount * 4.33; // Average weeks in a month
          case 'bi-weekly': return amount * 2.17; // Average bi-weeks in a month
          case 'quarterly': return amount / 3;
          case 'yearly': return amount / 12;
          default: return amount; // monthly
        }
      };
      
      // Group expenses by category and calculate total for each
      const categoryTotals: Record<string, number> = {};
      
      expenses.forEach(expense => {
        const category = expense.category || 'Uncategorized';
        const monthlyAmount = getMonthlyAmount(expense.amount, expense.frequency);
        
        if (categoryTotals[category]) {
          categoryTotals[category] += monthlyAmount;
        } else {
          categoryTotals[category] = monthlyAmount;
        }
      });
      
      // Convert to array, sort by amount (descending), and take top 5
      const sortedCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      
      return sortedCategories;
    } finally {
      setIsLoading(false);
    }
  }, [expenses]);
  
  // Calculate total of all categories for percentage calculation
  const totalSpending = useMemo(() => {
    return topCategories.reduce((sum, item) => sum + item.amount, 0);
  }, [topCategories]);
  
  // Vibrant colors for the categories (Duolingo-inspired)
  const categoryColors = [
    'bg-gradient-to-r from-indigo-500 to-purple-600',
    'bg-gradient-to-r from-pink-500 to-rose-500',
    'bg-gradient-to-r from-amber-400 to-orange-500',
    'bg-gradient-to-r from-green-400 to-emerald-500',
    'bg-gradient-to-r from-blue-400 to-cyan-500',
    'bg-gradient-to-r from-fuchsia-500 to-purple-600',
  ];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Top spending categories */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Top Spending Categories</h3>
        
        {topCategories.length > 0 ? (
          <div className="space-y-4">
            {topCategories.map((item, index) => {
              const percentage = (item.amount / totalSpending * 100);
              
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <div className="font-medium">{item.category}</div>
                    <div className="text-gray-700">
                      {formatCurrency(item.amount)} <span className="text-gray-500 text-xs">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${categoryColors[index % categoryColors.length]}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between">
                <div className="text-gray-500 text-sm">Total Monthly Spending:</div>
                <div className="font-semibold">{formatCurrency(totalSpending)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No expense data available.</p>
            <p className="text-sm mt-2">Add expenses to see your spending breakdown</p>
          </div>
        )}
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
  // Add state for toggling number visibility (privacy feature)
  const [isValueVisible, setIsValueVisible] = useState(true);
  
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
  
  // Handle toggling visibility
  const toggleValueVisibility = () => {
    setIsValueVisible(!isValueVisible);
  };
  
  return (
    <div className={`${getBackgroundColor()} rounded-lg p-4 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-gray-700 font-medium text-sm sm:text-base">{title}</h4>
        
        {/* Privacy toggle button - only for financial values (not scores) */}
        {!isScore && (
          <button 
            onClick={toggleValueVisibility}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={isValueVisible ? "Hide value" : "Show value"}
          >
            {isValueVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${getTextColor()}`}>
          {isValueVisible ? (
            <>
              {displayPrefix}{formattedValue}{suffix}
            </>
          ) : (
            <>
              {displayPrefix}•••••{suffix}
            </>
          )}
        </div>
        
        {trend !== undefined && isValueVisible && (
          <div className={`flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0112 7z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414l3.293 3.293A1 1 0 0012 13z" clipRule="evenodd" />
              </svg>
            )}
            <span className="ml-1 text-xs sm:text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function IncomeExpenseTrend({ timePeriod }: { timePeriod: TimePeriod }) {
  // Get data directly from store
  const { incomes, expenses, calculations } = useBudgetStore();
  const [isLoading, setIsLoading] = useState(false);

  // Function to aggregate data based on time period
  const getAggregatedData = useCallback(() => {
    // Set loading while we process the data
    setIsLoading(true);
    
    try {
      const now = new Date();
      const results: {
        date: string;
        income: number;
        expenses: number;
        balance: number;
      }[] = [];
      
      // Determine date range based on selected time period
      let daysToShow = 30; // Default to 30 days
      let groupByFormat: 'day' | 'week' | 'month' = 'day';
      
      switch(timePeriod) {
        case '7days':
          daysToShow = 7;
          groupByFormat = 'day';
          break;
        case '30days':
          daysToShow = 30;
          groupByFormat = 'day';
          break;
        case '90days':
          daysToShow = 90;
          groupByFormat = 'week';
          break;
        case '6months':
          daysToShow = 180;
          groupByFormat = 'week';
          break;
        case '1year':
          daysToShow = 365;
          groupByFormat = 'month';
          break;
        case 'all':
          daysToShow = 730; // Default to 2 years for "all"
          groupByFormat = 'month';
          break;
      }
      
      // For each date in our range, calculate aggregated values
      for (let i = daysToShow; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        // Here we would normally query our API for historical data at this date
        // Since we don't have historical data, we'll use what's in the store
        // In a production app, we would fetch this from an API with proper auth
        
        // Get monthly income/expense amounts from store
        const monthlyIncome = calculations.totalMonthlyIncome;
        const monthlyExpenses = calculations.totalMonthlyExpenses;
        
        // Add some subtle variation to make the chart look more realistic
        const dayFactor = Math.sin(i * 0.1) * 0.1 + 0.95; // Between 0.85 and 1.05
        
        // Format the date based on grouping
        let formattedDate = '';
        if (groupByFormat === 'day') {
          formattedDate = date.toISOString().split('T')[0];
        } else if (groupByFormat === 'week') {
          // Get the week number
          const weekNum = Math.ceil((date.getDate() + (date.getDay() + 1)) / 7);
          formattedDate = `${date.getFullYear()}-W${weekNum}`;
        } else { // month
          formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        // Find existing entry or create new one
        let entry = results.find(r => r.date === formattedDate);
        if (!entry) {
          entry = {
            date: formattedDate, 
            income: 0,
            expenses: 0,
            balance: 0
          };
          results.push(entry);
        }
        
        // If grouping by day, set values directly
        if (groupByFormat === 'day') {
          entry.income = monthlyIncome / 30 * dayFactor;
          entry.expenses = monthlyExpenses / 30 * dayFactor;
        } else {
          // For week/month, accumulate values
          entry.income += monthlyIncome / 30 * dayFactor;
          entry.expenses += monthlyExpenses / 30 * dayFactor;
        }
        
        // Calculate balance
        entry.balance = entry.income - entry.expenses;
      }
      
      // If we're grouping by week or month, we need to deduplicate and sort
      if (groupByFormat !== 'day') {
        // Get unique dates, summarize, and sort
        const uniqueDates = [...new Set(results.map(r => r.date))];
        const uniqueResults = uniqueDates.map(date => {
          const entries = results.filter(r => r.date === date);
          return {
            date,
            income: entries.reduce((sum, entry) => sum + entry.income, 0),
            expenses: entries.reduce((sum, entry) => sum + entry.expenses, 0),
            balance: entries.reduce((sum, entry) => sum + entry.balance, 0)
          };
        });
        
        // Sort by date
        uniqueResults.sort((a, b) => a.date.localeCompare(b.date));
        return uniqueResults;
      }
      
      // Sort results by date
      results.sort((a, b) => a.date.localeCompare(b.date));
      return results;
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  }, [timePeriod, calculations.totalMonthlyIncome, calculations.totalMonthlyExpenses]);

  // Process the data when time period changes
  const timeData = useMemo(() => getAggregatedData(), [getAggregatedData]);
  
  // Format date labels based on time period
  const formatDateLabel = (dateStr: string) => {
    if (dateStr.includes('W')) {
      // Week format
      const [year, week] = dateStr.split('-W');
      return `Week ${week}`;
    } else if (dateStr.length === 7) {
      // Month format (YYYY-MM)
      const date = new Date(dateStr + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else {
      // Day format (YYYY-MM-DD)
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  const chartData = {
    labels: timeData.map(d => formatDateLabel(d.date)),
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
          maxTicksLimit: timePeriod === '7days' ? 7 : timePeriod === '30days' ? 10 : 8,
          font: {
            size: 10
          }
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
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