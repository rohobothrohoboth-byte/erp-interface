// services/hr/dashboard/pendingEmployee.api.ts
import { api } from '../../api';

export interface PendingEmployee {
    id: string;
    code: string;
    empFullName: string;
    empFullNameAm: string;
    gender: string;
    department: string;
    position: string;
    branch?: string;
    employmentDate?: string;
    pendingDays?: number;
}

export interface PendingStats {
    totalPending: number;
    awaitingReview: number;
    todayPending: number;
    averageWaitTime: number;
    departmentStats: Array<{ name: string; count: number; percentage: number }>;
    pendingTimeStats: {
        lessThan3Days: number;
        between3And7Days: number;
        moreThan7Days: number;
        percentages: {
            lessThan3Days: number;
            between3And7Days: number;
            moreThan7Days: number;
        };
    };
}

export const pendingEmployeeApi = {
    // ✅ Get paginated pending employees
    getPaginatedPending: async (params: {
        pageNumber: number;
        pageSize: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        searchTerm?: string;
        department?: string;
        branch?: string;
        gender?: string;
    }) => {
        const response = await api.get('/hrm/profile/v1/Employee/pending/paginated', { params });
        return response.data?.data || response.data || { items: [], totalCount: 0 };
    },

    // ✅ Get pending stats
    getPendingStats: async (): Promise<PendingStats | null> => {
        try {
            const response = await api.get('/hrm/profile/v1/Employee/pending/stats');
            return response.data?.data || response.data || null;
        } catch (error) {
            console.error('Failed to fetch pending stats:', error);
            return null;
        }
    },

    // ✅ Get pending count
    getPendingCount: async (): Promise<number> => {
        try {
            const stats = await pendingEmployeeApi.getPendingStats();
            return stats?.totalPending || 0;
        } catch (error) {
            console.error('Failed to fetch pending count:', error);
            return 0;
        }
    },

    // ✅ Review pending employee
    reviewPendingEmployee: async (employeeId: string, action: 'approve' | 'reject', comments?: string) => {
        const response = await api.post(`/hrm/profile/v1/Employee/pending/${employeeId}/review`, {
            action,
            comments
        });
        return response.data;
    },

    // ✅ Bulk review pending employees
    bulkReviewPendingEmployees: async (employeeIds: string[], action: 'approve' | 'reject', comments?: string) => {
        const response = await api.post('/hrm/profile/v1/Employee/pending/bulk-review', {
            employeeIds,
            action,
            comments
        });
        return response.data;
    },
};