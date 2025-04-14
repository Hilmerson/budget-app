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
    addIncome, 
    clearIncomes, 
    addExpense, 
    clearExpenses, 
    setIncomes: updateStoreIncomes, 
    setExpenses: updateStoreExpenses,
    level,
    experience,
    nextLevelExperience,
    addExperience,
    setExperience,
    dataLoaded,
    setDataLoaded
  } = useBudgetStore();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState(0);
  const [incomeFrequency, setIncomeFrequency] = useState<Frequency>('monthly');
  const [employmentMode, setEmploymentMode] = useState<'full-time' | 'contract' | 'other'>('full-time');
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    frequency: 'monthly' as Frequency,
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  // Tax calculation variables
  const [taxBracket, setTaxBracket] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [afterTaxIncome, setAfterTaxIncome] = useState(0);

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

  // Fetch user data
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !dataLoaded) {
      console.log("🔄 Dashboard: User authenticated, fetching data");
      fetchUserData();
      fetchExpenses();
      fetchIncomes();
      fetchExperience();
    }
  }, [status, session, dataLoaded]);

  // Calculate taxes whenever income or employment mode changes
  useEffect(() => {
    calculateTaxes();
  }, [income, employmentMode, incomeFrequency]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await response.json();
      setIncome(userData.income || 0);
      setEmploymentMode(userData.employmentMode || 'full-time');
      setLoading(false);
    } catch (error) {
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      console.log("🔍 Dashboard: Fetching expenses...");
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const expensesData = await response.json();
      console.log("📥 Dashboard: Received expenses data:", expensesData);
      
      // Update local state
      setExpenses(expensesData);
      
      // Also update the Zustand store with the original IDs preserved
      if (Array.isArray(expensesData) && expensesData.length > 0) {
        console.log(`✅ Dashboard: Setting ${expensesData.length} expenses in store`);
        updateStoreExpenses(expensesData);
      } else {
        console.log("⚠️ Dashboard: No expenses data received or empty array");
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching expenses:', error);
      setError('Failed to load expenses');
    }
  };

  const fetchIncomes = async () => {
    try {
      console.log("🔍 Dashboard: Fetching incomes...");
      const response = await fetch('/api/income');
      
      if (!response.ok) {
        throw new Error('Failed to fetch income sources');
      }
      
      const incomesData = await response.json();
      console.log("📥 Dashboard: Received incomes data:", incomesData);
      
      // Use setIncomes to preserve the original database IDs
      if (Array.isArray(incomesData) && incomesData.length > 0) {
        console.log(`✅ Dashboard: Setting ${incomesData.length} incomes in store`);
        updateStoreIncomes(incomesData);
      } else {
        console.log("⚠️ Dashboard: No incomes data received or empty array");
      }
    } catch (error) {
      console.error('❌ Dashboard: Error fetching incomes:', error);
      setError('Failed to load income sources');
    }
  };

  const fetchExperience = async () => {
    try {
      const response = await fetch('/api/user/experience');
      
      if (!response.ok) {
        throw new Error('Failed to fetch experience data');
      }
      
      const data = await response.json();
      
      if (data.experience !== undefined && data.level !== undefined) {
        // Update Zustand store with saved experience and level
        setExperience({
          experience: data.experience,
          level: data.level
        });
      }
    } catch (error) {
      console.error('Failed to load experience data:', error);
    }
  };

  const saveIncome = async () => {
    try {
      const response = await fetch('/api/user/income', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          income, 
          incomeFrequency,
          employmentMode 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update income');
      }

      // Add experience for updating income
      addExperience(10);
    } catch (error) {
      setError('Failed to save income');
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount) return;
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add expense');
      }
      
      const addedExpense = await response.json();
      setExpenses([...expenses, addedExpense]);
      setNewExpense({
        category: '',
        amount: 0,
        frequency: 'monthly',
        description: ''
      });

      // Add experience for adding expenses
      addExperience(5);
    } catch (error) {
      setError('Failed to add expense');
    }
  };

  const handleRemoveExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }
      
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (error) {
      setError('Failed to remove expense');
    }
  };

  const calculateTaxBracket = (annualIncome: number): number => {
    if (annualIncome <= 11000) return 0.10;
    if (annualIncome <= 44725) return 0.12;
    if (annualIncome <= 95375) return 0.22;
    if (annualIncome <= 182100) return 0.24;
    if (annualIncome <= 231250) return 0.32;
    if (annualIncome <= 578125) return 0.35;
    return 0.37;
  };

  const convertToMonthly = (amount: number, frequency: Frequency): number => {
    switch (frequency) {
      case 'one-time':
        return amount / 12; // Spread one-time amount over a year
      case 'weekly':
        return amount * 52 / 12;
      case 'bi-weekly':
        return amount * 26 / 12;
      case 'monthly':
        return amount;
      case 'quarterly':
        return amount / 3;
      case 'yearly':
        return amount / 12;
      default:
        return amount;
    }
  };

  const calculateTaxes = () => {
    const annualIncome = convertToMonthly(income, incomeFrequency) * 12;
    let taxBracketValue = calculateTaxBracket(annualIncome);
    
    // Adjust tax bracket for different employment modes
    if (employmentMode === 'contract') {
      taxBracketValue += 0.0765; // Additional self-employment tax
    }
    
    const taxAmountValue = annualIncome * taxBracketValue;
    const afterTaxIncomeValue = annualIncome - taxAmountValue;
    
    setTaxBracket(taxBracketValue);
    setTaxAmount(taxAmountValue);
    setAfterTaxIncome(afterTaxIncomeValue);
  };

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
    fetchUserData();
    fetchExpenses();
    fetchIncomes();
    fetchExperience();
  };

  // Main content based on active sidebar item
  const renderContent = () => {
    if (loading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your financial dashboard...</p>
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

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 md:min-h-screen shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Finny
            </h1>
            <p className="text-xs text-gray-500">Smart money management</p>
          </div>
          
          {status === 'authenticated' && (
            <div className="p-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
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
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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