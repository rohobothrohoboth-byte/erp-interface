import axios from "axios";

const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const PROCUREMENT_PATH = '/procurement/v1.0';


export const procurementApi = axios.create({
    baseURL: `${API_BASE}${PROCUREMENT_PATH}`,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Add auth interceptor
procurementApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface EvaluationCriteria {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
}

export interface VendorEvaluation {
    id: string;
    vendorId: string;
    vendorName: string;
    vendorCode: string;
    overallScore: number;
    category: string;
    evaluationDate: string;
    evaluator: string;
    status: 'Excellent' | 'Good' | 'Average' | 'Poor';
    criteria: EvaluationCriteria[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    notes?: string;
    dateAdd: string;
    dateMod?: string;
}

export interface CreateVendorEvaluationDto {
    vendorId: string;
    category?: string;
    evaluationDate: string;
    evaluator?: string;
    criteria: EvaluationCriteria[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    notes?: string;
}

// Get all evaluations
export const getVendorEvaluations = async (params?: {
    vendorId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}): Promise<VendorEvaluation[]> => {
    try {
        const response = await procurementApi.get(`/VendorEvaluation`, { params });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching evaluations:', error);
        throw error;
    }
};

// Get evaluation by ID
export const getVendorEvaluationById = async (id: string): Promise<VendorEvaluation> => {
    try {
        const response = await procurementApi.get(`/VendorEvaluation/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching evaluation ${id}:`, error);
        throw error;
    }
};

// Get evaluations by vendor
export const getVendorEvaluationsByVendor = async (vendorId: string): Promise<VendorEvaluation[]> => {
    try {
        const response = await procurementApi.get(`/VendorEvaluation/by-vendor/${vendorId}`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching evaluations for vendor ${vendorId}:`, error);
        throw error;
    }
};

// Create evaluation
export const createVendorEvaluation = async (data: CreateVendorEvaluationDto): Promise<VendorEvaluation> => {
    try {
        const response = await procurementApi.post(`/VendorEvaluation`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error creating evaluation:', error);
        throw error;
    }
};

// Delete evaluation
export const deleteVendorEvaluation = async (id: string): Promise<void> => {
    try {
        await procurementApi.delete(`/VendorEvaluation/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting evaluation ${id}:`, error);
        throw error;
    }
};