// src/pages/finance/ap/invoice/utils/invoice.utils.ts

import type { Invoice, InvoiceStats, InvoiceItem,InvoiceFormData } from '@/modules/finance/pages/ap/invoice/types/invoice.types';
import { STATUS_COLORS } from '@/modules/finance/pages/ap/invoice/constants/invoice.constants';

export const formatCurrency = (amount: number): string => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};
export const canEditInvoice = (invoice: Invoice): boolean => {
    if (!invoice) return false;
    const lockedStatuses = ['Paid', 'Posted', 'Partially_Paid', 'Approved', 'Rejected'];
    return !lockedStatuses.includes(invoice.status);
};
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
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

export const getStatusColor = (status: string): string => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
};

export const getTypeBadge = (invoiceType: string): string => {
    if (invoiceType === 'Purchase') {
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    return 'bg-green-100 text-green-700 border-green-200';
};

export const calculateItemTotal = (item: InvoiceItem): number => {
    return (item.quantity || 0) * (item.unitPrice || 0);
};

export const calculateInvoiceTotals = (items: InvoiceItem[]) => {
    const subTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const taxAmount = subTotal * 0.15;
    const totalAmount = subTotal + taxAmount;
    return { subTotal, taxAmount, totalAmount };
};

export const calculateStats = (invoices: Invoice[]): InvoiceStats => {
    return {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
        totalPaid: invoices.reduce((sum, i) => sum + i.paidAmount, 0),
        totalBalance: invoices.reduce((sum, i) => sum + i.balanceDue, 0),
        draftCount: invoices.filter(i => i.status === 'Draft').length,
        pendingCount: invoices.filter(i => i.status === 'Pending').length,
        approvedCount: invoices.filter(i => i.status === 'Approved').length,
        paidCount: invoices.filter(i => i.status === 'Paid').length,
        partiallyPaidCount: invoices.filter(i => i.status === 'Partially_Paid').length,
        rejectedCount: invoices.filter(i => i.status === 'Rejected').length,
        purchaseCount: invoices.filter(i => i.invoiceType === 'Purchase').length,
        salesCount: invoices.filter(i => i.invoiceType === 'Sales').length,
    };
};

export const filterInvoices = (
    invoices: Invoice[],
    searchTerm: string,
    filterStatus: string,
    filterType: 'All' | 'Purchase' | 'Sales'
): Invoice[] => {
    return invoices.filter(inv => {
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
        const matchesType = filterType === 'All' || inv.invoiceType === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });
};

export const canRequestAmendment = (invoice: Invoice, userRole: string): boolean => {
    if (!invoice) return false;
    const allowedStatuses = ['Paid', 'Posted', 'Partially_Paid'];
    const isAllowedStatus = allowedStatuses.includes(invoice.status);
    if (!isAllowedStatus) return false;
    const allowedRoles = ['admin', 'financemanager', 'accountant', 'financeuser'];
    return allowedRoles.includes(userRole.toLowerCase());
};

// src/pages/finance/ap/invoice/utils/invoice.utils.ts

// src/pages/finance/ap/invoice/utils/invoice.utils.ts

/**
 * Build invoice payload for create or update
 */
// src/pages/finance/ap/invoice/utils/invoice.utils.ts

export const buildInvoicePayload = (data: {
    formData: InvoiceFormData;
    invoiceId?: string;
    rowVersion?: string;
    isUpdate?: boolean;
}) => {
    const { formData, invoiceId, rowVersion, isUpdate = false } = data;

    console.log('📤 buildInvoicePayload - formData:', formData);
    console.log('📤 buildInvoicePayload - periodId:', formData.periodId);
    console.log('📤 buildInvoicePayload - items:', formData.items);

    // ✅ Ensure periodId exists
    const periodId = formData.periodId || '';

    if (!periodId) {
        console.warn('⚠️ No periodId in formData!');
    }

    // ✅ Ensure items exist
    const items = formData.items || [];
    console.log('📤 buildInvoicePayload - items count:', items.length);

    const subTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subTotal * 0.15;
    const totalAmount = subTotal + taxAmount;

    // ✅ Build Lines array safely
    const lines = items.map(item => ({
        Description: item.description || '',
        Quantity: item.quantity || 0,
        UnitPrice: item.unitPrice || 0,
        Discount: 0,
        TaxRate: 15,
        TotalAmount: (item.quantity || 0) * (item.unitPrice || 0),
        PeriodId: periodId,
    }));

    const payload: any = {
        InvoiceType: formData.invoiceType || 'Purchase',
        InvoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : new Date().toISOString(),
        DueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        SubTotal: subTotal,
        TaxAmount: taxAmount,
        DiscountAmount: 0,
        TotalAmount: totalAmount,
        Notes: formData.notes || '',
        Status: formData.status || 'Draft',
        PeriodId: periodId,
        VendorId: formData.invoiceType === 'Purchase' ? formData.vendorId || null : null,
        CustomerId: formData.invoiceType === 'Sales' ? formData.customerId || null : null,
        SalesRep: formData.invoiceType === 'Sales' ? (formData.salesRep || null) : null,
        DeliveryDate: formData.invoiceType === 'Sales' && formData.deliveryDate
            ? new Date(formData.deliveryDate).toISOString()
            : null,
        PurchaseOrderId: formData.invoiceType === 'Purchase' ? (formData.purchaseOrderId || null) : null,
        ReceivedDate: formData.invoiceType === 'Purchase' && formData.receivedDate
            ? new Date(formData.receivedDate).toISOString()
            : null,
        BranchId: null,
        DepartmentId: null,
        EmployeeId: null,
        Lines: lines, // ✅ Always include Lines, even if empty
    };

    // ✅ Add ID and RowVersion for update
    if (isUpdate && invoiceId) {
        payload.Id = invoiceId;
        payload.RowVersion = rowVersion || '';
        // ✅ Update Lines with IDs for update
        payload.Lines = items.map(item => ({
            Id: item.id || null,
            Description: item.description || '',
            Quantity: item.quantity || 0,
            UnitPrice: item.unitPrice || 0,
            Discount: 0,
            TaxRate: 15,
            TotalAmount: (item.quantity || 0) * (item.unitPrice || 0),
            PeriodId: periodId,
        }));
    }

    console.log('📤 buildInvoicePayload - Lines count:', payload.Lines?.length || 0);
    console.log('📤 buildInvoicePayload - final payload:', JSON.stringify(payload, null, 2));
    return payload;
};