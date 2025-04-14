'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useBudgetStore } from '@/store/useBudgetStore';
import { 
  WelcomeIllustration, 
  FinancialHealthCard, 
  SavingsGoalCard,
  BudgetComparisonCard 
} from './Illustrations';
import {
  LevelProgress,
  StreakTracker,
  Achievements,
  Challenge
} from './Gamification';
import Income from './Income';
import Expenses from './Expenses';
import { useDashboardData } from '@/hooks/useDataFetching';

type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: Frequency;
  description?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    gamification: { level, experience, nextLevelExperience },
    calculations: { afterTaxIncome },
    expenses,
    addExperience,
    updateCalculations,
    dataLoaded,
    setDataLoaded
  } = useBudgetStore();

  const [incomeFrequency, setIncomeFrequency] = useState<Frequency>('monthly');
  const [employmentMode, setEmploymentMode] = useState<'full-time' | 'contract' | 'other'>('full-time');
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  // Custom hook for fetching all data
  const { 
    isLoading, 
    error,
    userData,
    refetchAll
  } = useDashboardData();

  // Mock gamification data - now using store values
  const [streak, setStreak] = useState(4);
  const [healthScore, setHealthScore] = useState(72);

  // Set the active sidebar item based on URL hash when component mounts
  useEffect(() => {
    // Check for hash in the URL (e.g., #income, #expenses)
    const hash = window.location.hash?.substring(1); // Remove the # character
    if (hash && ['dashboard', 'income', 'expenses', 'achievements', 'settings'].includes(hash)) {
      setActiveSidebarItem(hash);
    }
  }, []);

  // Update URL hash when active sidebar item changes
  useEffect(() => {
    if (activeSidebarItem) {
      window.location.hash = activeSidebarItem;
    }
  }, [activeSidebarItem]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Update state from userData when it changes
  useEffect(() => {
    if (userData && 'employmentMode' in userData) {
      setEmploymentMode(userData.employmentMode || 'full-time');
      updateCalculations();
    }
  }, [userData, updateCalculations]);

  // Calculate total monthly expenses
  const totalMonthlyExpenses = expenses.reduce((sum, expense) => {
    let monthlyAmount = expense.amount;
    
    if (expense.frequency === 'one-time') monthlyAmount = expense.amount / 12;
    else if (expense.frequency === 'yearly') monthlyAmount = expense.amount / 12;
    else if (expense.frequency === 'quarterly') monthlyAmount = expense.amount / 3;
    else if (expense.frequency === 'weekly') monthlyAmount = expense.amount * 4.33;
    else if (expense.frequency === 'bi-weekly') monthlyAmount = expense.amount * 2.17;
    
    return sum + monthlyAmount;
  }, 0);
  
  // Calculate remaining monthly income
  const remainingIncome = (afterTaxIncome / 12) - totalMonthlyExpenses;

  const frequencyOptions = [
    { value: 'one-time', label: 'One Time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Example category data for budget comparison
  const budgetCategories = [
    { name: 'Housing', budgeted: 1500, spent: 1450 },
    { name: 'Food', budgeted: 500, spent: 620 },
    { name: 'Transportation', budgeted: 300, spent: 275 },
    { name: 'Entertainment', budgeted: 200, spent: 180 },
  ];

  // Function to manually reset data loading state
  const resetDataLoadingState = () => {
    console.log("🧹 Dashboard: Resetting data loading state");
    setDataLoaded(false);
    // Trigger a complete data reload
    refetchAll();
  };

  // Main content based on active sidebar item
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading your financial dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <div className="text-red-500 text-xl mb-4">😕 {error}</div>
          <button 
            onClick={resetDataLoadingState} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (activeSidebarItem === 'dashboard') {
      return (
        <div className="space-y-6">
          <WelcomeIllustration />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <FinancialHealthCard score={healthScore} />
            <SavingsGoalCard current={3200} target={5000} />
            <div className="xl:col-span-1 md:col-span-2 col-span-1">
              <StreakTracker currentStreak={streak} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <BudgetComparisonCard categories={budgetCategories} />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Monthly Income</div>
                    <div className="text-xl font-bold text-green-600">${(afterTaxIncome / 12).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Monthly Expenses</div>
                    <div className="text-xl font-bold text-red-600">${totalMonthlyExpenses.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Remaining</div>
                    <div className={`text-xl font-bold ${remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${remainingIncome.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Challenge</h2>
                <Challenge
                  title="Review Expenses"
                  description="Review and categorize today's expenses"
                  progress={1}
                  goal={1}
                  reward={25}
                  type="expense"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSidebarItem === 'income') {
      return (
        <div className="space-y-6">
          <Income />
        </div>
      );
    }

    if (activeSidebarItem === 'expenses') {
      return (
        <div className="space-y-6">
          <Expenses />
        </div>
      );
    }

    if (activeSidebarItem === 'achievements') {
      return (
        <div>
          <Achievements />
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="text-xl text-indigo-500 flex items-center space-x-2">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading your finances...</span>
        </div>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'income', icon: '💵', label: 'Income' },
    { id: 'expenses', icon: '📝', label: 'Expenses' },
    { id: 'achievements', icon: '🏆', label: 'Achievements' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white md:min-h-screen shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">
              Finny
            </h1>
            <p className="text-xs text-gray-500">Smart money management</p>
          </div>
          
          {status === 'authenticated' && (
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <LevelProgress 
                  level={level}
                  experience={experience}
                  nextLevelExperience={nextLevelExperience}
                />
              </div>
            
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSidebarItem(item.id)}
                    className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                      activeSidebarItem === item.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 