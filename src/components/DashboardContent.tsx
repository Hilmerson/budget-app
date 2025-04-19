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
import Link from 'next/link';

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
      {/* Dashboard Header with welcome message */}
      <div className="relative mb-6 pb-4">
        <div className="h-1.5 w-32 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 absolute bottom-0 left-0 rounded-full"></div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {session?.user?.name || 'Friend'}!</h1>
        <p className="text-gray-600 mt-1">Here's your financial snapshot for today</p>
      </div>
      
      {/* Development testing panel - hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-5 right-5 bg-white p-2 rounded-md bg-opacity-90 shadow-md z-10 border border-gray-200">
          <div className="flex flex-col space-y-2">
            <span className="text-xs font-mono text-gray-600">Level: {level}, XP: {experience}</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleXpGain(50)}
                className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
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
      )}
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Financial Health & Quick Actions Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              Financial Health & Actions
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Financial Health Card */}
              <div className="lg:col-span-4">
                <FinancialHealthCard score={healthScore} />
              </div>
              
              {/* Quick Actions */}
              <div className="lg:col-span-8">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Quick Actions</h3>
                    <p className="text-gray-600 text-sm mb-4">Take control of your finances with these shortcuts</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/expenses/add" className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14"></path>
                          <path d="M5 12h14"></path>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-800">Add Expense</span>
                    </Link>
                    
                    <Link href="/bills" className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2 group-hover:bg-green-600 group-hover:text-white transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-800">Bills</span>
                    </Link>
                    
                    <Link href="/goals" className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      </div>
                      <span className="font-medium text-gray-800">Set Goal</span>
                    </Link>
                    
                    <Link href="/activity" className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-800">Activity</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Financial Overview Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                  <line x1="6" y1="6" x2="6.01" y2="6"></line>
                  <line x1="6" y1="18" x2="6.01" y2="18"></line>
                </svg>
              </div>
              Monthly Financial Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expense Distribution */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-medium text-gray-800 mb-3 px-2">Expense Distribution</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <ExpensePieChart />
                </div>
              </div>
              
              {/* Budget vs Actual */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                <h3 className="text-lg font-medium text-gray-800 mb-3 px-2">Budget vs Actual</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <BudgetToActualBarChart />
                </div>
              </div>
            </div>
            
            <div className="text-right mt-4">
              <Link href="/insights" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors">
                View detailed insights
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Savings Goals Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              Savings Goals
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Savings Progress Chart */}
              <div className="md:col-span-1 lg:col-span-1">
                <SavingsProgressChart />
              </div>
              
              {/* Add New Savings Goal Card */}
              <div className="md:col-span-1 lg:col-span-1 flex flex-col justify-center items-center bg-white rounded-lg border border-dashed border-gray-300 p-6 hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Add New Goal</h3>
                <p className="text-gray-500 text-center mb-4">Create a new savings goal to track your progress</p>
                <Link href="/goals/new" className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                  Create Goal
                </Link>
              </div>
              
              {/* Quick Tip Card */}
              <div className="md:col-span-2 lg:col-span-1 bg-white rounded-lg border border-gray-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Savings Tip</h3>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-gray-700">Try the 50/30/20 rule: Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.</p>
                </div>
                <div className="mt-4">
                  <Link href="/tips" className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium text-sm">
                    More financial tips
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 