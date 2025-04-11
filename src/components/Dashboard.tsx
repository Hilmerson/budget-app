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
    setExperience
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
    if (status === 'authenticated' && session?.user) {
      fetchUserData();
      fetchExpenses();
      fetchIncomes();
      fetchExperience();
    }
  }, [status, session]);

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
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const expensesData = await response.json();
      // Update local state
      setExpenses(expensesData);
      
      // Also update the Zustand store with the original IDs preserved
      if (Array.isArray(expensesData)) {
        updateStoreExpenses(expensesData);
      }
    } catch (error) {
      setError('Failed to load expenses');
    }
  };

  const fetchIncomes = async () => {
    try {
      const response = await fetch('/api/income');
      
      if (!response.ok) {
        throw new Error('Failed to fetch income sources');
      }
      
      const incomesData = await response.json();
      
      // Use setIncomes to preserve the original database IDs
      if (Array.isArray(incomesData)) {
        updateStoreIncomes(incomesData);
      }
    } catch (error) {
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

  const totalMonthlyExpenses = expenses.reduce((sum, expense) => {
    const amount = convertToMonthly(expense.amount, expense.frequency);
    return sum + amount;
  }, 0);

  const remainingIncome = convertToMonthly(afterTaxIncome, 'yearly') - totalMonthlyExpenses;

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
    <div className="min-h-screen bg-indigo-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col h-screen bg-white border-r border-indigo-100 pt-6 sticky top-0 transition-all">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-2 mb-1">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 7.00018C22 7.00018 19.5 9.50018 17.5 9.50018C15.5 9.50018 14.5 7.50018 12.5 7.50018C10.5 7.50018 9.5 9.00018 7.5 9.00018C5.5 9.00018 2 7.00018 2 7.00018" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 12.0002C22 12.0002 19.5 14.5002 17.5 14.5002C15.5 14.5002 14.5 12.5002 12.5 12.5002C10.5 12.5002 9.5 14.0002 7.5 14.0002C5.5 14.0002 2 12.0002 2 12.0002" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 17.0002C22 17.0002 19.5 19.5002 17.5 19.5002C15.5 19.5002 14.5 17.5002 12.5 17.5002C10.5 17.5002 9.5 19.0002 7.5 19.0002C5.5 19.0002 2 17.0002 2 17.0002" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="5" r="2" fill="#4F46E5" />
              </svg>
              <h1 className="text-2xl font-bold text-indigo-600">Finny</h1>
            </div>
            <p className="text-gray-500 text-sm">Your finances, swimming smoothly</p>
          </div>
          
          <div className="px-4 mb-8">
            <LevelProgress
              level={level}
              experience={experience}
              nextLevelExperience={nextLevelExperience}
            />
          </div>

          <div className="flex-1">
            <ul className="space-y-2 px-3">
              {sidebarItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSidebarItem(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSidebarItem === item.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 mt-auto">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-medium text-gray-900">{session?.user?.name}</div>
                <button 
                  onClick={() => router.push('/api/auth/signout')}
                  className="text-sm text-gray-500 hover:text-indigo-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 7.00018C22 7.00018 19.5 9.50018 17.5 9.50018C15.5 9.50018 14.5 7.50018 12.5 7.50018C10.5 7.50018 9.5 9.00018 7.5 9.00018C5.5 9.00018 2 7.00018 2 7.00018" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 12.0002C22 12.0002 19.5 14.5002 17.5 14.5002C15.5 14.5002 14.5 12.5002 12.5 12.5002C10.5 12.5002 9.5 14.0002 7.5 14.0002C5.5 14.0002 2 12.0002 2 12.0002" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 17.0002C22 17.0002 19.5 19.5002 17.5 19.5002C15.5 19.5002 14.5 17.5002 12.5 17.5002C10.5 17.5002 9.5 19.0002 7.5 19.0002C5.5 19.0002 2 17.0002 2 17.0002" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="5" r="2" fill="#4F46E5" />
              </svg>
              <h1 className="text-2xl font-bold text-indigo-600">Finny</h1>
            </div>
            <button className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {activeSidebarItem === 'dashboard' && (
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
          )}

          {activeSidebarItem === 'income' && (
            <div className="space-y-6">
              <Income />
            </div>
          )}

          {activeSidebarItem === 'expenses' && (
            <div className="space-y-6">
              <Expenses />
            </div>
          )}

          {activeSidebarItem === 'achievements' && (
            <div>
              <Achievements />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 