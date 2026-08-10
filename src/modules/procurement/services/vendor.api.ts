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

export interface ContactPerson {
    name?: string;
    phone?: string;
    email?: string;
    position?: string;
}

export interface Vendor {
    id: string;
    code: string;
    name: string;
    nameAm?: string;
    description?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    vendorType: string;
    status: string;
    paymentTerms?: string;
    currency?: string;
    bankName?: string;
    bankAccount?: string;
    website?: string;
    contactPerson?: ContactPerson;
    rating?: number;
    totalSpent?: number;
    totalTransactions?: number;
    isActive: boolean;
    syncedAt?: string;
    sourceId?: string;
    isLocalOnly: boolean;
    dateAdd: string;
    dateMod?: string;
}

export interface CreateVendorDto {
    code: string;
    name: string;
    nameAm?: string;
    description?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    vendorType: string;
    status: string;
    paymentTerms?: string;
    currency?: string;
    bankName?: string;
    bankAccount?: string;
    website?: string;
    contactPerson?: ContactPerson;
    isActive: boolean;
}

export interface UpdateVendorDto {
    id: string;
    code: string;
    name: string;
    nameAm?: string;
    description?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    vendorType: string;
    status: string;
    paymentTerms?: string;
    currency?: string;
    bankName?: string;
    bankAccount?: string;
    website?: string;
    contactPerson?: ContactPerson;
    isActive?: boolean;
    rowVersion?: string;
}

// Get all vendors
export const getVendors = async (params?: {
    status?: string;
    vendorType?: string;
    searchTerm?: string;
}): Promise<Vendor[]> => {
    try {
        const response = await procurementApi.get(`/Vendor`, { params });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching vendors:', error);
        throw error;
    }
};

// Get vendor by ID
export const getVendorById = async (id: string): Promise<Vendor> => {
    try {
        const response = await procurementApi.get(`/Vendor/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching vendor ${id}:`, error);
        throw error;
    }
};

// Create vendor
export const createVendor = async (data: CreateVendorDto): Promise<Vendor> => {
    try {
        const response = await procurementApi.post(`/Vendor`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error creating vendor:', error);
        throw error;
    }
};

// Update vendor
export const updateVendor = async (data: UpdateVendorDto): Promise<Vendor> => {
    try {
        const response = await procurementApi.put(`/Vendor`, data);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating vendor ${data.id}:`, error);
        throw error;
    }
};

// Delete vendor
export const deleteVendor = async (id: string): Promise<void> => {
    try {
        await procurementApi.delete(`/Vendor/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting vendor ${id}:`, error);
        throw error;
    }
};

// Toggle vendor status
export const toggleVendorStatus = async (id: string, isActive: boolean): Promise<Vendor> => {
    try {
        const response = await procurementApi.patch(`/Vendor/${id}/toggle-status`, isActive);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error toggling vendor status ${id}:`, error);
        throw error;
    }
};