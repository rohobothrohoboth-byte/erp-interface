// src/components/finance/accountsPayable/AddPaymentModal/hooks/usePaymentData.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getPurchaseInvoices,
    getBankAccounts,
    getVendors
} from '../../../../../services/finance/finance.api';
import { showToast } from '../../../../../layout/layout';
import type { Invoice, BankAccount, VendorWithInvoices } from '../types';

export const usePaymentData = (
    selectedPeriodId: string,
    selectedVendor: string,
    propVendors: any[] = [],
    propAvailableInvoices: any[] = [],
    vendorMap: Record<string, string>
) => {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [availableInvoices, setAvailableInvoices] = useState<Invoice[]>([]);
    const [vendorsWithInvoices, setVendorsWithInvoices] = useState<VendorWithInvoices[]>([]);
    const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [loadingVendors, setLoadingVendors] = useState(false);

    // Use ref to track if vendors have been loaded
    const vendorsLoadedRef = useRef(false);

    /**
     * Fetch bank accounts
     */
    const fetchBankAccounts = useCallback(async () => {
        try {
            setLoadingBankAccounts(true);
            const response = await getBankAccounts();
            let data = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }

            const mappedAccounts: BankAccount[] = data.map((item: any) => ({
                id: item.id,
                name: item.name || item.accountName || 'Unknown Account',
                accountNumber: item.accountNumber || item.account_no || '',
                accountType: item.accountType || 'Chequing',
                glCode: item.glCode || item.gl_code || '',
                currentBalance: Number(item.currentBalance || 0),
                bankName: item.bankName || item.bank_name || '',
                isDefault: item.isDefault || false,
                isActive: item.isActive !== false
            }));

            setBankAccounts(mappedAccounts);
            return mappedAccounts;
        } catch (error) {
            console.error('Error fetching bank accounts:', error);
            showToast.error('Failed to load bank accounts');
            return [];
        } finally {
            setLoadingBankAccounts(false);
        }
    }, []);

    /**
     * Build vendor list with invoice summary
     */
    const buildVendorList = useCallback((vendorsData: any[], invoicesData: any[]) => {
        console.log('🔨 Building vendor list with:', {
            vendorsCount: vendorsData.length,
            invoicesCount: invoicesData.length
        });

        const vendorMapWithInvoices: Record<string, { name: string; totalRemaining: number; count: number }> = {};

        // Initialize vendors
        vendorsData.forEach((vendor: any) => {
            const id = vendor.id || vendor.vendorId;
            if (id) {
                const name = vendor.name || vendor.vendorName || vendor.displayName || 'Unknown Vendor';
                vendorMapWithInvoices[id] = {
                    name,
                    totalRemaining: 0,
                    count: 0
                };
            }
        });

        console.log('📋 Vendor map initialized with:', Object.keys(vendorMapWithInvoices).length, 'vendors');

        // Aggregate invoice data
        invoicesData.forEach((inv: any) => {
            const vendorId = inv.vendor_id || inv.vendorId || inv.vendor_id;
            if (!vendorId) return;
            const remaining = inv.remaining_amount || inv.remainingAmount || 0;
            if (remaining <= 0) return;

            if (vendorMapWithInvoices[vendorId]) {
                vendorMapWithInvoices[vendorId].totalRemaining += remaining;
                vendorMapWithInvoices[vendorId].count += 1;
            }
        });

        // Convert to array and filter
        const vendorsArray = Object.entries(vendorMapWithInvoices)
            .map(([id, data]) => ({
                id,
                name: data.name,
                totalRemaining: data.totalRemaining,
                invoiceCount: data.count
            }))
            .filter(v => v.totalRemaining > 0)
            .sort((a, b) => b.totalRemaining - a.totalRemaining);

        console.log('✅ Final vendors with invoices:', vendorsArray.length);
        setVendorsWithInvoices(vendorsArray);
    }, []);

    /**
     * Fetch vendors using getVendors API
     */
    const fetchVendors = useCallback(async () => {
        try {
            setLoadingVendors(true);
            console.log('📡 Fetching vendors...');

            // ✅ If vendors are provided as props, use them
            if (propVendors.length > 0) {
                console.log('📦 Using vendors from props:', propVendors.length);
                const invoicesData = propAvailableInvoices.length > 0
                    ? propAvailableInvoices
                    : availableInvoices;
                buildVendorList(propVendors, invoicesData);
                vendorsLoadedRef.current = true;
                return;
            }

            // ✅ Fetch from API
            console.log('📡 Fetching vendors from API...');
            const response = await getVendors();
            console.log('📡 Vendors API Response:', response);

            let vendorsData = [];
            if (response.data) {
                // Try different data structures
                if (Array.isArray(response.data)) {
                    vendorsData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    vendorsData = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    vendorsData = response.data.$values;
                } else if (response.data.items && Array.isArray(response.data.items)) {
                    vendorsData = response.data.items;
                } else {
                    // Try to find any array in the response
                    const keys = Object.keys(response.data);
                    for (const key of keys) {
                        if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                            console.log(`📡 Found array in response.data.${key}:`, response.data[key].length);
                            vendorsData = response.data[key];
                            break;
                        }
                    }
                }
            }

            console.log('📦 Vendors fetched:', vendorsData.length);

            if (vendorsData.length === 0) {
                console.warn('⚠️ No vendors found in response');
                showToast.warning('No vendors found');
            }

            const invoicesData = propAvailableInvoices.length > 0
                ? propAvailableInvoices
                : availableInvoices;
            buildVendorList(vendorsData, invoicesData);
            vendorsLoadedRef.current = true;
        } catch (error) {
            console.error('❌ Error fetching vendors:', error);
            showToast.error('Failed to load vendors');
        } finally {
            setLoadingVendors(false);
        }
    }, [propVendors, propAvailableInvoices, availableInvoices, buildVendorList]);

    /**
     * Fetch invoices for a specific vendor
     */
    const fetchInvoicesForVendor = useCallback(async (vendorId: string) => {
        console.log('📡 Fetching invoices for vendor:', vendorId);

        // Check if we have propAvailableInvoices first
        if (propAvailableInvoices.length > 0) {
            console.log('📦 Using invoices from props');
            const vendorInvoices = propAvailableInvoices.filter(
                (inv: any) => String(inv.vendor_id || inv.vendorId) === String(vendorId)
            );
            if (vendorInvoices.length > 0) {
                const mappedInvoices: Invoice[] = vendorInvoices.map((inv: any) => ({
                    id: inv.id || inv.invoiceId,
                    invoice_no: inv.invoice_no || inv.invoiceNumber || 'N/A',
                    vendor_id: inv.vendor_id || inv.vendorId,
                    vendor_name: inv.vendor_name || inv.vendorName || 'Unknown Vendor',
                    total_amount: inv.total_amount || inv.totalAmount || 0,
                    paid_amount: inv.paid_amount || inv.paidAmount || 0,
                    remaining_amount: inv.remaining_amount || inv.remainingAmount || 0,
                    invoice_date: inv.invoice_date || inv.invoiceDate || new Date().toISOString(),
                    status: inv.status || 'Pending',
                    periodId: inv.periodId || selectedPeriodId || '',
                    periodName: inv.periodName || '',
                }));
                setAvailableInvoices(mappedInvoices);
                console.log('✅ Mapped invoices from props:', mappedInvoices.length);
                return mappedInvoices;
            }
        }

        // Otherwise fetch from API using getPurchaseInvoices
        try {
            setLoadingInvoices(true);
            const params: any = {};
            if (selectedPeriodId) {
                params.periodId = selectedPeriodId;
            }

            console.log('📡 Fetching purchase invoices with params:', params);
            const response = await getPurchaseInvoices(params);

            let data = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }

            console.log('📦 Purchase invoices fetched:', data.length);

            const vendorFiltered = data.filter((inv: any) => {
                const invVendorId = inv.VendorId || inv.vendorId || inv.vendor_id || inv.supplierId;
                return String(invVendorId) === String(vendorId);
            });

            console.log(`🔍 Found ${vendorFiltered.length} invoices for vendor ${vendorId}`);

            const vendorInvoices: Invoice[] = vendorFiltered
                .filter((inv: any) => {
                    const totalAmount = Number(inv.TotalAmount || inv.totalAmount || inv.total || 0);
                    const paidAmount = Number(inv.PaidAmount || inv.paidAmount || inv.paid || 0);
                    return totalAmount - paidAmount > 0;
                })
                .map((inv: any) => {
                    const totalAmount = Number(inv.TotalAmount || inv.totalAmount || inv.total || 0);
                    const paidAmount = Number(inv.PaidAmount || inv.paidAmount || inv.paid || 0);
                    const remainingAmount = totalAmount - paidAmount;
                    const status = inv.Status || inv.status || inv.invoiceStatus || 'Draft';
                    const invoiceNumber = inv.InvoiceNumber || inv.invoiceNumber || inv.invoice_no || 'N/A';
                    const invoiceId = inv.Id || inv.id || inv.invoiceId;
                    const vendorName = vendorMap[vendorId] || inv.VendorName || inv.vendorName || inv.vendor_name || 'Unknown Vendor';

                    return {
                        id: invoiceId,
                        invoice_no: invoiceNumber,
                        vendor_id: vendorId,
                        vendor_name: vendorName,
                        total_amount: totalAmount,
                        paid_amount: paidAmount,
                        remaining_amount: remainingAmount,
                        invoice_date: inv.InvoiceDate || inv.invoiceDate || inv.invoice_date || new Date().toISOString(),
                        status: status,
                        periodId: inv.periodId || inv.PeriodId || selectedPeriodId || '',
                        periodName: inv.periodName || inv.PeriodName || '',
                    };
                });

            setAvailableInvoices(vendorInvoices);
            console.log('✅ Final vendor invoices:', vendorInvoices.length);
            return vendorInvoices;
        } catch (error) {
            console.error('Error fetching invoices:', error);
            showToast.error('Failed to load invoices');
            setAvailableInvoices([]);
            return [];
        } finally {
            setLoadingInvoices(false);
        }
    }, [selectedPeriodId, vendorMap, propAvailableInvoices]);

    // ✅ Rebuild vendor list when propAvailableInvoices changes
    useEffect(() => {
        if (vendorsLoadedRef.current && (propVendors.length > 0 || propAvailableInvoices.length > 0)) {
            console.log('🔄 Rebuilding vendor list due to prop changes');
            const invoicesData = propAvailableInvoices.length > 0 ? propAvailableInvoices : availableInvoices;
            if (propVendors.length > 0) {
                buildVendorList(propVendors, invoicesData);
            }
        }
    }, [propAvailableInvoices, propVendors, availableInvoices, buildVendorList]);

    // ✅ Fetch vendors when propVendors changes
    useEffect(() => {
        if (propVendors.length > 0 && !vendorsLoadedRef.current) {
            console.log('📦 Prop vendors changed, fetching...');
            fetchVendors();
        }
    }, [propVendors]);

    return {
        bankAccounts,
        availableInvoices,
        vendorsWithInvoices,
        loadingBankAccounts,
        loadingInvoices,
        loadingVendors,
        fetchBankAccounts,
        fetchInvoicesForVendor,
        fetchVendors,
        setAvailableInvoices,
    };
};