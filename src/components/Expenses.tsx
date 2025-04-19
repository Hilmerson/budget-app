'use client';

import { useState, useEffect } from 'react';
import { XPGainAnimation } from './Gamification';
import { useExpenseData, invalidateCache } from '@/hooks/useDataFetching';
import { useBudgetStore } from '@/store/useBudgetStore';
import { Card, Button, Input, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';

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
  const { expenses, addExpense, removeExpense, calculations: { afterTaxIncome }, addExperience } = useBudgetStore();
  const { isLoadingExpense, expenseError, refetchExpense } = useExpenseData();

  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    frequency: 'monthly' as Frequency,
    description: ''
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
            description: newExpense.description,
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
        setNewExpense({ category: '', amount: 0, frequency: 'monthly', description: '' });
        
        // Add XP and show animation
        addExperience(earnedXP);
        setXpAmount(earnedXP);
        setShowXpAnimation(true);
        
        // Invalidate the expenses cache to trigger revalidation
        invalidateCache('/api/expenses');
        
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

  // Create select options
  const categoryOptions: SelectOption[] = [
    { value: '', label: 'Select Category' },
    ...expenseCategories.map(category => ({ value: category, label: category }))
  ];

  const frequencyOptions: SelectOption[] = [
    { value: 'one-time', label: 'One-time Payment' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Handle refresh button click
  const handleRefresh = () => {
    refetchExpense();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
        {(expenseError || isLoadingExpense) && (
          <Button 
            onClick={handleRefresh}
            disabled={isLoadingExpense}
            variant="secondary"
            size="sm"
            isLoading={isLoadingExpense}
          >
            {isLoadingExpense ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        )}
      </div>
      
      {expenseError && <p className="text-red-500 text-sm">{expenseError}</p>}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card 
          variant="elevated" 
          className="bg-white"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Income</p>
              <p className="text-xl font-semibold text-gray-900">${(afterTaxIncome / 12).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card 
          variant="elevated" 
          className="bg-white"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Expenses</p>
              <p className="text-xl font-semibold text-gray-900">${totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card 
          variant="elevated" 
          className="bg-white"
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${remainingIncome >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining Budget</p>
              <p className={`text-xl font-semibold ${remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(remainingIncome).toLocaleString()} {remainingIncome < 0 ? 'Over' : ''}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <div className="md:col-span-1">
          <Card 
            title="Add New Expense" 
            variant="outlined"
            className="h-full"
          >
            <div className="space-y-4">
              <Select
                label="Expense Category"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                options={categoryOptions}
                required
              />

              <Input
                label="Amount"
                type="number"
                value={newExpense.amount || ''}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                startIcon={<span className="text-gray-500 text-lg">$</span>}
              />

              <Select
                label="Frequency"
                value={newExpense.frequency}
                onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value as Frequency })}
                options={frequencyOptions}
              />

              <Input
                label="Description (Optional)"
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="Add details about this expense"
              />

              <Button
                onClick={handleAddExpense}
                disabled={!newExpense.category || !newExpense.amount || isSubmitting}
                isLoading={isSubmitting}
                fullWidth
              >
                Add Expense
              </Button>
            </div>
          </Card>
        </div>

        {/* Expenses List */}
        <div className="md:col-span-2">
          <Card 
            title="Your Expenses" 
            variant="outlined"
            className="h-full"
          >
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
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4 flex-shrink-0">
                        <span aria-hidden="true">{expense.category.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-base">{expense.category}</h4>
                        <div className="text-gray-500 flex items-center space-x-2 text-sm">
                          <span className="font-medium text-gray-900">${expense.amount.toLocaleString()}</span>
                          <span>/</span>
                          <span>{formatFrequency(expense.frequency)}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-900 font-medium">
                            ${calculateMonthlyAmount(expense).toLocaleString()}/mo
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-gray-500 text-sm mt-1 italic">
                            {expense.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
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
                          
                          // Invalidate cache
                          invalidateCache('/api/expenses');
                        } catch (error) {
                          console.error('Error deleting expense:', error);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label={`Delete ${expense.category} expense`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* XP Gain Animation */}
      <XPGainAnimation 
        isVisible={showXpAnimation} 
        amount={xpAmount} 
        onAnimationComplete={handleAnimationComplete} 
      />
    </div>
  );
} 