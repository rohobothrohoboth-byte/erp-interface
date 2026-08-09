import { api } from "../../../../shared/services/api";
import type { HistLvReqList,MyHistLvList } from "../../../types/leaverequest";

class LeaveReqHistoryApi {
  private baseUrl = `${import.meta.env.VITE_HRMM_LEAVE_URL}/LvReqHist`;

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
