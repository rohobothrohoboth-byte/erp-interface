// src/services/hr/dashboard/dashboard.queries.ts

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getEmpDbRepo,
  getPendEmpList,
  getPendEmpEduExp,
  dashboardApi
} from './dashboard.api';
import type {
  EmpDbPendList,
  EmpDbReport,
  EmpExpEduPendList
} from '../../../types/hr/dashboard';
import type { HrDashboardResponse, ActivityItem, EventItem } from '../../../types/hr/dashboard.types';
import { dashboardKeys } from './dashboard.key';

// ============================================================
// ✅ CACHE CONFIGURATION
// ============================================================
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 30 * 1000; // 30 seconds
const DASHBOARD_STALE_TIME = 2 * 60 * 1000; // 2 minutes
const DASHBOARD_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// ============================================================
// ✅ DEFAULT DATA - with proper structure
// ============================================================
const DEFAULT_DASHBOARD_DATA: HrDashboardResponse = {
  totalEmployees: 0,
  activeEmployees: 0,
  pendingEmployeesCount: 0,
  suspendedEmployees: 0,
  retiredEmployees: 0,
  standByEmployees: 0,
  terminatedEmployees: 0,
  leaveEmployees: 0,
  rejectedEmployees: 0,
  pendingEmployeesList: [],
  pendingEducationExperienceList: [],
  totalDepartments: 0,
  totalPositions: 0,
  totalJobGrades: 0,
  employeesByDepartment: {},
  employeesByPosition: {},
  employeesByStatus: {},
  generatedAt: new Date().toISOString(),
  cacheDurationSeconds: 600,
};

// ============================================================
// ✅ MAIN HOOKS
// ============================================================

// ✅ Fixed useHrDashboard - with proper error handling
export const useHrDashboard = () => {
  return useQuery<HrDashboardResponse>({
    queryKey: dashboardKeys.all,
    queryFn: async ({ signal }) => {
      try {
        // ✅ Pass signal for cancellation support
        const response = await dashboardApi.getDashboard(signal);

        // ✅ Ensure the response has all required fields
        if (!response || typeof response !== 'object') {
          console.warn('⚠️ Dashboard response is invalid, using default data');
          return DEFAULT_DASHBOARD_DATA;
        }

        // ✅ Merge with defaults to ensure all fields exist
        return {
          ...DEFAULT_DASHBOARD_DATA,
          ...response,
          pendingEmployeesList: response.pendingEmployeesList || [],
          pendingEducationExperienceList: response.pendingEducationExperienceList || [],
          employeesByDepartment: response.employeesByDepartment || {},
          employeesByPosition: response.employeesByPosition || {},
          employeesByStatus: response.employeesByStatus || {},
        };
      } catch (error: any) {
        // ✅ Log the error but don't throw - return default data instead
        console.error('❌ Failed to fetch dashboard:', error?.message || error);

        // ✅ Check if it's a cancellation error
        if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
          throw error; // Re-throw cancellation errors
        }

        // ✅ Return default data for all other errors
        return DEFAULT_DASHBOARD_DATA;
      }
    },
    staleTime: DASHBOARD_STALE_TIME,
    gcTime: DASHBOARD_CACHE_TIME,
    refetchOnWindowFocus: false, // ✅ Prevent unnecessary refetches
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: (failureCount, error: any) => {
      // ✅ Don't retry on cancellation errors
      if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
        return false;
      }
      return failureCount < 2;
    },
    // ✅ Remove initialData to avoid conflicts
    // ✅ Use placeholderData instead
    placeholderData: () => DEFAULT_DASHBOARD_DATA,
    // ✅ Prevent throwing errors
    throwOnError: false,
  });
};

// ✅ Recent Activities
export const useRecentActivities = (limit: number = 10) => {
  return useQuery<ActivityItem[]>({
    queryKey: [...dashboardKeys.activities(), limit],
    queryFn: async ({ signal }) => {
      try {
        const response = await dashboardApi.getRecentActivities(limit, signal);
        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
          throw error;
        }
        console.error('Failed to fetch activities:', error);
        return [];
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
        return false;
      }
      return failureCount < 2;
    },
    placeholderData: (previousData) => previousData || [],
    throwOnError: false,
  });
};

// ✅ Upcoming Events
export const useUpcomingEvents = () => {
  return useQuery<EventItem[]>({
    queryKey: dashboardKeys.events(),
    queryFn: async ({ signal }) => {
      try {
        const response = await dashboardApi.getUpcomingEvents(signal);
        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
          throw error;
        }
        console.error('Failed to fetch events:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
        return false;
      }
      return failureCount < 2;
    },
    placeholderData: (previousData) => previousData || [],
    throwOnError: false,
  });
};

// ✅ Pending Leave Requests
export const usePendingLeaveRequests = () => {
  return useQuery<any[]>({
    queryKey: dashboardKeys.pendingLeave(),
    queryFn: async ({ signal }) => {
      try {
        const response = await dashboardApi.getPendingLeaveRequests(signal);
        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
          throw error;
        }
        console.error('Failed to fetch pending leaves:', error);
        return [];
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
        return false;
      }
      return failureCount < 2;
    },
    placeholderData: (previousData) => previousData || [],
    throwOnError: false,
  });
};

// ✅ Leave Statistics
export const useLeaveStatistics = () => {
  return useQuery<any>({
    queryKey: dashboardKeys.statistics(),
    queryFn: async ({ signal }) => {
      try {
        const response = await dashboardApi.getLeaveStatistics(signal);
        return response || { pending: 0, approved: 0, rejected: 0, cancelled: 0, total: 0 };
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
          throw error;
        }
        console.error('Failed to fetch leave statistics:', error);
        return { pending: 0, approved: 0, rejected: 0, cancelled: 0, total: 0 };
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
        return false;
      }
      return failureCount < 2;
    },
    placeholderData: (previousData) => previousData || { pending: 0, approved: 0, rejected: 0, cancelled: 0, total: 0 },
    throwOnError: false,
  });
};

// ✅ On Leave Employees
export const useOnLeaveEmployees = () => {
  return useQuery<any[]>({
    queryKey: dashboardKeys.onLeave(),
    queryFn: async ({ signal }) => {
      try {
        const response = await dashboardApi.getOnLeaveEmployees(signal);
        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
          throw error;
        }
        console.error('Failed to fetch on-leave employees:', error);
        return [];
      }
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error?.name === 'AbortError' || error?.name === 'CancelledError') {
        return false;
      }
      return failureCount < 2;
    },
    placeholderData: (previousData) => previousData || [],
    throwOnError: false,
  });
};

// ============================================================
// ✅ PENDING EDUCATION/EXPERIENCE LIST
// ============================================================

export const usePendEmpEduExpList = () => {
  const { data, isLoading, error, refetch, isFetching } = useHrDashboard();

  const processedData = useMemo(() => {
    if (!data?.pendingEducationExperienceList) return [];

    return data.pendingEducationExperienceList.map((item: any) => {
      const isEducation = item.eduLevel !== undefined ||
          item.fieldOfStudy !== undefined ||
          item.institution !== undefined ||
          item.eduLevel !== null ||
          item.fieldOfStudy !== null ||
          item.institution !== null;

      const isExperience = item.company !== undefined ||
          item.posTitle !== undefined ||
          item.respo !== undefined ||
          item.company !== null ||
          item.posTitle !== null ||
          item.respo !== null;

      let type = 'unknown';

      if (item.type) {
        type = item.type;
      } else if (isEducation && !isExperience) {
        type = 'education';
      } else if (isExperience && !isEducation) {
        type = 'experience';
      } else if (isEducation && isExperience) {
        const eduFields = [item.eduLevel, item.fieldOfStudy, item.institution].filter(v => v).length;
        const expFields = [item.company, item.posTitle, item.respo].filter(v => v).length;
        type = eduFields >= expFields ? 'education' : 'experience';
      }

      return {
        ...item,
        type: type,
      };
    });
  }, [data?.pendingEducationExperienceList]);

  return {
    data: processedData,
    isLoading,
    error,
    refetch,
    isFetching,
  };
};

// ============================================================
// ✅ BACKWARD COMPATIBILITY HOOKS
// ============================================================

export const useEmpDbRepo = () => {
  const result = useHrDashboard();

  return {
    data: result.data || DEFAULT_DASHBOARD_DATA,
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
    isFetching: result.isFetching,
    dataUpdatedAt: result.dataUpdatedAt,
  };
};

export const usePendEmpList = () => {
  const { data, isLoading, error, refetch, isFetching } = useHrDashboard();

  return {
    data: data?.pendingEmployeesList ?? [],
    isLoading,
    error,
    refetch,
    isFetching,
  };
};

export const usePendEmpEduExp = () => {
  const { data, isLoading, error, refetch, isFetching } = useHrDashboard();

  return {
    data: data?.pendingEducationExperienceList ?? [],
    isLoading,
    error,
    refetch,
    isFetching,
  };
};

export const usePendEmpEduExpListOld = () => {
  return usePendEmpEduExp();
};