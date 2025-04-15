'use client';

import { useSession } from 'next-auth/react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useDashboardData } from '@/hooks/useDataFetching';
import { useEffect } from 'react';
import { useUserExperience } from '@/hooks/useDataFetching';
import { 
  FinancialHealthCard, 
  SavingsGoalCard,
  BudgetComparisonCard 
} from './Illustrations';

export default function DashboardContent() {
  const { data: session } = useSession();
  
  // Get store values
  const { addExperience, checkLevelUp, resetExperience } = useBudgetStore();
  
  // Custom hooks for fetching data
  const { isLoading } = useDashboardData();
  const { fetchExperience } = useUserExperience();

  // Get gamification state
  const healthScore = useBudgetStore((state) => state.gamification.healthScore);
  const level = useBudgetStore((state) => state.gamification.level);
  const experience = useBudgetStore((state) => state.gamification.experience);
  
  // Check for level up when component loads
  useEffect(() => {
    // Check if user has enough XP to level up
    checkLevelUp();
  }, [checkLevelUp]);

  // Handle XP gain with server sync (keep this for future use but remove from UI)
  const handleXpGain = async (amount: number) => {
    // First add XP locally
    addExperience(amount);
    
    // Then after a longer delay, fetch from server to ensure sync
    setTimeout(() => {
      fetchExperience();
    }, 1500); // Increased from 500ms to 1500ms
  };

  // Handle resetting experience to level 1
  const handleResetExperience = () => {
    resetExperience();
    
    // Fetch from server after a delay to ensure sync
    setTimeout(() => {
      fetchExperience();
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="text-xl text-indigo-500 flex items-center space-x-2">
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading your finances...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {session?.user?.name || 'User'}!</h1>
      
      {/* Small test panel in the top-right */}
      <div className="fixed top-5 right-5 bg-gray-100 p-2 rounded-md bg-opacity-90 shadow-md z-10">
        <div className="flex flex-col space-y-2">
          <span className="text-xs font-mono text-gray-600">Level: {level}, XP: {experience}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleXpGain(50)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
            >
              +50 XP
            </button>
            <button
              onClick={handleResetExperience}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              Reset to Lvl 1
            </button>
          </div>
        </div>
      </div>
      
      <FinancialHealthCard score={healthScore} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetComparisonCard categories={[
          { name: 'Housing', budgeted: 1200, spent: 1150 },
          { name: 'Food', budgeted: 500, spent: 480 },
          { name: 'Transportation', budgeted: 300, spent: 250 },
          { name: 'Entertainment', budgeted: 200, spent: 300 },
        ]} />
        <SavingsGoalCard current={3200} target={5000} />
      </div>
    </div>
  );
} 