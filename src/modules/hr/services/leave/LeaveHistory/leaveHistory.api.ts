import { api } from "@/shared/services/api";
import type { HistLvReqList, MyHistLvList } from "@/modules/hr/types/leave/leaverequest";

class LeaveReqHistoryApi {
  // NOTE: use VITE_HRM_LEAVE_URL (not the misspelled VITE_HRMM_LEAVE_URL, which is
  // undefined and produced requests to `undefined/LvReqHist/...`). Falls back to the
  // gateway-relative path so it works even without the env var set.
  private baseUrl = `${import.meta.env.VITE_HRM_LEAVE_URL || '/hrm/leave/v1'}/LvReqHist`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(", ");
    }

    return error.message || "An unexpected error occurred";
  }

  async getMyHistory(): Promise<MyHistLvList[]> {
    try {
      const response = await api.get(`${this.baseUrl}/MyReqHist`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getDepartmentHistory(): Promise<HistLvReqList[]> {
    try {
      const response = await api.get(`${this.baseUrl}/DeptReqHist`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getBranchHistory(): Promise<HistLvReqList[]> {
    try {
      const response = await api.get(`${this.baseUrl}/BraReqHist`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getAllHistory(): Promise<HistLvReqList[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllReqHist`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const leaveReqHistoryApi = new LeaveReqHistoryApi();

export const leaveReqHistoryFetcher = {
  getMyHistory: () => leaveReqHistoryApi.getMyHistory(),

  getDepartmentHistory: () => leaveReqHistoryApi.getDepartmentHistory(),

  getBranchHistory: () => leaveReqHistoryApi.getBranchHistory(),

  getAllHistory: () => leaveReqHistoryApi.getAllHistory(),
};
