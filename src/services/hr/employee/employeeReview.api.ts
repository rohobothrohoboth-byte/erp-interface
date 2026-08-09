// services/hr/employee/employeeReview.api.ts
import { api } from '../../api';

export const employeeReviewApi = {
    // Update employee status using POST method (works through gateway)
    updateEmployeeStatus: async (employeeId: string, status: string) => {
        try {
            console.log('Updating employee status:', { employeeId, status });

            // Use POST instead of PATCH
            const response = await api.post(`/hrm/profile/v1/Employee/UpdateEmployeeStatus/${employeeId}`, {
                empState: status
            });

            console.log('Update status response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error updating employee status:', error);
            if (error.response?.data?.message) {
                console.error('Error message:', error.response.data.message);
            }
            throw error;
        }
    },

    // Review employee (approve/reject)
    reviewEmployee: async (employeeId: string, decision: 'Accept' | 'Reject', remarks?: string) => {
        const status = decision === 'Accept' ? 'Active' : 'Rejected';
        const result = await employeeReviewApi.updateEmployeeStatus(employeeId, status);

        if (remarks) {
            console.log('Remarks for employee', employeeId, ':', remarks);
        }

        return result;
    }
};