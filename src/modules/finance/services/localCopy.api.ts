// src/services/finance/localCopy.api.ts
import axios from 'axios';
import { getAccessToken } from '@/modules/auth/utils/auth.utils';

// Create a dedicated finance API client that goes directly to port 8878
const financeApi = axios.create({
    baseURL: 'https://localhost:8878/api/finance/v1.0',
    timeout: 30000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for finance API
financeApi.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[Finance API] ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
});

// Response interceptor for finance API
financeApi.interceptors.response.use(
    (response) => {
        console.log(`[Finance API Response] ${response.config.url}`, response.status);
        return response;
    },
    (error) => {
        console.error('[Finance API Error]', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export const getCompanies = (params?: { isActive?: boolean }) => {
    return financeApi.get('/LocalCopy/Companies', { params });
};

export const getCompanyById = (id: string) => {
    return financeApi.get(`/LocalCopy/Company/${id}`);
};

export const getBranches = (params?: { isActive?: boolean; companyId?: string }) => {
    return financeApi.get('/LocalCopy/Branches', { params });
};

export const getBranchById = (id: string) => {
    return financeApi.get(`/LocalCopy/Branch/${id}`);
};

export const getDepartments = async (params?: { isActive?: boolean; branchId?: string }) => {
    console.log('📤 Calling getDepartments with params:', params);
    try {
        const response = await financeApi.get('/LocalCopy/Departments', { params });
        console.log('📥 getDepartments response:', response);
        return response.data;
    } catch (error) {
        console.error('❌ Error in getDepartments:', error);
        throw error;
    }
};

// Add the missing exports
export const getDepartmentsFullUrl = async (params?: { isActive?: boolean; branchId?: string }) => {
    console.log('📤 Calling getDepartmentsFullUrl with params:', params);
    try {
        const response = await financeApi.get('/LocalCopy/Departments', { params });
        console.log('📥 getDepartmentsFullUrl response:', response);
        return response.data;
    } catch (error) {
        console.error('❌ Error in getDepartmentsFullUrl:', error);
        throw error;
    }
};

export const getDepartmentsNoSlash = async (params?: { isActive?: boolean; branchId?: string }) => {
    console.log('📤 Calling getDepartmentsNoSlash with params:', params);
    try {
        // This is the same as getDepartments since we're already using the correct path
        const response = await financeApi.get('LocalCopy/Departments', { params });
        console.log('📥 getDepartmentsNoSlash response:', response);
        return response.data;
    } catch (error) {
        console.error('❌ Error in getDepartmentsNoSlash:', error);
        throw error;
    }
};

export const getDepartmentById = (id: string) => {
    return financeApi.get(`/LocalCopy/Department/${id}`);
};

export const getEmployees = (params?: { isActive?: boolean; departmentId?: string; position?: string }) => {
    return financeApi.get('/LocalCopy/Employees', { params });
};

export const getEmployeeById = (id: string) => {
    return financeApi.get(`/LocalCopy/Employee/${id}`);
};