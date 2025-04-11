import { create } from 'zustand';

type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

interface Expense {
  id: string;
  category: string;
  amount: number;
  frequency: Frequency;
  description?: string;
}

interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: Frequency;
}

interface BudgetState {
  // Basic Info
  employmentMode: 'full-time' | 'contract' | 'other';
  income: number;
  incomeFrequency: Frequency;
  isConfirmed: boolean;
  
  // Tax Information
  taxBracket: number;
  taxAmount: number;
  afterTaxIncome: number;
  
  // Expenses
  expenses: Expense[];
  
  // Income sources
  incomes: Income[];
  totalIncome: number;
  
  // Actions
  setEmploymentMode: (mode: 'full-time' | 'contract' | 'other') => void;
  setIncome: (amount: number) => void;
  setTotalIncome: (amount: number) => void;
  setIncomeFrequency: (frequency: Frequency) => void;
  setConfirmed: (confirmed: boolean) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  clearExpenses: () => void;
  setExpenses: (expenses: Expense[]) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  removeIncome: (id: string) => void;
  clearIncomes: () => void;
  setIncomes: (incomes: Income[]) => void;
  calculateTaxes: () => void;
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

  // Actions
  setEmploymentMode: (mode) => set({ employmentMode: mode }),
  setIncome: (amount) => {
    set({ income: amount });
    get().calculateTaxes();
  },
  setTotalIncome: (amount) => set({ totalIncome: amount }),
  setIncomeFrequency: (frequency) => set({ incomeFrequency: frequency }),
  setConfirmed: (confirmed) => set({ isConfirmed: confirmed }),
  
  addExpense: (expense) => 
    set((state) => ({
      expenses: [...state.expenses, { ...expense, id: Math.random().toString(36).substr(2, 9) }]
    })),
  
  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id)
    })),
    
  clearExpenses: () => set({ expenses: [] }),
  
  setExpenses: (expenses) => set({ expenses }),
  
  addIncome: (income) => 
    set((state) => ({
      incomes: [...state.incomes, { ...income, id: Math.random().toString(36).substr(2, 9) }]
    })),
  
  removeIncome: (id) =>
    set((state) => ({
      incomes: state.incomes.filter((income) => income.id !== id)
    })),
    
  clearIncomes: () => set({ incomes: [] }),
  
  setIncomes: (incomes) => set({ incomes }),
  
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
  }
})); 