'use client';

import { useState, useEffect } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { Achievements, Challenge, StreakTracker } from '@/components/Gamification';

export default function AchievementsPage() {
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  // Load streak safely from store
  useEffect(() => {
    try {
      const store = useBudgetStore.getState();
      setStreak(store.gamification?.streak || 0);
    } catch (e) {
      console.error('Error loading streak:', e);
      setError('Failed to load achievements data. Please try refreshing the page.');
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        {error}
        <button 
          onClick={() => window.location.reload()} 
          className="ml-2 underline"
        >
          Refresh
        </button>
      </div>
    );
  }

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
} 