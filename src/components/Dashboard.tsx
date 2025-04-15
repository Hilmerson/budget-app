'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useBudgetStore } from '@/store/useBudgetStore';
import { 
  WelcomeIllustration, 
  FinancialHealthCard, 
  SavingsGoalCard,
  BudgetComparisonCard 
} from './Illustrations';
import {
  LevelProgress,
  StreakTracker,
  Achievements,
  Challenge,
  XPGainAnimation
} from './Gamification';
import Income from './Income';
import Expenses from './Expenses';
import { useDashboardData } from '@/hooks/useDataFetching';

type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: Frequency;
  description?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Extract store values with a fallback for xpGainAnimation
  const store = useBudgetStore();
  const level = store.gamification.level;
  const experience = store.gamification.experience;
  const nextLevelExperience = store.gamification.nextLevelExperience;
  const xpGainAnimation = store.gamification.xpGainAnimation || { isVisible: false, amount: 0 };
  
  const {
    calculations: { afterTaxIncome },
    expenses,
    addExperience,
    updateCalculations,
    dataLoaded,
    setDataLoaded,
    hideXPGainAnimation
  } = store;

  const [incomeFrequency, setIncomeFrequency] = useState<Frequency>('monthly');
  const [employmentMode, setEmploymentMode] = useState<'full-time' | 'contract' | 'other'>('full-time');
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  // Custom hook for fetching all data
  const { 
    isLoading, 
    error,
    userData,
    refetchAll
  } = useDashboardData();

  // Mock gamification data - now using store values
  const [streak, setStreak] = useState(4);
  const [healthScore, setHealthScore] = useState(72);

  // Set the active sidebar item based on URL hash when component mounts
  useEffect(() => {
    // Check for hash in the URL (e.g., #income, #expenses)
    const hash = window.location.hash?.substring(1); // Remove the # character
    if (hash && ['dashboard', 'income', 'expenses', 'achievements', 'settings'].includes(hash)) {
      setActiveSidebarItem(hash);
    }
  }, []);

  // Update URL hash when active sidebar item changes
  useEffect(() => {
    if (activeSidebarItem) {
      window.location.hash = activeSidebarItem;
    }
  }, [activeSidebarItem]);

  // Redirect to profile page when that sidebar item is selected
  useEffect(() => {
    if (activeSidebarItem === 'profile') {
      router.push('/profile');
    }
  }, [activeSidebarItem, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Update state from userData when it changes
  useEffect(() => {
    if (userData && 'employmentMode' in userData) {
      setEmploymentMode(userData.employmentMode || 'full-time');
      updateCalculations();
    }
  }, [userData, updateCalculations]);

  // Refresh data when component mounts or when returning from profile page
  useEffect(() => {
    if (status === 'authenticated') {
      console.log('🔄 Dashboard: Refreshing all data...');
      refetchAll();
      
      // Log current gamification values from store
      console.log(`🎮 Dashboard: Current gamification values - Level: ${level}, Experience: ${experience}, Next Level XP: ${nextLevelExperience}`);
    }
  }, [status, refetchAll, level, experience, nextLevelExperience]);

  // Calculate total monthly expenses
  const totalMonthlyExpenses = expenses.reduce((sum, expense) => {
    let monthlyAmount = expense.amount;
    
    if (expense.frequency === 'one-time') monthlyAmount = expense.amount / 12;
    else if (expense.frequency === 'yearly') monthlyAmount = expense.amount / 12;
    else if (expense.frequency === 'quarterly') monthlyAmount = expense.amount / 3;
    else if (expense.frequency === 'weekly') monthlyAmount = expense.amount * 4.33;
    else if (expense.frequency === 'bi-weekly') monthlyAmount = expense.amount * 2.17;
    
    return sum + monthlyAmount;
  }, 0);
  
  // Calculate remaining monthly income
  const remainingIncome = (afterTaxIncome / 12) - totalMonthlyExpenses;

  const frequencyOptions = [
    { value: 'one-time', label: 'One Time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Example category data for budget comparison
  const budgetCategories = [
    { name: 'Housing', budgeted: 1500, spent: 1450 },
    { name: 'Food', budgeted: 500, spent: 620 },
    { name: 'Transportation', budgeted: 300, spent: 275 },
    { name: 'Entertainment', budgeted: 200, spent: 180 },
  ];

  // Function to manually reset data loading state
  const resetDataLoadingState = () => {
    console.log("🧹 Dashboard: Resetting data loading state");
    setDataLoaded(false);
    // Trigger a complete data reload
    refetchAll();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user?.name) return '?';
    
    const nameParts = session.user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Render content based on active sidebar item
  const renderContent = () => {
    switch (activeSidebarItem) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome, {session?.user?.name || 'User'}!</h1>
            
            {/* Debug button for testing XP animation - can be removed in production */}
            <button 
              onClick={() => addExperience(25)} 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
              aria-label="Add test XP"
            >
              Gain +25 XP (Test)
            </button>
            
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
      case 'income':
        return <Income />;
      case 'expenses':
        return <Expenses />;
      case 'achievements':
        return (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Achievements</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Achievements />
              </div>
              <div>
                <StreakTracker currentStreak={streak} />
                <div className="mt-6">
                  <Challenge 
                    title="Budget Master"
                    description="Stay under budget in all categories for a month"
                    progress={80}
                    goal={100}
                    reward={150}
                    type="budget"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        // Display loading indicator while redirecting
        return <div className="text-center py-8">Loading profile...</div>;
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="text-xl text-indigo-500 flex items-center space-x-2">
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading your finances...</span>
        </div>
      </div>
    );
  }

  // Sidebar items configuration
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'income', label: 'Income', icon: '💰' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex flex-col md:flex-row">
        {/* XP Gain Animation - positioned above everything else */}
        <XPGainAnimation 
          amount={xpGainAnimation.amount}
          isVisible={xpGainAnimation.isVisible}
          isLevelUp={xpGainAnimation.isLevelUp}
          onAnimationComplete={hideXPGainAnimation}
        />
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white md:fixed md:h-screen shadow-sm flex flex-col md:overflow-y-auto">
          <div className="p-4 flex flex-col border-b border-gray-200">
            <div className="flex items-center mb-2">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 8L13.5 15L10.5 10L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="ml-2 text-xl font-bold text-blue-600">
                Finny
              </h1>
            </div>
            <p className="text-xs font-medium text-blue-400 italic">Level up your finances! 🚀</p>
          </div>
          
          {status === 'authenticated' && (
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <LevelProgress 
                    level={level}
                    experience={experience}
                    nextLevelExperience={nextLevelExperience}
                  />
                </div>
              
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSidebarItem(item.id)}
                      className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                        activeSidebarItem === item.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* User profile section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium mr-3">
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'User'} 
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Sign out"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h4a1 1 0 010 2H5a4 4 0 01-4-4V5a4 4 0 014-4h4a1 1 0 010 2H5zm10.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H7a1 1 0 110-2h9.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6 md:ml-64">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 