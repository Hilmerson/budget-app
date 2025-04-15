'use client';

import { XPGainAnimation } from './Gamification';
import { useBudgetStore } from '@/store/useBudgetStore';

export default function ClientWrapper() {
  const store = useBudgetStore();
  const xpGainAnimation = store.gamification.xpGainAnimation || { isVisible: false, amount: 0 };
  const hideXPGainAnimation = store.hideXPGainAnimation;

  return (
    <>
      {/* XP Gain Animation - positioned above everything else */}
      <XPGainAnimation 
        amount={xpGainAnimation.amount}
        isVisible={xpGainAnimation.isVisible}
        isLevelUp={xpGainAnimation.isLevelUp}
        onAnimationComplete={hideXPGainAnimation}
      />
    </>
  );
} 