'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LevelProgress, XPGainAnimation } from './Gamification';
import { useBudgetStore } from '@/store/useBudgetStore';
import {
  HomeIcon,
  CreditCardIcon,
  BanknotesIcon,
  CalendarIcon,
  TrophyIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function DashboardSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract store values with a fallback for xpGainAnimation
  const store = useBudgetStore();
  const level = store.gamification.level;
  const experience = store.gamification.experience;
  const nextLevelExperience = store.gamification.nextLevelExperience;
  const xpGainAnimation = store.gamification.xpGainAnimation || { isVisible: false, amount: 0, isLevelUp: false };
  const hideXPGainAnimation = store.hideXPGainAnimation;
  const checkLevelUp = store.checkLevelUp;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // Check for level up when component loads
  useEffect(() => {
    // Check if user has enough XP to level up
    checkLevelUp();
  }, [checkLevelUp]);

  // Get active section from the current path
  const getActiveSectionFromPath = (path: string): string => {
    if (path === '/dashboard') return 'dashboard';
    if (path.includes('/dashboard/income')) return 'income';
    if (path.includes('/dashboard/expenses')) return 'expenses';
    if (path.includes('/dashboard/bills')) return 'bills';
    if (path.includes('/dashboard/insights')) return 'insights';
    if (path.includes('/dashboard/achievements')) return 'achievements';
    if (path.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeSection = getActiveSectionFromPath(pathname || '');

  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!session?.user?.name) return '?';
    
    const nameParts = session.user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Sidebar items configuration
  const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCardIcon },
    { name: 'Income', href: '/dashboard/income', icon: BanknotesIcon },
    { name: 'Bills', href: '/dashboard/bills', icon: CalendarIcon },
    { name: 'Insights', href: '/dashboard/insights', icon: ChartBarIcon },
    { name: 'Achievements', href: '/dashboard/achievements', icon: TrophyIcon },
  ];

  return (
    <>
      {/* XP Gain Animation - positioned above everything else */}
      <XPGainAnimation 
        amount={xpGainAnimation.amount}
        isVisible={xpGainAnimation.isVisible}
        isLevelUp={xpGainAnimation.isLevelUp || false}
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
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                      activeSection === item.name.toLowerCase()
                        ? 'bg-blue-100 text-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
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
    </>
  );
} 