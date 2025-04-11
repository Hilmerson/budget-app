'use client';

import { useState } from 'react';

interface BadgeProps {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

interface ChallengeProps {
  title: string;
  description: string;
  progress: number;
  goal: number;
  reward: number;
  type: 'savings' | 'budget' | 'expense';
}

interface LevelProgressProps {
  level: number;
  experience: number;
  nextLevelExperience: number;
}

export function Badge({ name, description, icon, earned }: BadgeProps) {
  return (
    <div 
      className={`p-4 rounded-lg flex flex-col items-center text-center transition-all ${
        earned 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' 
          : 'bg-gray-100 opacity-50'
      }`}
    >
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
          earned 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
            : 'bg-gray-300 text-gray-500'
        }`}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-bold text-gray-800">{name}</h3>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
      {!earned && <div className="text-xs mt-2 text-gray-500">Locked</div>}
    </div>
  );
}

export function Challenge({ title, description, progress, goal, reward, type }: ChallengeProps) {
  const percentage = Math.min(Math.floor((progress / goal) * 100), 100);
  
  const gradientColors = {
    savings: 'from-emerald-500 to-green-500',
    budget: 'from-blue-500 to-indigo-500',
    expense: 'from-amber-500 to-orange-500'
  };
  
  const bgColors = {
    savings: 'bg-emerald-100',
    budget: 'bg-blue-100',
    expense: 'bg-amber-100'
  };

  return (
    <div className={`p-4 rounded-lg ${bgColors[type]} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <div className="bg-white px-2 py-1 rounded text-xs font-medium">+{reward} XP</div>
      </div>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${gradientColors[type]}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{progress}</span>
        <span>{goal}</span>
      </div>
    </div>
  );
}

export function LevelProgress({ level, experience, nextLevelExperience }: LevelProgressProps) {
  const percentage = Math.floor((experience / nextLevelExperience) * 100);
  
  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="text-xl font-bold">Level {level}</div>
          <div className="text-indigo-200 text-sm">Financial Wizard</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center">
          <span className="text-xl font-bold">{level}</span>
        </div>
      </div>
      
      <div className="h-2.5 bg-white bg-opacity-20 rounded-full overflow-hidden mb-1">
        <div 
          className="h-full bg-white rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-indigo-100">
        <span>{experience} XP</span>
        <span>{nextLevelExperience} XP</span>
      </div>
    </div>
  );
}

export function StreakTracker({ currentStreak }: { currentStreak: number }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Mock data - in real app would be based on actual user activity
  const activeDays = [0, 1, 2, 5]; // 0-indexed, so Monday, Tuesday, Wednesday, Saturday
  
  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Your Budget Streak</h3>
        <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <span className="mr-1">🔥</span> {currentStreak} days
        </div>
      </div>
      
      <div className="flex justify-between">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">{day}</div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeDays.includes(index) 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {activeDays.includes(index) ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Achievements() {
  const [activeTab, setActiveTab] = useState('badges');
  
  const badges = [
    { name: 'Saver', description: 'Save $500 in your budget', icon: '💰', earned: true },
    { name: 'Tracker', description: 'Track expenses for 14 days', icon: '📊', earned: true },
    { name: 'Wise Spender', description: 'Stay under budget for a month', icon: '🏆', earned: false },
    { name: 'Goal Setter', description: 'Create and achieve a saving goal', icon: '🎯', earned: false },
  ];
  
  const challenges = [
    { 
      title: 'Expense Tracker', 
      description: 'Add 10 expenses to your budget', 
      progress: 6, 
      goal: 10, 
      reward: 50,
      type: 'expense' as const
    },
    { 
      title: 'Saving Champion', 
      description: 'Save 20% of your monthly income', 
      progress: 15, 
      goal: 20, 
      reward: 100,
      type: 'savings' as const
    },
    { 
      title: 'Budget Master', 
      description: 'Stay under budget for 5 categories', 
      progress: 3, 
      goal: 5, 
      reward: 75,
      type: 'budget' as const
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'badges'
              ? 'text-indigo-600 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'challenges'
              ? 'text-indigo-600 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
        </button>
      </div>
      
      <div className="p-4">
        {activeTab === 'badges' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <Badge key={badge.name} {...badge} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Challenge key={challenge.title} {...challenge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 