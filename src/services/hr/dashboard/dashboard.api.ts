// services/hr/dashboard/dashboard.api.ts

import { api } from "../../api";
import type {
  EmpDbPendList,
  EmpDbReport,
  EmpExpEduPendList
} from "../../../types/hr/dashboard";
import type { HrDashboardResponse, ActivityItem, EventItem } from '../../../types/hr/dashboard.types';

// ============================================================
// ✅ FIXED BASE URLS
// ============================================================
const BaseUrl = '/hrm/profile/v1/EmpListRepo';
const LeaveBaseUrl = '/hrm/leave/v1';
const DashboardBaseUrl = '/hrm/profile/v1.0/dashboard';

// ============================================================
// ✅ DEFAULT DATA STRUCTURE
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
// ✅ ERROR HANDLER
// ============================================================
const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const e = error as any;
    if (e.response?.data?.message) return e.response.data.message;
    if (e.response?.data?.errors) {
      const errors = e.response.data.errors;
      if (Array.isArray(errors)) return errors.join(", ");
      if (typeof errors === 'object') {
        return Object.values(errors).flat().join(", ");
      }
      return String(errors);
    }
    if (e.message) return e.message;
  }
  return "An unexpected error occurred";
};

// ============================================================
// ✅ API FUNCTIONS
// ============================================================

export const dashboardApi = {
  // ✅ Get Dashboard Data
  getDashboard: async (): Promise<HrDashboardResponse> => {
    try {
      const response = await api.get<HrDashboardResponse>(`${BaseUrl}/dashboard`);
      const responseData = response.data?.data || response.data || {};
      return {
        ...DEFAULT_DASHBOARD_DATA,
        ...responseData,
        pendingEmployeesList: responseData.pendingEmployeesList || [],
        pendingEducationExperienceList: responseData.pendingEducationExperienceList || [],
        employeesByDepartment: responseData.employeesByDepartment || {},
        employeesByPosition: responseData.employeesByPosition || {},
        employeesByStatus: responseData.employeesByStatus || {},
      };
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      return { ...DEFAULT_DASHBOARD_DATA };
    }
  },

  // ✅ Get Recent Activities
  getRecentActivities: async (limit: number = 10): Promise<ActivityItem[]> => {
    try {
      const response = await api.get(`${DashboardBaseUrl}/activities?limit=${limit}`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('⚠️ Activities endpoint not implemented yet');
        return [];
      }
      console.error('Failed to fetch recent activities:', error);
      return [];
    }
  },

  // ✅ Get Upcoming Events
  getUpcomingEvents: async (): Promise<EventItem[]> => {
    try {
      const response = await api.get(`${DashboardBaseUrl}/events/upcoming`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        console.warn('⚠️ Events endpoint not implemented yet');
        return [];
      }
      console.error('Failed to fetch upcoming events:', error);
      return [];
    }
  },

  // ✅ Get Pending Leave Requests
  getPendingLeaveRequests: async (): Promise<any[]> => {
    try {
      const response = await api.get(`${LeaveBaseUrl}/dashboard/pending?limit=100`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch pending leave requests:', error);
      return [];
    }
  },

  // ✅ Get Leave Statistics - Uses the existing endpoint
  getLeaveStatistics: async (): Promise<any> => {
    try {
      const response = await api.get(`${LeaveBaseUrl}/dashboard/statistics`);
      const data = response.data?.data || response.data || {};

      return data;
    } catch (error) {
      console.error('Failed to fetch leave statistics:', error);
      return { pending: 0, approved: 0, rejected: 0, cancelled: 0, total: 0 };
    }
  },

  // ✅ Get On Leave Employees
  getOnLeaveEmployees: async (): Promise<any[]> => {
    try {
      const response = await api.get(`${LeaveBaseUrl}/dashboard/on-leave`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch on-leave employees:', error);
      return [];
    }
  },

  // ✅ Get Employee Stats
  getEmpDbRepo: async (): Promise<EmpDbReport> => {
    try {
      const response = await api.get(`${BaseUrl}/EmpDbRepo`);
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('Failed to fetch employee stats:', error);
      return {} as EmpDbReport;
    }
  },

  // ✅ Get Pending Employees
  getPendEmpList: async (): Promise<EmpDbPendList[]> => {
    try {
      const response = await api.get(`${BaseUrl}/PendEmpList`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch pending employees:', error);
      return [];
    }
  },

  // ✅ Get Pending Education/Experience
  getPendEmpEduExp: async (): Promise<EmpExpEduPendList[]> => {
    try {
      const response = await api.get(`${BaseUrl}/PendEmpEduExp`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch pending education/experience:', error);
      return [];
    }
  },
};

// ============================================================
// ✅ EXPORT INDIVIDUAL FUNCTIONS FOR LEGACY SUPPORT
// ============================================================
export const getEmpDbRepo = dashboardApi.getEmpDbRepo;
export const getPendEmpList = dashboardApi.getPendEmpList;
export const getPendEmpEduExp = dashboardApi.getPendEmpEduExp;