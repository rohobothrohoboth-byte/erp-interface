// src/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // ✅ Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,

      // ✅ Don't refetch on window focus (improves performance)
      refetchOnWindowFocus: false,

      // ✅ Don't refetch on mount (use cache)
      refetchOnMount: false,

      // ✅ Don't refetch on reconnect
      refetchOnReconnect: false,

      // ✅ Retry failed requests - Skip cancellation errors
      retry: (failureCount, error: any) => {
        // ✅ Don't retry on cancellation errors
        if (error?.name === 'AbortError' ||
            error?.name === 'CancelledError' ||
            error?.message === 'CancelledError') {
          return false;
        }
        return failureCount < 1;
      },

      // ✅ Show loading state for 300ms before showing loading UI
      suspense: false,

      // ✅ Only refetch when data is stale
      refetchInterval: false,
    },
    mutations: {
      // ✅ Retry failed mutations - Skip cancellation errors
      retry: (failureCount, error: any) => {
        if (error?.name === 'AbortError' ||
            error?.name === 'CancelledError' ||
            error?.message === 'CancelledError') {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

// ✅ Helper to invalidate finance queries
export const invalidateFinanceQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
  queryClient.invalidateQueries({ queryKey: ['journalSummary'] });
  queryClient.invalidateQueries({ queryKey: ['reference'] });
};

// ✅ Helper to invalidate HR queries
export const invalidateHrQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['empDbReport'] });
  queryClient.invalidateQueries({ queryKey: ['pendEmpList'] });
  queryClient.invalidateQueries({ queryKey: ['pendingLeaveRequests'] });
  queryClient.invalidateQueries({ queryKey: ['statistics'] });
  queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
  queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] });
};

// ✅ Helper to clear all queries (for logout)
export const clearAllQueries = (queryClient: QueryClient) => {
  queryClient.clear();
};