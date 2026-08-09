// hooks/finance/useChartOfAccounts.ts - FIXED

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    getAccounts,
    createAccount as createAccountApi,
    updateAccount as updateAccountApi,
    deleteAccount as deleteAccountApi,
    toggleAccountStatus as toggleAccountStatusService,
    getAccountById,
    getAccountCategories,
    getAccountHierarchy,
    getAccountUsage as getAccountUsageService,
    canDeleteAccount,
    bulkDeleteAccounts as bulkDeleteAccountsApi,
    exportAccounts as exportAccountsApi,
    getDepartments  // ✅ ADD THIS
} from '../../services/finance/finance.api';
import { showToast } from '../../layout/layout';
import type { Account, AccountCategory, Department, HierarchyNode, UsageInfo, AccountFilters, AccountFormData } from '../../types/finance/account.types';

const ITEMS_PER_PAGE = 10;

export function useChartOfAccounts() {
    // ============================================================
    // STATE
    // ============================================================

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [accountCategories, setAccountCategories] = useState<AccountCategory[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<AccountFilters>({
        searchTerm: '',
        filterType: 'All',
        filterStatus: 'All',
    });

    // ✅ Refs
    const isFetching = useRef(false);
    const isInitialMount = useRef(true);
    const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastFetchParams = useRef<string>('');

    // ============================================================
    // ✅ HELPER: Extract data from response
    // ============================================================

    const extractData = useCallback((response: any, fallback: any[] = []) => {
        if (!response) return fallback;

        // Handle different response formats
        if (response.data?.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        if (response.data?.items && Array.isArray(response.data.items)) {
            return response.data.items;
        }
        if (response.data?.$values && Array.isArray(response.data.$values)) {
            return response.data.$values;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        if (Array.isArray(response)) {
            return response;
        }
        if (response.data && typeof response.data === 'object') {
            // Check if it's a paginated response with data array
            for (const key of ['data', 'items', 'results', 'rows']) {
                if (response.data[key] && Array.isArray(response.data[key])) {
                    return response.data[key];
                }
            }
        }
        return fallback;
    }, []);

    // ============================================================
    // ✅ FETCH ACCOUNT CATEGORIES
    // ============================================================

    const fetchAccountCategories = useCallback(async () => {
        try {
            console.log('🔍 Fetching account categories...');
            const response = await getAccountCategories({ isActive: true });
            console.log('📦 Account Categories raw response:', response);

            const categories = extractData(response, []);
            console.log('✅ Processed categories:', categories);

            setAccountCategories(categories);
            return categories;
        } catch (error) {
            console.error('❌ Error fetching account categories:', error);
            setAccountCategories([]);
            return [];
        }
    }, [extractData]);

    // ============================================================
    // ✅ FETCH DEPARTMENTS
    // ============================================================

    const fetchDepartments = useCallback(async () => {
        try {
            console.log('🔍 Fetching departments...');
            const response = await getDepartments();
            console.log('📦 Departments raw response:', response);

            const depts = extractData(response, []);
            console.log('✅ Processed departments:', depts);

            setDepartments(depts);
            return depts;
        } catch (error) {
            console.error('❌ Error fetching departments:', error);
            setDepartments([]);
            return [];
        }
    }, [extractData]);

    // ============================================================
    // ✅ FETCH ACCOUNTS
    // ============================================================

    const fetchAccounts = useCallback(async () => {
        try {
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                sortBy: 'Code',
                sortOrder: 'ASC'
            };

            if (filters.searchTerm) params.search = filters.searchTerm;
            if (filters.filterType !== 'All') params.type = filters.filterType;
            if (filters.filterStatus !== 'All') params.isActive = filters.filterStatus === 'Active';

            console.log('📡 Fetching accounts with params:', params);

            const response = await getAccounts(params);
            console.log('📦 Accounts raw response:', response);

            let accountsData = [];
            let pagination = { totalCount: 0, totalPages: 1 };

            if (response.data?.data && Array.isArray(response.data.data)) {
                accountsData = response.data.data;
                pagination = {
                    totalCount: response.data.totalCount || accountsData.length,
                    totalPages: response.data.totalPages || 1,
                };
            } else if (response.data?.items && Array.isArray(response.data.items)) {
                accountsData = response.data.items;
                pagination = {
                    totalCount: response.data.totalCount || accountsData.length,
                    totalPages: response.data.totalPages || 1,
                };
            } else if (response.data?.$values && Array.isArray(response.data.$values)) {
                accountsData = response.data.$values;
                pagination = {
                    totalCount: response.data.totalCount || accountsData.length,
                    totalPages: response.data.totalPages || 1,
                };
            } else if (Array.isArray(response.data)) {
                accountsData = response.data;
                pagination = {
                    totalCount: accountsData.length,
                    totalPages: 1,
                };
            } else if (Array.isArray(response)) {
                accountsData = response;
                pagination = {
                    totalCount: accountsData.length,
                    totalPages: 1,
                };
            }

            console.log(`✅ Accounts received: ${accountsData.length}`);

            setAccounts(accountsData);
            setTotalCount(pagination.totalCount || accountsData.length);
            setTotalPages(pagination.totalPages || 1);

            return accountsData;
        } catch (error) {
            console.error('❌ Error fetching accounts:', error);
            setAccounts([]);
            return [];
        }
    }, [currentPage, filters]);

    // ============================================================
    // ✅ FETCH HIERARCHY
    // ============================================================

    const fetchHierarchy = useCallback(async () => {
        try {
            console.log('🔍 Fetching hierarchy...');
            const response = await getAccountHierarchy();
            console.log('📦 Hierarchy raw response:', response);

            const hierarchyData = extractData(response, []);
            console.log('✅ Processed hierarchy:', hierarchyData);

            setHierarchy(hierarchyData);
            return hierarchyData;
        } catch (error) {
            console.error('❌ Error fetching hierarchy:', error);
            setHierarchy([]);
            return [];
        }
    }, [extractData]);

    // ============================================================
    // ✅ DATA FETCHING - Combined
    // ============================================================

    const fetchData = useCallback(async () => {
        if (isFetching.current) {
            console.log('🛑 Skipping duplicate fetch - already in progress');
            return;
        }

        const paramsKey = JSON.stringify({
            page: currentPage,
            filters,
        });

        if (paramsKey === lastFetchParams.current && !isInitialMount.current) {
            console.log('🛑 Skipping duplicate fetch - same params');
            return;
        }

        try {
            isFetching.current = true;
            setLoading(true);
            setIsRefreshing(true);
            lastFetchParams.current = paramsKey;

            // ✅ Fetch all data in parallel
            await Promise.all([
                fetchAccounts(),
                fetchAccountCategories(),
                fetchDepartments(),
                fetchHierarchy(),
            ]);

        } catch (error) {
            console.error('Error fetching data:', error);
            showToast.error('Failed to load data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
            isFetching.current = false;
        }
    }, [currentPage, filters, fetchAccounts, fetchAccountCategories, fetchDepartments, fetchHierarchy]);

    // ============================================================
    // GET ACCOUNT USAGE
    // ============================================================

    // hooks/finance/useChartOfAccounts.ts

    const getAccountUsage = useCallback(async (id: string): Promise<UsageInfo | null> => {
        try {
            console.log('🔍 Fetching usage for account:', id);
            const response = await getAccountUsageService(id);
            console.log('📦 Usage response:', response);

            let usageData = response;
            if (response.data && typeof response.data === 'object') {
                usageData = response.data;
            }
            if (usageData && (usageData as any).data) {
                usageData = (usageData as any).data;
            }

            // ✅ Use the correct property names
            const accountName = usageData.accountName || usageData.name || 'Unknown';
            const accountCode = usageData.accountCode || usageData.code || '';

            console.log('✅ Processed usage data:', { accountName, accountCode, usageData });

            return {
                accountId: usageData.accountId || id,
                accountCode: accountCode,
                accountName: accountName,
                transactionCount: usageData.transactionCount || 0,
                journalEntryCount: usageData.journalEntryCount || 0,
                journalLineCount: usageData.journalLineCount || 0,
                totalDebit: usageData.totalDebit || 0,
                totalCredit: usageData.totalCredit || 0,
                canDelete: usageData.canDelete !== undefined ? usageData.canDelete : true,
                canBeDeleted: usageData.canBeDeleted !== undefined ? usageData.canBeDeleted : true,
                hasChildren: usageData.hasChildren || false,
                reason: usageData.reason || null,
                categoryName: usageData.categoryName || 'Unknown',
                accountCount: usageData.journalLineCount || 0,
            };
        } catch (error) {
            console.error('Error fetching usage info:', error);
            return {
                accountId: id,
                accountCode: '',
                accountName: 'Error loading data',
                transactionCount: 0,
                journalEntryCount: 0,
                journalLineCount: 0,
                totalDebit: 0,
                totalCredit: 0,
                canDelete: false,
                canBeDeleted: false,
                hasChildren: false,
                reason: 'Failed to load usage information. Please try again.',
                categoryName: 'Error loading data',
                accountCount: 0,
            };
        }
    }, []);

    // ============================================================
    // CRUD OPERATIONS
    // ============================================================



    // hooks/finance/useChartOfAccounts.ts

    const createAccount = useCallback(async (formData: AccountFormData) => {
        if (!formData.code || !formData.name) {
            showToast.error('Code and Name are required');
            return false;
        }

        setIsSubmitting(true);
        try {
            // ✅ DEBUG: Log the entire formData
            console.log('📤 [HOOK] createAccount - Full formData:', JSON.stringify(formData, null, 2));
            console.log('📤 [HOOK] categoryId value:', formData.categoryId);
            console.log('📤 [HOOK] categoryId type:', typeof formData.categoryId);
            console.log('📤 [HOOK] categoryId length:', formData.categoryId?.length);

            // ✅ FIX: Process categoryId - handle 'no-category' and empty string
            let processedCategoryId = null;
            if (formData.categoryId && formData.categoryId !== 'no-category' && formData.categoryId !== '') {
                processedCategoryId = formData.categoryId;
            }
            console.log('📤 [HOOK] Processed categoryId:', processedCategoryId);

            const payload = {
                code: formData.code,
                name: formData.name,
                nameAm: formData.nameAm || '',
                accountType: formData.accountType || 'Asset',
                accountSubType: formData.accountSubType || '',
                description: formData.description || '',
                level: formData.level || 1,
                openingBalance: formData.openingBalance || 0,
                categoryId: processedCategoryId, // ✅ Use processed value
                parentId: formData.parentId && formData.parentId !== 'no-parent' && formData.parentId !== ''
                    ? formData.parentId
                    : null,
                isActive: true,
                usefulLife: formData.usefulLife || null,
                salvageValue: formData.salvageValue || null,
                acquisitionDate: formData.acquisitionDate || null,
                location: formData.location || null,
                serialNumber: formData.serialNumber || null,
                manufacturer: formData.manufacturer || null,
                model: formData.model || null,
                assignedTo: formData.assignedTo || null,
                departmentId: formData.departmentId && formData.departmentId !== 'no-department' && formData.departmentId !== ''
                    ? formData.departmentId
                    : null,
            };

            console.log('📤 [HOOK] Final payload:', JSON.stringify(payload, null, 2));
            console.log('📤 [HOOK] categoryId in payload:', payload.categoryId);

            const response = await createAccountApi(payload);
            console.log('✅ [HOOK] Account created successfully:', response.data);

            showToast.success('Account created successfully');
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('❌ [HOOK] Error creating account:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create account';
            showToast.error(errorMsg);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchData]);



    // hooks/finance/useChartOfAccounts.ts - FIXED updateAccount

    const updateAccount = useCallback(async (id: string, formData: AccountFormData) => {
        if (!id || !formData.code || !formData.name) {
            showToast.error('Code and Name are required');
            return false;
        }

        setIsSubmitting(true);
        try {
            // ✅ DEBUG: Log what we're sending
            console.log('📤 Updating account with formData:', formData);
            console.log('📤 CategoryId from formData:', formData.categoryId);

            const payload = {
                id: id,
                code: formData.code,
                name: formData.name,
                nameAm: formData.nameAm || '',
                accountType: formData.accountType || 'Asset',
                accountSubType: formData.accountSubType || '',
                description: formData.description || '',
                level: formData.level || 1,
                openingBalance: formData.openingBalance || 0,
                // ✅ FIX: Handle categoryId properly
                categoryId: formData.categoryId && formData.categoryId !== 'no-category' && formData.categoryId !== ''
                    ? formData.categoryId
                    : null,
                parentId: formData.parentId && formData.parentId !== 'no-parent' && formData.parentId !== ''
                    ? formData.parentId
                    : null,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                usefulLife: formData.usefulLife || null,
                salvageValue: formData.salvageValue || null,
                acquisitionDate: formData.acquisitionDate || null,
                location: formData.location || null,
                serialNumber: formData.serialNumber || null,
                manufacturer: formData.manufacturer || null,
                model: formData.model || null,
                assignedTo: formData.assignedTo || null,
                departmentId: formData.departmentId && formData.departmentId !== 'no-department' && formData.departmentId !== ''
                    ? formData.departmentId
                    : null,
                rowVersion: formData.rowVersion || '',
            };

            console.log('📤 Sending update payload to API:', payload);

            const response = await updateAccountApi(payload);
            console.log('✅ Account updated successfully:', response.data);

            showToast.success('Account updated successfully');
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('❌ Error updating account:', error);
            showToast.error(error.response?.data?.message || 'Failed to update account');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchData]);


    const deleteAccount = useCallback(async (id: string) => {
        if (!id) {
            showToast.error('Account ID is required');
            return false;
        }

        try {
            const canDeleteRes = await canDeleteAccount(id);
            const canDeleteData = canDeleteRes.data?.data || canDeleteRes.data;
            if (!canDeleteData?.canDelete) {
                showToast.error(canDeleteData?.reason || 'Cannot delete this account');
                return false;
            }
        } catch (error) {
            console.error('Error checking delete eligibility:', error);
            showToast.error('Failed to check delete eligibility');
            return false;
        }

        setIsSubmitting(true);
        try {
            await deleteAccountApi(id);
            showToast.success('Account deleted successfully');
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('Error deleting account:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete account');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchData]);

    const bulkDeleteAccounts = useCallback(async (ids: string[]) => {
        if (ids.length === 0) {
            showToast.error('Please select at least one account');
            return false;
        }

        setIsSubmitting(true);
        try {
            const res = await bulkDeleteAccountsApi(ids);
            const result = res.data?.data || res.data;
            showToast.success(`${result.deletedCount} accounts deleted successfully`);
            if (result.errors && result.errors.length > 0) {
                console.warn('Bulk delete errors:', result.errors);
            }
            setSelectedIds([]);
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('Error bulk deleting:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete accounts');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchData]);

    const toggleAccountStatus = useCallback(async (id: string) => {
        try {
            setIsSubmitting(true);
            await toggleAccountStatusService(id);
            showToast.success('Account status toggled successfully');
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('Error toggling account status:', error);
            showToast.error(error.response?.data?.message || 'Failed to toggle account status');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchData]);

    const exportAccounts = useCallback(async (exportFilters: AccountFilters, format: 'csv' | 'json') => {
        try {
            const params: any = {};
            if (exportFilters.filterType !== 'All') params.type = exportFilters.filterType;
            if (exportFilters.filterStatus !== 'All') params.isActive = exportFilters.filterStatus === 'Active';

            const res = await exportAccountsApi(params, format);

            const blob = new Blob([res.data], {
                type: format === 'csv' ? 'text/csv' : 'application/json'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chart-of-accounts-${new Date().toISOString().slice(0,10)}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast.success(`Exported successfully as ${format.toUpperCase()}`);
            return true;
        } catch (error) {
            console.error('Error exporting:', error);
            showToast.error('Failed to export accounts');
            return false;
        }
    }, []);

    // ============================================================
    // FILTERING & PAGINATION
    // ============================================================

    const filteredAccounts = useMemo(() => {
        return accounts.filter(account => {
            const matchesSearch =
                account.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                account.code?.toLowerCase().includes(filters.searchTerm.toLowerCase());
            const matchesType = filters.filterType === 'All' || account.accountType === filters.filterType;
            const matchesStatus = filters.filterStatus === 'All' ||
                (filters.filterStatus === 'Active' && account.isActive) ||
                (filters.filterStatus === 'Inactive' && !account.isActive);
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [accounts, filters]);

    const totalFilteredPages = useMemo(() => {
        return Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE);
    }, [filteredAccounts]);

    const paginatedAccounts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAccounts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAccounts, currentPage]);

    // ============================================================
    // EFFECTS
    // ============================================================

    // ✅ Initial load - runs only once
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ Handle filter changes with debounce
    useEffect(() => {
        if (isInitialMount.current) return;

        if (filterTimeoutRef.current) {
            clearTimeout(filterTimeoutRef.current);
        }

        filterTimeoutRef.current = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            lastFetchParams.current = '';
            fetchData();
        }, 300);

        return () => {
            if (filterTimeoutRef.current) {
                clearTimeout(filterTimeoutRef.current);
            }
        };
    }, [filters.searchTerm, filters.filterType, filters.filterStatus]);

    // ✅ Handle page changes
    useEffect(() => {
        if (isInitialMount.current) return;
        if (loading) return;

        lastFetchParams.current = '';
        fetchData();
    }, [currentPage]);

    // ============================================================
    // RETURN
    // ============================================================

    return {
        // Data
        accounts,
        filteredAccounts,
        paginatedAccounts,
        accountCategories,
        departments,
        hierarchy,
        totalCount: filteredAccounts.length,
        totalPages: totalFilteredPages,
        loading,
        isRefreshing,
        isSubmitting,
        currentPage,
        selectedIds,
        filters,

        // Setters
        setCurrentPage,
        setSelectedIds,
        setFilters,

        // Actions
        fetchData,
        createAccount,
        updateAccount,
        deleteAccount,
        bulkDeleteAccounts,
        toggleAccountStatus,
        getAccountUsage,
        exportAccounts,

        // Utilities
        ITEMS_PER_PAGE,
    };
}