// src/services/hr/recruitment/onboardingTask/onboardingTask.api.ts

import { api } from '../../../api';
import type {
    OnboardingTaskListDto,
    OnboardingTaskAddDto,
    OnboardingTaskModDto
} from '../../../../types/hr/recruit/onboardingTask';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/OnboardingTask`;

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

export const onboardingTaskApi = {
    // GET all tasks
    getAll: async (): Promise<OnboardingTaskListDto[]> => {
        try {
            const res = await api.get(`${BASE}/All`);
            return normalizeArray(res.data?.data ?? res.data ?? []);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // GET tasks by plan
    getByPlan: async (planId: string): Promise<OnboardingTaskListDto[]> => {
        try {
            const res = await api.get(`${BASE}/ByPlan/${planId}`);
            return normalizeArray(res.data?.data ?? res.data ?? []);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // GET single task
    getById: async (id: string): Promise<OnboardingTaskListDto> => {
        try {
            const res = await api.get(`${BASE}/Get/${id}`);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // POST create task
    create: async (data: OnboardingTaskAddDto): Promise<OnboardingTaskListDto> => {
        try {
            const res = await api.post(`${BASE}/Add`, data);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // PUT update task
    update: async (data: OnboardingTaskModDto): Promise<OnboardingTaskListDto> => {
        try {
            const res = await api.put(`${BASE}/Mod/${data.id}`, data);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // DELETE task
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`${BASE}/Del/${id}`);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // ✅ ADD THIS - Update task status
    updateStatus: async (id: string, status: string): Promise<OnboardingTaskListDto> => {
        try {
            const res = await api.patch(`${BASE}/Status/${id}`, { status });
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },
};