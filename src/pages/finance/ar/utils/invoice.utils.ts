// src/pages/finance/ar/utils/invoice.utils.ts

import React from 'react'; // ✅ Add this
import type { SalesInvoice, InvoiceStats } from '../types/invoice.types';
import { Clock, CheckCircle, BadgeCheck, ListChecks, X, FileText } from 'lucide-react';

export const formatCurrency = (amount: number): string => {
    if (!amount || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType: string): string => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    return '📎';
};

// ✅ Add getStatusBadge function
export const getStatusBadge = (status: string): string => {
    const colors: Record<string, string> = {
        Draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        Posted: 'bg-green-100 text-green-800 border-green-200',
        Unpaid: 'bg-blue-100 text-blue-800 border-blue-200',
        Partially_Paid: 'bg-orange-100 text-orange-800 border-orange-200',
        Paid: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        Cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// ✅ Add getStatusIcon function - returns React.ReactNode
export const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
        case 'Draft':
            return React.createElement(Clock, { className: "h-3 w-3" });
        case 'Posted':
            return React.createElement(CheckCircle, { className: "h-3 w-3" });
        case 'Paid':
            return React.createElement(BadgeCheck, { className: "h-3 w-3" });
        case 'Partially_Paid':
            return React.createElement(ListChecks, { className: "h-3 w-3" });
        case 'Cancelled':
            return React.createElement(X, { className: "h-3 w-3" });
        default:
            return React.createElement(FileText, { className: "h-3 w-3" });
    }
};

export const calculateStats = (invoices: SalesInvoice[]): InvoiceStats => {
    return {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
        totalPaid: invoices.reduce((sum, i) => sum + i.paidAmount, 0),
        totalBalance: invoices.reduce((sum, i) => sum + i.balanceDue, 0),
        draftCount: invoices.filter(i => i.status === 'Draft').length,
        postedCount: invoices.filter(i => i.status === 'Posted').length,
        paidCount: invoices.filter(i => i.status === 'Paid').length,
        cancelledCount: invoices.filter(i => i.status === 'Cancelled').length,
        unpaidCount: invoices.filter(i => i.status === 'Unpaid').length,
        partiallyPaidCount: invoices.filter(i => i.status === 'Partially_Paid').length,
    };
};

export const filterInvoices = (
    invoices: SalesInvoice[],
    searchTerm: string,
    statusFilter: string
): SalesInvoice[] => {
    return invoices.filter(inv => {
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
};