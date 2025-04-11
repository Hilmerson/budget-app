'use client';

import { useBudgetStore } from '@/store/useBudgetStore';
import { useState } from 'react';
import Expenses from './Expenses';

export default function IncomeInput() {
  const { income, setIncome, taxBracket, taxAmount, afterTaxIncome, setConfirmed } = useBudgetStore();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
    setConfirmed(true);
  };

  if (isConfirmed) {
    return <Expenses />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Enter Your Income</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-xl">$</span>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-48 rounded-lg border border-gray-300 px-4 py-3 text-lg"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        {income > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Tax Calculation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tax Bracket:</span>
                <span className="font-medium">{(taxBracket * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes:</span>
                <span className="font-medium">${taxAmount.toLocaleString()}/year</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span>After-Tax Income:</span>
                <span className="font-medium text-green-600">
                  ${afterTaxIncome.toLocaleString()}/year
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={handleConfirm}
        disabled={!income || income <= 0}
        className={`w-full py-3 px-4 font-semibold rounded-lg transition-colors ${
          income && income > 0
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue to Expenses
      </button>
    </div>
  );
} 