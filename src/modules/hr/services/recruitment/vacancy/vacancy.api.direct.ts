// src/services/hr/recruitment/vacancy/vacancy.api.direct.ts

import axios from 'axios';

// Direct API client for Recruit service (bypasses gateway)
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

export interface VacancyListItem {
    id: string;
    postNumber: string;
    position: string;
    department: string;
    location: string;
    empNatureStr: string;
    datePosted: string;
    deadline: string;
    numOpen: number;
    preGenderStr?: string;
    jobGrade?: string;
    status: string;
    isInternal: boolean;
}

export interface VacancyDetail {
    id: string;
    postNumber: string;
    position: string;
    department: string;
    departmentId: string;
    location: string;
    empNatureStr: string;
    datePosted: string;
    deadline: string;
    jobDesc: string;
    reqQual: string[];
    keyRespo: string[];
    keySkills: string[];
    salary?: string;
    numOpen: number;
    applicants: number;
    preGenderStr?: string;
    jobGrade?: string;
    workArrStr?: string;
    status: string;
    isInternal: boolean;
}

export interface CreateApplicationRequest {
    jobPostingId: string;
    coverLetter: string;
    file?: File | null;
}

class VacancyDirectApi {
    async getPublishedVacancies(): Promise<VacancyListItem[]> {
        const response = await recruitApi.get('/api/hrm/recruit/v1/Vacancy/PublishedVacancy');
        return response.data?.data || [];
    }

    async getExternalVacancies(): Promise<VacancyListItem[]> {
        const response = await recruitApi.get('/api/hrm/recruit/v1/Vacancy/ExternalVacancy');
        return response.data?.data || [];
    }

    async getInternalVacancies(): Promise<VacancyListItem[]> {
        const response = await recruitApi.get('/api/hrm/recruit/v1/Vacancy/InternalVacancy');
        return response.data?.data || [];
    }

    async getVacancyDetail(id: string): Promise<VacancyDetail> {
        const response = await recruitApi.get(`/api/hrm/recruit/v1/Vacancy/GetVacancy/${id}`);
        return response.data?.data;
    }

    async applyForVacancy(data: CreateApplicationRequest): Promise<any> {
        const formData = new FormData();
        formData.append('jobPostingId', data.jobPostingId);
        formData.append('coverLetter', data.coverLetter);
        if (data.file) {
            formData.append('file', data.file);
        }

        const response = await recruitApi.post(
            '/api/hrm/recruit/v1/JobApplication/Apply',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    async hasApplied(vacancyId: string): Promise<boolean> {
        try {
            const response = await recruitApi.get(
                `/api/hrm/recruit/v1/JobApplication/HasApplied/${vacancyId}`
            );
            return response.data?.data || false;
        } catch {
            return false;
        }
    }
}

export const vacancyDirectApi = new VacancyDirectApi();