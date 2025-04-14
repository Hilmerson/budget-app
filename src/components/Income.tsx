'use client';

import { useBudgetStore } from '@/store/useBudgetStore';
import { useState, useEffect } from 'react';
import { XPGainAnimation } from './Gamification';
import { useIncomeData } from '@/hooks/useDataFetching';

const incomeCategories = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental',
  'Side Hustle',
  'Gifts',
  'Other'
];

type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

// Define an interface for income with monthly amount
interface IncomeWithMonthly {
  id: string;
  source: string;
  amount: number;
  frequency: Frequency;
  monthlyAmount: number;
}

export default function Income() {
  const { incomes, addIncome, removeIncome, setTotalIncome, employmentMode, addExperience } = useBudgetStore();
  const { isLoadingIncome, incomeError, refetchIncome } = useIncomeData();
  
  const [newIncome, setNewIncome] = useState({
    source: '',
    amount: 0,
    frequency: 'monthly' as Frequency
  });
  
  // Animation and loading states
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert all incomes to monthly for comparison
  const monthlyIncomes = incomes.map(income => {
    let monthlyAmount = income.amount;
    
    if (income.frequency === 'one-time') monthlyAmount = income.amount / 12; // Spread over a year
    else if (income.frequency === 'yearly') monthlyAmount = income.amount / 12;
    else if (income.frequency === 'quarterly') monthlyAmount = income.amount / 3;
    else if (income.frequency === 'weekly') monthlyAmount = income.amount * 4.33;
    else if (income.frequency === 'bi-weekly') monthlyAmount = income.amount * 2.17;
    
    return {
      ...income,
      monthlyAmount
    };
  });

  const totalIncome = monthlyIncomes.reduce((sum, income) => sum + income.monthlyAmount, 0);

  // Update total income in the store when it changes
  useEffect(() => {
    setTotalIncome(totalIncome);
  }, [totalIncome, setTotalIncome]);

  const handleAddIncome = async () => {
    if (newIncome.source && newIncome.amount > 0 && !isSubmitting) {
      try {
        // Prevent multiple submissions
        setIsSubmitting(true);
        
        // Save to database first
        const response = await fetch('/api/income', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: newIncome.source,
            amount: newIncome.amount,
            frequency: newIncome.frequency,
            description: '',
            date: new Date().toISOString(),
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save income to database');
        }
        
        // Get the saved income with proper ID from server
        const savedIncome = await response.json();
        
        // Add to local state with the database ID
        addIncome(savedIncome);
        
        // Calculate XP based on amount (higher amounts give more XP)
        const baseXP = 10;
        const amountFactor = Math.floor(newIncome.amount / 100);
        const earnedXP = Math.min(baseXP + amountFactor, 30); // Cap at 30 XP
        
        // Reset form
        setNewIncome({ source: '', amount: 0, frequency: 'monthly' });
        
        // Add XP and show animation
        addExperience(earnedXP);
        setXpAmount(earnedXP);
        setShowXpAnimation(true);
      } catch (error) {
        console.error('Error saving income:', error);
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
  const calculateMonthlyAmount = (income: typeof incomes[0]) => {
    if (income.frequency === 'one-time') return Math.round(income.amount / 12);
    if (income.frequency === 'yearly') return Math.round(income.amount / 12);
    if (income.frequency === 'quarterly') return Math.round(income.amount / 3);
    if (income.frequency === 'weekly') return Math.round(income.amount * 4.33);
    if (income.frequency === 'bi-weekly') return Math.round(income.amount * 2.17);
    return Math.round(income.amount); // Monthly amount
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
        <h2 className="text-2xl font-bold text-gray-800">Income Sources</h2>
        {(incomeError || isLoadingIncome) && (
          <button 
            onClick={refetchIncome}
            className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            disabled={isLoadingIncome}
          >
            {isLoadingIncome ? 'Refreshing...' : 'Refresh Data'}
          </button>
        )}
      </div>
      
      {incomeError && <p className="text-red-500 text-sm">{incomeError}</p>}
      
      {/* Header with illustration */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 mb-2">Income Management</h2>
            <p className="text-gray-600 max-w-lg">
              Track all your income sources in one place. Add multiple income streams to get a complete picture of your finances.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg width="120" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 16V21H4V16" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 8V3H20V8" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Income Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Add Income Source</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Income Source</label>
                <select
                  value={newIncome.source}
                  onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                >
                  <option value="">Select Source</option>
                  {incomeCategories.map((category) => (
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
                    value={newIncome.amount || ''}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) })}
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
                  value={newIncome.frequency}
                  onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value as Frequency })}
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
                onClick={handleAddIncome}
                disabled={!newIncome.source || !newIncome.amount || isSubmitting}
                className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 ${
                  newIncome.source && newIncome.amount && !isSubmitting
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Income Source'}
              </button>
            </div>
          </div>
        </div>

        {/* Income List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 h-full">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Your Income Sources</h3>
            
            {isLoadingIncome ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-lg h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-600">Loading your income data...</p>
              </div>
            ) : incomeError ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-red-50 rounded-lg h-64">
                <svg className="w-16 h-16 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h4 className="text-lg font-medium text-red-600">{incomeError}</h4>
              </div>
            ) : incomes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-lg h-64">
                <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h4 className="text-lg font-medium text-gray-900">No income sources added yet</h4>
                <p className="text-gray-500 mt-1 max-w-sm">
                  Start adding your income sources to track and manage your total income more effectively.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group hover:bg-gray-50 px-2 rounded-lg transition duration-150"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
                        {income.source.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-base">{income.source}</h4>
                        <div className="text-gray-500 flex items-center space-x-2 text-sm">
                          <span className="font-medium text-gray-900">${income.amount.toLocaleString()}</span>
                          <span>/</span>
                          <span>{formatFrequency(income.frequency)}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-green-600 font-medium">
                            ${calculateMonthlyAmount(income).toLocaleString()}/mo
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          // First remove from UI state for responsive feel
                          removeIncome(income.id);
                          
                          // Then try to delete from database
                          const response = await fetch(`/api/income/${income.id}`, {
                            method: 'DELETE',
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to delete income from database');
                          }
                          
                          // No need to reload the page after deletion
                          // The UI state is already updated by removeIncome
                        } catch (error) {
                          console.error('Error deleting income:', error);
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
            
            {/* Income Summary */}
            {incomes.length > 0 && (
              <>
                <div className="mt-6 bg-indigo-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Income Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-500">Monthly Income</div>
                      <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-500">Annual Income</div>
                      <div className="text-2xl font-bold text-green-600">${(totalIncome * 12).toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-500">Employment Type</div>
                      <div className="text-2xl font-bold text-indigo-700 capitalize">{employmentMode.replace('-', ' ')}</div>
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