// src/services/hr/recruitment/interview/interview.api.ts

import axios from 'axios';

// ✅ Direct API client for Recruit service
const recruitApi = axios.create({
    baseURL: import.meta.env.VITE_RECRUIT_API_URL || 'https://localhost:1217',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
recruitApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor
recruitApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface CreateInterviewRequest {
    applicantId: string;
    jobPostingId: string;
    interviewType: string;
    scheduledDate: string;
    location?: string;
    meetingLink?: string;
    notes?: string;
    interviewerId?: string;
}

class InterviewApi {
    // ✅ Create interview
    async createInterview(data: CreateInterviewRequest): Promise<any> {
        if (!data.applicantId || data.applicantId === '' || data.applicantId === 'undefined' || data.applicantId === 'null') {
            throw new Error('Applicant ID is required');
        }
        if (!data.jobPostingId || data.jobPostingId === '' || data.jobPostingId === 'undefined' || data.jobPostingId === 'null') {
            throw new Error('Job Posting ID is required');
        }

        const payload: any = {
            applicantId: data.applicantId.trim(),
            jobPostingId: data.jobPostingId.trim(),
            interviewType: data.interviewType,
            scheduledDate: data.scheduledDate,
        };

        if (data.location && data.location.trim() !== '') {
            payload.location = data.location.trim();
        }
        if (data.meetingLink && data.meetingLink.trim() !== '') {
            payload.meetingLink = data.meetingLink.trim();
        }
        if (data.notes && data.notes.trim() !== '') {
            payload.notes = data.notes.trim();
        }
        if (data.interviewerId && data.interviewerId.trim() !== '') {
            payload.interviewerId = data.interviewerId.trim();
        }

        console.log('Creating interview with payload:', payload);

        const response = await recruitApi.post('/api/hrm/recruit/v1/Interview/Add', payload);
        return response.data;
    }

    // ✅ Get all interviews
    async getAllInterviews(): Promise<any[]> {
        const response = await recruitApi.get('/api/hrm/recruit/v1/Interview/All');
        return response.data?.data || [];
    }

    // ✅ Get interviews by applicant
    async getInterviewsByApplicant(applicantId: string): Promise<any[]> {
        const response = await recruitApi.get(`/api/hrm/recruit/v1/Interview/ByApplicant/${applicantId}`);
        return response.data?.data || [];
    }

    // ✅ Get interviews by job posting
    async getInterviewsByJobPosting(jobPostingId: string): Promise<any[]> {
        const response = await recruitApi.get(`/api/hrm/recruit/v1/Interview/ByJobPosting/${jobPostingId}`);
        return response.data?.data || [];
    }

    // ✅ Get interview by ID
    async getInterview(id: string): Promise<any> {
        const response = await recruitApi.get(`/api/hrm/recruit/v1/Interview/GetInterview/${id}`);
        return response.data?.data;
    }

    // ✅ Update interview
    async updateInterview(id: string, data: any): Promise<any> {
        const response = await recruitApi.put(`/api/hrm/recruit/v1/Interview/Mod/${id}`, data);
        return response.data;
    }

    // ✅ Delete interview
    async deleteInterview(id: string): Promise<any> {
        const response = await recruitApi.delete(`/api/hrm/recruit/v1/Interview/Del/${id}`);
        return response.data;
    }

    // ✅ Cancel interview
    async cancelInterview(id: string): Promise<any> {
        return this.updateInterview(id, { status: 'Cancelled' });
    }

    // ✅ Reschedule interview
    async rescheduleInterview(id: string, data: any): Promise<any> {
        return this.updateInterview(id, { ...data, status: 'Rescheduled' });
    }

    // ✅ Complete interview
    async completeInterview(id: string, feedback?: string, score?: number): Promise<any> {
        return this.updateInterview(id, {
            status: 'Completed',
            feedback,
            score
        });
    }
}

export const interviewApi = new InterviewApi();