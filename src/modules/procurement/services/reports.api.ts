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

export interface ReportStats {
    totalReports: number;
    readyReports: number;
    generatingReports: number;
    scheduledReports: number;
    totalDownloads: number;
    categoriesCount: number;
}

export interface Report {
    id: string;
    name: string;
    description: string;
    category: string;
    type: string;
    generatedDate: string;
    period: string;
    status: 'ready' | 'generating' | 'scheduled';
    format: 'pdf' | 'excel' | 'csv';
    size: string;
    downloads: number;
    lastViewed: string;
    tags: string[];
    reportUrl?: string;
}

export interface SpendCategory {
    name: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
}

export interface TopVendor {
    name: string;
    amount: number;
    percentage: number;
}

export interface MonthlyTrend {
    month: string;
    amount: number;
}

export interface BudgetUtilization {
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
    utilizationPercentage: number;
}

export interface SpendAnalysis {
    period: string;
    totalSpend: number;
    categories: SpendCategory[];
    topVendors: TopVendor[];
    monthlyTrend: MonthlyTrend[];
    budgetUtilization: BudgetUtilization[];
    monthlyChange: number;
    budgetUtilizationPercentage: number;
}

export interface VendorMetrics {
    delivery: number;
    quality: number;
    price: number;
    communication: number;
    compliance: number;
}

export interface VendorTrends {
    delivery: 'up' | 'down' | 'stable';
    quality: 'up' | 'down' | 'stable';
    price: 'up' | 'down' | 'stable';
}

export interface VendorPerformance {
    id: string;
    vendorName: string;
    vendorCode: string;
    category: string;
    overallScore: number;
    performanceMetrics: VendorMetrics;
    trends: VendorTrends;
    totalOrders: number;
    onTimeDelivery: number;
    qualityRate: number;
    averageResponseTime: number;
    status: 'excellent' | 'good' | 'average' | 'poor';
    lastEvaluation: string;
}

export interface ReportsDashboard {
    stats: ReportStats;
    reports: Report[];
    spendAnalysis: SpendAnalysis;
    vendorPerformance: VendorPerformance[];
    lastUpdated: string;
}

// ✅ Get complete reports dashboard
export const getReportsDashboard = async (params?: {
    period?: string;
    topVendorsCount?: number;
    recentReportsCount?: number;
}): Promise<ReportsDashboard> => {
    try {
        const response = await procurementApi.get(`/Reports/dashboard`, { params });
        return response?.data;
    } catch (error) {
        console.error('❌ Error fetching reports dashboard:', error);
        throw error;
    }
};
// Add to reports.api.ts

// ✅ Delete report
export const deleteReport = async (id: string): Promise<void> => {
    try {
        await procurementApi.delete(`/Reports/${id}`);
    } catch (error) {
        console.error(`❌ Error deleting report ${id}:`, error);
        throw error;
    }
};

// ✅ Get report by ID with error handling
export const getReportById = async (id: string): Promise<Report> => {
    try {
        const response = await procurementApi.get(`/Reports/${id}`);
        return response?.data;
    } catch (error: any) {
        console.error(`❌ Error fetching report ${id}:`, error);
        if (error?.response?.status === 404) {
            throw new Error('Report not found');
        }
        throw error;
    }
};

// ✅ Download report with error handling
export const downloadReport = async (id: string): Promise<Blob> => {
    try {
        const response = await procurementApi.get(`/Reports/download/${id}`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error: any) {
        console.error(`❌ Error downloading report ${id}:`, error);
        if (error?.response?.status === 404) {
            throw new Error('Report not found');
        }
        throw error;
    }
};

// ✅ Generate report
export const generateReport = async (data: {
    name: string;
    description?: string;
    category: string;
    period: string;
    format?: string;
    tags?: string[];
    startDate?: string;
    endDate?: string;
    includeCharts?: boolean;
    includeSummary?: boolean;
    includeDetails?: boolean;
}): Promise<{ id: string; name: string; downloadUrl: string; generatedDate: string }> => {
    try {
        const response = await procurementApi.post(`/Reports/generate`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error generating report:', error);
        throw error;
    }
};
// ✅ Get spend analysis only
export const getSpendAnalysis = async (period?: string): Promise<SpendAnalysis> => {
    try {
        const response = await procurementApi.get(`/Reports/spend-analysis`, { params: { period } });
        return response?.data;
    } catch (error) {
        console.error('❌ Error fetching spend analysis:', error);
        throw error;
    }
};

// ✅ Get vendor performance only
export const getVendorPerformance = async (count: number = 5): Promise<VendorPerformance[]> => {
    try {
        const response = await procurementApi.get(`/Reports/vendor-performance`, { params: { count } });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching vendor performance:', error);
        throw error;
    }
};