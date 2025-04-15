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
  setExperience: (data: { experience: number, level: number }, skipDatabaseSync?: boolean) => void;
  checkLevelUp: () => boolean;
  resetExperience: () => void;
  updateGamification: (updates?: Partial<GamificationState>) => void;
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

// Define the XP required for each level
// This is the XP needed to advance FROM this level TO the next level
// e.g. LEVEL_XP_REQUIREMENTS[1] = 100 means you need 100 XP to go from level 1 to level 2
const LEVEL_XP_REQUIREMENTS = [
  0,    // Level 0 (not used)
  100,  // Level 1 needs 100 XP to reach Level 2
  150,  // Level 2 needs 150 XP to reach Level 3
  200,  // Level 3 needs 200 XP to reach Level 4
  250,  // Level 4 needs 250 XP to reach Level 5
  300,  // Level 5 needs 300 XP to reach Level 6
  350,  // Level 6 needs 350 XP to reach Level 7
  400,  // Level 7 needs 400 XP to reach Level 8
  450,  // Level 8 needs 450 XP to reach Level 9
  500,  // Level 9 needs 500 XP to reach Level 10
  500,  // Level 10 needs 500 XP to reach Level 11
  500,  // Level 11 needs 500 XP to reach Level 12
  500,  // Level 12 needs 500 XP to reach Level 13
  500   // Level 13 needs 500 XP to reach Level 14
];

// Maximum level allowed
const MAX_LEVEL = 30;

// For levels beyond our explicitly defined requirements
const HIGH_LEVEL_XP_REQUIREMENT = 500;

// Get XP required for a specific level
const getXpRequiredForLevel = (level: number): number => {
  // Ensure level is valid
  if (level < 1) return 0;
  
  // If we have a predefined requirement, use it
  if (level < LEVEL_XP_REQUIREMENTS.length) {
    return LEVEL_XP_REQUIREMENTS[level];
  }
  
  // For higher levels, use the standard increment
  return HIGH_LEVEL_XP_REQUIREMENT;
};

// Calculate how much more XP is needed for the next level based on current level and XP
const getXpNeededForNextLevel = (level: number, currentXp: number): number => {
  // Get the total XP required for this level
  const requiredXp = getXpRequiredForLevel(level);
  
  // Calculate how much more XP is needed
  return Math.max(0, requiredXp - currentXp);
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
        nextLevelExperience: 100, // Default level 1 requires 100 XP to level up
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
        // Perform all operations in a single state update to avoid race conditions
        set((state) => {
          // Get current state values
          const currentLevel = state.gamification.level;
          const currentExp = state.gamification.experience;
          const requiredExp = getXpRequiredForLevel(currentLevel);
          
          // Calculate new experience
          const newExperience = currentExp + amount;
          
          // Check if this will trigger a level up
          const willLevelUp = newExperience >= requiredExp;
          
          // Initialize the new state
          let updatedExperience = newExperience;
          let updatedLevel = currentLevel;
          let updatedNextLevelExperience = requiredExp;
          
          // Handle level up if needed
          if (willLevelUp) {
            // Calculate overflow XP (the excess XP after leveling up)
            const overflowXP = Math.max(0, newExperience - requiredExp);
            
            // Increment level
            updatedLevel = currentLevel + 1;
            
            // Ensure we don't exceed the maximum level
            if (updatedLevel > MAX_LEVEL) {
              updatedLevel = MAX_LEVEL;
              // At max level, we keep accumulating XP
              updatedExperience = newExperience;
            } else {
              // Reset XP to just the overflow amount
              updatedExperience = overflowXP;
            }
            
            // Get the XP requirement for the new level
            updatedNextLevelExperience = getXpRequiredForLevel(updatedLevel);
            
            console.log(`Level up! ${currentLevel} -> ${updatedLevel}`);
          } 
          
          // Show animation based on the pre-calculated values 
          setTimeout(() => {
            get().showXPGainAnimation(amount, willLevelUp);
          }, 0);
          
          // Save to database after update
          const finalExp = updatedExperience;
          const finalLevel = updatedLevel;
          
          // Use setTimeout to avoid blocking the UI
          setTimeout(async () => {
            try {
              const response = await fetch('/api/user/experience', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  experience: finalExp,
                  level: finalLevel
                }),
              });
              
              if (!response.ok) {
                console.error('Failed to save experience to database');
              } else {
                // After successful save, fetch fresh data from server to ensure client is in sync
                setTimeout(async () => {
                  try {
                    const response = await fetch('/api/user/experience');
                    if (response.ok) {
                      const serverData = await response.json();
                      
                      // Only update if the server data is different from our local state
                      const currentState = get();
                      if (
                        serverData.experience !== currentState.gamification.experience || 
                        serverData.level !== currentState.gamification.level
                      ) {
                        // Get XP required for the server's level
                        const nextLevelExp = getXpRequiredForLevel(serverData.level);
                        
                        // Update state with server values
                        set(state => ({
                          gamification: {
                            ...state.gamification,
                            level: serverData.level,
                            experience: serverData.experience,
                            nextLevelExperience: nextLevelExp
                          }
                        }));
                      }
                    }
                  } catch (syncError) {
                    console.error('Error syncing with server:', syncError);
                  }
                }, 300); // Add a delay to ensure the server has processed the update
              }
            } catch (error) {
              console.error('Error saving experience:', error);
            }
          }, 100); // Slight delay to ensure state is settled
          
          // Return the new state
          return {
            gamification: {
              ...state.gamification,
              experience: updatedExperience,
              level: updatedLevel,
              nextLevelExperience: updatedNextLevelExperience
            }
          };
        });
      },
      
      setExperience: (data, skipDatabaseSync = false) => {
        // Get XP required for the level
        const nextLevelExperience = getXpRequiredForLevel(data.level);
        
        // Ensure the experience doesn't exceed what's required for this level
        const validExperience = Math.min(data.experience, nextLevelExperience - 1);
        
        set((state) => ({
          gamification: {
            ...state.gamification,
            experience: validExperience,
            level: data.level,
            nextLevelExperience: nextLevelExperience
          }
        }));
        
        // Only update the database if not skipped
        if (!skipDatabaseSync) {
          setTimeout(async () => {
            try {
              await fetch('/api/user/experience', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  experience: validExperience,
                  level: data.level
                }),
              });
            } catch (error) {
              console.error('Error saving experience:', error);
            }
          }, 100);
        }
      },
      
      resetExperience: () => {
        console.log('Resetting experience to Level 1 with 0 XP');
        
        // Set level to 1 and XP to 0 in the store
        set((state) => ({
          gamification: {
            ...state.gamification,
            level: 1,
            experience: 0,
            nextLevelExperience: getXpRequiredForLevel(1)
          }
        }));
        
        // Update the database
        setTimeout(async () => {
          try {
            await fetch('/api/user/experience', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                experience: 0,
                level: 1
              }),
            });
            console.log('Reset experience saved to database');
          } catch (error) {
            console.error('Error resetting experience:', error);
          }
        }, 100);
      },
      
      checkLevelUp: () => {
        const { gamification } = get();
        const { experience, level } = gamification;
        
        // Get XP required for the current level
        const requiredXp = getXpRequiredForLevel(level);
        
        // Check if we have enough XP to level up
        if (experience >= requiredXp) {
          console.log(`Auto level up detected: ${level} -> ${level + 1}`);
          
          // Calculate overflow XP
          const overflowXP = experience - requiredXp;
          
          // Get XP required for the next level
          const nextLevelRequiredXp = getXpRequiredForLevel(level + 1);
          
          // Update state with new level info
          set((state) => ({
            gamification: {
              ...state.gamification,
              level: level + 1,
              experience: overflowXP,
              nextLevelExperience: nextLevelRequiredXp,
              xpGainAnimation: {
                ...state.gamification.xpGainAnimation,
                isLevelUp: true
              }
            }
          }));
          
          // Save to the database
          setTimeout(async () => {
            try {
              await fetch('/api/user/experience', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  experience: overflowXP,
                  level: level + 1
                }),
              });
            } catch (error) {
              console.error('Error saving level up:', error);
            }
          }, 100);
          
          return true;
        }
        
        return false;
      },
      
      updateGamification: (updates = {}) => {
        set((state) => {
          // Start with current state
          let newState = { ...state.gamification };
          
          // Apply any direct updates passed in
          if (Object.keys(updates).length > 0) {
            newState = { ...newState, ...updates };
          } 
          // Otherwise calculate health score based on financial situation
          else {
            const { calculations } = state;
            let healthScore = 50; // Start at neutral
            
            // If we have income data, calculate health score
            if (calculations.totalMonthlyIncome > 0) {
              // Positive factors
              if (calculations.monthlyBalance > 0) {
                // Having positive monthly balance is good
                const savingsRate = calculations.monthlyBalance / calculations.totalMonthlyIncome;
                
                if (savingsRate >= 0.2) healthScore += 30; // Excellent savings
                else if (savingsRate >= 0.1) healthScore += 20; // Good savings
                else if (savingsRate > 0) healthScore += 10; // Some savings
              }
              
              // Negative factors
              if (calculations.monthlyBalance < 0) {
                // Deficit is bad
                const deficitRate = Math.abs(calculations.monthlyBalance) / calculations.totalMonthlyIncome;
                
                if (deficitRate >= 0.2) healthScore -= 30; // Serious deficit
                else if (deficitRate >= 0.1) healthScore -= 20; // Moderate deficit
                else healthScore -= 10; // Small deficit
              }
              
              // Tax rate factor
              if (calculations.taxBracket >= 0.32) healthScore -= 5; // High tax bracket
              
              // Total expense to income ratio
              const expenseRatio = calculations.totalMonthlyExpenses / calculations.totalMonthlyIncome;
              if (expenseRatio <= 0.5) healthScore += 10; // Very good expense ratio
              else if (expenseRatio <= 0.7) healthScore += 5; // Decent expense ratio
              else if (expenseRatio >= 0.9) healthScore -= 10; // High expense ratio
            }
            
            // Ensure score is within bounds
            healthScore = Math.max(10, Math.min(100, healthScore));
            
            newState.healthScore = healthScore;
          }
          
          return { gamification: newState };
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
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          get().hideXPGainAnimation();
        }, 3000);
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
      },
      
      setDataLoaded: (loaded) => {
        set({ dataLoaded: loaded });
      },
    }),
    {
      name: 'budget-store',
      // Don't persist some non-essential UI state
      partialize: (state) => ({
        ...state,
        gamification: {
          ...state.gamification,
          xpGainAnimation: {
            isVisible: false,  // Don't persist animation state
            amount: 0,
            isLevelUp: false
          }
        }
      })
    }
  )
);