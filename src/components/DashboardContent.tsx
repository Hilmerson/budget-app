'use client';

import { useSession } from 'next-auth/react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useDashboardData } from '@/hooks/useDataFetching';
import { useEffect } from 'react';
import { useUserExperience } from '@/hooks/useDataFetching';
import { FinancialHealthCard } from './Illustrations';
import ExpensePieChart from './charts/ExpensePieChart';
import BudgetToActualBarChart from './charts/BudgetToActualBarChart';
import SavingsProgressChart from './charts/SavingsProgressChart';

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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-xl text-indigo-500 flex items-center space-x-2">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading your finances...</span>
        </div>
        <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Dashboard Header with welcome message and colorful accent */}
      <div className="relative mb-8 pb-4 border-b border-gray-100">
        <div className="h-1 w-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 absolute bottom-0 left-0 rounded-full"></div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {session?.user?.name || 'User'}!</h1>
        <p className="text-gray-600 mt-1">Here's your financial snapshot for today</p>
      </div>
      
      {/* Small test panel in the top-right - only visible during development */}
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
      
      {/* Financial Health Score Card - Prominent at the top */}
      <div className="mb-8">
        <FinancialHealthCard score={healthScore} />
      </div>
      
      {/* Visual Charts Section */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Financial Overview</h2>
        </div>
        
        {/* Explanation/guide text */}
        <p className="text-gray-600 mb-6 ml-11">These charts break down your spending patterns and progress toward goals</p>
        
        {/* Chart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <ExpensePieChart />
          </div>
          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <BudgetToActualBarChart />
          </div>
          <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <SavingsProgressChart />
          </div>
        </div>
      </div>
      
      {/* Quick Action Shortcuts */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-11">
          <button className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-indigo-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            <span className="font-medium text-gray-800">Add Expense</span>
          </button>
          
          <button className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-green-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span className="font-medium text-gray-800">Bills</span>
          </button>
          
          <button className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-amber-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20v-6"></path>
              <path d="M6 20v-6"></path>
              <path d="M18 20v-6"></path>
              <path d="M6 6L8 4"></path>
              <path d="M18 6L16 4"></path>
              <path d="M12 2v4"></path>
              <path d="M19.5 12H18"></path>
              <path d="M6 12H4.5"></path>
              <circle cx="12" cy="12" r="7"></circle>
            </svg>
            <span className="font-medium text-gray-800">Set Goal</span>
          </button>
          
          <button className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-purple-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <span className="font-medium text-gray-800">Activity</span>
          </button>
        </div>
      </div>
    </div>
  );
} 