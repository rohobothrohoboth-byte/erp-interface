// src/pages/finance/ap/hooks/usePaymentsData.ts

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useFinanceDashboard } from '@/modules/finance/hooks/useFinanceDashboard';
import type { PaymentEntry, AvailableInvoice } from '@/modules/finance/pages/ap/Payments/types/payment.types';
import { filterPayments, calculateStats } from '@/modules/finance/pages/ap/Payments/utils/payment.utils';

export const usePaymentsData = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState<string>('all');

    // ✅ Use refs to prevent infinite loops
    const isFirstRender = useRef(true);
    const hasLoggedData = useRef(false);
    const initialDataLoaded = useRef(false);

    // ✅ Use useMemo to prevent recreating filter object
    const dashboardFilters = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        return {
            periodStart: new Date(year, 0, 1).toISOString(),
            periodEnd: now.toISOString(),
            period: `${year}-${String(month + 1).padStart(2, '0')}`,
            periodType: 'month',
            fiscalYear: year.toString(),
        };
    }, []); // ✅ Empty dependency array - only created once

    console.log('🔍 [usePaymentsData] Initializing...');

    const {
        invoices: allInvoices,
        payments: allPayments,
        vendors,
        periods,
        bankAccounts,
        isLoading,
        isRefreshing,
        refetchAll,
    } = useFinanceDashboard(dashboardFilters);

    // ✅ Log data counts only once when data is loaded
    useEffect(() => {
        if (!isLoading && !hasLoggedData.current) {
            console.log('📊 [usePaymentsData] Data received:');
            console.log(`  📄 Invoices: ${Array.isArray(allInvoices) ? allInvoices.length : 'N/A'}`);
            console.log(`  💰 Payments: ${Array.isArray(allPayments) ? allPayments.length : 'N/A'}`);
            console.log(`  🏢 Vendors: ${Array.isArray(vendors) ? vendors.length : 'N/A'}`);
            console.log(`  📅 Periods: ${Array.isArray(periods) ? periods.length : 'N/A'}`);

            hasLoggedData.current = true;
        }
    }, [isLoading, allInvoices, allPayments, vendors, periods]);

    // ✅ Auto-select active period (only once)
    useEffect(() => {
        if (periods && periods.length > 0 && isFirstRender.current && !isLoading) {
            const active = periods.find((p: any) => !p.isClosed);
            if (active) {
                console.log(`📅 [usePaymentsData] Auto-selected active period: ${active.name} (${active.id})`);
                setPeriodFilter(active.id);
                isFirstRender.current = false;
            }
        }
    }, [periods, isLoading]);

    // ✅ Mark data as loaded
    useEffect(() => {
        if (!isLoading && !initialDataLoaded.current) {
            initialDataLoaded.current = true;
            console.log('✅ [usePaymentsData] Initial data loaded');
        }
    }, [isLoading]);

    // ✅ Vendor map
    const vendorMap = useMemo(() => {
        const map: Record<string, string> = {};
        const vendList = Array.isArray(vendors) ? vendors : [];
        vendList.forEach((v: any) => {
            const id = v.id || v.vendorId;
            if (id) {
                map[id] = v.name || v.vendorName || v.displayName || 'Unknown Vendor';
            }
        });
        return map;
    }, [vendors]);

    // ✅ Period map
    const periodMap = useMemo(() => {
        const map: Record<string, string> = {};
        const periodList = Array.isArray(periods) ? periods : [];
        periodList.forEach((p: any) => {
            if (p.id) {
                map[p.id] = p.name || 'Unknown Period';
            }
        });
        return map;
    }, [periods]);

    // ✅ Invoice map
    const invoiceMap = useMemo(() => {
        const map: Record<string, any> = {};
        const invList = Array.isArray(allInvoices) ? allInvoices : [];

        const purchaseInvoices = invList.filter((inv: any) => {
            const type = inv.invoiceType || inv.InvoiceType || 'Purchase';
            return type === 'Purchase';
        });

        purchaseInvoices.forEach((inv: any) => {
            const id = inv.id;
            const vendorId = inv.vendorId || inv.vendor_id || inv.supplierId;
            map[id] = {
                id: id,
                invoiceNumber: inv.invoiceNumber || inv.invoice_no,
                vendorId: vendorId,
                vendorName: vendorMap[vendorId] || inv.vendorName || inv.vendor_name || 'Unknown Vendor',
                totalAmount: inv.totalAmount || inv.total_amount || 0,
                status: inv.status || 'Pending',
                periodId: inv.periodId || inv.PeriodId || '',
                periodName: periodMap[inv.periodId || inv.PeriodId] || inv.periodName || '',
            };
        });

        return map;
    }, [allInvoices, vendorMap, periodMap]);

    // ✅ Available invoices
    const availableInvoices = useMemo<AvailableInvoice[]>(() => {
        const invList = Array.isArray(allInvoices) ? allInvoices : [];

        const result = invList
            .filter((inv: any) => {
                const type = inv.invoiceType || inv.InvoiceType || 'Purchase';
                const status = inv.status || inv.invoiceStatus;
                return type === 'Purchase' && (status === 'Pending' || status === 'Partially_Paid' || status === 'Approved');
            })
            .map((inv: any) => {
                const total = Number(inv.totalAmount || inv.total_amount || 0);
                const paid = Number(inv.paidAmount || inv.paid_amount || 0);
                const vendorId = inv.vendorId || inv.vendor_id || inv.supplierId;

                return {
                    id: inv.id,
                    invoice_no: inv.invoiceNumber || inv.invoice_no,
                    vendor_id: vendorId,
                    vendor_name: vendorMap[vendorId] || inv.vendorName || inv.vendor_name || 'Unknown Vendor',
                    total_amount: total,
                    remaining_amount: total - paid,
                    invoice_date: inv.invoiceDate || inv.invoice_date,
                    status: inv.status || 'Pending',
                    due_date: inv.dueDate || inv.due_date,
                    periodId: inv.periodId || inv.PeriodId || '',
                    periodName: periodMap[inv.periodId || inv.PeriodId] || inv.periodName || '',
                };
            })
            .filter((inv: any) => inv.remaining_amount > 0);

        return result;
    }, [allInvoices, vendorMap, periodMap]);

    // ✅ Payments
    const payments = useMemo<PaymentEntry[]>(() => {
        const payList = Array.isArray(allPayments) ? allPayments : [];

        const result = payList
            .filter((p: any) => {
                const type = p.paymentType || p.PaymentType || 'Purchase';
                return type === 'Purchase';
            })
            .map((p: any) => {
                const invoiceId = p.invoiceId || p.InvoiceId || null;
                const invoiceData = invoiceId ? invoiceMap[invoiceId] : null;

                let vendorId = '';
                let vendorName = 'Unknown Vendor';
                let invoiceNumber = '';

                if (invoiceData) {
                    vendorId = invoiceData.vendorId || '';
                    vendorName = invoiceData.vendorName || 'Unknown Vendor';
                    invoiceNumber = invoiceData.invoiceNumber || '';
                }

                if (!vendorId) {
                    vendorId = p.vendorId || p.vendor_id || p.supplierId || '';
                    vendorName = vendorMap[vendorId] || p.vendorName || p.vendor_name || 'Unknown Vendor';
                }

                if (!invoiceNumber) {
                    invoiceNumber = p.invoiceNumber || p.invoice_no || '';
                }

                const periodId = p.periodId || p.PeriodId || invoiceData?.periodId || '';
                const periodName = periodMap[periodId] || p.periodName || p.PeriodName || invoiceData?.periodName || '';

                return {
                    id: p.id,
                    paymentNumber: p.paymentNumber || p.payment_no || `PV-${Date.now()}`,
                    vendorId: vendorId,
                    vendorName: vendorName,
                    paymentDate: p.paymentDate || p.payment_date || new Date().toISOString().split('T')[0],
                    paymentMethod: p.paymentMethod || p.payment_method || 'Bank_Transfer',
                    bankAccountId: p.bankAccountId || p.bank_account_id || '',
                    bankAccountName: p.bankAccountName || p.bank_account_name || 'Main Account',
                    amount: p.amount || p.total_amount || 0,
                    reference: p.reference || p.externalBankRef || '',
                    description: p.description || '',
                    status: p.status || 'Draft',
                    dateAdd: p.dateAdd || p.created_at || new Date().toISOString(),
                    invoiceId: invoiceId,
                    invoiceNumber: invoiceNumber,
                    invoiceVendorId: vendorId,
                    paymentType: p.paymentType || 'Purchase',
                    periodId: periodId,
                    periodName: periodName,
                };
            });

        return result;
    }, [allPayments, vendorMap, invoiceMap, periodMap]);

    // ✅ Filtered payments
    const filteredPayments = useMemo(() => {
        const result = filterPayments(payments, searchTerm, statusFilter, periodFilter);
        return result;
    }, [payments, searchTerm, statusFilter, periodFilter]);

    // ✅ Stats
    const stats = useMemo(() => {
        const result = calculateStats(payments);
        return result;
    }, [payments]);

    return {
        payments,
        filteredPayments,
        stats,
        vendors,
        periods,
        bankAccounts,
        availableInvoices,
        isLoading,
        isRefreshing,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        periodFilter,
        setPeriodFilter,
        refetchAll,
        vendorMap,
        periodMap,
    };
};