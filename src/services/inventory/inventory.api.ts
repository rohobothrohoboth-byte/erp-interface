// src/services/inventory/inventory.api.ts

import { api } from '../api.config';

const INVENTORY_URL = import.meta.env.VITE_INVENTORY_URL || '/inventory/v1';

export interface Warehouse {
    id: string;
    name: string;
    code: string;
    location?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    warehouseType?: string;
    status?: string;
    isActive: boolean;
    dateAdd: string;
    dateMod?: string;
}

export interface CreateWarehouseDto {
    name: string;
    code: string;
    location?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    warehouseType?: string;
    status?: string;
    isActive?: boolean;
}

export interface UpdateWarehouseDto {
    id: string;
    name?: string;
    code?: string;
    location?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    warehouseType?: string;
    status?: string;
    isActive?: boolean;
    rowVersion?: string;
}

// ============================================================
// WAREHOUSE API
// ============================================================

// ✅ Get all warehouses
export const getWarehouses = async (): Promise<Warehouse[]> => {
    try {
        const response = await api.get(`${INVENTORY_URL}/Warehouse`);
        const data = response?.data?.data || response?.data || [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('❌ Error fetching warehouses:', error);
        throw error;
    }
};

// ✅ Get warehouse by ID
export const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
    try {
        const response = await api.get(`${INVENTORY_URL}/Warehouse/${id}`);
        return response?.data?.data || response?.data || null;
    } catch (error) {
        console.error(`❌ Error fetching warehouse ${id}:`, error);
        throw error;
    }
};

// ✅ Create warehouse
export const createWarehouse = async (data: CreateWarehouseDto): Promise<Warehouse> => {
    try {
        const response = await api.post(`${INVENTORY_URL}/Warehouse`, data);
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error('❌ Error creating warehouse:', error);
        throw error;
    }
};

// ✅ Update warehouse
export const updateWarehouse = async (data: UpdateWarehouseDto): Promise<Warehouse> => {
    try {
        const response = await api.put(`${INVENTORY_URL}/Warehouse`, data);
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error(`❌ Error updating warehouse ${data.id}:`, error);
        throw error;
    }
};

// ✅ Delete warehouse
export const deleteWarehouse = async (id: string): Promise<void> => {
    try {
        await api.delete(`${INVENTORY_URL}/Warehouse/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting warehouse ${id}:`, error);
        throw error;
    }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// ✅ Get warehouse options for dropdowns
export const getWarehouseOptions = async () => {
    const warehouses = await getWarehouses();
    return warehouses.map(w => ({
        value: w.id,
        label: `${w.code} - ${w.name}`,
        warehouse: w
    }));
};

// ✅ Get active warehouses only
export const getActiveWarehouses = async (): Promise<Warehouse[]> => {
    const warehouses = await getWarehouses();
    return warehouses.filter(w => w.isActive);
};