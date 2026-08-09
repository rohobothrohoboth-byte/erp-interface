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

export interface Invoice {
    id: string;
    invoiceNumber: string;
    purchaseOrderId: string;
    purchaseOrderNumber?: string;
    vendorId: string;
    vendorName?: string;
    title?: string;
    invoiceDate: string;
    dueDate: string;
    receivedDate?: string;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
    status: 'Draft' | 'Sent' | 'Verified' | 'Approved' | 'Rejected' | 'Paid' | 'Cancelled';
    paymentTerms?: string;
    notes?: string;
    approvedBy?: string;
    approvedDate?: string;
    paidBy?: string;
    paidDate?: string;
    attachmentCount: number;
    lineItems: InvoiceLineItem[];
    dateAdd: string;
    dateMod?: string;
    rowVersion?: string;
}

export interface InvoiceLineItem {
    id?: string;
    purchaseOrderItemId: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    discount?: number;
    taxAmount?: number;
}

export interface CreateInvoiceDto {
    purchaseOrderId: string;
    title?: string;
    invoiceDate: string;
    dueDate: string;
    paymentTerms?: string;
    notes?: string;
    lineItems: CreateInvoiceLineItemDto[];
}

export interface CreateInvoiceLineItemDto {
    purchaseOrderItemId: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxAmount?: number;
}

export interface InvoiceStatusUpdateDto {
    id: string;
    status: 'Draft' | 'Sent' | 'Verified' | 'Approved' | 'Rejected' | 'Paid' | 'Cancelled';
    notes?: string;
}

// Get all invoices
export const getInvoices = async (params?: {
    status?: string;
    vendorId?: string;
    purchaseOrderId?: string;
    fromDate?: string;
    toDate?: string;
}): Promise<Invoice[]> => {
    try {
        const response = await procurementApi.get(`/Invoice`, { params });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error fetching invoices:', error);
        throw error;
    }
};

// Get invoice by ID
export const getInvoiceById = async (id: string): Promise<Invoice> => {
    try {
        const response = await procurementApi.get(`/Invoice/${id}`);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error fetching invoice ${id}:`, error);
        throw error;
    }
};

// Create invoice
export const createInvoice = async (data: CreateInvoiceDto): Promise<Invoice> => {
    try {
        const response = await procurementApi.post(`/Invoice`, data);
        return response?.data;
    } catch (error) {
        console.error('❌ Error creating invoice:', error);
        throw error;
    }
};
export const searchInvoices = async (params?: {
    searchTerm?: string;
    status?: string;
}): Promise<Invoice[]> => {
    try {
        const response = await procurementApi.get(`/Invoice/search`, { params });
        return response?.data || [];
    } catch (error) {
        console.error('❌ Error searching invoices:', error);
        throw error;
    }
};
// Update invoice status
export const updateInvoiceStatus = async (data: InvoiceStatusUpdateDto): Promise<Invoice> => {
    try {
        const response = await procurementApi.patch(`/Invoice/status`, data);
        return response?.data;
    } catch (error) {
        console.error(`❌ Error updating invoice status ${data.id}:`, error);
        throw error;
    }
};