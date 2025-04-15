'use client';

import { useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { useBudgetStore } from '@/store/useBudgetStore';

// Define type for frequency
type Frequency = 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

// Define interfaces for our API responses
export interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  employmentMode: 'full-time' | 'contract' | 'other';
  income: number;
  bio?: string; // Optional bio field
  createdAt?: string | Date; // Make sure it can be either string or Date
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
  const { setExperience, gamification } = useBudgetStore();
  const { data, isLoading, error, refetch } = useDataFetch<ExperienceData>('/api/user/experience');

  useEffect(() => {
    if (data) {
      console.log(`🎮 useExperienceData: Received from API - experience: ${data.experience}, level: ${data.level}`);
      
      // Compare with current store values before updating
      const currentLevel = gamification.level;
      const currentExp = gamification.experience;
      
      // Ensure API data is valid
      const apiLevel = typeof data.level === 'number' && data.level > 0 ? data.level : 1;
      const apiExperience = typeof data.experience === 'number' && data.experience >= 0 ? data.experience : 0;
      
      console.log(`🎮 useExperienceData: Current store values - level: ${currentLevel}, experience: ${currentExp}`);
      console.log(`🎮 useExperienceData: API values after validation - level: ${apiLevel}, experience: ${apiExperience}`);
      
      // Only update if:
      // 1. The current level is 1 (default) and API level is higher, OR
      // 2. The API level is significantly different from current level, OR
      // 3. Same level but significantly different XP
      if ((currentLevel === 1 && apiLevel > currentLevel) || 
          Math.abs(apiLevel - currentLevel) > 1 ||
          (apiLevel === currentLevel && Math.abs(apiExperience - currentExp) > 50)) {
            
        console.log(`✅ useExperienceData: Updating store with API data - level: ${apiLevel}, experience: ${apiExperience}`);
        setExperience({
          experience: apiExperience,
          level: apiLevel
        });
      } else {
        console.log(`ℹ️ useExperienceData: Keeping current store values - level: ${currentLevel}, experience: ${currentExp}`);
        
        // If store has higher values than API, sync back to API
        if ((currentLevel > apiLevel) || 
            (currentLevel === apiLevel && currentExp > apiExperience)) {
              
          console.log(`🔄 useExperienceData: Syncing store values to API - level: ${currentLevel}, experience: ${currentExp}`);
          
          // Use setTimeout to avoid blocking the UI
          setTimeout(async () => {
            try {
              await fetch('/api/user/experience', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  experience: currentExp,
                  level: currentLevel
                }),
              });
            } catch (error) {
              console.error('Error syncing experience to API:', error);
            }
          }, 100);
        }
      }
    }
  }, [data, setExperience, gamification]);

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