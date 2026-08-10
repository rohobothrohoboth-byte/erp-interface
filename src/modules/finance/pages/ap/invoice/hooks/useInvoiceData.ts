// src/pages/finance/ap/invoice/hooks/useInvoiceData.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    getInvoices,
    getPurchaseInvoices,
    getSalesInvoices,
    getVendors,
    getCustomers,
    getFinancialPeriods,
    getAllFinancialPeriods,
} from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import type { Invoice, InvoiceStats } from '@/modules/finance/pages/ap/invoice/types/invoice.types';
import { calculateStats, filterInvoices } from '@/modules/finance/pages/ap/invoice/utils/invoice.utils';

export const useInvoiceData = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPeriods, setLoadingPeriods] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState<'All' | 'Purchase' | 'Sales'>('All');
    const [filterPeriodId, setFilterPeriodId] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);

    // ✅ Use ref to prevent infinite loops
    const isFirstRender = useRef(true);
    const hasLoggedData = useRef(false);

    // ✅ Helper to determine if period is currently active based on dates
    const isPeriodCurrentlyActive = useCallback((period: any) => {
        if (period.isActive) return true;
        if (period.startDate && period.endDate) {
            const now = new Date();
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            return now >= start && now <= end;
        }
        return false;
    }, []);

    // ✅ Helper to get period status
    const getPeriodStatus = useCallback((period: any) => {
        if (!period) return { status: 'unknown', label: 'Unknown', icon: '❓', color: 'text-gray-500' };

        if (period.isClosed) {
            return { status: 'closed', label: 'Closed', icon: '🔒', color: 'text-red-500' };
        }

        if (period.isActive || isPeriodCurrentlyActive(period)) {
            return { status: 'active', label: 'Active', icon: '✅', color: 'text-green-500' };
        }

        if (period.startDate && period.endDate) {
            const now = new Date();
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            if (now < start) {
                return { status: 'future', label: 'Future', icon: '📅', color: 'text-amber-500' };
            }
            if (now > end) {
                return { status: 'expired', label: 'Expired', icon: '⏰', color: 'text-orange-500' };
            }
        }
        return { status: 'inactive', label: 'Inactive', icon: '⏳', color: 'text-gray-500' };
    }, [isPeriodCurrentlyActive]);

    // ✅ Fetch periods
    const fetchPeriods = useCallback(async () => {
        try {
            setLoadingPeriods(true);
            console.log('📡 [useInvoiceData] Fetching financial periods...');

            let response;
            try {
                response = await getAllFinancialPeriods({ isClosed: false });
            } catch (error) {
                console.log('📡 [useInvoiceData] Falling back to getFinancialPeriods...');
                response = await getFinancialPeriods({ status: 'All' });
            }

            console.log('📡 [useInvoiceData] API Response:', response);

            let data = [];
            if (response?.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    data = response.data.items;
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    data = response.data.results;
                } else if (response.data.list && Array.isArray(response.data.list)) {
                    data = response.data.list;
                } else if (response.data.periods && Array.isArray(response.data.periods)) {
                    data = response.data.periods;
                } else {
                    // Try to find any array in the response
                    const keys = Object.keys(response.data);
                    for (const key of keys) {
                        if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                            console.log(`📡 Found array in response.data.${key}:`, response.data[key].length);
                            data = response.data[key];
                            break;
                        }
                    }
                    if (data.length === 0 && response.data.length !== undefined) {
                        data = response.data;
                    }
                }
            }

            console.log('📥 [useInvoiceData] Periods fetched:', data.length);
            setPeriods(data);

            // ✅ Auto-select active period
            const active = data.find((p: any) => !p.isClosed && (p.isActive || isPeriodCurrentlyActive(p)));
            if (active) {
                console.log('📅 [useInvoiceData] Auto-selected active period:', active.name);
                setFilterPeriodId(active.id);
            } else if (data.length > 0) {
                // If no active period, select the first open one
                const firstOpen = data.find((p: any) => !p.isClosed);
                if (firstOpen) {
                    console.log('📅 [useInvoiceData] Selected first open period:', firstOpen.name);
                    setFilterPeriodId(firstOpen.id);
                }
            }

            return data;
        } catch (error) {
            console.error('❌ [useInvoiceData] Error fetching periods:', error);
            showToast.error('Failed to load financial periods');
            return [];
        } finally {
            setLoadingPeriods(false);
        }
    }, [isPeriodCurrentlyActive]);

    // ✅ Fetch all data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            console.log('📡 [useInvoiceData] Fetching data...');

            // Fetch periods first
            const periodsData = await fetchPeriods();
            const periodMap: Record<string, string> = {};
            periodsData.forEach((p: any) => {
                if (p.id) {
                    periodMap[p.id] = p.name || 'Unknown Period';
                }
            });

            // Build params
            const params: any = {};
            if (filterPeriodId && filterPeriodId !== 'all') {
                params.periodId = filterPeriodId;
            }
            if (dateRange?.from) {
                const fromDate = new Date(dateRange.from);
                fromDate.setHours(0, 0, 0, 0);
                params.fromDate = fromDate.toISOString();
            }
            if (dateRange?.to) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                params.toDate = toDate.toISOString();
            }
            if (filterStatus && filterStatus !== 'All') {
                params.status = filterStatus;
            }

            console.log('🔍 [useInvoiceData] Fetch params:', params);

            // Fetch vendors and customers
            const [vendorsRes, customersRes] = await Promise.all([
                getVendors(),
                getCustomers(),
            ]);

            let vendorsData = [];
            if (vendorsRes.data) {
                if (Array.isArray(vendorsRes.data)) {
                    vendorsData = vendorsRes.data;
                } else if (vendorsRes.data.data && Array.isArray(vendorsRes.data.data)) {
                    vendorsData = vendorsRes.data.data;
                } else if (vendorsRes.data.$values && Array.isArray(vendorsRes.data.$values)) {
                    vendorsData = vendorsRes.data.$values;
                }
            }
            setVendors(vendorsData);

            let customersData = [];
            if (customersRes.data) {
                if (Array.isArray(customersRes.data)) {
                    customersData = customersRes.data;
                } else if (customersRes.data.data && Array.isArray(customersRes.data.data)) {
                    customersData = customersRes.data.data;
                } else if (customersRes.data.$values && Array.isArray(customersRes.data.$values)) {
                    customersData = customersRes.data.$values;
                }
            }
            setCustomers(customersData);

            // Build maps
            const vendorMap: Record<string, string> = {};
            vendorsData.forEach((v: any) => {
                const id = v.id || v.vendorId;
                if (id) vendorMap[id] = v.name || v.vendorName || v.displayName || 'Unknown Vendor';
            });

            const customerMap: Record<string, string> = {};
            customersData.forEach((c: any) => {
                const id = c.id || c.customerId;
                if (id) customerMap[id] = c.name || c.customerName || c.displayName || 'Unknown Customer';
            });

            // Fetch invoices
            let invoicesRes;
            if (filterType === 'All') {
                invoicesRes = await getInvoices(params);
            } else if (filterType === 'Purchase') {
                invoicesRes = await getPurchaseInvoices(params);
            } else {
                invoicesRes = await getSalesInvoices(params);
            }

            let invoicesData = [];
            if (invoicesRes.data) {
                if (Array.isArray(invoicesRes.data)) {
                    invoicesData = invoicesRes.data;
                } else if (invoicesRes.data.data && Array.isArray(invoicesRes.data.data)) {
                    invoicesData = invoicesRes.data.data;
                } else if (invoicesRes.data.$values && Array.isArray(invoicesRes.data.$values)) {
                    invoicesData = invoicesRes.data.$values;
                }
            }

            console.log('📦 [useInvoiceData] Invoices fetched:', invoicesData.length);

            // Map invoices
            const mappedInvoices: Invoice[] = invoicesData.map((inv: any) => {
                const totalAmount = Number(inv.totalAmount || inv.total_amount || 0);
                const paidAmount = Number(inv.paidAmount || inv.paid_amount || 0);
                const balanceDue = totalAmount - paidAmount;
                const invoiceType = inv.invoiceType || inv.InvoiceType || 'Purchase';
                const periodId = inv.periodId || inv.PeriodId || '';
                const periodName = periodMap[periodId] || inv.periodName || inv.PeriodName || '';

                return {
                    id: inv.id,
                    invoiceNumber: inv.invoiceNumber || inv.invoice_no || `INV-${String(invoicesData.indexOf(inv) + 1).padStart(4, '0')}`,
                    invoiceType: invoiceType,
                    vendorId: invoiceType === 'Purchase' ? (inv.vendorId || inv.vendor_id || inv.supplierId) : undefined,
                    vendorName: invoiceType === 'Purchase' ? (vendorMap[inv.vendorId || inv.vendor_id || inv.supplierId] || inv.vendorName || inv.vendor_name || inv.supplierName || 'Unknown') : undefined,
                    customerId: invoiceType === 'Sales' ? (inv.customerId || inv.customer_id) : undefined,
                    customerName: invoiceType === 'Sales' ? (customerMap[inv.customerId || inv.customer_id] || inv.customerName || inv.customer_name || 'Unknown') : undefined,
                    periodId: periodId,
                    periodName: periodName,
                    invoiceDate: inv.invoiceDate || inv.invoice_date || new Date().toISOString(),
                    dueDate: inv.dueDate || inv.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    items: (inv.items || inv.lines || []).map((item: any) => ({
                        id: item.id,
                        description: item.description || '',
                        quantity: Number(item.quantity || 0),
                        unitPrice: Number(item.unitPrice || 0),
                        total: Number(item.total || (Number(item.quantity || 0) * Number(item.unitPrice || 0))),
                        periodId: item.periodId || periodId || '',
                    })),
                    subTotal: inv.subTotal || inv.sub_total || 0,
                    taxAmount: inv.taxAmount || inv.tax_amount || 0,
                    totalAmount: totalAmount,
                    paidAmount: paidAmount,
                    balanceDue: balanceDue,
                    status: inv.status || 'Draft',
                    notes: inv.notes || inv.description || '',
                    dateAdd: inv.dateAdd || inv.created_at || new Date().toISOString(),
                    rowVersion: inv.rowVersion || '',
                    amendments: inv.amendments || [],
                    attachments: inv.attachments || [],
                    salesRep: inv.salesRep || inv.SalesRep || '',
                    deliveryDate: inv.deliveryDate || inv.DeliveryDate || '',
                    purchaseOrderId: inv.purchaseOrderId || inv.PurchaseOrderId || '',
                    receivedDate: inv.receivedDate || inv.ReceivedDate || '',
                };
            });

            setInvoices(mappedInvoices);
            console.log('✅ [useInvoiceData] Data loaded successfully');

        } catch (error) {
            console.error('❌ [useInvoiceData] Error fetching data:', error);
            showToast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [filterPeriodId, filterStatus, filterType, dateRange, fetchPeriods]);

    // ✅ Initial fetch - only once
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            fetchData();
        }
    }, [fetchData]);

    // ✅ Refresh function
    const refreshData = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const filteredInvoices = filterInvoices(invoices, searchTerm, filterStatus, filterType);
    const stats = calculateStats(invoices);

    return {
        invoices,
        filteredInvoices,
        stats,
        vendors,
        customers,
        periods,
        loading,
        loadingPeriods,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        filterPeriodId,
        setFilterPeriodId,
        dateRange,
        setDateRange,
        fetchData: refreshData,
        fetchPeriods,
        getPeriodStatus,
        isPeriodCurrentlyActive,
    };
};