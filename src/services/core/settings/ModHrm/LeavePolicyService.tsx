// services/core/settings/ModHrm/LeavePolicyService.tsx
import { api } from '../../../api';
import type {
  LeavePolicyListDto,
  LeavePolicyAddDto,
  LeavePolicyModDto,
  UUID
} from '../../../../types/core/Settings/leavepolicy';

class LeavePolicyService {
  private baseUrl = '/hrm/leave/v1/LeavePolicy';

// In your LeavePolicyService.ts
  async getAllLeavePolicies(): Promise<LeavePolicyListDto[]> {
    try {
      const response = await api.get('/hrm/leave/v1/LeavePolicy/AllLeavePolicy');
      console.log('API Response:', response);

      // Handle the response structure based on your API
      // From your logs, it looks like: { success: true, data: [...] }
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Error in getAllLeavePolicies:', error);
      return [];
    }
  }

  async getActiveLeavePolicies(): Promise<LeavePolicyListDto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/ActiveLeavePolicy`);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error fetching active leave policies:', error?.message || error);
      return [];
    }
  }
// EmpLeavePolicyService.ts

  async getLeavePolicyById(id: UUID): Promise<LeavePolicyListDto> {
    try {
      const response = await api.get(`${this.baseUrl}/GetLeavePolicy/${id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error(`Error fetching leave policy with id ${id}:`, error?.message || error);
      throw error;
    }
  }
  // Add this method to your emp.api.ts
  async getEmployeeCountByDepartment(departmentId: string): Promise<number> {
    try {
      // Use the paginated endpoint with pageSize=1 just to get the totalCount
      const response = await api.get(`/hrm/profile/v1/Employee/paginated`, {
        params: {
          pageNumber: 1,
          pageSize: 1,
          department: departmentId
        }
      });

      // The totalCount is in the response
      return response.data?.data?.totalCount || 0;
    } catch (error) {
      console.error('Error fetching employee count by department:', error);
      return 0;
    }
  }

// Or if you need counts for all departments at once
  async getEmployeeCountsByDepartments(): Promise<{ departmentId: string; count: number }[]> {
    try {
      // Fetch all departments first
      const departments = await this.getAllDepartments();

      // Then get counts for each department (you can do this in parallel)
      const counts = await Promise.all(
          departments.map(async (dept) => {
            const count = await this.getEmployeeCountByDepartment(dept.id);
            return { departmentId: dept.id, count };
          })
      );

      return counts;
    } catch (error) {
      console.error('Error fetching employee counts:', error);
      return [];
    }
  }

  async createLeavePolicy(data: LeavePolicyAddDto): Promise<LeavePolicyListDto> {
    try {
      const submitData = {
        code: data.code,
        name: data.name,
        allowEncashment: data.allowEncashment,
        requiresAttachment: data.requiresAttachment,
        leaveTypeId: data.leaveTypeId
      };

      console.log('Creating leave policy:', submitData);
      const response = await api.post(`${this.baseUrl}/AddLeavePolicy`, submitData);

      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Failed to create leave policy');
    } catch (error: any) {
      console.error('Error creating leave policy:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create leave policy');
    }
  }

  async updateLeavePolicy(data: LeavePolicyModDto): Promise<LeavePolicyListDto> {
    try {
      const submitData = {
        id: data.id,
        code: data.code,
        name: data.name,
        leaveTypeId: data.leaveTypeId,
        allowEncashment: data.allowEncashment,
        requiresAttachment: data.requiresAttachment,
        status: data.status,
        rowVersion: data.rowVersion
      };

      console.log('Updating leave policy:', submitData);
      const response = await api.put(`${this.baseUrl}/ModLeavePolicy/${data.id}`, submitData);

      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Failed to update leave policy');
    } catch (error: any) {
      console.error('Error updating leave policy:', error);

      // If the error is a concurrency error, provide a helpful message
      if (error.response?.data?.message?.includes("modified by another transaction")) {
        throw new Error('This policy was modified by another user. Please refresh and try again.');
      }

      throw new Error(error.response?.data?.message || error.message || 'Failed to update leave policy');
    }
  }

  async deleteLeavePolicy(id: UUID): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/DelLeavePolicy/${id}`);
    } catch (error: any) {
      console.error('Error deleting leave policy:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete leave policy');
    }
  }

  async assignPolicies(): Promise<string> {
    try {
      const response = await api.post(`${this.baseUrl}/AssignLeavePolicy`);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error assigning policies:', error);

      // Provide user-friendly error messages
      if (error.response?.data?.message?.includes("modified by another transaction")) {
        throw new Error('Unable to assign policies: The data has been modified. Please refresh the page and try again.');
      }

      if (error.response?.data?.message?.includes("Connection is not open")) {
        throw new Error('The assignment may have completed. Please refresh the page to confirm.');
      }

      throw new Error(error.response?.data?.message || error.message || 'Failed to assign policies');
    }
  }
}

export const leavePolicyService = new LeavePolicyService();