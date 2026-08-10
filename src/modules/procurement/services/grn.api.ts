
import type { GoodsReceiptNote ,GoodsReceiptItem ,CreateGoodsReceiptNoteDto ,CreateGoodsReceiptItemDto,Warehouse } from '@/modules/procurement/types/goodsReceiptNote.types';
import axios from "axios";

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
// Get all GRNs
/*export const getGoodsReceiptNotes = async (params?: {
    status?: string;
    purchaseOrderId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    const response = await procurementApi.get('/GoodsReceiptNote', { params });
    return response.data;
};*/


// src/services/procurement/grn.api.ts

// ✅ Get all GRNs
export const getGoodsReceiptNotes = async (params?: {
    status?: string;
    purchaseOrderId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: string;
}): Promise<GoodsReceiptNote[]> => {
    try {
        const response = await procurementApi.get(`/GoodsReceiptNote`, { params });

        // ✅ Handle both response formats
        // Format 1: { data: [...], totalCount: 10, totalPages: 2 }
        // Format 2: directly an array [...]
        const responseData = response?.data;

        if (Array.isArray(responseData)) {
            // Direct array response
            return responseData;
        }

        if (responseData?.data && Array.isArray(responseData.data)) {
            // Paginated response with data property
            return responseData.data;
        }

        return [];
    } catch (error) {
        console.error('❌ Error fetching GRNs:', error);
        throw error;
    }
};


export const getWarehouses = async (): Promise<Warehouse[]> => {
    try {
        const response = await procurementApi.get(`/Warehouse`);
        const data = response?.data?.data || response?.data || [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('❌ Error fetching warehouses from Procurement:', error);
        throw error;
    }
};

// ✅ Get active warehouses only
export const getActiveWarehouses = async (): Promise<Warehouse[]> => {
    const warehouses = await getWarehouses();
    return warehouses.filter(w => w.isActive);
};

// ✅ Get warehouse by ID
export const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
    try {
        const response = await procurementApi.get(`/Warehouse/${id}`);
        return response?.data?.data || response?.data || null;
    } catch (error) {
        console.error(`❌ Error fetching warehouse ${id}:`, error);
        throw error;
    }
};

// ✅ Get warehouse options for dropdowns
export const getWarehouseOptions = async () => {
    const warehouses = await getActiveWarehouses();
    return warehouses.map(w => ({
        value: w.id,
        label: `${w.code} - ${w.name}`,
        warehouse: w
    }));
};


// Get GRN by ID
export const getGoodsReceiptNoteById = async (id: string) => {
    const response = await procurementApi.get(`/GoodsReceiptNote/${id}`);
    return response.data;
};

// Get GRNs by Purchase Order
export const getGoodsReceiptNotesByPO = async (purchaseOrderId: string) => {
    const response = await procurementApi.get(`/GoodsReceiptNote/by-po/${purchaseOrderId}`);
    return response.data;
};

// Create GRN
export const createGoodsReceiptNote = async (data: CreateGoodsReceiptNoteDto): Promise<GoodsReceiptNote> => {
    try {
        // ✅ Validate required fields
        if (!data.purchaseOrderId) {
            throw new Error('Purchase Order ID is required');
        }
        if (!data.warehouseId) {
            throw new Error('Warehouse ID is required');
        }
        if (!data.receivedBy) {
            throw new Error('Received By is required');
        }
        if (!data.items || data.items.length === 0) {
            throw new Error('At least one item is required');
        }

        // ✅ Validate items
        data.items.forEach((item, index) => {
            if (!item.purchaseOrderItemId) {
                throw new Error(`Item ${index + 1}: Purchase Order Item ID is required`);
            }
            if (item.quantityReceived <= 0) {
                throw new Error(`Item ${index + 1}: Quantity Received must be greater than 0`);
            }
            if (item.quantityRejected > 0 && !item.rejectionReason) {
                throw new Error(`Item ${index + 1}: Rejection Reason is required when items are rejected`);
            }
        });

        // ✅ Ensure numeric values are numbers
        const payload = {
            ...data,
            items: data.items.map(item => ({
                ...item,
                quantityReceived: Number(item.quantityReceived),
                quantityAccepted: Number(item.quantityAccepted),
                quantityRejected: Number(item.quantityRejected),
                unitPrice: Number(item.unitPrice) || 0
            }))
        };

        console.log('📤 Sending GRN payload:', JSON.stringify(payload, null, 2));

        const response = await procurementApi.post(`/GoodsReceiptNote`, payload);
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error('❌ Error creating GRN:', error);
        throw error;
    }
};

// Update GRN
export const updateGoodsReceiptNote = async (data: any) => {
    const response = await procurementApi.put('/GoodsReceiptNote', data);
    return response.data;
};

// Delete GRN
export const deleteGoodsReceiptNote = async (id: string) => {
    const response = await procurementApi.delete(`/GoodsReceiptNote/${id}`);
    return response.data;
};

// Complete GRN
export const completeGoodsReceiptNote = async (id: string) => {
    const response = await procurementApi.patch(`/GoodsReceiptNote/${id}/complete`);
    return response.data;
};