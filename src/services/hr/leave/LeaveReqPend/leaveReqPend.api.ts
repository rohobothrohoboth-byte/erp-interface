// services/hr/leave/LeaveReqPend/leaveReqPend.api.ts
import { api } from "../../../../shared/services/api";
import type { MyPendLvList, PendLvReqList } from "../../../types/leaverequest";

class LeaveReqPendApi {
  // ✅ FIXED: Use VITE_HRM_LEAVE_URL
  private baseUrl = `${import.meta.env.VITE_HRM_LEAVE_URL || '/hrm/leave/v1'}/LvReqPend`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(", ");
    }
    return error.message || "An unexpected error occurred";
  }

  async getMyPending(): Promise<MyPendLvList> {
    try {
      const response = await api.get(`${this.baseUrl}/MyPendReq`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch my pending leave requests:', error);
      return [] as any;
    }
  }

  async getDepartmentPending(): Promise<PendLvReqList[]> {
    try {
      const response = await api.get(`${this.baseUrl}/DeptPendReq`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch department pending leave requests:', error);
      return [];
    }
  }

  async getBranchPending(): Promise<PendLvReqList[]> {
    try {
      const response = await api.get(`${this.baseUrl}/BraPendReq`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch branch pending leave requests:', error);
      return [];
    }
  }

  async getAllPending(): Promise<PendLvReqList[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllPendReq`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch all pending leave requests:', error);
      return [];
    }
  }
}

export const leaveReqPendApi = new LeaveReqPendApi();

export const leaveReqPendFetcher = {
  getMyPending: () => leaveReqPendApi.getMyPending(),
  getDepartmentPending: () => leaveReqPendApi.getDepartmentPending(),
  getBranchPending: () => leaveReqPendApi.getBranchPending(),
  getAllPending: () => leaveReqPendApi.getAllPending(),
};