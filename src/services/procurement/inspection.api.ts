// src/services/procurement/inspection.api.ts

import axios from "axios";
import type{ InspectionResult, InspectionFormData } from '../../types/procurement/inspection.types';


const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const PROCUREMENT_PATH = '/procurement/v1.0';


export const procurementApi = axios.create({
    baseURL: `${API_BASE}${PROCUREMENT_PATH}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

procurementApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Get all inspections
export const getInspections = async (params?: {
    status?: string;
    inspectorId?: string;
    fromDate?: string;
    toDate?: string;
}): Promise<InspectionResult[]> => {
    try {
        const response = await procurementApi.get(`/Inspection`, { params });
        return response?.data?.data || response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching inspections:', error);
        throw error;
    }
};

// ✅ Get inspection by ID
export const getInspectionById = async (id: string): Promise<InspectionResult> => {
    try {
        const response = await procurementApi.get(`/Inspection/${id}`);
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error(`❌ Error fetching inspection ${id}:`, error);
        throw error;
    }
};

// ✅ Start inspection (assign inspector)
export const startInspection = async (grnId: string, inspectorId: string, inspectorName: string): Promise<InspectionResult> => {
    try {
        const response = await procurementApi.post(`/Inspection/start`, {
            grnId,
            inspectorId,
            inspectorName
        });
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error('❌ Error starting inspection:', error);
        throw error;
    }
};

// ✅ Complete inspection (submit results)
export const completeInspection = async (data: InspectionFormData): Promise<InspectionResult> => {
    try {
        const response = await procurementApi.post(`/Inspection/complete`, data);
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error('❌ Error completing inspection:', error);
        throw error;
    }
};

// ✅ Update inspection item
export const updateInspectionItem = async (
    inspectionId: string,
    itemId: string,
    data: {
        quantityAccepted: number;
        quantityRejected: number;
        condition: 'Good' | 'Damaged' | 'Partial';
        rejectionReason?: string;
    }
): Promise<InspectionResult> => {
    try {
        const response = await procurementApi.put(`/Inspection/${inspectionId}/item/${itemId}`, data);
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error('❌ Error updating inspection item:', error);
        throw error;
    }
};