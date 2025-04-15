import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Shared types
export type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
export type EmploymentMode = 'full-time' | 'contract' | 'other';

export interface Expense {
  id: string;
  userId?: string;
  category: string;
  amount: number;
  frequency: Frequency;
  description?: string;
  date?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Income {
  id: string;
  userId?: string;
  source: string;
  amount: number;
  frequency: Frequency;
  description?: string;
  date?: Date | string;
  createdAt?: Date | string;
  updatedAt?: string;
}

// Interface for calculated financial data
interface FinancialCalculations {
  totalMonthlyIncome: number;
  totalAnnualIncome: number;
  totalMonthlyExpenses: number;
  monthlyBalance: number;
  taxBracket: number;
  taxAmount: number;
  afterTaxIncome: number;
}

// Gamification state
interface GamificationState {
  level: number;
  experience: number;
  nextLevelExperience: number;
  streak: number;
  healthScore: number;
  xpGainAnimation: {
    isVisible: boolean;
    amount: number;
    isLevelUp: boolean;
  };
}

// Main state interface
export interface BudgetState {
  // User-related state
  userId?: string;
  employmentMode: EmploymentMode;
  incomeFrequency: Frequency;
  isConfirmed: boolean;
  
  // Data collections
  expenses: Expense[];
  incomes: Income[];
  
  // Calculated financial data
  calculations: FinancialCalculations;
  
  // Gamification state
  gamification: GamificationState;
  
  // UI state
  dataLoaded: boolean;
  
  // Actions: Core data operations
  setEmploymentMode: (mode: EmploymentMode) => void;
  setIncomeFrequency: (frequency: Frequency) => void;
  setConfirmed: (confirmed: boolean) => void;
  
  // Expense operations
  addExpense: (expense: Expense | Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  clearExpenses: () => void;
  setExpenses: (expenses: Expense[]) => void;
  
  // Income operations
  addIncome: (income: Income | Omit<Income, 'id'>) => void;
  removeIncome: (id: string) => void;
  clearIncomes: () => void;
  setIncomes: (incomes: Income[]) => void;
  
  // Financial calculations
  updateCalculations: () => void;
  
  // Gamification methods
  addExperience: (amount: number) => void;
  setExperience: (data: { experience: number, level: number }) => void;
  updateGamification: () => void;
  setStreak: (streak: number) => void;
  setHealthScore: (score: number) => void;
  showXPGainAnimation: (amount: number, isLevelUp?: boolean) => void;
  hideXPGainAnimation: () => void;
  
  // Data loading
  setDataLoaded: (loaded: boolean) => void;
}

// Utility functions moved outside the store for better organization
const calculateTaxBracket = (income: number): number => {
  if (income <= 11000) return 0.10;
  if (income <= 44725) return 0.12;
  if (income <= 95375) return 0.22;
  if (income <= 182100) return 0.24;
  if (income <= 231250) return 0.32;
  if (income <= 578125) return 0.35;
  return 0.37;
};

const convertToMonthly = (amount: number, frequency: Frequency): number => {
  switch (frequency) {
    case 'one-time':
      return amount / 12; // Spread one-time amount over a year
    case 'weekly':
      return amount * 52 / 12;
    case 'bi-weekly':
      return amount * 26 / 12;
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
};

// Convert any amount to monthly based on frequency
const getMonthlyAmount = (item: { amount: number, frequency: Frequency }): number => {
  let monthlyAmount = item.amount;
  
  if (item.frequency === 'one-time') monthlyAmount = item.amount / 12;
  else if (item.frequency === 'yearly') monthlyAmount = item.amount / 12;
  else if (item.frequency === 'quarterly') monthlyAmount = item.amount / 3;
  else if (item.frequency === 'weekly') monthlyAmount = item.amount * 4.33;
  else if (item.frequency === 'bi-weekly') monthlyAmount = item.amount * 2.17;
  
  return monthlyAmount;
};

// Calculate XP thresholds for different levels
const getLevelInfo = (experience: number): { level: number, nextLevelExperience: number } => {
  let level = 1;
  
  // Ensure experience is a valid number
  const safeExperience = isNaN(experience) || experience < 0 ? 0 : experience;
  
  // Calculate level based on experience
  if (safeExperience > 100) level = 2;
  if (safeExperience > 250) level = 3;
  if (safeExperience > 450) level = 4;
  if (safeExperience > 700) level = 5;
  if (safeExperience > 1000) level = 6;
  if (safeExperience > 1350) level = 7;
  if (safeExperience > 1750) level = 8;
  if (safeExperience > 2200) level = 9;
  if (safeExperience > 2700) level = 10;
  
  // Calculate next level threshold using a formula instead of fixed values
  // This creates a smoother progression curve: 100, 150, 200, 250, 300, 350, 400, 450, 500, etc.
  const baseXP = 100;
  const growthFactor = 1.5;
  
  // Calculate next level XP threshold
  let nextLevelExperience: number;
  
  if (level === 1) {
    nextLevelExperience = baseXP; // Level 1 to 2 always requires 100 XP
  } else if (level === 10) {
    nextLevelExperience = Math.round(baseXP * Math.pow(growthFactor, level - 1)); // For max level
  } else {
    // For levels 2-9, calculate based on the next level's threshold
    nextLevelExperience = Math.round(baseXP * Math.pow(growthFactor, level - 1));
  }
  
  // Ensure we never return zero or negative values
  nextLevelExperience = Math.max(100, nextLevelExperience);
  
  console.log(`🎮 getLevelInfo: Level ${level}, Next Level XP: ${nextLevelExperience}`);
  
  return { level, nextLevelExperience };
};

// Create store with the persist middleware to save state to localStorage
export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      // Initial State
      employmentMode: 'full-time',
      incomeFrequency: 'monthly',
      isConfirmed: false,
      expenses: [],
      incomes: [],
      dataLoaded: false,
      
      // Initial calculations
      calculations: {
        totalMonthlyIncome: 0,
        totalAnnualIncome: 0,
        totalMonthlyExpenses: 0,
        monthlyBalance: 0,
        taxBracket: 0,
        taxAmount: 0,
        afterTaxIncome: 0
      },
      
      // Initial gamification state
      gamification: {
        level: 1,
        experience: 0,
        nextLevelExperience: 100, // Fixed default value for level 1
        streak: 0,
        healthScore: 50,
        xpGainAnimation: {
          isVisible: false,
          amount: 0,
          isLevelUp: false
        }
      },

      // Core data actions
      setEmploymentMode: (mode) => {
        set({ employmentMode: mode });
        get().updateCalculations();
      },
      
      setIncomeFrequency: (frequency) => {
        set({ incomeFrequency: frequency });
        get().updateCalculations();
      },
      
      setConfirmed: (confirmed) => set({ isConfirmed: confirmed }),
      
      // Expense operations
      addExpense: (expense) => {
        set((state) => ({
          expenses: [
            ...state.expenses, 
            'id' in expense 
              ? expense as Expense 
              : { ...expense, id: Math.random().toString(36).substr(2, 9) }
          ]
        }));
        get().updateCalculations();
      },
      
      removeExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id)
        }));
        get().updateCalculations();
      },
      
      clearExpenses: () => {
        set({ expenses: [] });
        get().updateCalculations();
      },
      
      setExpenses: (expenses) => {
        console.log(`🔄 Store: Setting ${expenses.length} expenses in store`);
        // Make sure we have all the required fields
        const validExpenses = expenses.filter(expense => 
          expense.id && expense.category && expense.amount !== undefined
        );
        console.log(`✅ Store: Valid expenses count: ${validExpenses.length}`);
        set({ 
          expenses: validExpenses,
          dataLoaded: true 
        });
        get().updateCalculations();
      },
      
      // Income operations
      addIncome: (income) => {
        set((state) => ({
          incomes: [
            ...state.incomes, 
            'id' in income 
              ? income as Income 
              : { ...income, id: Math.random().toString(36).substr(2, 9) }
          ]
        }));
        get().updateCalculations();
      },
      
      removeIncome: (id) => {
        set((state) => ({
          incomes: state.incomes.filter((income) => income.id !== id)
        }));
        get().updateCalculations();
      },
      
      clearIncomes: () => {
        set({ incomes: [] });
        get().updateCalculations();
      },
      
      setIncomes: (incomes) => {
        console.log(`🔄 Store: Setting ${incomes.length} incomes in store`);
        // Make sure we have all the required fields
        const validIncomes = incomes.filter(income => 
          income.id && income.source && income.amount !== undefined
        );
        console.log(`✅ Store: Valid incomes count: ${validIncomes.length}`);
        set({ 
          incomes: validIncomes,
          dataLoaded: true 
        });
        get().updateCalculations();
      },
      
      // Calculate financial metrics
      updateCalculations: () => {
        const { incomes, expenses, employmentMode } = get();
        
        // Calculate total monthly income from all sources
        const totalMonthlyIncome = incomes.reduce((total, income) => 
          total + getMonthlyAmount(income), 0);
        
        // Calculate total annual income
        const totalAnnualIncome = totalMonthlyIncome * 12;
        
        // Calculate total monthly expenses
        const totalMonthlyExpenses = expenses.reduce((total, expense) => 
          total + getMonthlyAmount(expense), 0);
        
        // Calculate tax information
        let taxBracket = calculateTaxBracket(totalAnnualIncome);
        
        // Adjust tax bracket for different employment modes
        if (employmentMode === 'contract') {
          taxBracket += 0.0765; // Additional self-employment tax
        }
        
        const taxAmount = totalAnnualIncome * taxBracket;
        const afterTaxIncome = totalAnnualIncome - taxAmount;
        const monthlyAfterTaxIncome = afterTaxIncome / 12;
        
        // Calculate monthly balance (after-tax income minus expenses)
        const monthlyBalance = monthlyAfterTaxIncome - totalMonthlyExpenses;
        
        // Update calculations in state
        set({
          calculations: {
            totalMonthlyIncome,
            totalAnnualIncome,
            totalMonthlyExpenses,
            monthlyBalance,
            taxBracket,
            taxAmount,
            afterTaxIncome
          }
        });
        
        // Update health score based on financial data
        get().updateGamification();
      },
      
      // Gamification methods
      addExperience: (amount) => {
        // Log the amount being added
        console.log(`🎮 Budget Store: Adding ${amount} XP points to current experience`);
        
        // Get current state first to determine if this will trigger a level up
        const currentState = get();
        const currentLevel = currentState.gamification.level;
        const currentExp = currentState.gamification.experience;
        console.log(`🎮 Budget Store: Current level: ${currentLevel}, current experience: ${currentExp}`);
        
        const newExperience = currentExp + amount;
        const newLevelInfo = getLevelInfo(newExperience);
        
        // Check if this will trigger a level up
        const willLevelUp = newLevelInfo.level > currentLevel;
        
        // Show appropriate animation
        get().showXPGainAnimation(amount, willLevelUp);
        
        set((state) => {
          const currentExp = state.gamification.experience;
          const currentLevel = state.gamification.level;
          const currentLevelInfo = getLevelInfo(currentExp);
          const newExperience = currentExp + amount;
          
          // Check if the user leveled up
          const newLevelInfo = getLevelInfo(newExperience);
          
          // If the user leveled up, handle overflow XP
          if (newLevelInfo.level > currentLevel) {
            console.log(`🎮 Level up! ${currentLevel} -> ${newLevelInfo.level}`);
            
            // Calculate overflow XP
            // For simplicity in the case of multiple level jumps, just take the remainder
            // of the new experience over the level threshold
            
            // Get the XP threshold for the previous level
            let previousLevelThreshold = 0;
            switch (currentLevel) {
              case 1: previousLevelThreshold = 0; break;
              case 2: previousLevelThreshold = 100; break;
              case 3: previousLevelThreshold = 250; break;
              case 4: previousLevelThreshold = 450; break;
              case 5: previousLevelThreshold = 700; break;
              case 6: previousLevelThreshold = 1000; break;
              case 7: previousLevelThreshold = 1350; break;
              case 8: previousLevelThreshold = 1750; break;
              case 9: previousLevelThreshold = 2200; break;
              case 10: previousLevelThreshold = 2700; break;
              default: previousLevelThreshold = (currentLevel - 1) * 350; break;
            }
            
            // Calculate XP needed for this level
            const xpForCurrentLevel = currentLevelInfo.nextLevelExperience - previousLevelThreshold;
            
            // Calculate how much XP was remaining to level up
            const xpRemainingToLevelUp = currentLevelInfo.nextLevelExperience - currentExp;
            
            // Calculate overflow XP (the excess XP after leveling up)
            const overflowXP = amount - xpRemainingToLevelUp;
            
            console.log(`🎮 Level up details:
              - Previous level threshold: ${previousLevelThreshold}
              - XP for current level: ${xpForCurrentLevel}
              - XP needed to level up: ${xpRemainingToLevelUp}
              - Overflow XP: ${overflowXP}
            `);
            
            // For multi-level jumps, just use the level info from getLevelInfo
            return {
              gamification: {
                ...state.gamification,
                experience: newLevelInfo.level === currentLevel + 1 ? overflowXP : 0, // Use overflow for single level jump, reset for multiple
                level: newLevelInfo.level,
                nextLevelExperience: newLevelInfo.nextLevelExperience
              }
            };
          }
          
          // No level up, just add XP normally
          return { 
            gamification: {
              ...state.gamification,
              experience: newExperience,
              level: newLevelInfo.level,
              nextLevelExperience: newLevelInfo.nextLevelExperience
            }
          };
        });
        
        // Save experience and level to the database
        const { gamification } = get();
        console.log(`🎮 Budget Store: After update - level: ${gamification.level}, experience: ${gamification.experience}`);
        
        // Use setTimeout to avoid blocking the UI
        setTimeout(async () => {
          try {
            console.log(`🎮 Budget Store: Saving to API - level: ${gamification.level}, experience: ${gamification.experience}`);
            const response = await fetch('/api/user/experience', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                experience: gamification.experience,
                level: gamification.level
              }),
            });
            
            if (!response.ok) {
              console.error('Failed to save experience to database');
            } else {
              console.log(`✅ Budget Store: Successfully saved experience data to API`);
            }
          } catch (error) {
            console.error('Error saving experience:', error);
          }
        }, 100); // Slight delay to ensure state is settled
      },
      
      setExperience: ({ experience, level }) => {
        console.log(`🎮 Setting experience: ${experience}, level: ${level}`);
        
        // Calculate next level threshold based on the level
        let nextLevelExperience = 100; // Default fallback
        
        // Only calculate if level is valid
        if (level && level > 0) {
          nextLevelExperience = Math.round(100 * Math.pow(1.5, level - 1));
        }
        
        console.log(`🎮 Setting nextLevelExperience: ${nextLevelExperience} for level ${level}`);
        
        set((state) => ({
          gamification: {
            ...state.gamification,
            experience: experience || 0,
            level: level || 1,
            nextLevelExperience: nextLevelExperience
          }
        }));
      },
      
      updateGamification: () => {
        const { calculations, gamification, expenses, incomes } = get();
        
        // Calculate health score based on financial health
        // 1. Income-to-expense ratio (weight: 40%)
        const incomeExpenseRatio = calculations.totalMonthlyExpenses > 0 
          ? calculations.totalMonthlyIncome / calculations.totalMonthlyExpenses 
          : 2; // If no expenses, assume good ratio
        const ratioScore = Math.min(100, incomeExpenseRatio * 50); // Score from 0-100
        
        // 2. Diversity of income sources (weight: 20%)
        const incomeDiversity = Math.min(5, incomes.length) * 20; // Score from 0-100
        
        // 3. Expense tracking (weight: 20%)
        const expenseTracking = Math.min(10, expenses.length) * 10; // Score from 0-100
        
        // 4. Monthly balance (weight: 20%)
        const balanceScore = calculations.monthlyBalance > 0 
          ? Math.min(100, (calculations.monthlyBalance / calculations.totalMonthlyIncome) * 200)
          : Math.max(0, 50 + (calculations.monthlyBalance / calculations.totalMonthlyIncome) * 100);
        
        // Calculate weighted overall score
        const healthScore = Math.round(
          ratioScore * 0.4 +
          incomeDiversity * 0.2 +
          expenseTracking * 0.2 +
          balanceScore * 0.2
        );
        
        // Update health score
        set({
          gamification: {
            ...gamification,
            healthScore: Math.max(0, Math.min(100, healthScore))
          }
        });
      },
      
      setStreak: (streak) => {
        set((state) => ({
          gamification: {
            ...state.gamification,
            streak
          }
        }));
      },
      
      setHealthScore: (score) => {
        set((state) => ({
          gamification: {
            ...state.gamification,
            healthScore: score
          }
        }));
      },
      
      // Data loading
      setDataLoaded: (loaded) => {
        set({ dataLoaded: loaded });
      },
      
      // Gamification methods
      showXPGainAnimation: (amount, isLevelUp = false) => {
        set((state) => ({
          gamification: {
            ...state.gamification,
            xpGainAnimation: {
              isVisible: true,
              amount,
              isLevelUp
            }
          }
        }));
      },
      
      hideXPGainAnimation: () => {
        set((state) => ({
          gamification: {
            ...state.gamification,
            xpGainAnimation: {
              isVisible: false,
              amount: 0,
              isLevelUp: false
            }
          }
        }));
      }
    }),
    {
      name: 'budget-storage',
      // Add a partial persist to handle merging server data with local storage
      partialize: (state) => ({
        incomes: state.incomes,
        expenses: state.expenses,
        gamification: {
          level: state.gamification.level,
          experience: state.gamification.experience,
          streak: state.gamification.streak,
          healthScore: state.gamification.healthScore,
          // Don't persist animation state
        },
        dataLoaded: state.dataLoaded,
        // Also persist user-related state to avoid inconsistencies
        userId: state.userId,
        employmentMode: state.employmentMode,
        incomeFrequency: state.incomeFrequency,
        isConfirmed: state.isConfirmed
      }),
      // Set a higher version to ensure proper migrations
      version: 2,
      // Add migration for previous versions if needed
      migrate: (persistedState: any, version) => {
        if (version === 1) {
          // If coming from version 1, make sure gamification is properly structured
          return {
            ...persistedState,
            gamification: {
              level: persistedState.gamification?.level || 1,
              experience: persistedState.gamification?.experience || 0,
              streak: persistedState.gamification?.streak || 0,
              healthScore: persistedState.gamification?.healthScore || 50,
              nextLevelExperience: 100,
              xpGainAnimation: {
                isVisible: false,
                amount: 0,
                isLevelUp: false
              }
            }
          };
        }
        return persistedState;
      }
    }
  )
); 