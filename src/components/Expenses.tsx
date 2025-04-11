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

type Frequency = 'monthly' | 'yearly';

export default function Expenses() {
  const { expenses, addExpense, removeExpense, afterTaxIncome } = useBudgetStore();
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    frequency: 'monthly' as Frequency
  });

  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = expense.frequency === 'yearly' ? expense.amount / 12 : expense.amount;
    return sum + amount;
  }, 0);

  const remainingIncome = afterTaxIncome - totalExpenses;

  const handleAddExpense = () => {
    if (newExpense.category && newExpense.amount > 0) {
      addExpense(newExpense);
      setNewExpense({ category: '', amount: 0, frequency: 'monthly' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Manage Your Expenses</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Add New Expense</h3>
          <div className="space-y-4">
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="">Select Category</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                value={newExpense.amount || ''}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Amount"
                min="0"
                step="0.01"
              />
            </div>

            <select
              value={newExpense.frequency}
              onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value as Frequency })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            <button
              onClick={handleAddExpense}
              disabled={!newExpense.category || !newExpense.amount}
              className={`w-full py-2 px-4 font-semibold rounded-lg transition-colors ${
                newExpense.category && newExpense.amount
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add Expense
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Current Expenses</h3>
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{expense.category}</p>
                  <p className="text-sm text-gray-500">
                    ${expense.amount.toLocaleString()} {expense.frequency}
                  </p>
                </div>
                <button
                  onClick={() => removeExpense(expense.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Budget Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>After-Tax Income:</span>
            <span className="font-medium">${afterTaxIncome.toLocaleString()}/month</span>
          </div>
          <div className="flex justify-between">
            <span>Total Expenses:</span>
            <span className="font-medium">${totalExpenses.toLocaleString()}/month</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span>Remaining Income:</span>
            <span className={`font-medium ${remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remainingIncome.toLocaleString()}/month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 