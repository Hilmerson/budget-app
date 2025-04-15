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

/**
 * Legacy Dashboard component
 * Note: This component is being replaced with route-based pages,
 * but we're keeping it for backward compatibility. It will redirect
 * to the appropriate route.
 */
export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');

  // Redirect to appropriate route based on hash or active sidebar item
  useEffect(() => {
    // Check for hash in the URL
    const hash = window.location.hash?.substring(1);
    let route = '/dashboard';
    
    if (hash && ['income', 'expenses', 'achievements'].includes(hash)) {
      route = `/dashboard/${hash}`;
      setActiveSidebarItem(hash);
    } else if (hash === 'profile') {
      route = '/profile';
      setActiveSidebarItem('profile');
    } else if (activeSidebarItem && activeSidebarItem !== 'dashboard') {
      if (activeSidebarItem === 'profile') {
        route = '/profile';
      } else {
        route = `/dashboard/${activeSidebarItem}`;
      }
    }
    
    // Redirect to the new route-based URL
    if (window.location.pathname !== route) {
      router.push(route);
    }
  }, [activeSidebarItem, router]);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="text-xl text-indigo-500 flex items-center space-x-2">
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Redirecting to new dashboard...</span>
      </div>
    </div>
  );
} 