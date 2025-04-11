'use client';

import { useBudgetStore } from '@/store/useBudgetStore';
import { useState } from 'react';

const expenseCategories = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Debt Payments',
  'Entertainment',
  'Savings',
  'Other'
];

type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

export default function Expenses() {
  const { expenses, addExpense, removeExpense, afterTaxIncome } = useBudgetStore();
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    frequency: 'monthly' as Frequency
  });

  const totalExpenses = expenses.reduce((sum, expense) => {
    let monthlyAmount = expense.amount;
    
    if (expense.frequency === 'one-time') monthlyAmount = expense.amount / 12;
    else if (expense.frequency === 'yearly') monthlyAmount = expense.amount / 12;
    else if (expense.frequency === 'quarterly') monthlyAmount = expense.amount / 3;
    else if (expense.frequency === 'weekly') monthlyAmount = expense.amount * 4.33;
    else if (expense.frequency === 'bi-weekly') monthlyAmount = expense.amount * 2.17;
    
    return sum + monthlyAmount;
  }, 0);

  const remainingIncome = afterTaxIncome / 12 - totalExpenses; // Convert annual after-tax income to monthly

  const handleAddExpense = () => {
    if (newExpense.category && newExpense.amount > 0) {
      addExpense(newExpense);
      setNewExpense({ category: '', amount: 0, frequency: 'monthly' });
    }
  };

  // Helper function to calculate monthly amount
  const calculateMonthlyAmount = (expense: typeof expenses[0]) => {
    if (expense.frequency === 'one-time') return Math.round(expense.amount / 12);
    if (expense.frequency === 'yearly') return Math.round(expense.amount / 12);
    if (expense.frequency === 'quarterly') return Math.round(expense.amount / 3);
    if (expense.frequency === 'weekly') return Math.round(expense.amount * 4.33);
    if (expense.frequency === 'bi-weekly') return Math.round(expense.amount * 2.17);
    return Math.round(expense.amount); // Monthly amount
  };

  // Format frequency for display
  const formatFrequency = (frequency: string) => {
    switch(frequency) {
      case 'one-time': return 'One-time';
      case 'weekly': return 'Weekly';
      case 'bi-weekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return frequency;
    }
  };

  return (
    <div>
      {/* Header with illustration */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 mb-2">Expense Management</h2>
            <p className="text-gray-600 max-w-lg">
              Track all your expenses in one place. Categorize your spending to better understand your financial habits.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg width="120" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 18V6M12 18L17 13M12 18L7 13" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 16V21H4V16" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 8V3H20V8" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Add New Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">$</span>
                  </div>
                  <input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-700 transition duration-200"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={newExpense.frequency}
                  onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value as Frequency })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                >
                  <option value="one-time">One-time Payment</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <button
                onClick={handleAddExpense}
                disabled={!newExpense.category || !newExpense.amount}
                className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 ${
                  newExpense.category && newExpense.amount
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Your Expenses</h3>
            
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-lg h-64">
                <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path>
                </svg>
                <h4 className="text-lg font-medium text-gray-900">No expenses added yet</h4>
                <p className="text-gray-500 mt-1 max-w-sm">
                  Start tracking your expenses to get a better picture of your spending habits.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group hover:bg-gray-50 px-2 rounded-lg transition duration-150"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
                        {expense.category.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-base">{expense.category}</h4>
                        <div className="text-gray-500 flex items-center space-x-2 text-sm">
                          <span className="font-medium text-gray-900">${expense.amount.toLocaleString()}</span>
                          <span>/</span>
                          <span>{formatFrequency(expense.frequency)}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-red-600 font-medium">
                            ${calculateMonthlyAmount(expense).toLocaleString()}/mo
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors group-hover:opacity-100 opacity-0 md:opacity-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Budget Summary */}
            {expenses.length > 0 && (
              <div className="mt-6 bg-indigo-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3">Budget Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500">Monthly Income</div>
                    <div className="text-2xl font-bold text-green-600">${(afterTaxIncome / 12).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500">Monthly Expenses</div>
                    <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500">Remaining</div>
                    <div className={`text-2xl font-bold ${remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${remainingIncome.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 