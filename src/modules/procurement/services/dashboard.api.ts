// src/services/procurement/inspection.api.ts

import axios from "axios";
import type { InspectionResult, InspectionFormData } from '@/modules/procurement/types/inspection.types';


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

export interface DashboardStats {
    monthlySpend: number;
    costSavings: number;
    activeVendors: number;
    openPOs: number;
    totalRequisitions: number;
    pendingInvoices: number;
    activeContracts: number;
    totalSpent: number;
    monthlyChange: number;
    savingsChange: number;
    vendorsChange: number;
    ordersChange: number;
}

export interface DashboardVendor {
    id: string;
    name: string;
    code: string;
    rating: number;
    performance: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
    orders: number;
    spend: number;
}

export interface DashboardPurchaseOrder {
    id: string;
    purchaseOrderNumber: string;
    vendorName: string;
    totalAmount: number;
    status: string;
    orderDate: string;
    expectedDeliveryDate: string;
}

export interface DashboardSpendCategory {
    name: string;
    amount: number;
    percentage: number;
    color: string;
}

export interface DashboardActivity {
    type: string;
    title: string;
    description: string;
    status: string;
    date: string;
    referenceId: string;
}

export interface DashboardData {
    stats: DashboardStats;
    vendors: DashboardVendor[];
    activeOrders: DashboardPurchaseOrder[];
    spendByCategory: DashboardSpendCategory[];
    recentActivities: DashboardActivity[];
    lastUpdated: string;
}

// ✅ Get all dashboard data in one request
export const getDashboardData = async (params?: {
    recentActivitiesCount?: number;
    topVendorsCount?: number;
}): Promise<DashboardData> => {
    try {
        const response = await procurementApi.get(`/Dashboard`, { params });
        return response?.data;
    } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        throw error;
    }
};

// ✅ Get only stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await procurementApi.get(`/Dashboard/stats`);
        return response?.data;
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        throw error;
    }
};

// ✅ Get recent activities
export const getDashboardActivities = async (count: number = 10): Promise<DashboardActivity[]> => {
    try {
        const response = await procurementApi.get(`/Dashboard/activities`, { params: { count } });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching dashboard activities:', error);
        throw error;
    }
};

// ✅ Get vendor performance
export const getDashboardVendors = async (count: number = 5): Promise<DashboardVendor[]> => {
    try {
        const response = await procurementApi.get(`/Dashboard/vendors`, { params: { count } });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching dashboard vendors:', error);
        throw error;
    }
};