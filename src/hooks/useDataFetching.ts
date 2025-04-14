'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';

// Define type for frequency
type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

// Define interfaces for our API responses
interface UserData {
  id: string;
  name?: string;
  email: string;
  employmentMode: 'full-time' | 'contract' | 'other';
  income: number;
}

interface ExperienceData {
  experience: number;
  level: number;
}

interface IncomeData {
  id: string;
  userId: string;
  source: string;
  amount: number;
  frequency: Frequency;
  description?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExpenseData {
  id: string;
  userId: string;
  category: string;
  amount: number;
  frequency: Frequency;
  description?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Generic data fetching hook
export function useDataFetch<T>(
  url: string,
  options?: RequestInit,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(`Error fetching data from ${url}:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

// Specific hooks for different data types
export function useUserData() {
  const { data, isLoading, error, refetch } = useDataFetch<UserData>('/api/user');
  return { userData: data, isLoadingUser: isLoading, userError: error, refetchUser: refetch };
}

export function useIncomeData() {
  const { setIncomes, dataLoaded, setDataLoaded } = useBudgetStore();
  const { data, isLoading, error, refetch } = useDataFetch<IncomeData[]>(
    '/api/income',
    undefined,
    [dataLoaded]
  );

  useEffect(() => {
    if (data && Array.isArray(data)) {
      console.log(`✅ useIncomeData: Setting ${data.length} incomes in store`);
      setIncomes(data);
      setDataLoaded(true);
    }
  }, [data, setIncomes, setDataLoaded]);

  return { 
    incomeData: data, 
    isLoadingIncome: isLoading, 
    incomeError: error, 
    refetchIncome: refetch 
  };
}

export function useExpenseData() {
  const { setExpenses, dataLoaded, setDataLoaded } = useBudgetStore();
  const { data, isLoading, error, refetch } = useDataFetch<ExpenseData[]>(
    '/api/expenses',
    undefined,
    [dataLoaded]
  );

  useEffect(() => {
    if (data && Array.isArray(data)) {
      console.log(`✅ useExpenseData: Setting ${data.length} expenses in store`);
      setExpenses(data);
      setDataLoaded(true);
    }
  }, [data, setExpenses, setDataLoaded]);

  return { 
    expenseData: data, 
    isLoadingExpense: isLoading, 
    expenseError: error, 
    refetchExpense: refetch 
  };
}

export function useExperienceData() {
  const { setExperience } = useBudgetStore();
  const { data, isLoading, error, refetch } = useDataFetch<ExperienceData>('/api/user/experience');

  useEffect(() => {
    if (data && data.experience !== undefined && data.level !== undefined) {
      setExperience({
        experience: data.experience,
        level: data.level
      });
    }
  }, [data, setExperience]);

  return { 
    experienceData: data, 
    isLoadingExperience: isLoading, 
    experienceError: error, 
    refetchExperience: refetch 
  };
}

// Combined hook for dashboard that needs all data
export function useDashboardData() {
  const { userData, isLoadingUser, userError, refetchUser } = useUserData();
  const { incomeData, isLoadingIncome, incomeError, refetchIncome } = useIncomeData();
  const { expenseData, isLoadingExpense, expenseError, refetchExpense } = useExpenseData();
  const { experienceData, isLoadingExperience, experienceError, refetchExperience } = useExperienceData();

  const isLoading = isLoadingUser || isLoadingIncome || isLoadingExpense || isLoadingExperience;
  
  const error = userError || incomeError || expenseError || experienceError;

  const refetchAll = useCallback(() => {
    refetchUser();
    refetchIncome();
    refetchExpense();
    refetchExperience();
  }, [refetchUser, refetchIncome, refetchExpense, refetchExperience]);

  return {
    userData,
    incomeData,
    expenseData, 
    experienceData,
    isLoading,
    error,
    refetchAll
  };
} 