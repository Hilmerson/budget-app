'use client';

import { useState, useEffect } from 'react';
import { makeAccessibleButton } from '../utils/accessibility';

interface BadgeProps {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  onClick?: () => void;
}

interface ChallengeProps {
  title: string;
  description: string;
  progress: number;
  goal: number;
  reward: number;
  type: 'savings' | 'budget' | 'expense';
  onClick?: () => void;
}

interface LevelProgressProps {
  level: number;
  experience: number;
  nextLevelExperience: number;
}

export function Badge({ name, description, icon, earned, onClick }: BadgeProps) {
  // Add accessibility props for earned badges that can be clicked
  const accessibilityProps = earned && onClick ? {
    ...makeAccessibleButton(onClick),
    'aria-label': `Badge: ${name} - ${description}`,
  } : {};

  return (
    <div 
      className={`p-4 rounded-lg flex flex-col items-center text-center transition-all ${
        earned 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md cursor-pointer' 
          : 'bg-gray-100 opacity-50'
      }`}
      {...accessibilityProps}
    >
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
          earned 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
            : 'bg-gray-300 text-gray-500'
        }`}
        aria-hidden="true"
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-bold text-gray-800">{name}</h3>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
      {!earned && <div className="text-xs mt-2 text-gray-500" aria-live="polite">Locked</div>}
    </div>
  );
}

export function Challenge({ title, description, progress, goal, reward, type, onClick }: ChallengeProps) {
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

  // Add accessibility props for challenge interaction
  const accessibilityProps = onClick ? {
    ...makeAccessibleButton(onClick),
    'aria-label': `Challenge: ${title}`,
  } : {};

  return (
    <div 
      className={`p-4 rounded-lg ${bgColors[type]} transition-all hover:shadow-md cursor-pointer`}
      {...accessibilityProps}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <div className="bg-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm text-indigo-700" aria-label={`Reward: ${reward} XP`}>
          +{reward} XP
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
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
  // Ensure nextLevelExperience is valid to prevent NaN% display
  const safeNextLevelExp = nextLevelExperience && nextLevelExperience > 0 ? nextLevelExperience : 100;
  
  // Calculate percentage safely
  const percentage = isNaN(experience) || isNaN(safeNextLevelExp) || safeNextLevelExp === 0
    ? 0
    : Math.min(Math.floor((experience / safeNextLevelExp) * 100), 100);
  
  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xl font-bold">Level {level || 1}</div>
          <div className="text-indigo-200 text-sm">Financial Wizard</div>
        </div>
        <div className="bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-indigo-700">{level || 1}</span>
        </div>
      </div>
      
      <div className="relative h-3 bg-indigo-800 bg-opacity-50 rounded-full overflow-hidden mb-2" 
        role="progressbar" 
        aria-valuenow={percentage} 
        aria-valuemin={0} 
        aria-valuemax={100} 
        aria-label={`Level progress: ${percentage}%`}>
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 w-full h-full opacity-30">
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>
        </div>
        
        {/* Actual progress bar */}
        <div 
          className="relative h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          {/* Shine overlay */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-white bg-opacity-30 rounded-t-full"></div>
        </div>
        
        {/* Small dots to mark progress milestones */}
        <div className="absolute inset-y-0 w-full flex justify-between px-1 pointer-events-none">
          {[0, 1, 2, 3].map((_, index) => (
            <div key={index} className="h-full flex items-center">
              <div className="w-1 h-1 rounded-full bg-white bg-opacity-70"></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm font-bold text-yellow-300">{experience || 0}</span>
          <span className="text-xs text-indigo-200 mx-1">/</span>
          <span className="text-xs text-indigo-200">{safeNextLevelExp}</span>
        </div>
        <div className="bg-indigo-800 bg-opacity-50 px-2 py-0.5 rounded text-xs font-medium text-indigo-100">
          {percentage}% to Level {(level || 1) + 1}
        </div>
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
        <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center" aria-label={`Current streak: ${currentStreak} days`}>
          <span className="mr-1" aria-hidden="true">🔥</span> {currentStreak} days
        </div>
      </div>
      
      <div className="flex justify-between" role="group" aria-label="Days of the week activity">
        {days.map((day, index) => (
          <div key={day} className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">{day}</div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeDays.includes(index) 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}
              aria-label={`${day}: ${activeDays.includes(index) ? 'Active' : 'Inactive'}`}
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
      <div className="flex border-b border-gray-200" role="tablist">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium cursor-pointer transition-colors ${
            activeTab === 'badges'
              ? 'text-indigo-600 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('badges')}
          role="tab"
          aria-selected={activeTab === 'badges'}
          aria-controls="badges-panel"
          id="badges-tab"
        >
          Badges
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium cursor-pointer transition-colors ${
            activeTab === 'challenges'
              ? 'text-indigo-600 border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('challenges')}
          role="tab"
          aria-selected={activeTab === 'challenges'}
          aria-controls="challenges-panel"
          id="challenges-tab"
        >
          Challenges
        </button>
      </div>
      
      <div className="p-4">
        {activeTab === 'badges' ? (
          <div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-4" 
            role="tabpanel"
            id="badges-panel"
            aria-labelledby="badges-tab"
          >
            {badges.map((badge) => (
              <Badge key={badge.name} {...badge} onClick={() => badge.earned ? console.log(`Clicked on ${badge.name}`) : null} />
            ))}
          </div>
        ) : (
          <div 
            className="space-y-4"
            role="tabpanel"
            id="challenges-panel"
            aria-labelledby="challenges-tab"
          >
            {challenges.map((challenge) => (
              <Challenge key={challenge.title} {...challenge} onClick={() => console.log(`Clicked on ${challenge.title}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function XPGainAnimation({ amount, isVisible, onAnimationComplete, isLevelUp }: { 
  amount: number; 
  isVisible: boolean;
  onAnimationComplete: () => void;
  isLevelUp?: boolean;
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, isLevelUp ? 3000 : 2000); // Animation lasts longer for level up
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete, isLevelUp]);
  
  if (!isVisible) return null;
  
  // Special animation for level up
  if (isLevelUp) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" aria-live="polite" aria-atomic="true">
        {/* Darkened overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-40 pointer-events-none"></div>
        
        {/* Level up message */}
        <div 
          className="animate-scale-in bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-6 rounded-xl shadow-xl font-bold text-2xl flex flex-col items-center"
          style={{
            animation: 'scale-in-out 3s ease-out forwards',
          }}
          aria-label="Level up!"
        >
          <div className="text-4xl mb-2">🎊 LEVEL UP! 🎊</div>
          <div className="flex items-center justify-center">
            <span className="text-3xl mr-2">+{amount} XP</span>
          </div>
        </div>
        
        {/* Celebratory particles */}
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#4169E1'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `celebration-particle 2.${i % 5}s ease-out forwards ${i * 0.05}s`,
              }}
            />
          ))}
        </div>
        
        {/* Add keyframes for level up animation */}
        <style jsx global>{`
          @keyframes scale-in-out {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            20% {
              opacity: 1;
              transform: scale(1.2);
            }
            30% {
              transform: scale(1);
            }
            70% {
              opacity: 1;
              transform: scale(1.05);
            }
            100% {
              opacity: 0;
              transform: scale(1.5);
            }
          }
          
          @keyframes celebration-particle {
            0% {
              opacity: 0;
              transform: scale(0) translate(0, 0);
            }
            10% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(0.5) translate(
                ${Math.random() * 200 - 100}px,
                ${Math.random() * 200 - 100}px
              );
            }
          }
        `}</style>
      </div>
    );
  }
  
  // Regular XP gain animation
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" aria-live="polite" aria-atomic="true">
      <div 
        className="animate-bounce-up-fade-out bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-full shadow-lg font-bold text-xl flex items-center"
        style={{
          animation: 'bounce-up-fade-out 2s ease-out forwards',
        }}
        aria-label={`Gained ${amount} experience points`}
      >
        <span className="mr-2 text-yellow-300">✨</span>
        +{amount} XP
        <span className="ml-2 text-yellow-300">✨</span>
      </div>
      
      {/* Small floating particles for extra flair */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-yellow-300 rounded-full opacity-80"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animation: `particle-fade-out 1.${5 + i % 5}s ease-out forwards ${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      
      {/* Add keyframes for the animations */}
      <style jsx global>{`
        @keyframes bounce-up-fade-out {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          30% {
            opacity: 1;
            transform: scale(1.2) translateY(-10px);
          }
          70% {
            opacity: 1;
            transform: scale(1) translateY(-30px);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) translateY(-50px);
          }
        }
        
        @keyframes particle-fade-out {
          0% {
            opacity: 0.8;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 0.6;
            transform: scale(1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}