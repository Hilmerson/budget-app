'use client';

import { useBudgetStore } from '@/store/useBudgetStore';
import { useState, useEffect } from 'react';
import { XPGainAnimation } from './Gamification';
import { useIncomeData, invalidateCache } from '@/hooks/useDataFetching';
import { Card, Button, Input, Select } from '@/components/ui';
import type { SelectOption } from '@/components/ui';

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
  const { incomes, addIncome, removeIncome, updateCalculations, employmentMode, addExperience } = useBudgetStore();
  const { isLoadingIncome, incomeError, refetchIncome } = useIncomeData();
  
  const [newIncome, setNewIncome] = useState({
    source: '',
    amount: 0,
    frequency: 'monthly' as Frequency,
    description: ''
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

  // Update calculations in the store when income changes
  useEffect(() => {
    if (incomes.length > 0) {
      updateCalculations();
    }
  }, [incomes, updateCalculations]);

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
            description: newIncome.description,
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
        setNewIncome({ source: '', amount: 0, frequency: 'monthly', description: '' });
        
        // Add XP and show animation
        addExperience(earnedXP);
        setXpAmount(earnedXP);
        setShowXpAnimation(true);
        
        // Invalidate the income cache to trigger revalidation
        invalidateCache('/api/income');
        
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

  // Create select options
  const sourceOptions: SelectOption[] = [
    { value: '', label: 'Select Source' },
    ...incomeCategories.map(category => ({ value: category, label: category }))
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
    refetchIncome();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Income Sources</h2>
        {(incomeError || isLoadingIncome) && (
          <Button 
            onClick={handleRefresh}
            disabled={isLoadingIncome}
            variant="secondary"
            size="sm"
            isLoading={isLoadingIncome}
          >
            {isLoadingIncome ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        )}
      </div>
      
      {incomeError && <p className="text-red-500 text-sm">{incomeError}</p>}
      
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
              <p className="text-xl font-semibold text-gray-900">${totalIncome.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card 
          variant="elevated" 
          className="bg-white"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Annual Income</p>
              <p className="text-xl font-semibold text-green-600">${(totalIncome * 12).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card 
          variant="elevated" 
          className="bg-white"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Employment Type</p>
              <p className="text-xl font-semibold text-indigo-600 capitalize">{employmentMode.replace('-', ' ')}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Income Form */}
        <div className="md:col-span-1">
          <Card 
            title="Add Income Source" 
            variant="outlined"
            className="h-full"
          >
            <div className="space-y-4">
              <Select
                label="Income Source"
                value={newIncome.source}
                onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                options={sourceOptions}
                required
              />

              <Input
                label="Amount"
                type="number"
                value={newIncome.amount || ''}
                onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) })}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                startIcon={<span className="text-gray-500 text-lg">$</span>}
              />

              <Select
                label="Frequency"
                value={newIncome.frequency}
                onChange={(e) => setNewIncome({ ...newIncome, frequency: e.target.value as Frequency })}
                options={frequencyOptions}
              />

              <Input
                label="Description (Optional)"
                type="text"
                value={newIncome.description}
                onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                placeholder="Add details about this income"
              />

              <Button
                onClick={handleAddIncome}
                disabled={!newIncome.source || !newIncome.amount || isSubmitting}
                isLoading={isSubmitting}
                fullWidth
              >
                Add Income Source
              </Button>
            </div>
          </Card>
        </div>

        {/* Income List */}
        <div className="md:col-span-2">
          <Card 
            title="Your Income Sources"
            variant="outlined"
            className="h-full"
          >
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
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4 flex-shrink-0">
                        <span aria-hidden="true">{income.source.charAt(0)}</span>
                      </div>
                      <div className="flex flex-col">
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
                        {income.description && (
                          <p className="text-gray-500 text-sm mt-1 italic">
                            {income.description}
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
                          removeIncome(income.id);
                          
                          // Then try to delete from database
                          const response = await fetch(`/api/income/${income.id}`, {
                            method: 'DELETE',
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to delete income from database');
                          }
                        } catch (error) {
                          console.error('Error deleting income:', error);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label={`Delete ${income.source} income`}
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