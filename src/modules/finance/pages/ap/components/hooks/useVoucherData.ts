// src/pages/finance/ap/hooks/useVoucherData.ts
import { useState, useEffect, useCallback } from 'react';
import { showToast } from '@/shared/layout/layout';
import {
    getVouchers,
    getAccounts,
    getVendors,
    getFinancialPeriods,
    getAllFinancialPeriods,
} from '@/modules/finance/services/finance.api';
import type { Voucher, VoucherStats } from '@/modules/finance/pages/ap/components/types/voucher.types';
import { calculateStats, filterVouchers } from '@/modules/finance/pages/ap/components/utils/voucher.utils';

export const useVoucherData = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPeriods, setLoadingPeriods] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filterPeriodId, setFilterPeriodId] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // ✅ Fetch periods
    const fetchPeriods = useCallback(async () => {
        try {
            setLoadingPeriods(true);
            console.log('📡 [useVoucherData] Fetching financial periods...');

            let response;
            try {
                response = await getAllFinancialPeriods({ isClosed: false });
            } catch (error) {
                console.log('📡 [useVoucherData] Falling back to getFinancialPeriods...');
                response = await getFinancialPeriods({ status: 'All' });
            }

            let data = [];
            if (response?.data) {
                if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }

            console.log('📥 [useVoucherData] Parsed periods:', data.length);
            console.log('📥 [useVoucherData] Periods data:', data);

            setPeriods(data);
            return data;
        } catch (error) {
            console.error('❌ [useVoucherData] Error fetching periods:', error);
            showToast.error('Failed to load financial periods');
            return [];
        } finally {
            setLoadingPeriods(false);
        }
    }, []);

    // ✅ Main data fetch
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            // Fetch periods first and wait for them
            const periodsData = await fetchPeriods();

            // Build period map from fetched data
            const periodMap: Record<string, string> = {};
            if (periodsData && periodsData.length > 0) {
                periodsData.forEach((p: any) => {
                    const id = p.id || p.periodId;
                    if (id) {
                        periodMap[id] = p.name || p.periodName || '';
                    }
                });
                console.log('📥 [useVoucherData] Period map built:', periodMap);
            }

            // Build params
            const params: any = {};
            if (filterPeriodId && filterPeriodId !== 'all') {
                params.periodId = filterPeriodId;
            }
            if (filterStatus && filterStatus !== 'All') {
                params.status = filterStatus;
            }
            if (filterType && filterType !== 'All') {
                params.voucherType = filterType;
            }

            // Fetch vouchers, vendors, and accounts in parallel
            const [vouchersRes, vendorsRes, accountsRes] = await Promise.all([
                getVouchers(params),
                getVendors(),
                getAccounts(),
            ]);

            // Parse vouchers
            let vouchersData = [];
            if (vouchersRes.data) {
                if (Array.isArray(vouchersRes.data)) {
                    vouchersData = vouchersRes.data;
                } else if (vouchersRes.data.data && Array.isArray(vouchersRes.data.data)) {
                    vouchersData = vouchersRes.data.data;
                } else if (vouchersRes.data.$values && Array.isArray(vouchersRes.data.$values)) {
                    vouchersData = vouchersRes.data.$values;
                }
            }

            // Parse vendors
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

            // Parse accounts
            let accountsData = [];
            if (accountsRes.data) {
                if (Array.isArray(accountsRes.data)) {
                    accountsData = accountsRes.data;
                } else if (accountsRes.data.data && Array.isArray(accountsRes.data.data)) {
                    accountsData = accountsRes.data.data;
                } else if (accountsRes.data.$values && Array.isArray(accountsRes.data.$values)) {
                    accountsData = accountsRes.data.$values;
                }
            }
            setAccounts(accountsData);

            // Build maps
            const vendorMap: Record<string, string> = {};
            vendorsData.forEach((v: any) => {
                const id = v.id || v.vendorId;
                if (id) vendorMap[id] = v.name || v.vendorName || 'Unknown';
            });

            const accountMap: Record<string, any> = {};
            accountsData.forEach((a: any) => {
                const id = a.id || a.accountId;
                if (id) accountMap[id] = a;
            });

            // Map vouchers with period names from the fetched period data
            const mappedVouchers: Voucher[] = vouchersData.map((v: any) => ({
                id: v.id,
                voucherNumber: v.voucherNumber || `VCH-${String(vouchersData.indexOf(v) + 1).padStart(4, '0')}`,
                voucherType: v.voucherType || 'Journal',
                vendorId: v.vendorId || '',
                vendorName: vendorMap[v.vendorId] || v.vendorName || '',
                voucherDate: v.voucherDate || new Date().toISOString(),
                description: v.description || '',
                totalDebit: v.totalDebit || 0,
                totalCredit: v.totalCredit || 0,
                status: v.status || 'Draft',
                periodId: v.periodId || '',
                periodName: periodMap[v.periodId] || v.periodName || '',
                lines: (v.lines || []).map((line: any) => ({
                    id: line.id,
                    accountId: line.accountId || '',
                    accountName: accountMap[line.accountId]?.name || line.accountName || '',
                    accountCode: accountMap[line.accountId]?.code || line.accountCode || '',
                    description: line.description || '',
                    debitAmount: line.debitAmount || 0,
                    creditAmount: line.creditAmount || 0,
                    periodId: line.periodId || v.periodId || '',
                })),
                approvedBy: v.approvedBy,
                approvedAt: v.approvedAt,
                postedBy: v.postedBy,
                postedAt: v.postedAt,
                dateAdd: v.dateAdd || new Date().toISOString(),
                dateMod: v.dateMod,
                rowVersion: v.rowVersion || '',
            }));

            setVouchers(mappedVouchers);
            setIsDataLoaded(true);

        } catch (error) {
            console.error('❌ [useVoucherData] Error fetching vouchers:', error);
            showToast.error('Failed to load vouchers');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterPeriodId, filterStatus, filterType, fetchPeriods]);

    // ✅ Initial fetch
    useEffect(() => {
        fetchData();
    }, []); // Empty dependency array - only run once on mount

    const refreshData = () => fetchData();

    const filteredVouchers = filterVouchers(vouchers, searchTerm, filterStatus, filterType);
    const stats = calculateStats(vouchers);

    return {
        vouchers,
        filteredVouchers,
        stats,
        vendors,
        periods, // This will be updated after fetch
        accounts,
        loading,
        loadingPeriods,
        isRefreshing,
        isDataLoaded,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        filterPeriodId,
        setFilterPeriodId,
        fetchData: refreshData,
        fetchPeriods,
        setVouchers,
        setVendors,
        setAccounts,
        setPeriods,
    };
};