import { create } from 'zustand';

type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

interface Expense {
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

interface Income {
  id: string;
  userId?: string;
  source: string;
  amount: number;
  frequency: Frequency;
  description?: string;
  date?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface BudgetState {
  // User-related state
  userId?: string;
  employmentMode: 'full-time' | 'contract' | 'other';
  income: number;
  incomeFrequency: Frequency;
  isConfirmed: boolean;
  taxBracket: number;
  taxAmount: number;
  afterTaxIncome: number;
  expenses: Expense[];
  incomes: Income[];
  totalIncome: number;
  
  // Gamification
  level: number;
  experience: number;
  nextLevelExperience: number;
  
  // Data loading state
  dataLoaded: boolean;
  
  // Actions
  setEmploymentMode: (mode: 'full-time' | 'contract' | 'other') => void;
  setIncome: (amount: number) => void;
  setTotalIncome: (amount: number) => void;
  setIncomeFrequency: (frequency: Frequency) => void;
  setConfirmed: (confirmed: boolean) => void;
  
  addExpense: (expense: Expense | Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  clearExpenses: () => void;
  setExpenses: (expenses: Expense[]) => void;
  
  addIncome: (income: Income | Omit<Income, 'id'>) => void;
  removeIncome: (id: string) => void;
  clearIncomes: () => void;
  setIncomes: (incomes: Income[]) => void;
  
  calculateTaxes: () => void;
  
  // XP methods
  addExperience: (amount: number) => void;
  setExperience: (data: { experience: number, level: number }) => void;
  calculateLevel: () => void;
  
  // Data loading flag
  setDataLoaded: (loaded: boolean) => void;
}

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

export const useBudgetStore = create<BudgetState>((set, get) => ({
  // Initial State
  employmentMode: 'full-time',
  income: 0,
  incomeFrequency: 'monthly',
  isConfirmed: false,
  taxBracket: 0,
  taxAmount: 0,
  afterTaxIncome: 0,
  expenses: [],
  incomes: [],
  totalIncome: 0,
  
  // Data loading state
  dataLoaded: false,
  
  // Gamification
  level: 1,
  experience: 0,
  nextLevelExperience: 100,

  // Actions
  setEmploymentMode: (mode) => set({ employmentMode: mode }),
  setIncome: (amount) => {
    set({ income: amount });
    get().calculateTaxes();
  },
  setTotalIncome: (amount) => set({ totalIncome: amount }),
  setIncomeFrequency: (frequency) => set({ incomeFrequency: frequency }),
  setConfirmed: (confirmed) => set({ isConfirmed: confirmed }),
  
  addExpense: (expense: Expense | Omit<Expense, 'id'>) => 
    set((state) => ({
      expenses: [...state.expenses, 'id' in expense ? expense as Expense : { ...expense, id: Math.random().toString(36).substr(2, 9) }]
    })),
  
  removeExpense: (id: string) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id)
    })),
    
  clearExpenses: () => set({ expenses: [] }),
  
  setExpenses: (expenses: Expense[]) => {
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
  },
  
  addIncome: (income: Income | Omit<Income, 'id'>) => 
    set((state) => {
      console.log('➕ Store: Adding income', income);
      return {
        incomes: [...state.incomes, 'id' in income ? income as Income : { ...income, id: Math.random().toString(36).substr(2, 9) }]
      };
    }),
  
  removeIncome: (id: string) =>
    set((state) => {
      console.log(`🗑️ Store: Removing income with id ${id}`);
      return {
        incomes: state.incomes.filter((income) => income.id !== id)
      };
    }),
    
  clearIncomes: () => {
    console.log('🧹 Store: Clearing all incomes');
    set({ incomes: [] });
  },
  
  setIncomes: (incomes: Income[]) => {
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
  },
  
  calculateTaxes: () => {
    const { totalIncome, employmentMode } = get();
    const annualIncome = totalIncome * 12; // Total income is already monthly
    let taxBracket = calculateTaxBracket(annualIncome);
    
    // Adjust tax bracket for different employment modes
    if (employmentMode === 'contract') {
      taxBracket += 0.0765; // Additional self-employment tax
    }
    
    const taxAmount = annualIncome * taxBracket;
    const afterTaxIncome = totalIncome - (taxAmount / 12); // Monthly after-tax income
    
    set({ taxBracket, taxAmount, afterTaxIncome });
  },
  
  // XP methods
  addExperience: (amount) => {
    set((state) => {
      const newExperience = state.experience + amount;
      return { experience: newExperience };
    });
    get().calculateLevel();
    
    // Save experience and level to the database
    const { experience, level } = get();
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(async () => {
      try {
        const response = await fetch('/api/user/experience', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            experience,
            level
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to save experience to database');
        }
      } catch (error) {
        console.error('Error saving experience:', error);
      }
    }, 0);
  },
  
  setExperience: (data) => {
    set({ 
      experience: data.experience, 
      level: data.level 
    });
  },
  
  calculateLevel: () => {
    const { experience } = get();
    
    // Simple level calculation
    // Level 1: 0-100 XP
    // Level 2: 101-250 XP
    // Level 3: 251-450 XP
    // Level 4: 451-700 XP
    // Level 5: 701-1000 XP
    // And so on...
    
    let level = 1;
    let nextLevelExperience = 100;
    
    if (experience > 100) level = 2;
    if (experience > 250) level = 3;
    if (experience > 450) level = 4;
    if (experience > 700) level = 5;
    if (experience > 1000) level = 6;
    if (experience > 1350) level = 7;
    if (experience > 1750) level = 8;
    if (experience > 2200) level = 9;
    if (experience > 2700) level = 10;
    
    // Set next level target
    switch (level) {
      case 1: nextLevelExperience = 100; break;
      case 2: nextLevelExperience = 250; break;
      case 3: nextLevelExperience = 450; break;
      case 4: nextLevelExperience = 700; break;
      case 5: nextLevelExperience = 1000; break;
      case 6: nextLevelExperience = 1350; break;
      case 7: nextLevelExperience = 1750; break;
      case 8: nextLevelExperience = 2200; break;
      case 9: nextLevelExperience = 2700; break;
      case 10: nextLevelExperience = 3300; break;
      default: nextLevelExperience = level * 350; break;
    }
    
    set({ level, nextLevelExperience });
  },
  
  // Data loading flag
  setDataLoaded: (loaded) => {
    set({ dataLoaded: loaded });
  }
})); 