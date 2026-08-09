// services/core/settings/ModHrm/EmpLeavePolicyService.ts
import { api } from '../../../api';

class EmpLeavePolicyService {
    private baseUrl = '/hrm/leave/v1/EmpLeavePolicy';

    async bulkAssign(data: any): Promise<any> {
        try {
            const response = await api.post(`${this.baseUrl}/BulkAssign`, data);
            return response.data?.data;
        } catch (error) {
            console.error('Error bulk assigning leave policy:', error);
            throw error;
        }
    }

    async bulkAssignWithFallback(data: any): Promise<any> {
        try {
            // Try bulk assign first
            return await this.bulkAssign(data);
        } catch (error: any) {
            // If bulk fails due to duplicates, try individual assignments
            const errorMessage = error?.response?.data?.message || '';

            if (errorMessage.includes('already being tracked') || errorMessage.includes('duplicate')) {
                console.log('Bulk assignment failed due to duplicates, trying individual assignments...');

                const results = {
                    successful: [] as string[],
                    failed: [] as { id: string; error: string }[]
                };

                // Try each employee individually
                for (const employeeId of data.employeeIds) {
                    try {
                        const individualPayload = {
                            ...data,
                            employeeIds: [employeeId]
                        };
                        await this.bulkAssign(individualPayload);
                        results.successful.push(employeeId);
                    } catch (individualError: any) {
                        results.failed.push({
                            id: employeeId,
                            error: individualError?.response?.data?.message || 'Unknown error'
                        });
                    }
                }

                return {
                    success: results.successful.length > 0,
                    results,
                    message: `Successfully assigned to ${results.successful.length} out of ${data.employeeIds.length} employees`
                };
            }

            throw error;
        }
    }

    async assignToEmployee(data: any): Promise<any> {
        try {
            const response = await api.post(`${this.baseUrl}/Assign`, data);
            return response.data?.data;
        } catch (error) {
            console.error('Error assigning leave policy:', error);
            throw error;
        }
    }

    async getByEmployee(employeeId: string): Promise<any[]> {
        try {
            const response = await api.get(`${this.baseUrl}/ByEmployee/${employeeId}`);
            return response.data?.data || [];
        } catch (error) {
            console.error('Error fetching employee leave policies:', error);
            return [];
        }
    }

    async getEmployeesByLeaveType(leaveTypeId: string): Promise<string[]> {
        try {
            // This endpoint might not exist yet, but you could ask backend to add it
            const response = await api.get(`${this.baseUrl}/ByLeaveType/${leaveTypeId}`);
            return response.data?.data?.map((item: any) => item.employeeId) || [];
        } catch (error) {
            console.error('Error fetching employees by leave type:', error);
            return [];
        }
    }
}

export const empLeavePolicyService = new EmpLeavePolicyService();