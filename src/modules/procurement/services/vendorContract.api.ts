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

export interface VendorContract {
    id: string;
    vendorId: string;
    vendorName: string;
    vendorCode: string;
    contractNumber: string;
    title: string;
    type: 'Service' | 'Supply' | 'Maintenance' | 'Consulting';
    startDate: string;
    endDate: string;
    value: number;
    status: 'Active' | 'Expired' | 'Pending' | 'Terminated' | 'Renewal';
    autoRenew: boolean;
    renewalDate?: string;
    signedDate?: string;
    attachmentCount: number;
    terms: string[];
    notes?: string;
    dateAdd: string;
    dateMod?: string;
    rowVersion?: string;
}

export interface CreateVendorContractDto {
    vendorId: string;
    contractNumber: string;
    title: string;
    type: string;
    startDate: string;
    endDate: string;
    value: number;
    status: string;
    autoRenew: boolean;
    renewalDate?: string;
    signedDate?: string;
    terms: string[];
    notes?: string;
}

// Get all contracts
export const getVendorContracts = async (params?: {
    vendorId?: string;
    status?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
}): Promise<VendorContract[]> => {
    try {
        const response = await procurementApi.get(`/VendorContract`, { params });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching contracts:', error);
        throw error;
    }
};

// Get contract by ID
export const getVendorContractById = async (id: string): Promise<VendorContract> => {
    try {
        const response = await procurementApi.get(`/VendorContract/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching contract ${id}:`, error);
        throw error;
    }
};

// Get contracts by vendor
export const getVendorContractsByVendor = async (vendorId: string): Promise<VendorContract[]> => {
    try {
        const response = await procurementApi.get(`/VendorContract/by-vendor/${vendorId}`);
        return response?.data || [];
    } catch (error) {
        console.error(`❌ Error fetching contracts for vendor ${vendorId}:`, error);
        throw error;
    }
};

// Create contract
export const createVendorContract = async (data: CreateVendorContractDto): Promise<VendorContract> => {
    try {
        const response = await procurementApi.post(`/VendorContract`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error creating contract:', error);
        throw error;
    }
};

// Delete contract
export const deleteVendorContract = async (id: string): Promise<void> => {
    try {
        await procurementApi.delete(`/VendorContract/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting contract ${id}:`, error);
        throw error;
    }
};