// src/services/finance/financeApi.ts
import axios from 'axios';
import type { ApiResponse, FinancialPeriod, JournalEntry, AuditLog } from '../../types/finance/finance.types';

const API_BASE = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:5000';
const FINANCE_PATH = '/finance/v1.0';

export const financeApi = axios.create({
    baseURL: `${API_BASE}${FINANCE_PATH}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
financeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============================================================
// INVOICE AMENDMENTS
// ============================================================
export const requestInvoiceAmendment = (data: {
    invoiceId: string;
    reason: string;
    requestedSubTotal: number;
    requestedTaxAmount: number;
    requestedTotalAmount: number;
    comment?: string;
}) => {
    return financeApi.post('/Invoice/Amendment/Request', data);
};

export const approveInvoiceAmendment = (amendmentId: string, data?: { comment?: string }) => {
    return financeApi.post(`/Invoice/Amendment/${amendmentId}/approve`, data || {});
};

export const rejectInvoiceAmendment = (amendmentId: string, data: { reason: string }) => {
    return financeApi.post(`/Invoice/Amendment/${amendmentId}/reject`, data);
};

export const getInvoiceAmendments = (invoiceId: string) => {
    return financeApi.get(`/Invoice/Amendment/${invoiceId}`);
};

// ============================================================
// ACCOUNTS (Chart of Accounts)
// ============================================================

// ============================================================
// ACCOUNT CATEGORIES
// ============================================================


// ============================================================
// ASSETS
// ============================================================

// services/finance/finance.api.ts

export const getAssets = (params?: any) => {
    console.log('🔍 Fetching assets with params:', params);
    return financeApi.get('/Assets', { params });
};

export const getAssetById = async (id: string) => {
    const response = await financeApi.get(`/Assets/${id}`);
    return response.data;
};

export const createAsset = async (data: any) => {
    const response = await financeApi.post(`/Assets`, data);
    return response.data;
};

export const updateAsset = async (data: any) => {
    const response = await financeApi.put(`/Assets`, data);
    return response.data;
};

export const deleteAsset = async (id: string) => {
    const response = await financeApi.delete(`/Assets/${id}`);
    return response.data;
};

export const toggleAssetStatus = async (id: string) => {
    const response = await financeApi.patch(`/Assets/${id}/toggle-status`);
    return response.data;
};
// ============================================================
// TAX RETURNS
// ============================================================
// ============================================================
// TAX RETURNS API
// ============================================================

export const getTaxReturns = async (params?: {
    period?: string;
    fromDate?: string;
    toDate?: string;
    status?: 'Pending' | 'Filed' | 'Overdue' | 'Refunded';
    taxType?: 'VAT' | 'WHT' | 'Corporate' | 'Payroll';
    fiscalYear?: string;
}) => {
    try {
        // ✅ Filter out 'All' and undefined values
        const filteredParams = params ? Object.fromEntries(
            Object.entries(params).filter(([_, value]) =>
                value !== undefined &&
                value !== null &&
                value !== 'All' &&
                value !== ''
            )
        ) : {};

        console.log('🔍 Fetching tax returns with params:', filteredParams);

        const response = await financeApi.get('/tax-returns', { params: filteredParams });
        console.log('✅ Tax returns response:', response);
        return response;
    } catch (error) {
        console.error('❌ Error fetching tax returns:', error);
        throw error;
    }
};

export const getTaxReturn = async (id: string) => {
    try {
        const response = await financeApi.get(`/tax-returns/${id}`);
        return response;
    } catch (error) {
        console.error('Error fetching tax return:', error);
        throw error;
    }
};

export const createTaxReturn = async (data: any) => {
    try {
        const response = await financeApi.post('/tax-returns', data);
        return response;
    } catch (error) {
        console.error('Error creating tax return:', error);
        throw error;
    }
};

export const updateTaxReturn = async (id: string, data: any) => {
    try {
        const response = await financeApi.put(`/tax-returns/${id}`, data);
        return response;
    } catch (error) {
        console.error('Error updating tax return:', error);
        throw error;
    }
};

export const fileTaxReturn = async (id: string, data?: any) => {
    try {
        const response = await financeApi.post(`/tax-returns/${id}/file`, data);
        return response;
    } catch (error) {
        console.error('Error filing tax return:', error);
        throw error;
    }
};

export const getTaxReturnSummary = async (params?: {
    fiscalYear?: string;
    period?: string;
}) => {
    try {
        const response = await financeApi.get('/tax-returns/summary', { params });
        return response;
    } catch (error) {
        console.error('Error fetching tax return summary:', error);
        throw error;
    }
};

export const getFullDashboard = async (params?: {
    periodStart?: string;
    periodEnd?: string;
    periodType?: string;
    fiscalYear?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    if (params?.periodType) queryParams.append('periodType', params.periodType);
    if (params?.fiscalYear) queryParams.append('fiscalYear', params.fiscalYear);

    const url = `/Analytics/FullDashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return financeApi.get(url);
};

export const getInvoiceSummary = async (params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    return financeApi.get(`/Analytics/InvoiceSummary?${queryParams.toString()}`);
};

export const getInvoiceMonthlyTrend = async (months: number = 12, endDate?: string) => {
    const params: any = { months };
    if (endDate) params.endDate = endDate;
    return financeApi.get('/Analytics/InvoiceMonthlyTrend', { params });
};

export const getRecentInvoices = async (count: number = 10) => {
    return financeApi.get(`/Analytics/RecentInvoices?count=${count}`);
};

export const getToponeCustomers = async (count: number = 10, params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams: any = { count };
    if (params?.periodStart) queryParams.periodStart = params.periodStart;
    if (params?.periodEnd) queryParams.periodEnd = params.periodEnd;
    return financeApi.get('/Analytics/TopCustomers', { params: queryParams });
};
// ============================================================
// COST CENTERS
// ============================================================
export const getCostCenters = (params?: any) => financeApi.get('/CostCenter', { params });
export const createCostCenter = (data: any) => financeApi.post('/CostCenter', data);
export const updateCostCenter = (data: any) => financeApi.put('/CostCenter', data);
export const deleteCostCenter = (id: string) => financeApi.delete(`/CostCenter/${id}`);

// ============================================================
// BUDGET CODES
// ============================================================
export const getBudgetCodes = () => financeApi.get('/BudgetCode');
export const createBudgetCode = (data: any) => financeApi.post('/BudgetCode', data);
export const updateBudgetCode = (data: any) => financeApi.put('/BudgetCode', data);
export const deleteBudgetCode = (id: string) => financeApi.delete(`/BudgetCode/${id}`);

// ============================================================
// BUDGET CATEGORIES
// ============================================================
export const getBudgetCategories = () => financeApi.get('/BudgetCategory');
export const createBudgetCategory = (data: any) => financeApi.post('/BudgetCategory', data);
export const updateBudgetCategory = (data: any) => financeApi.put('/BudgetCategory', data);
export const deleteBudgetCategory = (id: string) => financeApi.delete(`/BudgetCategory/${id}`);

// ============================================================
// PAYMENT APPROVAL CHAINS
// ============================================================
export const getPaymentApprovalChains = () => financeApi.get('/PaymentApprovalChain');
export const createPaymentApprovalChain = (data: any) => financeApi.post('/PaymentApprovalChain', data);
export const updatePaymentApprovalChain = (data: any) => financeApi.put('/PaymentApprovalChain', data);
export const deletePaymentApprovalChain = (id: string) => financeApi.delete(`/PaymentApprovalChain/${id}`);

// ============================================================
// EXPENSES
// ============================================================
export const getExpenses = (params?: any) => financeApi.get('/Expense/All', { params });
export const getExpenseById = (id: string) => financeApi.get(`/Expense/${id}`);
export const createExpense = (data: any) => financeApi.post('/Expense', data);
export const updateExpense = (data: any) => financeApi.put('/Expense', data);
export const deleteExpense = (id: string) => financeApi.delete(`/Expense/${id}`);

// ============================================================
// EXPENSE CATEGORIES
// ============================================================
export const getExpenseCategories = (params?: any) => financeApi.get('/Expense/Categories', { params });
export const createExpenseCategory = (data: any) => financeApi.post('/Expense/Category', data);
export const toggleExpenseCategoryStatus = (id: string) => financeApi.patch(`/Expense/Category/${id}/toggle-status`);

// ============================================================
// INVOICES
// ============================================================
export const getInvoices = (params?: any) => financeApi.get('/Invoice/All', { params });
export const getInvoiceById = (id: string) => financeApi.get(`/Invoice/${id}`);
export const getInvoiceByNumber = (number: string) => financeApi.get(`/Invoice/ByNumber/${number}`);
export const createInvoice = (data: any) => financeApi.post('/Invoice', data);
// src/services/finance/finance.api.ts

export const updateInvoice = (data: any) => {
    // ✅ Validate required fields
    if (!data.Id) {
        console.error('❌ updateInvoice: Id is required');
        throw new Error('Invoice Id is required');
    }

    if (!data.PeriodId) {
        console.error('❌ updateInvoice: PeriodId is required');
        throw new Error('PeriodId is required');
    }

    const payload = {
        Id: data.Id,
        InvoiceType: data.InvoiceType || 'Purchase',
        VendorId: data.VendorId || null,
        CustomerId: data.CustomerId || null,
        InvoiceDate: data.InvoiceDate || new Date().toISOString(),
        DueDate: data.DueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        PeriodId: data.PeriodId, // ✅ Make sure this is included
        SubTotal: data.SubTotal || 0,
        TaxAmount: data.TaxAmount || 0,
        DiscountAmount: data.DiscountAmount || 0,
        TotalAmount: data.TotalAmount || 0,
        Notes: data.Notes || '',
        Status: data.Status || 'Draft',
        BranchId: data.BranchId || null,
        DepartmentId: data.DepartmentId || null,
        EmployeeId: data.EmployeeId || null,
        SalesRep: data.SalesRep || null,
        DeliveryDate: data.DeliveryDate || null,
        PurchaseOrderId: data.PurchaseOrderId || null,
        ReceivedDate: data.ReceivedDate || null,
        RowVersion: data.RowVersion || '',
        Lines: data.Lines?.map((line: any) => ({
            Id: line.Id || null,
            Description: line.Description || '',
            Quantity: line.Quantity || 0,
            UnitPrice: line.UnitPrice || 0,
            Discount: line.Discount || 0,
            TaxRate: line.TaxRate || 15,
            TotalAmount: line.TotalAmount || (line.Quantity * line.UnitPrice) || 0,
            PeriodId: line.PeriodId || data.PeriodId || '',
        })) || [],
    };

    console.log('📤 [API] updateInvoice payload:', JSON.stringify(payload, null, 2));

    // ✅ Validate payload before sending
    if (!payload.PeriodId) {
        console.error('❌ [API] PeriodId is missing from update payload!');
    }

    return financeApi.put('/Invoice', payload);
};
export const updateInvoiceStatus = (id: string, status: string) =>
    financeApi.patch(`/Invoice/${id}/status`, { status });
export const deleteInvoice = (id: string) => financeApi.delete(`/Invoice/${id}`);

export const getSalesInvoices = (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    customerId?: string;
}) => {
    return financeApi.get('/Invoice/Sales', { params });
};

export const getPurchaseInvoices = (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    vendorId?: string;
}) => {
    return financeApi.get('/Invoice/Purchase', { params });
};

export const getInvoicesByType = (invoiceType: 'Purchase' | 'Sales') => {
    return financeApi.get(`/Invoice/ByType/${invoiceType}`);
};

export const getInvoicesByCustomer = (customerId: string) => {
    return financeApi.get(`/Invoice/ByCustomer/${customerId}`);
};

export const getInvoicesByVendor = (vendorId: string) => {
    return financeApi.get(`/Invoice/ByVendor/${vendorId}`);
};

// ============================================================
// INVOICE APPROVALS
// ============================================================
export const getPendingApprovals = (params?: any) =>
    financeApi.get('/Invoice/PendingApprovals', { params });
export const approveInvoice = (id: string, data?: any) =>
    financeApi.post(`/Invoice/${id}/approve`, data);
export const rejectInvoice = (id: string, data?: any) =>
    financeApi.post(`/Invoice/${id}/reject`, data);

// ============================================================
// INVOICE ATTACHMENTS
// ============================================================
export const uploadInvoiceAttachment = async (invoiceId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await financeApi.post(`/Invoice/${invoiceId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getInvoiceAttachments = async (invoiceId: string) => {
    const response = await financeApi.get(`/Invoice/${invoiceId}/attachments`);
    return response.data;
};

export const deleteInvoiceAttachment = async (invoiceId: string, attachmentId: string) => {
    const response = await financeApi.delete(`/Invoice/${invoiceId}/attachments/${attachmentId}`);
    return response.data;
};

export const downloadInvoiceAttachment = async (invoiceId: string, attachmentId: string) => {
    const response = await financeApi.get(`/Invoice/${invoiceId}/attachments/${attachmentId}/download`, {
        responseType: 'blob',
    });
    return response.data;
};

// ============================================================
// PAYMENTS
// ============================================================
export const getPayments = (params?: any) => financeApi.get('/Payment/All', { params });
export const getPaymentById = (id: string) => financeApi.get(`/Payment/${id}`);
export const createPayment = (data: any) => financeApi.post('/Payment', data);
export const updatePayment = (data: any) => financeApi.put('/Payment', data);
export const processPayment = (id: string) => financeApi.post(`/Payment/${id}/process`);
export const cancelPayment = (id: string) => financeApi.post(`/Payment/${id}/cancel`);
export const deletePayment = (id: string) => financeApi.delete(`/Payment/${id}`);

export const getSalesPayments = (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    customerId?: string;
}) => {
    return financeApi.get('/Payment/Sales', { params });
};

export const getPurchasePayments = (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    vendorId?: string;
}) => {
    return financeApi.get('/Payment/Purchase', { params });
};

export const getPaymentsByType = (paymentType: 'Purchase' | 'Sales') => {
    return financeApi.get(`/Payment/ByType/${paymentType}`);
};

export const getPaymentsByCustomer = (customerId: string) => {
    return financeApi.get(`/Payment/ByCustomer/${customerId}`);
};

export const getPaymentsByVendor = (vendorId: string) => {
    return financeApi.get(`/Payment/ByVendor/${vendorId}`);
};

export const bulkCreatePayments = (data: any[]) => financeApi.post('/Payment/Bulk', data);

// ============================================================
// PURCHASE ORDERS
// ============================================================
export const getPurchaseOrders = (params?: {
    vendorId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/PurchaseOrder/All', { params });
};

export const getPurchaseOrderById = (id: string) => {
    return financeApi.get(`/PurchaseOrder/${id}`);
};

export const getPurchaseOrdersByVendor = (vendorId: string) => {
    return financeApi.get(`/PurchaseOrder/ByVendor/${vendorId}`);
};

export const getPurchaseOrderByNumber = (number: string) => {
    return financeApi.get(`/PurchaseOrder/ByNumber/${number}`);
};

// ============================================================
// JOURNAL ENTRIES
// ============================================================



export const postJournalEntry = (id: string) => financeApi.post(`/JournalEntry/${id}/post`);
export const unpostJournalEntry = (id: string) => financeApi.post(`/JournalEntry/${id}/unpost`);
export const deleteJournalEntry = (id: string) => financeApi.delete(`/JournalEntry/${id}`);

// ============================================================
// BUDGETS
// ============================================================
export const getBudgets = (params?: any) => financeApi.get('/Budget/All', { params });
export const getBudgetById = (id: string) => financeApi.get(`/Budget/${id}`);
export const getBudgetsByBranch = (branchId: string) => financeApi.get(`/Budget/ByBranch/${branchId}`);
export const createBudget = (data: any) => financeApi.post('/Budget', data);
export const updateBudget = (data: any) => financeApi.put('/Budget', data);
export const toggleBudgetStatus = (id: string) => financeApi.patch(`/Budget/${id}/toggle-status`);
export const deleteBudget = (id: string) => financeApi.delete(`/Budget/${id}`);

// ============================================================
// FINANCIAL PERIODS
// ============================================================
export const getFinancialPeriods = (params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
}) => {
    return financeApi.get('/PeriodClosing', { params });
};

export const getAllFinancialPeriods = (params?: {
    isClosed?: boolean;
    periodType?: string;
    search?: string;
}) => {
    return financeApi.get('/PeriodClosing/All', { params });
};

export const getActivePeriod = (date?: string) => {
    return financeApi.get('/PeriodClosing/Active', { params: { date } });
};

export const getActivePeriodWithStats = (date?: string) => {
    return financeApi.get('/PeriodClosing/ActiveWithStats', { params: { date } });
};

export const getPeriodById = (id: string) => {
    return financeApi.get(`/PeriodClosing/${id}`);
};

export const getPeriodStats = (id: string) => {
    return financeApi.get(`/PeriodClosing/${id}/stats`);
};

export const validatePeriodClose = (id: string) => {
    return financeApi.get(`/PeriodClosing/${id}/validate-close`);
};

export const getPeriodAuditTrail = (id: string, page: number = 1, pageSize: number = 50) => {
    return financeApi.get(`/PeriodClosing/${id}/audit`, {
        params: { page, pageSize }
    });
};

export const exportPeriodData = (id: string) => {
    return financeApi.get(`/PeriodClosing/${id}/export`, {
        responseType: 'blob', // ✅ Important: Tell axios to return blob
        headers: {
            'Accept': 'application/json'
        }
    });
};

export const createFinancialPeriod = (data: any) => {
    return financeApi.post('/PeriodClosing', data);
};

export const closeFinancialPeriod = (id: string, data?: { forceClose?: boolean; notes?: string; reason?: string }) => {
    return financeApi.post(`/PeriodClosing/${id}/close`, data || {});
};

export const openFinancialPeriod = (id: string) => {
    return financeApi.post(`/PeriodClosing/${id}/open`);
};

export const updateFinancialPeriod = (data: any) => {
    return financeApi.put('/PeriodClosing', data);
};

export const deleteFinancialPeriod = (id: string) => {
    return financeApi.delete(`/PeriodClosing/${id}`);
};

export const validatePeriodClosing = (id: string) => {
    return financeApi.get(`/PeriodClosing/${id}/validate-close`);
};

// ============================================================
// LOCAL DATA (Branches, Departments, Employees, Companies)
// ============================================================
export const getCompanies = () => financeApi.get('/LocalCopy/Companies');
export const getBranches = () => financeApi.get('/LocalCopy/Branches');
export const getDepartments = () => financeApi.get('/LocalCopy/Departments');
export const getEmployees = () => financeApi.get('/LocalCopy/Employees');

export const createCompany = (data: any) => financeApi.post('/LocalCopy/Companies', data);
export const updateCompany = (data: any) => financeApi.put(`/LocalCopy/Companies/${data.id}`, data);
export const deleteCompany = (id: string) => financeApi.delete(`/LocalCopy/Companies/${id}`);

// ============================================================
// CUSTOMERS
// ============================================================
export const getCustomers = () => financeApi.get('/Customer');
export const getCustomerById = (id: string) => financeApi.get(`/Customer/${id}`);
export const getCustomerByCode = (code: string) => financeApi.get(`/Customer/ByCode/${code}`);
export const getCustomersByType = (type: string) => financeApi.get(`/Customer/ByType/${type}`);
export const getActiveCustomers = () => financeApi.get('/Customer/Active');
export const createCustomer = (data: any) => financeApi.post('/Customer', data);
export const updateCustomer = (data: any) => financeApi.put('/Customer', data);
export const deleteCustomer = (id: string) => financeApi.delete(`/Customer/${id}`);
export const toggleCustomerStatus = (id: string) => financeApi.patch(`/Customer/${id}/toggle-status`);

// ============================================================
// VENDORS
// ============================================================
export const getVendors = (params?: any) => financeApi.get('/Vendor/All', { params });
export const getVendorById = (id: string) => financeApi.get(`/Vendor/${id}`);
export const getVendorByCode = (code: string) => financeApi.get(`/Vendor/ByCode/${code}`);
export const getVendorsByType = (type: string) => financeApi.get(`/Vendor/ByType/${type}`);
export const getActiveVendors = () => financeApi.get('/Vendor/Active');
export const createVendor = (data: any) => financeApi.post('/Vendor', data);
export const updateVendor = (data: any) => financeApi.put('/Vendor', data);
export const toggleVendorStatus = (id: string) => financeApi.patch(`/Vendor/${id}/toggle-status`);
export const deleteVendor = (id: string) => financeApi.delete(`/Vendor/${id}`);

// ============================================================
// AUDIT TRAIL
// ============================================================
export const getAuditLogs = (params?: any) => financeApi.get('/Audit/Logs', { params });
export const getAuditTrail = (entityType: string, entityId: string) =>
    financeApi.get('/Audit/Trail', { params: { entityType, entityId } });
export const getEntityAuditHistory = (entityType: string, entityId: string) =>
    financeApi.get(`/Audit/Entity/${entityType}/${entityId}`);
export const getAuditSummary = (params?: any) => financeApi.get('/Audit/Summary', { params });

// ============================================================
// TAX MANAGEMENT
// ============================================================
export const getTaxes = (params?: any) => financeApi.get('/Tax/All', { params });
export const getTaxById = (id: string) => financeApi.get(`/Tax/${id}`);
export const createTax = (data: any) => financeApi.post('/Tax', data);
export const updateTax = (data: any) => financeApi.put('/Tax', data);
export const deleteTax = (id: string) => financeApi.delete(`/Tax/${id}`);
export const calculateTax = (amount: number, taxRate: number) =>
    financeApi.post('/Tax/Calculate', { amount, taxRate });

// ============================================================
// CURRENCY
// ============================================================
export const getCurrencies = (params?: any) => financeApi.get('/Currency/All', { params });
export const getCurrencyById = (id: string) => financeApi.get(`/Currency/${id}`);
export const createCurrency = (data: any) => financeApi.post('/Currency', data);
export const updateCurrency = (data: any) => financeApi.put('/Currency', data);
export const deleteCurrency = (id: string) => financeApi.delete(`/Currency/${id}`);
export const getExchangeRate = (fromCurrencyId: string, toCurrencyId: string) =>
    financeApi.get('/Currency/ExchangeRate', { params: { fromCurrencyId, toCurrencyId } });

// ============================================================
// APPROVALS
// ============================================================
export const getApprovalById = (id: string) => financeApi.get(`/Approval/${id}`);
export const approveRequest = (data: any) => financeApi.post('/Approval/Approve', data);
export const rejectRequest = (data: any) => financeApi.post('/Approval/Reject', data);
export const getApprovalHistory = (entityId: string) =>
    financeApi.get(`/Approval/History/${entityId}`);

// ============================================================
// RECURRING TRANSACTIONS
// ============================================================
export const getRecurringTransactions = (params?: any) => financeApi.get('/RecurringTransaction/All', { params });
export const getRecurringTransactionById = (id: string) => financeApi.get(`/RecurringTransaction/${id}`);
export const createRecurringTransaction = (data: any) => financeApi.post('/RecurringTransaction', data);
export const updateRecurringTransaction = (data: any) => financeApi.put('/RecurringTransaction', data);
export const deleteRecurringTransaction = (id: string) => financeApi.delete(`/RecurringTransaction/${id}`);
export const pauseRecurringTransaction = (id: string) => financeApi.post(`/RecurringTransaction/${id}/pause`);
export const resumeRecurringTransaction = (id: string) => financeApi.post(`/RecurringTransaction/${id}/resume`);

// ============================================================
// PAYMENT REQUESTS
// ============================================================
export const getPaymentRequests = (params?: any) => financeApi.get('/PaymentRequest/All', { params });
export const createPaymentRequest = (data: any) => financeApi.post('/PaymentRequest', data);
export const approvePaymentRequest = (id: string, data?: any) =>
    financeApi.post(`/PaymentRequest/${id}/approve`, data);
export const rejectPaymentRequest = (id: string, data?: any) =>
    financeApi.post(`/PaymentRequest/${id}/reject`, data);

// ============================================================
// BANK ACCOUNTS
// ============================================================
export const getBankAccounts = (params?: any) => financeApi.get('/BankAccount', { params });
export const getBankAccountById = (id: string) => financeApi.get(`/BankAccount/${id}`);
export const createBankAccount = (data: any) => {
    const payload = {
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName || '',
        accountType: data.accountType || 'Checking',
        glCode: data.glCode || '',
        openingBalance: data.openingBalance || 0,
        currentBalance: data.openingBalance || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        branchId: data.branchId || null,
    };
    return financeApi.post('/BankAccount', payload);
};

export const updateBankAccount = (data: any) => {
    const payload = {
        id: data.id,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName || '',
        accountType: data.accountType || 'Checking',
        glCode: data.glCode || '',
        openingBalance: data.openingBalance || 0,
        currentBalance: data.currentBalance || data.openingBalance || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        branchId: data.branchId || null,
        rowVersion: data.rowVersion || '',
    };
    return financeApi.put('/BankAccount', payload);
};
export const deleteBankAccount = (id: string) => financeApi.delete(`/BankAccount/${id}`);

// ============================================================
// BANK TRANSACTIONS
// ============================================================
export const getBankTransactions = (params?: any) => financeApi.get('/BankTransaction', { params });
export const getBankTransactionById = (id: string) => financeApi.get(`/BankTransaction/${id}`);
export const createBankTransaction = (data: any) => financeApi.post('/BankTransaction', data);
export const updateBankTransaction = (data: any) => financeApi.put('/BankTransaction', data);
export const deleteBankTransaction = (id: string) => financeApi.delete(`/BankTransaction/${id}`);
export const reconcileBankTransaction = (data: {
    id: string;  // ✅ Must be string, not object
    isReconciled: boolean;
    reconciliationDate?: string;
}) => {
    // ✅ Make sure id is a string
    const id = typeof data.id === 'string' ? data.id : data.id.toString();
    return financeApi.patch(`/BankTransaction/${id}/reconcile`, {
        id: id,
        isReconciled: data.isReconciled,
        reconciliationDate: data.reconciliationDate
    });
};


// ============================================================
// PETTY CASH
// ============================================================
export const getPettyCashBalance = (params?: any) => financeApi.get('/PettyCash/Balance', { params });
export const getPettyCashTransactions = (params?: any) => financeApi.get('/PettyCash/Transactions', { params });
// src/services/finance/finance.api.ts

export const recordPettyCashTransaction = (data: {
    amount: number;
    description: string;
    transactionType: string;
    category?: string;
    transactionDate?: string;
    reference?: string;
}) => {
    // ✅ Ensure correct field names (lowercase/camelCase)
    return financeApi.post('/PettyCash/Transaction', {
        amount: data.amount,
        description: data.description,
        transactionType: data.transactionType,
        category: data.category || 'Miscellaneous',
        transactionDate: data.transactionDate || new Date().toISOString(),
        reference: data.reference || `PC-${Date.now()}`
    });
};
export const replenishPettyCash = (data: any) => financeApi.post('/PettyCash/Replenish', data);
export const approveTransaction = (id: string) => {
    return financeApi.post(`/PettyCash/Transaction/${id}/approve`);
};
export const approvePettyCashTransaction = (id: string) => {
    return financeApi.post(`/PettyCash/Transaction/${id}/approve`);
};

export const rejectPettyCashTransaction = (id: string) => {
    return financeApi.post(`/PettyCash/Transaction/${id}/reject`);
};

export const deletePettyCashTransaction = (id: string) => {
    return financeApi.delete(`/PettyCash/Transaction/${id}`);
};
export const rejectTransaction = (id: string) => {
    return financeApi.post(`/PettyCash/Transaction/${id}/reject`);
};
export const deleteTransaction = (id: string) => {
    return financeApi.delete(`/PettyCash/Transaction/${id}`);
};
export const exportPettyCash = (format: 'pdf' | 'excel' | 'csv') => {
    return financeApi.get(`/PettyCash/Export?format=${format}`, {
        responseType: 'blob'
    });
};

export const bulkReconcileBankTransactions = (data: {
    transactionIds: string[];
    isReconciled: boolean;
    reconciliationDate?: string;
}) => {
    return financeApi.post('/BankTransaction/BulkReconcile', data);
};

/**
 * Get transaction statistics
 */
export const getTransactionStats = (params?: {
    bankAccountId?: string;
    fromDate?: string;
    toDate?: string;
    periodId?: string;
}) => {
    return financeApi.get('/BankTransaction/Stats', { params });
};
// src/services/finance/financeApi.ts

// ============================================================
// ACCOUNT CATEGORIES - CORRECTED ✅
// ============================================================

/**
 * Get all account categories with pagination and filtering
 */
export const getAccountCategories = (params?: {
    isActive?: boolean;
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
}) => {
    return financeApi.get('/AccountCategory', { params });
};

/**
 * Get account category by ID
 */
export const getAccountCategoryById = (id: string) => {
    return financeApi.get(`/AccountCategory/${id}`);
};

/**
 * Get account category by code
 */
export const getAccountCategoryByCode = (code: string) => {
    return financeApi.get(`/AccountCategory/ByCode/${code}`);
};

/**
 * Get account categories by type (Asset, Liability, Equity, Revenue, Expense)
 */
export const getAccountCategoriesByType = (type: string) => {
    return financeApi.get(`/AccountCategory/ByType/${type}`);
};

/**
 * Get account category hierarchy
 */
export const getAccountCategoryHierarchy = () => {
    return financeApi.get('/AccountCategory/Hierarchy');
};

/**
 * Get account category usage (how many accounts use this category)
 */
export const getAccountCategoryUsage = (id: string) => {
    return financeApi.get(`/AccountCategory/${id}/usage`);
};

/**
 * Check if account category can be deleted
 */
export const canDeleteAccountCategory = (id: string) => {
    return financeApi.get(`/AccountCategory/${id}/can-delete`);
};

/**
 * Create a new account category
 */
export const createAccountCategory = (data: {
    code: string;
    name: string;
    nameAm?: string;
    description?: string;
    type: string; // Asset, Liability, Equity, Revenue, Expense
    isActive?: boolean;
    parentId?: string | null;
}) => {
    return financeApi.post('/AccountCategory', data);
};

/**
 * Update an account category
 */
export const updateAccountCategory = (data: {
    id: string;
    code: string;
    name: string;
    nameAm?: string;
    description?: string;
    type: string;
    isActive: boolean;
    parentId?: string | null;
}) => {
    return financeApi.put('/AccountCategory', data);
};

/**
 * Toggle account category active status
 */
export const toggleAccountCategoryStatus = (id: string) => {
    return financeApi.patch(`/AccountCategory/${id}/toggle-active`);
};

/**
 * Delete an account category
 */
export const deleteAccountCategory = (id: string) => {
    return financeApi.delete(`/AccountCategory/${id}`);
};

/**
 * Bulk delete account categories
 */
export const bulkDeleteAccountCategories = (ids: string[]) => {
    return financeApi.post('/AccountCategory/BulkDelete', { ids });
};

/**
 * Export account categories
 */
export const exportAccountCategories = (params?: {
    type?: string;
    isActive?: boolean;
    format?: 'csv' | 'json';
}) => {
    const format = params?.format || 'csv';
    return financeApi.get('/AccountCategory/Export', {
        params: {
            type: params?.type,
            isActive: params?.isActive,
            format: format
        },
        responseType: 'blob'
    });
};

// ============================================================
// CHART OF ACCOUNTS (Keep these as they are)
// ============================================================

/**
 * Get all chart of accounts with pagination and filtering
 */
export const getAccounts = (params?: {
    isActive?: boolean;
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
}) => {
    return financeApi.get('/ChartOfAccounts', { params });
};

/**
 * Get chart of accounts hierarchy
 */
export const getAccountHierarchy = () => {
    return financeApi.get('/ChartOfAccounts/Hierarchy');
};

/**
 * Get chart of accounts by ID
 */
export const getAccountById = (id: string) => {
    return financeApi.get(`/ChartOfAccounts/${id}`);
};

/**
 * Get chart of accounts by code
 */
export const getAccountByCode = (code: string) => {
    return financeApi.get(`/ChartOfAccounts/ByCode/${code}`);
};

/**
 * Get chart of accounts by type
 */
export const getAccountsByType = (accountType: string) => {
    return financeApi.get(`/ChartOfAccounts/ByType/${accountType}`);
};

/**
 * Get chart of accounts usage
 */
export const getAccountUsage = (id: string) => {
    return financeApi.get(`/ChartOfAccounts/${id}/usage`);
};

/**
 * Check if chart of accounts can be deleted
 */
export const canDeleteAccount = (id: string) => {
    return financeApi.get(`/ChartOfAccounts/${id}/can-delete`);
};

/**
 * Create a new chart of accounts
 */
// services/finance/financeApi.ts

export const createAccount = (data: any) => {
    // ✅ Make sure categoryId is included
    const payload = {
        code: data.code,
        name: data.name,
        nameAm: data.nameAm || '',
        accountType: data.accountType,
        accountSubType: data.accountSubType || '',
        description: data.description || '',
        level: data.level || 1,
        openingBalance: data.openingBalance || 0,
        parentId: data.parentId || null,
        categoryId: data.categoryId || null, // ✅ ADD THIS
        isActive: data.isActive !== undefined ? data.isActive : true,
        usefulLife: data.usefulLife || null,
        salvageValue: data.salvageValue || null,
        acquisitionDate: data.acquisitionDate || null,
        location: data.location || null,
        serialNumber: data.serialNumber || null,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        assignedTo: data.assignedTo || null,
        departmentId: data.departmentId || null,
    };
    return financeApi.post('/ChartOfAccounts', payload);
};

export const updateAccount = (data: any) => {
    // ✅ Make sure categoryId is included
    const payload = {
        id: data.id,
        code: data.code,
        name: data.name,
        nameAm: data.nameAm || '',
        accountType: data.accountType,
        accountSubType: data.accountSubType || '',
        description: data.description || '',
        level: data.level || 1,
        openingBalance: data.openingBalance || 0,
        parentId: data.parentId || null,
        categoryId: data.categoryId || null, // ✅ ADD THIS
        isActive: data.isActive !== undefined ? data.isActive : true,
        usefulLife: data.usefulLife || null,
        salvageValue: data.salvageValue || null,
        acquisitionDate: data.acquisitionDate || null,
        location: data.location || null,
        serialNumber: data.serialNumber || null,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        assignedTo: data.assignedTo || null,
        departmentId: data.departmentId || null,
        rowVersion: data.rowVersion || '',
    };
    return financeApi.put('/ChartOfAccounts', payload);
};

/**
 * Toggle chart of accounts active status
 */
export const toggleAccountStatus = (id: string) => {
    return financeApi.patch(`/ChartOfAccounts/${id}/toggle-active`);
};

/**
 * Delete a chart of accounts
 */
export const deleteAccount = (id: string) => {
    return financeApi.delete(`/ChartOfAccounts/${id}`);
};

/**
 * Bulk delete chart of accounts
 */
export const bulkDeleteAccounts = (ids: string[]) => {
    return financeApi.post('/ChartOfAccounts/BulkDelete', { ids });
};

/**
 * Export chart of accounts
 */
export const exportAccounts = (params?: {
    type?: string;
    isActive?: boolean;
    format?: 'csv' | 'json' | 'pdf';
}) => {
    const format = params?.format || 'csv';
    return financeApi.get('/ChartOfAccounts/Export', {
        params: {
            type: params?.type,
            isActive: params?.isActive,
            format: format
        },
        responseType: 'blob'
    });
};
/**
 * Get transaction types
 */
export const getTransactionTypes = () => {
    return financeApi.get('/BankTransaction/Types');
};
// ============================================================
// VOUCHER MANAGEMENT
// ============================================================
export const getVouchers = (params?: any) => financeApi.get('/Voucher', { params });
export const getVoucherById = (id: string) => financeApi.get(`/Voucher/${id}`);
export const createVoucher = (data: any) => financeApi.post('/Voucher', data);
// src/services/finance/finance.api.ts

// ✅ Fix: Use POST method (not PUT) and ensure ID is passed correctly
export const updateVoucher = async (id: string, data: any) => {
    if (!id) {
        console.error('❌ [API] updateVoucher called with undefined ID');
        throw new Error('Voucher ID is required for update');
    }

    console.log('📡 [API] Updating voucher with ID:', id);
    console.log('📡 [API] RowVersion being sent:', data.rowVersion);
    console.log('📡 [API] Full data:', JSON.stringify(data, null, 2));

    try {
        // ✅ PUT to /Voucher with ID in body - matches your Postman test
        const response = await financeApi.put('/Voucher', data);
        console.log('✅ [API] Update successful via PUT to /Voucher:', response.data);
        return response;
    } catch (error: any) {
        console.error('❌ [API] Update failed:', error.response?.data);
        throw error;
    }
};
export const deleteVoucher = (id: string) => financeApi.delete(`/Voucher/${id}`);
export const approveVoucher = (id: string) => financeApi.post(`/Voucher/${id}/approve`);
export const rejectVoucher = (id: string, data: any) => financeApi.post(`/Voucher/${id}/reject`, data);

// ============================================================
// COST CONTROLLING (Profit Centers, Internal Orders)
// ============================================================
export const getProfitCenters = (params?: any) => financeApi.get('/ProfitCenter', { params });
export const createProfitCenter = (data: any) => financeApi.post('/ProfitCenter', data);
export const updateProfitCenter = (data: any) => financeApi.put(`/ProfitCenter/${data.id}`, data);
export const deleteProfitCenter = (id: string) => financeApi.delete(`/ProfitCenter/${id}`);

export const getInternalOrders = (params?: any) => financeApi.get('/InternalOrder', { params });
export const createInternalOrder = (data: any) => financeApi.post('/InternalOrder', data);
export const updateInternalOrder = (data: any) => financeApi.put(`/InternalOrder/${data.id}`, data);
export const deleteInternalOrder = (id: string) => financeApi.delete(`/InternalOrder/${id}`);

// ============================================================
// CO REPORTS
// ============================================================
export const getCOReports = (params?: {
    type?: 'cost-center' | 'profit-center' | 'internal-order';
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/finance/co-reports', { params });
};

export const generateCOReport = (data: {
    type: 'cost-center' | 'profit-center' | 'internal-order';
    periodId: string;
    fromDate: string;
    toDate: string;
    format?: 'pdf' | 'excel' | 'csv';
}) => {
    return financeApi.post('/finance/co-reports/generate', data);
};

export const downloadCOReport = (id: string) => {
    return financeApi.get(`/finance/co-reports/${id}/download`, { responseType: 'blob' });
};

// ============================================================
// CONSOLIDATION
// ============================================================
export const getEntities = (params?: any) => financeApi.get('/Entity', { params });
export const createEntity = (data: any) => financeApi.post('/Entity', data);
export const updateEntity = (data: any) => financeApi.put(`/Entity/${data.id}`, data);
export const deleteEntity = (id: string) => financeApi.delete(`/Entity/${id}`);

export const getConsolidationGroups = (params?: any) => financeApi.get('/ConsolidationGroup', { params });
export const createConsolidationGroup = (data: any) => financeApi.post('/ConsolidationGroup', data);
export const updateConsolidationGroup = (data: any) => financeApi.put(`/ConsolidationGroup/${data.id}`, data);
export const deleteConsolidationGroup = (id: string) => financeApi.delete(`/ConsolidationGroup/${id}`);
export const runConsolidation = (id: string) => financeApi.post(`/ConsolidationGroup/${id}/run`);
export const getConsolidationResults = (id: string) => financeApi.get(`/ConsolidationGroup/${id}/results`);

export const getEliminationEntries = (params?: any) => financeApi.get('/elimination-entries', { params });
export const createEliminationEntry = (data: any) => financeApi.post('/elimination-entries', data);
export const updateEliminationEntry = (data: any) => financeApi.put(`/elimination-entries/${data.id}`, data);
export const deleteEliminationEntry = (id: string) => financeApi.delete(`/elimination-entries/${id}`);

// src/services/finance/finance.api.ts

// ============================================================
// CONSOLIDATION REPORTS
// ============================================================

// ============================================================
// CONSOLIDATION REPORTS
// ============================================================

export const getConsolidationReports = (params?: {
    groupId?: string;
    period?: string;
    status?: string;
}) => {
    return financeApi.get('/consolidation-reports', { params });
};

export const generateConsolidationReport = (data: {
    consolidationGroupId?: string | null;
    period?: string;
    format?: string;
    fromDate?: string | null;
    toDate?: string | null;
    includeEliminations?: boolean;
    includeAdjustments?: boolean;
}) => {
    // ✅ Clean up the data - remove undefined values
    const cleanData: any = {};

    if (data.consolidationGroupId) {
        cleanData.consolidationGroupId = data.consolidationGroupId;
    }
    if (data.period) {
        cleanData.period = data.period;
    }
    if (data.format) {
        cleanData.format = data.format;
    }
    if (data.fromDate) {
        cleanData.fromDate = data.fromDate;
    }
    if (data.toDate) {
        cleanData.toDate = data.toDate;
    }
    if (data.includeEliminations !== undefined) {
        cleanData.includeEliminations = data.includeEliminations;
    }
    if (data.includeAdjustments !== undefined) {
        cleanData.includeAdjustments = data.includeAdjustments;
    }

    console.log('Sending generate request:', cleanData);

    return financeApi.post('/consolidation-reports/generate', cleanData);
};

export const downloadConsolidationReport = async (id: string, format: string = 'pdf') => {
    try {
        const response = await financeApi.get(`/consolidation-reports/${id}/download`, {
            params: { format },
            responseType: 'blob'
        });

        const blob = new Blob([response.data], {
            type: response.headers['content-type'] || 'application/octet-stream'
        });

        if (blob.size === 0) {
            throw new Error('Downloaded file is empty');
        }

        const contentDisposition = response.headers['content-disposition'];
        let filename = `Consolidation-Report-${id}.${format}`;
        if (contentDisposition) {
            const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '');
            }
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, filename };
    } catch (error) {
        console.error('Error downloading report:', error);
        throw error;
    }
};
// ============================================================
// COMPLIANCE MANAGEMENT
// ============================================================
export const getInternalControls = (params?: any) => financeApi.get('/InternalControl', { params });
export const createInternalControl = (data: any) => financeApi.post('/InternalControl', data);
export const updateInternalControl = (data: any) => financeApi.put(`/InternalControl/${data.id}`, data);
export const deleteInternalControl = (id: string) => financeApi.delete(`/InternalControl/${id}`);
export const runControlTest = (data: {
    controlId: string;
    testDate: string;
    results: string;
    testedBy: string;
}) => {
    return financeApi.post(`/InternalControl/${data.controlId}/test`, {
        testDate: data.testDate,
        results: data.results,
        testedBy: data.testedBy
    });
};

export const getComplianceRequirements = (params?: any) => financeApi.get('/ComplianceRequirement', { params });
export const createComplianceRequirement = (data: any) => financeApi.post('/ComplianceRequirement', data);
export const updateComplianceRequirement = (data: any) => financeApi.put(`/ComplianceRequirement/${data.id}`, data);
export const deleteComplianceRequirement = (id: string) => financeApi.delete(`/ComplianceRequirement/${id}`);

export const getComplianceReports = (params?: {
    requirementId?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
}) => {
    return financeApi.get('/compliance/reports', { params });
};

export const generateComplianceReport = (data: {
    requirementId: string;
    periodId: string;
    format?: 'pdf' | 'excel' | 'csv';
}) => {
    return financeApi.post('/compliance/reports/generate', data);
};

export const downloadComplianceReport = (id: string) => {
    return financeApi.get(`/compliance/reports/${id}/download`, { responseType: 'blob' });
};

// ============================================================
// AUDIT FINDINGS
// ============================================================
export const getAuditFindings = (params: {
    status?: string;
    severity?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/Audit/Findings', { params });
};

export const createAuditFinding = (data: any) => {
    return financeApi.post('/Audit/Findings', data);
};

export const resolveAuditFinding = (id: string, data: {
    resolution: string;
    resolvedBy: string;
    resolvedDate: string;
}) => {
    return financeApi.post(`/Audit/Findings/${id}/resolve`, data);
};

// ============================================================
// VENDOR PORTAL
// ============================================================
export const getPortalVendors = (params?: any) => financeApi.get('/VendorPortal/Vendors', { params });
export const createPortalVendor = (data: any) => financeApi.post('/VendorPortal/Vendors', data);
export const updatePortalVendor = (data: any) => financeApi.put(`/VendorPortal/Vendors/${data.id}`, data);
export const deletePortalVendor = (id: string) => financeApi.delete(`/VendorPortal/Vendors/${id}`);

export const getPortalInvoices = (params?: any) => financeApi.get('/VendorPortal/invoices', { params });
export const submitPortalInvoice = (data: any) => financeApi.post('/VendorPortal/invoices', data);
export const updatePortalInvoice = (data: any) => financeApi.put(`/VendorPortal/invoices/${data.id}`, data);
export const deletePortalInvoice = (id: string) => financeApi.delete(`/VendorPortal/invoices/${id}`);
export const getInvoiceTracking = (id: string) => financeApi.get(`/VendorPortal/invoices/${id}/tracking`);

export const getPortalPayments = (params?: any) =>
    financeApi.get('/VendorPortal/Payments', { params });

export const getPortalPaymentById = (id: string) =>
    financeApi.get(`/VendorPortal/Payments/${id}`);

export const getPortalPaymentsByInvoice = (invoiceId: string) =>
    financeApi.get(`/VendorPortal/Payments/Invoice/${invoiceId}`);

export const createPortalPayment = (data: any) =>
    financeApi.post('/VendorPortal/Payments', data);

export const updatePortalPayment = (data: any) =>
    financeApi.put('/VendorPortal/Payments', data);

export const updatePaymentStatus = (id: string, data: { status: string }) =>
    financeApi.patch(`/VendorPortal/Payments/${id}/Status`, data);

export const processPortalPayment = (id: string) =>
    financeApi.post(`/VendorPortal/Payments/${id}/Process`);

export const deletePortalPayment = (id: string) =>
    financeApi.delete(`/VendorPortal/Payments/${id}`);

export const getPortalPaymentSummary = (params?: any) =>
    financeApi.get('/VendorPortal/Payments/Summary', { params });

export const getPortalNotifications = (params?: any) => financeApi.get('/VendorPortal/notifications', { params });
export const markPortalNotificationRead = (id: string) => financeApi.put(`/VendorPortal/notifications/${id}/read`);
export const sendPortalNotification = (data: any) => financeApi.post('/VendorPortal/notifications', data);
export const deletePortalNotification = (id: string) => financeApi.delete(`/VendorPortal/notifications/${id}`);

// ============================================================
// IFRS REPORTS
// IFRS REPORTS
// ============================================================
export const getIFRSReports = (params?: any) => financeApi.get('/IFRSReport', { params });
export const getIFRSReportById = (id: string) => financeApi.get(`/IFRSReport/${id}`);
export const generateIFRSReport = (data: any) => financeApi.post('/IFRSReport/generate', data);
export const downloadIFRSReport = (id: string) => financeApi.get(`/IFRSReport/${id}/download`, { responseType: 'blob' });
export const scheduleIFRSReport = (data: any) => financeApi.post('/IFRSReport/schedule', data);

// ============================================================
// DASHBOARD
// ============================================================
export const getFinanceDashboard = (params?: { periodId?: string }) => {
    return financeApi.get('/Dashboard/Overview', { params });
};

export const getFinanceKPIs = (params?: { periodId?: string }) => {
    return financeApi.get('/Dashboard/KPIs', { params });
};

export const getFinanceCharts = (params?: { periodId?: string }) => {
    return financeApi.get('/Dashboard/Charts', { params });
};

// ============================================================
// RECONCILIATION
// ============================================================
export const getReconciliationSummary = (params?: {
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/BankTransaction/ReconciliationSummary', { params });
};

export const getReconciliationDetails = (id: string) => {
    return financeApi.get(`/BankTransaction/Reconciliation/${id}`);
};

export const runReconciliation = (data: {
    bankAccountId: string;
    fromDate: string;
    toDate: string;
    statementBalance: number;
}) => {
    return financeApi.post('BankTransaction/Reconciliation/Run', data);
};

export const confirmReconciliation = (id: string) => {
    return financeApi.post(`BankTransaction/Reconciliation/${id}/confirm`);
};

// ============================================================
// FIXED ASSETS
// ============================================================
export const getFixedAssets = (params?: {
    category?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/FixedAssets', { params });
};

export const getFixedAssetById = (id: string) => {
    return financeApi.get(`/FixedAssets/${id}`);
};

export const createFixedAsset = (data: any) => {
    return financeApi.post('/FixedAssets', data);
};

export const updateFixedAsset = (data: any) => {
    return financeApi.put('/FixedAssets', data);
};

export const deleteFixedAsset = (id: string) => {
    return financeApi.delete(`/FixedAssets/${id}`);
};

export const depreciateFixedAsset = (id: string, data?: { periodId?: string }) => {
    return financeApi.post(`/FixedAssets/${id}/depreciate`, data || {});
};

export const getFixedAssetDepreciation = (id: string, params?: { periodId?: string }) => {
    return financeApi.get(`/FixedAssets/${id}/depreciation`, { params });
};

// ============================================================
// BUDGET VS ACTUAL
// ============================================================
export const getBudgetVsActual = (params: {
    periodId: string;
    fromDate?: string;
    toDate?: string;
    departmentId?: string;
    branchId?: string;
    costCenterId?: string;
}) => {
    return financeApi.get('/BudgetVsActual', { params });
};

export const getBudgetVsActualDetail = (params: {
    periodId: string;
    accountId: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/BudgetVsActual/Detail', { params });
};

// ============================================================
// FORECASTING
// ============================================================
export const getForecast = (params: {
    periodId: string;
    horizon: string; // 'quarterly' | 'yearly'
    fromDate: string;
    toDate: string;
}) => {
    return financeApi.get('/Forecast', { params });
};

export const generateForecast = (data: {
    periodId: string;
    method: string; // 'linear' | 'exponential' | 'moving-average'
    fromDate: string;
    toDate: string;
}) => {
    return financeApi.post('/Forecast/Generate', data);
};

// ============================================================
// CASH FLOW
// ============================================================
export const getCashFlow = (params: {
    periodId: string;
    fromDate: string;
    toDate: string;
}) => {
    return financeApi.get('/CashFlow', { params });
};

export const getCashFlowForecast = (params: {
    periodId: string;
    days: number;
}) => {
    return financeApi.get('/CashFlow/Forecast', { params });
};

// ============================================================
// FINANCIAL STATEMENT REPORTS
// ============================================================
export const getIncomeStatement = (params: { startDate: string; endDate: string }) => {
    return financeApi.get('/Reports/IncomeStatement', { params });
};

export const getBalanceSheet = (params: { asOfDate: string }) => {
    return financeApi.get('/Reports/BalanceSheet', { params });
};

export const getCashFlowStatement = (params: { startDate: string; endDate: string }) => {
    return financeApi.get('/Reports/CashFlow', { params });
};

export const getExpenseReport = (params: { startDate: string; endDate: string }) => {
    return financeApi.get('/Reports/ExpenseReport', { params });
};

// ============================================================
// ACCOUNTING ENTRIES
// ============================================================
export const getAccountingEntries = (params: {
    fromDate?: string;
    toDate?: string;
    accountId?: string;
    journalEntryId?: string;
    status?: string;
}) => {
    return financeApi.get('/AccountingEntries', { params });
};

export const reverseAccountingEntry = (id: string) => {
    return financeApi.post(`/AccountingEntries/${id}/reverse`);
};

// ============================================================
// CLOSING ACTIVITIES
// ============================================================
export const getClosingActivities = (params: {
    periodId: string;
}) => {
    return financeApi.get('/Closing/Activities', { params });
};

export const runClosingActivity = (data: {
    periodId: string;
    activityType: string; // 'revaluation' | 'depreciation' | 'accrual' | 'provision'
}) => {
    return financeApi.post('/Closing/Run', data);
};

export const getClosingSummary = (periodId: string) => {
    return financeApi.get(`/Closing/${periodId}/summary`);
};

// ============================================================
// TAX COMPLIANCE
// ============================================================
export const getTaxCompliance = (params: {
    periodId: string;
    taxType?: string;
}) => {
    return financeApi.get('/Tax/Compliance', { params });
};

export const getTaxFilingHistory = (params: {
    periodId?: string;
    taxType?: string;
}) => {
    return financeApi.get('/Tax/FilingHistory', { params });
};

// ============================================================
// BANKING (Statement Import, Matching)
// ============================================================
export const getBankStatementImport = (params: {
    bankAccountId: string;
    fromDate: string;
    toDate: string;
}) => {
    return financeApi.get('/Banking/StatementImport', { params });
};

export const importBankStatement = (data: {
    bankAccountId: string;
    fileContent: string;
    fileFormat: string; // 'csv' | 'excel' | 'xml'
}) => {
    return financeApi.post('/Banking/ImportStatement', data);
};

export const matchBankTransactions = (data: {
    bankStatementId: string;
    matches: Array<{
        bankTransactionId: string;
        systemTransactionId: string;
    }>;
}) => {
    return financeApi.post('/Banking/MatchTransactions', data);
};

// ============================================================
// RATIO ANALYSIS
// ============================================================
export const getFinancialRatios = (params: {
    periodId: string;
    fromDate: string;
    toDate: string;
}) => {
    return financeApi.get('/FinancialRatios', { params });
};

export const getFinancialRatioTrend = (params: {
    fromPeriodId: string;
    toPeriodId: string;
}) => {
    return financeApi.get('/FinancialRatios/Trend', { params });
};

// ============================================================
// EXPORT / IMPORT
// ============================================================
export const exportFinanceData = (data: {
    module: string;
    periodId: string;
    format: string; // 'excel' | 'pdf' | 'csv'
    filters?: any;
}) => {
    return financeApi.post('/Export/FinanceData', data, {
        responseType: 'blob'
    });
};

export const importFinanceData = (data: {
    module: string;
    periodId: string;
    file: File;
    mapping?: any;
}) => {
    const formData = new FormData();
    formData.append('module', data.module);
    formData.append('periodId', data.periodId);
    formData.append('file', data.file);
    if (data.mapping) {
        formData.append('mapping', JSON.stringify(data.mapping));
    }
    return financeApi.post('/Import/FinanceData', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};


// Add these to your finance.api.ts file (src/services/finance/finance.api.ts)

// ============================================================
// COST CONTROLLING (CO) REPORTS - COMPLETE
// ============================================================

// Cost Center Allocations
export const getCostCenterAllocations = (params?: {
    costCenterId?: string;
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/finance/co-reports/cost-center-allocations', { params });
};

export const createCostCenterAllocation = (data: {
    costCenterId: string;
    amount: number;
    periodId: string;
    description?: string;
}) => {
    return financeApi.post('/finance/co-reports/cost-center-allocations', data);
};

export const updateCostCenterAllocation = (id: string, data: any) => {
    return financeApi.put(`/finance/co-reports/cost-center-allocations/${id}`, data);
};

export const deleteCostCenterAllocation = (id: string) => {
    return financeApi.delete(`/finance/co-reports/cost-center-allocations/${id}`);
};

// CO Reports


export const getCOReportById = (id: string) => {
    return financeApi.get(`/finance/co-reports/${id}`);
};





export const getCOReportSummary = (params?: {
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/finance/co-reports/summary', { params });
};

export const getCOReportTrend = (params?: {
    costCenterId?: string;
    profitCenterId?: string;
    internalOrderId?: string;
    fromDate?: string;
    toDate?: string;
    interval?: 'monthly' | 'quarterly' | 'yearly';
}) => {
    return financeApi.get('/finance/co-reports/trend', { params });
};

// Cost Center Reports
export const getCostCenterReport = (params?: {
    costCenterId?: string;
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/finance/co-reports/cost-centers', { params });
};

export const getCostCenterDetail = (id: string, params?: {
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get(`/finance/co-reports/cost-centers/${id}`, { params });
};

// Profit Center Reports
export const getProfitCenterReport = (params?: {
    profitCenterId?: string;
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/finance/co-reports/profit-centers', { params });
};

export const getProfitCenterDetail = (id: string, params?: {
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get(`/finance/co-reports/profit-centers/${id}`, { params });
};

// Internal Order Reports
export const getInternalOrderReport = (params?: {
    internalOrderId?: string;
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/finance/co-reports/internal-orders', { params });
};

export const getInternalOrderDetail = (id: string, params?: {
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get(`/finance/co-reports/internal-orders/${id}`, { params });
};

// CO Budget vs Actual
export const getCOBudgetVsActual = (params: {
    costCenterId?: string;
    profitCenterId?: string;
    internalOrderId?: string;
    periodId: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/finance/co-reports/budget-vs-actual', { params });
};

// CO Variance Analysis
export const getCOVarianceAnalysis = (params: {
    costCenterId?: string;
    profitCenterId?: string;
    internalOrderId?: string;
    periodId: string;
    fromDate?: string;
    toDate?: string;
    varianceType?: 'favorable' | 'unfavorable' | 'all';
}) => {
    return financeApi.get('/finance/co-reports/variance-analysis', { params });
};

// CO Export
export const exportCOReport = (data: {
    type: 'cost-center' | 'profit-center' | 'internal-order' | 'all';
    periodId: string;
    fromDate: string;
    toDate: string;
    format: 'pdf' | 'excel' | 'csv';
    costCenterIds?: string[];
    profitCenterIds?: string[];
    internalOrderIds?: string[];
}) => {
    return financeApi.post('/finance/co-reports/export', data, {
        responseType: 'blob'
    });
};

// CO Allocation Rules
export const getAllocationRules = (params?: {
    costCenterId?: string;
    isActive?: boolean;
}) => {
    return financeApi.get('/finance/co-reports/allocation-rules', { params });
};

export const createAllocationRule = (data: {
    name: string;
    description?: string;
    costCenterId: string;
    allocationMethod: 'percentage' | 'fixed' | 'activity-based';
    percentage?: number;
    fixedAmount?: number;
    activityDriver?: string;
    isActive?: boolean;
}) => {
    return financeApi.post('/finance/co-reports/allocation-rules', data);
};

export const updateAllocationRule = (id: string, data: any) => {
    return financeApi.put(`/finance/co-reports/allocation-rules/${id}`, data);
};

export const deleteAllocationRule = (id: string) => {
    return financeApi.delete(`/finance/co-reports/allocation-rules/${id}`);
};

// ============================================================
// COST DISTRIBUTION
// ============================================================
export const getCostDistribution = (params: {
    costCenterId?: string;
    periodId: string;
    fromDate?: string;
    toDate?: string;
    distributionType?: 'direct' | 'indirect' | 'all';
}) => {
    return financeApi.get('/finance/co-reports/cost-distribution', { params });
};

export const allocateCosts = (data: {
    fromCostCenterId: string;
    toCostCenterIds: string[];
    amount: number;
    periodId: string;
    description?: string;
    allocationDate: string;
}) => {
    return financeApi.post('/finance/co-reports/allocate-costs', data);
};

// ============================================================
// CO PERFORMANCE METRICS
// ============================================================
export const getCOPerformanceMetrics = (params: {
    costCenterId?: string;
    profitCenterId?: string;
    internalOrderId?: string;
    periodId: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/finance/co-reports/performance-metrics', { params });
};

export const getCOKPIs = (params: {
    periodId: string;
    costCenterId?: string;
    profitCenterId?: string;
}) => {
    return financeApi.get('/finance/co-reports/kpis', { params });
};

// ============================================================
// CO COST DRIVERS
// ============================================================
export const getCostDrivers = (params?: {
    costCenterId?: string;
    isActive?: boolean;
}) => {
    return financeApi.get('/finance/co-reports/cost-drivers', { params });
};

export const createCostDriver = (data: {
    name: string;
    description?: string;
    unit: string;
    rate: number;
    costCenterId?: string;
    isActive?: boolean;
}) => {
    return financeApi.post('/finance/co-reports/cost-drivers', data);
};

export const updateCostDriver = (id: string, data: any) => {
    return financeApi.put(`/finance/co-reports/cost-drivers/${id}`, data);
};

export const deleteCostDriver = (id: string) => {
    return financeApi.delete(`/finance/co-reports/cost-drivers/${id}`);
};






export const getFinancialPeriodById = (id: string) => {
    return financeApi.get(`/PeriodClosing/${id}`);
};

// src/services/finance/finance.api.ts

// ============================================================
// JOURNAL ENTRIES - COMPLETE API
// ============================================================

/**
 * Get all journal entries with pagination and filtering
 */
export const getJournalEntries = (params?: {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    isPosted?: boolean;
    isApproved?: boolean;
    isReversed?: boolean;
    entryType?: string;
    periodId?: string;
    branchId?: string;
    departmentId?: string;
    search?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string;
    sortOrder?: string;
}) => {
    return financeApi.get('/JournalEntry/All', { params });
};

/**
 * Get journal entry by ID
 */
export const getJournalEntryById = (id: string) => {
    return financeApi.get(`/JournalEntry/${id}`);
};

/**
 * Get journal entry by reference
 */
export const getJournalEntryByReference = (reference: string) => {
    return financeApi.get(`/JournalEntry/ByReference/${reference}`);
};

/**
 * Get unposted journal entries
 */
export const getUnpostedJournalEntries = () => {
    return financeApi.get('/JournalEntry/Unposted');
};

/**
 * Get journal entries by period
 */
export const getJournalEntriesByPeriod = (periodId: string) => {
    return financeApi.get(`/JournalEntry/ByPeriod/${periodId}`);
};

/**
 * Get journal entry summary
 */
export const getJournalEntrySummary = (params?: {
    periodId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return financeApi.get('/JournalEntry/Summary', { params });
};

/**
 * Create a new journal entry
 */
// services/finance/journal-entries/journalEntryService.ts

/**
 * Create a new journal entry
 */
export const createJournalEntry = (data: {
    reference: string;
    entryDate: string;
    description: string;
    entryType?: string;
    periodId: string;
    branchId?: string;
    departmentId?: string;
    employeeId?: string;
    totalDebit: number;
    totalCredit: number;
    createdByUserId?: string;   // ✅ ADD THIS
    createdByUserName?: string; // ✅ ADD THIS
    lines: Array<{
        accountId: string;
        direction: 'Debit' | 'Credit';
        amount: number;
        description?: string;
    }>;
}) => {
    const payload = {
        reference: data.reference,
        entryDate: data.entryDate,
        description: data.description,
        entryType: data.entryType || 'General',
        periodId: data.periodId,
        branchId: data.branchId || null,
        departmentId: data.departmentId || null,
        employeeId: data.employeeId || null,
        totalDebit: data.totalDebit,
        totalCredit: data.totalCredit,
        createdByUserId: data.createdByUserId || null,   // ✅ ADD THIS
        createdByUserName: data.createdByUserName || null, // ✅ ADD THIS
        lines: data.lines.map(line => ({
            accountId: line.accountId,
            direction: line.direction,
            amount: line.amount,
            description: line.description || '',
        })),
    };
    return financeApi.post('/JournalEntry', payload);
};

/**
 * Update a journal entry
 */
export const updateJournalEntry = (data: {
    id: string;
    reference: string;
    entryDate: string;
    description: string;
    entryType?: string;
    periodId: string;
    branchId?: string;
    departmentId?: string;
    employeeId?: string;
    totalDebit: number;
    totalCredit: number;
    rowVersion?: string;
    updatedByUserId?: string;   // ✅ ADD THIS
    updatedByUserName?: string; // ✅ ADD THIS
    lines: Array<{
        id?: string;
        accountId: string;
        direction: 'Debit' | 'Credit';
        amount: number;
        description?: string;
    }>;
}) => {
    const payload = {
        id: data.id,
        reference: data.reference,
        entryDate: data.entryDate,
        description: data.description,
        entryType: data.entryType || 'General',
        periodId: data.periodId,
        branchId: data.branchId || null,
        departmentId: data.departmentId || null,
        employeeId: data.employeeId || null,
        totalDebit: data.totalDebit,
        totalCredit: data.totalCredit,
        rowVersion: data.rowVersion || '',
        updatedByUserId: data.updatedByUserId || null,   // ✅ ADD THIS
        updatedByUserName: data.updatedByUserName || null, // ✅ ADD THIS
        lines: data.lines.map(line => ({
            id: line.id,
            accountId: line.accountId,
            direction: line.direction,
            amount: line.amount,
            description: line.description || '',
        })),
    };
    return financeApi.put('/JournalEntry', payload);
};

/**
 * Delete a journal entry
 */


/**
 * Post a journal entry
 */


/**
 * Unpost a journal entry
 */


/**
 * Approve a journal entry
 */
export const approveJournalEntry = (id: string) => {
    return financeApi.post(`/JournalEntry/${id}/approve`);
};

/**
 * Reject a journal entry
 */
export const rejectJournalEntry = (id: string, reason: string) => {
    return financeApi.post(`/JournalEntry/${id}/reject`, { reason });
};

/**
 * Reverse a journal entry
 */
export const reverseJournalEntry = (data: {
    id: string;
    reason?: string;
    reverseDate: string;
}) => {
    return financeApi.post(`/JournalEntry/${data.id}/reverse`, {
        reason: data.reason,
        reverseDate: data.reverseDate
    });
};

/**
 * Export journal entries
 */
export const exportJournalEntries = (
    params?: {
        periodId?: string;
        fromDate?: string;
        toDate?: string;
        entryType?: string;
        isPosted?: boolean;
    },
    format: 'csv' | 'json' = 'csv'
) => {
    return financeApi.get('/JournalEntry/Export', {
        params: {
            ...params,
            format
        },
        responseType: 'blob'
    });
};

// ============================================================
// ACCOUNTS (Chart of Accounts)
// ============================================================



// ============================================================
// COST CENTERS
// ============================================================



export const getCostCenterById = (id: string) => {
    return financeApi.get(`/CostCenter/${id}`);
};

// ============================================================
// FINANCIAL PERIODS
// ============================================================

// services/finance/finance.api.ts

// services/finance/finance.api.ts

export const getAnalyticsDashboard = async (params?: {
    periodStart?: string;
    periodEnd?: string;
    periodType?: string;
    fiscalYear?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    if (params?.periodType) queryParams.append('periodType', params.periodType);
    if (params?.fiscalYear) queryParams.append('fiscalYear', params.fiscalYear);

    const url = `/Analytics/Dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return financeApi.get(url);
};

export const getRevenueTrend = async (months: number = 12, endDate?: string) => {
    const params: any = { months };
    if (endDate) params.endDate = endDate;
    return financeApi.get('/Analytics/RevenueTrend', { params });
};

export const getPurchaseTrend = async (months: number = 12, endDate?: string) => {
    const params: any = { months };
    if (endDate) params.endDate = endDate;
    return financeApi.get('/Analytics/PurchaseTrend', { params });
};

export const getAgingReport = async (asOfDate?: string) => {
    const params: any = {};
    if (asOfDate) params.asOfDate = asOfDate;
    return financeApi.get('/Analytics/Aging', { params });
};

export const getPaymentAnalytics = async (params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    const url = `/Analytics/PaymentAnalytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return financeApi.get(url);
};

export const getExpenseAnalytics = async (params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    const url = `/Analytics/ExpenseAnalytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return financeApi.get(url);
};

export const getBudgetAnalytics = async (params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    const url = `/Analytics/BudgetAnalytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return financeApi.get(url);
};

export const getInvoiceStatusSummary = async (params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    const url = `/Analytics/InvoiceStatusSummary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return financeApi.get(url);
};

export const getSalesInvoiceStatus = async (params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    const url = `/Analytics/SalesInvoiceStatus${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return financeApi.get(url);
};

export const getPurchaseInvoiceStatus = async (params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.periodStart) queryParams.append('periodStart', params.periodStart);
    if (params?.periodEnd) queryParams.append('periodEnd', params.periodEnd);
    const url = `/Analytics/PurchaseInvoiceStatus${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return financeApi.get(url);
};

export const getMonthlyRevenue = async (months: number = 12, endDate?: string) => {
    const params: any = { months };
    if (endDate) params.endDate = endDate;
    return financeApi.get('/Analytics/MonthlyRevenue', { params });
};

export const getMonthlyPurchaseExpense = async (months: number = 12, endDate?: string) => {
    const params: any = { months };
    if (endDate) params.endDate = endDate;
    return financeApi.get('/Analytics/MonthlyPurchaseExpense', { params });
};

export const getTopCustomers = async (count: number = 10, params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams: any = { count };
    if (params?.periodStart) queryParams.periodStart = params.periodStart;
    if (params?.periodEnd) queryParams.periodEnd = params.periodEnd;
    return financeApi.get('/Analytics/TopCustomers', { params: queryParams });
};

export const getTopVendors = async (count: number = 10, params?: {
    periodStart?: string;
    periodEnd?: string;
}) => {
    const queryParams: any = { count };
    if (params?.periodStart) queryParams.periodStart = params.periodStart;
    if (params?.periodEnd) queryParams.periodEnd = params.periodEnd;
    return financeApi.get('/Analytics/TopVendors', { params: queryParams });
};


// ============================================================
// EXPORT DEFAULT
// ============================================================
export default financeApi;