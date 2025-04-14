'use client';

import { useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
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

// Custom fetcher function for SWR
const fetcher = async (url: string) => {
  try {
    console.log(`🔍 SWR: Fetching data from ${url}`);
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`⚠️ Error fetching data from ${url}, status: ${res.status}`);
      const error = new Error('An error occurred while fetching the data.');
      error.message = `Failed to fetch: ${res.status} ${res.statusText}`;
      throw error;
    }
    
    const data = await res.json();
    console.log(`✅ SWR: Successfully fetched data from ${url}`);
    return data;
  } catch (error) {
    console.error(`🚨 SWR Fetcher error for ${url}:`, error);
    throw error;
  }
};

// Generic data fetching hook using SWR
export function useDataFetch<T>(url: string) {
  const { data, error, isLoading, isValidating, mutate: refetch } = useSWR<T>(
    url, 
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 5000, // Deduplicate requests within 5 seconds
      errorRetryCount: 3,     // Retry failed requests 3 times
      focusThrottleInterval: 10000, // Only revalidate once per 10 seconds on focus
      loadingTimeout: 5000,   // Show slow data fetch warning after 5 seconds
      onLoadingSlow: () => console.warn(`🐢 Slow loading detected for ${url}`),
      onSuccess: (data) => console.log(`🎉 SWR success for ${url}, received:`, Array.isArray(data) ? `${data.length} items` : 'data'),
      onError: (err) => console.error(`💥 SWR error for ${url}:`, err.message),
    }
  );

  // Combine isLoading and isValidating for a consistent loading state
  // This ensures components show loading state during initial load AND revalidation
  const isFetching = isLoading || isValidating;

  return { 
    data, 
    isLoading: isFetching, 
    error: error ? error.message : null, 
    refetch 
  };
}

// Helper function to mutate SWR cache for a specific endpoint
export function invalidateCache(endpoint: string) {
  return mutate(endpoint);
}

// Specific hooks for different data types
export function useUserData() {
  const { data, isLoading, error, refetch } = useDataFetch<UserData>('/api/user');
  return { userData: data, isLoadingUser: isLoading, userError: error, refetchUser: refetch };
}

export function useIncomeData() {
  const { setIncomes, dataLoaded, setDataLoaded } = useBudgetStore();
  const { data, isLoading, error, refetch } = useDataFetch<IncomeData[]>('/api/income');

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
  const { data, isLoading, error, refetch } = useDataFetch<ExpenseData[]>('/api/expenses');

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
      console.log(`✅ useExperienceData: Setting experience (${data.experience}) and level (${data.level}) in store`);
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