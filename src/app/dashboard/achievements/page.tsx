'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { Achievements, Challenge, StreakTracker } from '@/components/Gamification';

export default function AchievementsPage() {
  // Get streak from store
  const streak = useBudgetStore((state) => state.gamification.streak);

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