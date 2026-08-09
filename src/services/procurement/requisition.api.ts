// services/procurement/requisition.api.ts


import type { RequisitionFormData } from '../../types/procurement/requisition.types';
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
export const submitRequisition = (id: string) => {
    return procurementApi.patch(`/Requisition/${id}/submit`);
};
export const createRequisition = (data: any) => {
    return procurementApi.post('/Requisition', data);
};

export const getRequisitions = (params?: any) => {
    return procurementApi.get('/Requisition/All', { params });
};
export const createPurchaseOrderFromRequisition = (id: string) => {
    return procurementApi.post(`/Requisition/${id}/create-po`);
};
export const getRequisitionById = (id: string) => {
    return procurementApi.get(`/Requisition/${id}`);
};

export const updateRequisition = (data: any) => {
    return procurementApi.put('/Requisition', data);
};

export const deleteRequisition = (id: string) => {
    return procurementApi.delete(`/Requisition/${id}`);
};

export const approveRequisition = (id: string, data?: any) => {
    return procurementApi.post(`/Requisition/${id}/approve`, data || {});
};

export const rejectRequisition = (id: string, data: { reason: string }) => {
    return procurementApi.post(`/Requisition/${id}/reject`, data);
};