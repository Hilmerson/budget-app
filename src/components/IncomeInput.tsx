'use client';

import { useBudgetStore } from '@/store/useBudgetStore';
import { useState } from 'react';
import Expenses from './Expenses';
import { Card, Button, Input } from '@/components/ui';

export default function IncomeInput() {
  const { 
    setConfirmed,
    calculations: { taxBracket, taxAmount, afterTaxIncome }
  } = useBudgetStore();
  
  const [income, setLocalIncome] = useState<number>(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const setIncome = (value: number) => {
    setLocalIncome(value);
    useBudgetStore.getState().addIncome({
      id: 'primary-income',
      source: 'Primary Income',
      amount: value,
      frequency: 'yearly',
      date: new Date().toISOString()
    });
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    setConfirmed(true);
  };

  if (isConfirmed) {
    return <Expenses />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Income</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Enter Your Income"
          variant="outlined"
          className="h-full"
        >
          <div className="space-y-4">
            <Input
              label="Annual Income"
              type="number"
              value={income || ''}
              onChange={(e) => setIncome(Number(e.target.value))}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              startIcon={<span className="text-gray-500 text-lg">$</span>}
            />
          
            <Button
              onClick={handleConfirm}
              disabled={!income || income <= 0}
              fullWidth
            >
              Continue to Expenses
            </Button>
          </div>
        </Card>
      
        {income > 0 ? (
          <Card
            title="Tax Calculation"
            variant="outlined"
            className="h-full"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-gray-700">Tax Bracket</span>
                </div>
                <span className="font-medium text-gray-900">{(taxBracket * 100).toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">Estimated Taxes</span>
                </div>
                <span className="font-medium text-gray-900">${taxAmount.toLocaleString()}/year</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <span className="text-gray-700">After-Tax Income</span>
                </div>
                <span className="font-medium text-green-600">${afterTaxIncome.toLocaleString()}/year</span>
              </div>
              
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">
                  This is an estimate based on federal tax brackets. Actual taxes may vary based on deductions, credits, state taxes, and other factors.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            variant="outlined"
            className="h-full flex flex-col justify-center items-center text-center p-8"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tax Information</h3>
            <p className="text-gray-500">
              Enter your annual income to see tax calculations and your after-tax income.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
} 