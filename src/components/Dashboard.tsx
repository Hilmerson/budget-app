'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

  // Mock gamification data
  const [level, setLevel] = useState(3);
  const [experience, setExperience] = useState(245);
  const [nextLevelExperience, setNextLevelExperience] = useState(500);
  const [streak, setStreak] = useState(4);
  const [healthScore, setHealthScore] = useState(72);

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
      setExpenses(expensesData);
    } catch (error) {
      setError('Failed to load expenses');
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

      // In a real app, we'd update the experience here
      setExperience(Math.min(experience + 10, nextLevelExperience));
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

      // In a real app, we'd update the experience here
      setExperience(Math.min(experience + 5, nextLevelExperience));
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
            <h1 className="text-2xl font-bold text-indigo-600">BudgetWise</h1>
            <p className="text-gray-500 text-sm">Gamified Budgeting</p>
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
            <h1 className="text-2xl font-bold text-indigo-600">BudgetWise</h1>
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Income Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['full-time', 'contract', 'other'].map((mode) => (
                      <label
                        key={mode}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          employmentMode === mode
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="employmentMode"
                          value={mode}
                          checked={employmentMode === mode}
                          onChange={() => {
                            setEmploymentMode(mode as any);
                            saveIncome();
                          }}
                          className="form-radio h-5 w-5 text-indigo-600"
                        />
                        <span className="text-gray-900 capitalize">{mode.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Income Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(Number(e.target.value))}
                        onBlur={saveIncome}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                        placeholder="0"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={incomeFrequency}
                      onChange={(e) => {
                        setIncomeFrequency(e.target.value as Frequency);
                        saveIncome();
                      }}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    >
                      {frequencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Tax Bracket</div>
                      <div className="text-2xl font-bold">{(taxBracket * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Estimated Taxes</div>
                      <div className="text-2xl font-bold">${taxAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">After-Tax Income</div>
                      <div className="text-2xl font-bold text-green-600">${afterTaxIncome.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSidebarItem === 'expenses' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Expense</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">Select Category</option>
                        {['Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 'Healthcare', 'Debt Payments', 'Entertainment', 'Savings', 'Other'].map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          type="number"
                          value={newExpense.amount || ''}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={newExpense.frequency}
                        onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value as Frequency })}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                      >
                        {frequencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                        placeholder="Description"
                      />
                    </div>

                    <button
                      onClick={handleAddExpense}
                      disabled={!newExpense.category || !newExpense.amount}
                      className={`w-full py-3 px-4 rounded-lg font-medium ${
                        newExpense.category && newExpense.amount
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      } transition-colors`}
                    >
                      Add Expense
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Expenses</h2>
                  <div className="overflow-hidden">
                    {expenses.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding your first expense.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {expenses.map((expense) => (
                              <tr key={expense.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{expense.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-gray-900">${expense.amount.toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-gray-500">{expense.frequency}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-gray-500">{expense.description || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <button
                                    onClick={() => handleRemoveExpense(expense.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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