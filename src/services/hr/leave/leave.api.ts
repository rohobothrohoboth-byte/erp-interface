import { api } from '../../api';
import type { LeaveRequestListDto, LeaveRequestAddDto, LeaveRequestModDto, UUID } from '../../../types/hr/leaverequest';

class LeaveApi {
  private baseUrl = `${import.meta.env.VITE_HRMM_LEAVE_URL || 'hrm/leave/v1'}/LeaveRequest`;

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      return (Object.values(errors).flat() as string[]).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  }

  async addLeaveRequest(leaveData: LeaveRequestAddDto): Promise<LeaveRequestListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddNewReq`, leaveData);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getMyLeaveRequests(): Promise<LeaveRequestListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/MyLeaveReq`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async getLeaveRequestById(id: UUID): Promise<LeaveRequestListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetLeaveReq/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async updateLeaveRequest(updateData: LeaveRequestModDto): Promise<LeaveRequestListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/UpdateLeaveReq/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  async deleteLeaveRequest(id: UUID): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/DeleteLeaveReq/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export const leaveApi = new LeaveApi();

export const leaveFetcher = {
  addLeaveRequest: (data: LeaveRequestAddDto) => leaveApi.addLeaveRequest(data),
  getMyLeaveRequests: () => leaveApi.getMyLeaveRequests(),
  getLeaveRequestById: (id: UUID) => leaveApi.getLeaveRequestById(id),
  updateLeaveRequest: (data: LeaveRequestModDto) => leaveApi.updateLeaveRequest(data),
  deleteLeaveRequest: (id: UUID) => leaveApi.deleteLeaveRequest(id),
};
