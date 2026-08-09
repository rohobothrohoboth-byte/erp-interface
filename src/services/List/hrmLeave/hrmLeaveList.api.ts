import { api } from '../../api';
import type { ListItem } from '../../../types/List/list';

class HrmLeaveListApi {
  // Use the NameListController endpoints
  private baseUrl = '/hrm/leave/v1/Names';

  async getAllLeaveTypes(): Promise<ListItem[]> {
    try {
      // From NameListController - GET /Names/LeaveTypes
      const response = await api.get(`${this.baseUrl}/LeaveTypes`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching leave types:', error);
      return [];
    }
  }

  async getAllLeavePolicies(): Promise<ListItem[]> {
    try {
      // From NameListController - GET /Names/LeavePolicies
      const response = await api.get(`${this.baseUrl}/LeavePolicies`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching leave policies:', error);
      return [];
    }
  }
}

export const hrmLeaveListApi = new HrmLeaveListApi();