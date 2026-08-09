// src/hooks/usePeriodClosing.ts

import { useState, useEffect, useCallback } from 'react';
import { showToast } from '../layout/layout';
import {
    getFinancialPeriods,
    getFinancialPeriodById,
    createFinancialPeriod,
    updateFinancialPeriod,
    deleteFinancialPeriod,
    closeFinancialPeriod,
    openFinancialPeriod,
    validatePeriodClose,
    getPeriodAuditTrail,
    exportPeriodData as exportPeriodDataApi
} from '../services/finance/finance.api';
import type { FinancialPeriod, PeriodStats, AuditLog } from '../types/finance/finance.types';

export const usePeriodClosing = () => {
    const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<FinancialPeriod | null>(null);
    const [stats, setStats] = useState<PeriodStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClosed, setFilterClosed] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const ITEMS_PER_PAGE = 10;

    // ✅ Fetch data with current filters
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                sortBy: 'StartDate',
                sortOrder: 'DESC'
            };

            // ✅ Add search if not empty
            if (searchTerm && searchTerm.trim() !== '') {
                params.search = searchTerm.trim();
            }

            // ✅ Add filter if not 'All'
            if (filterClosed === 'Open') {
                params.isClosed = false;
            } else if (filterClosed === 'Closed') {
                params.isClosed = true;
            }
            // If 'All', don't add isClosed filter

            console.log('🔍 Fetching periods with params:', params);

            const response = await getFinancialPeriods(params);

            // Handle both response formats
            const data = response?.data?.data?.data || response?.data?.data || response?.data || [];
            const pagination = response?.data?.pagination || response?.pagination || {};

            setPeriods(Array.isArray(data) ? data : []);
            setTotalPages(pagination.totalPages || 1);

            // Get stats for the first active period if available
            if (data.length > 0) {
                const activePeriod = data.find((p: FinancialPeriod) => !p.isClosed);
                if (activePeriod) {
                    await fetchStats(activePeriod.id);
                }
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to fetch periods';
            setError(errorMsg);
            showToast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterClosed]); // ✅ Include searchTerm and filterClosed in dependencies

    const fetchStats = async (periodId: string) => {
        try {
            const response = await getFinancialPeriodById(periodId);
            const data = response?.data?.data || response?.data;
            if (data) {
                setStats({
                    totalJournalEntries: data.totalEntries || 0,
                    postedEntries: data.postedEntries || 0,
                    unpostedEntries: data.unpostedEntries || 0,
                    totalTransactions: data.totalTransactions || 0,
                    totalDebit: data.totalDebit || 0,
                    totalCredit: data.totalCredit || 0,
                    periodStart: data.startDate,
                    periodEnd: data.endDate,
                    daysRemaining: data.daysRemaining || 0,
                    completionPercentage: data.completionPercentage || 0,
                    canBeClosed: data.canBeClosed || false,
                    closingReason: data.closingReason || null
                });
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    // ============================================================
    // CRUD Operations
    // ============================================================

    const handleClosePeriod = async (id: string, forceClose: boolean = false, notes: string = '') => {
        setLoading(true);
        try {
            await closeFinancialPeriod(id, { forceClose, notes });
            showToast.success('Period closed successfully');
            await fetchData();
            return true;
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to close period';
            showToast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPeriod = async (id: string) => {
        setLoading(true);
        try {
            await openFinancialPeriod(id);
            showToast.success('Period reopened successfully');
            await fetchData();
            return true;
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to open period';
            showToast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePeriod = async (data: Partial<FinancialPeriod>) => {
        setLoading(true);
        try {
            await createFinancialPeriod(data);
            showToast.success('Period created successfully');
            await fetchData();
            return true;
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to create period';
            showToast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePeriod = async (id: string, data: Partial<FinancialPeriod>) => {
        setLoading(true);
        try {
            await updateFinancialPeriod(id, data);
            showToast.success('Period updated successfully');
            await fetchData();
            return true;
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to update period';
            showToast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePeriod = async (id: string) => {
        setLoading(true);
        try {
            await deleteFinancialPeriod(id);
            showToast.success('Period deleted successfully');
            await fetchData();
            return true;
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to delete period';
            showToast.error(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // Audit and Export
    // ============================================================

    const getAuditTrail = async (periodId: string, page: number = 1, pageSize: number = 50) => {
        try {
            const response = await getPeriodAuditTrail(periodId, { page, pageSize });
            const data = response?.data?.data?.items || response?.data?.items || response?.data || [];
            return {
                data: Array.isArray(data) ? data : [],
                total: response?.data?.total || response?.data?.totalCount || data.length,
                page: response?.data?.page || page,
                pageSize: response?.data?.pageSize || pageSize
            };
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to get audit trail';
            showToast.error(errorMsg);
            throw err;
        }
    };

    const exportPeriodData = async (periodId: string) => {
        try {
            const response = await exportPeriodDataApi(periodId);

            // Handle blob response
            if (response.data instanceof Blob) {
                const blob = new Blob([response.data], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const period = periods.find(p => p.id === periodId);
                link.download = `period-${period?.name || periodId}-${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => window.URL.revokeObjectURL(url), 100);
                showToast.success('Period data exported successfully');
            } else {
                // Fallback for JSON response
                const jsonString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const period = periods.find(p => p.id === periodId);
                link.download = `period-${period?.name || periodId}-${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                showToast.success('Period data exported successfully');
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Failed to export period data';
            showToast.error(errorMsg);
            throw err;
        }
    };

    const validateClose = async (periodId: string) => {
        try {
            const response = await validatePeriodClose(periodId);
            const data = response?.data?.data || response?.data;
            return {
                canClose: data?.canClose || false,
                reason: data?.reason || null
            };
        } catch (err: any) {
            return {
                canClose: false,
                reason: err?.response?.data?.message || 'Validation failed'
            };
        }
    };

    // ✅ Effect to refetch when search, filter, or page changes
    useEffect(() => {
        // Debounce search to avoid too many requests
        const timer = setTimeout(() => {
            fetchData();
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchTerm, filterClosed, currentPage, fetchData]); // ✅ All dependencies

    // ✅ Initial load
    useEffect(() => {
        fetchData();
    }, []); // Only once on mount

    return {
        periods,
        selectedPeriod,
        setSelectedPeriod,
        stats,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        filterClosed,
        setFilterClosed,
        currentPage,
        setCurrentPage,
        totalPages,
        handleClosePeriod,
        handleOpenPeriod,
        handleCreatePeriod,
        handleUpdatePeriod,
        handleDeletePeriod,
        getAuditTrail,
        exportPeriodData,
        validateClose,
        fetchData,
        ITEMS_PER_PAGE
    };
};