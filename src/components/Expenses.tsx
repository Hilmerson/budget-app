'use client';

import { useBudgetStore } from '@/store/useBudgetStore';
import { useState, useEffect } from 'react';
import { XPGainAnimation } from './Gamification';
import { useExpenseData } from '@/hooks/useDataFetching';

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
  const { expenses, addExpense, removeExpense, afterTaxIncome, addExperience } = useBudgetStore();
  const { isLoadingExpense, expenseError, refetchExpense } = useExpenseData();

  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    frequency: 'monthly' as Frequency
  });
  
  // Animation and loading states
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddExpense = async () => {
    if (newExpense.category && newExpense.amount > 0 && !isSubmitting) {
      try {
        // Prevent multiple submissions
        setIsSubmitting(true);
        
        // Save to database first
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: newExpense.category,
            amount: newExpense.amount,
            frequency: newExpense.frequency,
            description: '',
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save expense to database');
        }
        
        // Get the saved expense with proper ID from server
        const savedExpense = await response.json();
        
        // Add to local state with the database ID
        addExpense(savedExpense);
        
        // Calculate XP based on budget discipline (track expenses = good financial habit)
        const baseXP = 5; // Base XP for adding an expense
        const budgetXP = 8; // Give a fixed amount as a reward for tracking expenses
        const earnedXP = baseXP + budgetXP;
        
        // Reset form
        setNewExpense({ category: '', amount: 0, frequency: 'monthly' });
        
        // Add XP and show animation
        addExperience(earnedXP);
        setXpAmount(earnedXP);
        setShowXpAnimation(true);
      } catch (error) {
        console.error('Error saving expense:', error);
        setIsSubmitting(false); // Enable the form again if there's an error
      }
    }
  };

  // Function to handle when animation completes
  const handleAnimationComplete = () => {
    setShowXpAnimation(false);
    // Don't reload the page - just reset the submitting state
    setIsSubmitting(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        {(expenseError || isLoadingExpense) && (
          <button 
            onClick={refetchExpense}
            className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            disabled={isLoadingExpense}
          >
            {isLoadingExpense ? 'Refreshing...' : 'Refresh Data'}
          </button>
        )}
      </div>
      
      {expenseError && <p className="text-red-500 text-sm">{expenseError}</p>}
      
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
                disabled={!newExpense.category || !newExpense.amount || isSubmitting}
                className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 ${
                  newExpense.category && newExpense.amount && !isSubmitting
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Your Expenses</h3>
            
            {isLoadingExpense ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-lg h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-600">Loading your expense data...</p>
              </div>
            ) : expenseError ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-red-50 rounded-lg h-64">
                <svg className="w-16 h-16 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h4 className="text-lg font-medium text-red-600">{expenseError}</h4>
              </div>
            ) : expenses.length === 0 ? (
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
                      onClick={async () => {
                        try {
                          // First remove from UI state for responsive feel
                          removeExpense(expense.id);
                          
                          // Then try to delete from database
                          const response = await fetch(`/api/expenses/${expense.id}`, {
                            method: 'DELETE',
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to delete expense from database');
                          }
                          
                          // No need to reload the page after deletion
                          // The UI state is already updated by removeExpense
                        } catch (error) {
                          console.error('Error deleting expense:', error);
                          // You could show an error message to the user here
                        }
                      }}
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
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* XP Animation */}
      <XPGainAnimation 
        amount={xpAmount} 
        isVisible={showXpAnimation} 
        onAnimationComplete={handleAnimationComplete} 
      />
    </div>
  );
} 