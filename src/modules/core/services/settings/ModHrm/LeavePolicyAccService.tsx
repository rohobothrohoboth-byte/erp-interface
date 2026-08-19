import { api } from '@/shared/services/api';
import type {
  LeavePolicyAccrualListDto,
  LeavePolicyAccrualAddDto,
  LeavePolicyAccrualModDto,
  UUID
} from '@/modules/core/types/Settings/leavepolicyaccrual';

class LeavePolicyAccrualService {
  // private baseUrl = `${import.meta.env.VITE_HRMM_MODULE_URL}/LeavePolicyAcc`;
  private baseUrl = `${import.meta.env.VITE_HRMM_LEAVE_URL || 'hrm/leave/v1'}/LeavePolicyAcc`;

  // Helper method to extract error messages
  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      // Handle validation errors (object with field names as keys)
      const errors = error.response.data.errors;
      const errorMessages = Object.values(errors).flat();
      return errorMessages.join(', ');
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // GET: /AllLeavePolicyAccrual
  async getAllLeavePolicyAccruals(): Promise<LeavePolicyAccrualListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/AllLeavePolicyAcc`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching leave policy accruals:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // NEW METHOD: GET all accruals for a specific policy
  async getLeavePolicyAccrualsByPolicyId(policyId: UUID): Promise<LeavePolicyAccrualListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/PolicyLeaveAcc/${policyId}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching leave policy accruals by policy Id:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // GET: /GetLeavePolicyAccrual/{id}
  async getLeavePolicyAccrualById(id: UUID): Promise<LeavePolicyAccrualListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetLeavePolicyAcc/${id}`);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error fetching leave policy accrual:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // POST: /AddLeavePolicyAccrual
  async createLeavePolicyAccrual(leavePolicyAccrual: LeavePolicyAccrualAddDto): Promise<LeavePolicyAccrualListDto> {
    try {
      const response = await api.post(`${this.baseUrl}/AddLeavePolicyAcc`, leavePolicyAccrual);
      console.info('Leave policy accrual created successfully:', response.data.data.id);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error creating leave policy accrual:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // PUT: /ModLeavePolicyAccrual/{id}
  async updateLeavePolicyAccrual(updateData: LeavePolicyAccrualModDto): Promise<LeavePolicyAccrualListDto> {
    try {
      const response = await api.put(`${this.baseUrl}/ModLeavePolicyAcc/${updateData.id}`, updateData);
      return response.data.data;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error updating leave policy accrual:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // DELETE: /DelLeavePolicyAccrual/{id}
  async deleteLeavePolicyAccrual(id: UUID): Promise<void> {
    try {
      const response = await api.delete(`${this.baseUrl}/DelLeavePolicyAcc/${id}`);
      console.info('Leave policy accrual deleted successfully:', response.data.message);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Error deleting leave policy accrual:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

export const leavePolicyAccrualService = new LeavePolicyAccrualService();