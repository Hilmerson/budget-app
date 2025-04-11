'use client';

import { useBudgetStore } from '@/store/useBudgetStore';
import { useState } from 'react';
import IncomeInput from './IncomeInput';

export default function EmploymentModeSelector() {
  const { employmentMode, setEmploymentMode } = useBudgetStore();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  if (isConfirmed) {
    return <IncomeInput />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Select Your Employment Mode</h2>
      <div className="space-y-4">
        <label className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="employmentMode"
            value="full-time"
            checked={employmentMode === 'full-time'}
            onChange={() => setEmploymentMode('full-time')}
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span className="text-lg text-gray-700">Full-time Employment</span>
        </label>
        <label className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="employmentMode"
            value="contract"
            checked={employmentMode === 'contract'}
            onChange={() => setEmploymentMode('contract')}
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span className="text-lg text-gray-700">Contract/Freelance</span>
        </label>
        <label className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="employmentMode"
            value="other"
            checked={employmentMode === 'other'}
            onChange={() => setEmploymentMode('other')}
            className="form-radio h-5 w-5 text-blue-600"
          />
          <span className="text-lg text-gray-700">Other</span>
        </label>
      </div>
      
      <button
        onClick={handleConfirm}
        disabled={!employmentMode}
        className={`w-full py-3 px-4 font-semibold rounded-lg transition-colors ${
          employmentMode
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Confirm Selection
      </button>
    </div>
  );
} 