// services/procurement/purchaseOrder.api.ts
import type { PurchaseOrder, PurchaseOrderFormData, PurchaseOrderFilters, PurchaseOrderSummary } from '../../types/procurement/purchaseOrder.types';
import axios from "axios";

// ============================================================
// PURCHASE ORDER API
// ============================================================
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
/**
 * Get all purchase orders with pagination and filtering
 */
export const getPurchaseOrders = (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    vendorId?: string;
    periodId?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: string;
}) => {
    return procurementApi.get('/PurchaseOrder/All', { params });
};

/**
 * Get purchase order by ID
 */
export const getPurchaseOrderById = (id: string) => {
    return procurementApi.get(`/PurchaseOrder/${id}`);
};

/**
 * Get purchase order by number
 */
export const getPurchaseOrderByNumber = (number: string) => {
    return procurementApi.get(`/PurchaseOrder/ByNumber/${number}`);
};

/**
 * Get purchase orders by vendor
 */
export const getPurchaseOrdersByVendor = (vendorId: string) => {
    return procurementApi.get(`/PurchaseOrder/ByVendor/${vendorId}`);
};

/**
 * Get purchase orders by period
 */
export const getPurchaseOrdersByPeriod = (periodId: string) => {
    return procurementApi.get(`/PurchaseOrder/ByPeriod/${periodId}`);
};

/**
 * Get purchase order summary
 */
export const getPurchaseOrderSummary = (params?: {
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return procurementApi.get('/PurchaseOrder/Summary', { params });
};

/**
 * Create a new purchase order
 */
export const createPurchaseOrder = (data: {
    purchaseOrderNumber: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    vendorId?: string;
    vendorName?: string;
    description?: string;
    totalAmount: number;
    status?: string;
    currency?: string;
    paymentTerms?: string;
    shippingAddress?: string;
    requisitionId?: string;
    requisitionNumber?: string;
    periodId?: string;
    createdByUserId?: string;
    createdByUserName?: string;
    lines: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        discount?: number;
        taxRate?: number;
        taxAmount?: number;
        unitOfMeasure?: string;
        requisitionLineId?: string;
        periodId?: string;
    }>;
}) => {
    return procurementApi.post('/PurchaseOrder', data);
};

/**
 * Update a purchase order
 */
export const updatePurchaseOrder = (data: {
    id: string;
    purchaseOrderNumber: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    vendorId?: string;
    vendorName?: string;
    description?: string;
    totalAmount: number;
    status?: string;
    currency?: string;
    paymentTerms?: string;
    shippingAddress?: string;
    requisitionId?: string;
    requisitionNumber?: string;
    periodId?: string;
    rowVersion?: string;
    updatedByUserId?: string;
    updatedByUserName?: string;
    lines: Array<{
        id?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        discount?: number;
        taxRate?: number;
        taxAmount?: number;
        unitOfMeasure?: string;
        requisitionLineId?: string;
        periodId?: string;
    }>;
}) => {
    return procurementApi.put('/PurchaseOrder', data);
};

/**
 * Update purchase order status
 */
export const updatePurchaseOrderStatus = (id: string, data: {
    status: string;
    notes?: string;
}) => {
    return procurementApi.patch(`/PurchaseOrder/${id}/status`, data);
};

/**
 * Receive purchase order
 */
export const receivePurchaseOrder = (id: string, data: {
    receivedDate?: string;
    receivedBy?: string;
}) => {
    return procurementApi.post(`/PurchaseOrder/${id}/receive`, data);
};

/**
 * Delete a purchase order
 */
export const deletePurchaseOrder = (id: string) => {
    return procurementApi.delete(`/PurchaseOrder/${id}`);
};

/**
 * Export purchase orders
 */
export const exportPurchaseOrders = (params: {
    periodId?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
    format?: 'csv' | 'json';
}) => {
    return procurementApi.get('/PurchaseOrder/Export', {
        params,
        responseType: 'blob'
    });
};