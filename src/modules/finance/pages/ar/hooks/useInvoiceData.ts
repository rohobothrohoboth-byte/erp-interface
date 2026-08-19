// src/pages/finance/ar/hooks/useInvoiceData.ts

import { useState, useEffect, useCallback } from 'react';
import { showToast } from '@/shared/layout/layout';
import {
    getSalesInvoices,
    getCustomers,
    getAccounts,
    getFinancialPeriods,
} from '@/modules/finance/services/finance.api';
import type { SalesInvoice, InvoiceStats } from '@/modules/finance/pages/ar/types/invoice.types';
import { calculateStats, filterInvoices } from '@/modules/finance/pages/ar/utils/invoice.utils';

export const useInvoiceData = () => {
    const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [periodFilter, setPeriodFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchPeriods = useCallback(async () => {
        try {
            const res = await getFinancialPeriods({ status: 'All' });
            let data = [];
            if (res.data) {
                if (Array.isArray(res.data)) {
                    data = res.data;
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    data = res.data.data;
                } else if (res.data.$values && Array.isArray(res.data.$values)) {
                    data = res.data.$values;
                }
            }
            setPeriods(data);
            const active = data.find((p: any) => !p.isClosed);
            if (active) {
                setPeriodFilter(active.id);
            }
            return data;
        } catch (error) {
            console.error('Error fetching periods:', error);
            return [];
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const customersRes = await getCustomers();
            let customersData = parseResponseData(customersRes);
            setCustomers(customersData);

            const accountsRes = await getAccounts();
            let accountsData = parseResponseData(accountsRes);
            setAccounts(accountsData);

            const customerMap = buildCustomerMap(customersData);

            const params: any = {};
            if (periodFilter && periodFilter !== 'all') {
                params.periodId = periodFilter;
            }

            const invoicesRes = await getSalesInvoices(params);
            let invoicesData = parseResponseData(invoicesRes);

            const salesInvoices = invoicesData.filter((inv: any) => {
                const type = inv.invoiceType || inv.InvoiceType;
                return type === 'Sales' || type === undefined;
            });

            const mappedInvoices = mapInvoices(salesInvoices, customerMap);
            setInvoices(mappedInvoices);

        } catch (error) {
            console.error('Error fetching data:', error);
            showToast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [periodFilter]);

    const parseResponseData = (response: any) => {
        if (!response?.data) return [];
        if (Array.isArray(response.data)) return response.data;
        if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
        if (response.data.$values && Array.isArray(response.data.$values)) return response.data.$values;
        return [];
    };

    const buildCustomerMap = (customersData: any[]) => {
        const map: Record<string, string> = {};
        customersData.forEach((c: any) => {
            const id = c.id || c.customerId;
            if (id) {
                map[id] = c.name || c.customerName || 'Unknown Customer';
            }
        });
        return map;
    };

    const mapInvoices = (invoicesData: any[], customerMap: Record<string, string>): SalesInvoice[] => {
        return invoicesData.map((inv: any) => {
            const customerId = inv.customerId || inv.customer_id;
            const totalAmount = Number(inv.totalAmount || inv.total_amount || 0);
            const paidAmount = Number(inv.paidAmount || inv.paid_amount || 0);

            return {
                id: inv.id,
                invoiceNumber: inv.invoiceNumber || inv.invoice_no || 'N/A',
                invoiceDate: inv.invoiceDate || inv.invoice_date || new Date().toISOString(),
                dueDate: inv.dueDate || inv.due_date || new Date().toISOString(),
                customerId: customerId,
                customerName: customerMap[customerId] || inv.customerName || inv.customer_name || 'Unknown Customer',
                subTotal: Number(inv.subTotal || inv.sub_total || 0),
                taxAmount: Number(inv.taxAmount || inv.tax_amount || 0),
                discountAmount: Number(inv.discountAmount || inv.discount_amount || 0),
                totalAmount: totalAmount,
                paidAmount: paidAmount,
                balanceDue: totalAmount - paidAmount,
                status: inv.status || 'Draft',
                notes: inv.notes || inv.description || '',
                branchId: inv.branchId || inv.branch_id,
                departmentId: inv.departmentId || inv.department_id,
                employeeId: inv.employeeId || inv.employee_id,
                dateAdd: inv.dateAdd || inv.created_at || new Date().toISOString(),
                dateMod: inv.dateMod || inv.updated_at,
                postedAt: inv.postedAt,
                postedBy: inv.postedBy,
                salesRep: inv.salesRep || inv.SalesRep || '',
                periodId: inv.periodId || inv.PeriodId || '',
                periodName: inv.periodName || inv.PeriodName || '',
                items: (inv.items || inv.lines || []).map((item: any) => ({
                    id: item.id,
                    description: item.description || '',
                    quantity: Number(item.quantity || 0),
                    unitPrice: Number(item.unitPrice || item.unit_price || 0),
                    total: Number(item.total || (Number(item.quantity || 0) * Number(item.unitPrice || 0))),
                    periodId: item.periodId || inv.periodId || '',
                })),
            };
        });
    };

    const refreshData = () => fetchData();

    const filteredInvoices = filterInvoices(invoices, searchTerm, statusFilter);
    const stats = calculateStats(invoices);

    return {
        invoices,
        filteredInvoices,
        stats,
        customers,
        accounts,
        periods,
        loading,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        periodFilter,
        setPeriodFilter,
        fetchData: refreshData,
        fetchPeriods,
        setInvoices,
        setCustomers,
        setAccounts,
        setPeriods,
    };
};