// services/hr/leave/leaveRequest.api.ts
import { api } from "../../../../shared/services/api";
import type {
  LvRqstAddDto,
  LvRqstModDto,
  UUID,
  LvRqstRevDto,
  ViewLvReqDto,
} from "../../../types/leaverequest";

class LeaveReqApi {
  // ✅ FIXED: Use VITE_HRM_LEAVE_URL
  private baseUrl = `${import.meta.env.VITE_HRM_LEAVE_URL || '/hrm/leave/v1'}/Request`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(", ");
    }
    return error.message || "An unexpected error occurred";
  }

  async getLeaveRequestById(id: UUID): Promise<ViewLvReqDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetLeaveReq/${id}`);
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error('Failed to fetch leave request:', error);
      return null as any;
    }
  }

  async addLeaveRequest(leaveData: LvRqstAddDto): Promise<string> {
    try {
      const response = await api.post(`${this.baseUrl}/AddNewReq`, leaveData);
      return response.data?.message || 'Leave request created';
    } catch (error) {
      console.error('Failed to add leave request:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateLeaveRequest(updateData: LvRqstModDto): Promise<string> {
    try {
      const response = await api.put(
          `${this.baseUrl}/UpdateLeaveReq/${updateData.id}`,
          updateData,
      );
      return response.data?.message || 'Leave request updated';
    } catch (error) {
      console.error('Failed to update leave request:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteLeaveRequest(id: UUID): Promise<string> {
    try {
      const response = await api.delete(`${this.baseUrl}/DeleteLeaveReq/${id}`);
      return response.data?.message || 'Leave request deleted';
    } catch (error) {
      console.error('Failed to delete leave request:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async reviewLeaveRequest(reviewData: LvRqstRevDto): Promise<string> {
    try {
      const response = await api.put(
          `${this.baseUrl}/ReviewLeaveReq/${reviewData.id}`,
          reviewData,
      );
      return response.data?.data || 'Leave request reviewed';
    } catch (error) {
      console.error('Failed to review leave request:', error);
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const leaveReqApi = new LeaveReqApi();

export const leaveReqFetcher = {
  addLeaveRequest: (data: LvRqstAddDto) => leaveReqApi.addLeaveRequest(data),
  getLeaveRequestById: (id: UUID) => leaveReqApi.getLeaveRequestById(id),
  updateLeaveRequest: (data: LvRqstModDto) =>
      leaveReqApi.updateLeaveRequest(data),
  reviewLeaveRequest: (data: LvRqstRevDto) =>
      leaveReqApi.reviewLeaveRequest(data),
  deleteLeaveRequest: (id: UUID) => leaveReqApi.deleteLeaveRequest(id),
};