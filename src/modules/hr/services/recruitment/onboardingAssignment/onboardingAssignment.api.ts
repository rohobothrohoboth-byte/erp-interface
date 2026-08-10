// src/services/hr/recruitment/onboardingAssignment/onboardingAssignment.api.ts

import { api } from '@/shared/services/api';
import type {
    OnboardingAssignmentListDto,
    OnboardingAssignmentAddDto,
    OnboardingAssignmentModDto
} from '@/modules/hr/types/recruit/onboardingAssignment';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/OnboardingAssignment`;

const extractError = (error: any): string => {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
        return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
    }
    return error.message || 'An unexpected error occurred';
};

const normalizeArray = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && raw.id) return [raw];
    return [];
};

export const onboardingAssignmentApi = {
    // Get all assignments
    getAll: async (): Promise<OnboardingAssignmentListDto[]> => {
        try {
            const res = await api.get(`${BASE}/All`);
            return normalizeArray(res.data?.data ?? res.data ?? []);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Get assignment by ID
    getById: async (id: string): Promise<OnboardingAssignmentListDto> => {
        try {
            const res = await api.get(`${BASE}/Get/${id}`);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Get assignments by employee
    getByEmployee: async (employeeId: string): Promise<OnboardingAssignmentListDto[]> => {
        try {
            const res = await api.get(`${BASE}/ByEmployee/${employeeId}`);
            return normalizeArray(res.data?.data ?? res.data ?? []);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Get assignments by task
    getByTask: async (taskId: string): Promise<OnboardingAssignmentListDto[]> => {
        try {
            const res = await api.get(`${BASE}/ByTask/${taskId}`);
            return normalizeArray(res.data?.data ?? res.data ?? []);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Create assignment
    create: async (data: OnboardingAssignmentAddDto): Promise<OnboardingAssignmentListDto> => {
        try {
            const res = await api.post(`${BASE}/Add`, data);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Update assignment
    update: async (data: OnboardingAssignmentModDto): Promise<OnboardingAssignmentListDto> => {
        try {
            const res = await api.put(`${BASE}/Mod/${data.id}`, data);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Delete assignment
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`${BASE}/Del/${id}`);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Update assignment status
    updateStatus: async (id: string, status: string): Promise<OnboardingAssignmentListDto> => {
        try {
            const res = await api.patch(`${BASE}/Status/${id}`, { status });
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },
};