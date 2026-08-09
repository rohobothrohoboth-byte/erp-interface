// services/hr/leave/LeaveReqDb/leaveReqDb.api.ts
import { api } from "../../../../services/api";
import type { LeaveReqDbList } from "../../../../types/hr/leave/leaverequest";

class LeaveReqDbApi {
  // ✅ FIXED: Use VITE_HRM_LEAVE_URL (not VITE_HRMM_LEAVE_URL)
  private base = `${import.meta.env.VITE_HRM_LEAVE_URL || '/hrm/leave/v1'}/LeaveReqDb`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(", ");
    }
    return error.message || "An unexpected error occurred";
  }

  async getPendLeaveRequests(): Promise<LeaveReqDbList[]> {
    try {
      const response = await api.get(`${this.base}/PendList`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch pending leave requests:', error);
      return [];
    }
  }

  // ✅ Add method to get on-leave employees
  async getOnLeaveEmployees(): Promise<LeaveReqDbList[]> {
    try {
      const response = await api.get(`${this.base}/OnLeaveList`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch on-leave employees:', error);
      return [];
    }
  }
}

export const leaveReqDbApi = new LeaveReqDbApi();

export const leaveReqDbFetcher = {
  getPendLeaveRequests: () => leaveReqDbApi.getPendLeaveRequests(),
  getOnLeaveEmployees: () => leaveReqDbApi.getOnLeaveEmployees(),
};