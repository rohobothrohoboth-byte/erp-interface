// src/hooks/finance/useBudgets.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getBudgets,
    createBudget as createBudgetApi,
    updateBudget as updateBudgetApi,
    deleteBudget as deleteBudgetApi,
    toggleBudgetStatus as toggleBudgetStatusApi,
    getBudgetById,
    getBranches,
    getDepartments,
    getAccounts,
    getAllFinancialPeriods,
    getBudgetCodes,
} from '../../services/finance/finance.api';
import { showToast } from '../../layout/layout';
import type { Budget, BudgetFormData, BudgetStats } from '../../types/finance/budget/types/index';

const ITEMS_PER_PAGE = 10;

export function useBudgets() {
    // State
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);
    const [budgetCodes, setBudgetCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPeriodId, setFilterPeriodId] = useState<string>('all');

    // Refs
    const isFetching = useRef(false);
    const isInitialMount = useRef(true);

    // ✅ Fetch budget codes
    const fetchBudgetCodes = useCallback(async () => {
        try {
            console.log('📡 [useBudgets] Fetching budget codes...');
            const response = await getBudgetCodes();

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

            console.log('📥 [useBudgets] Parsed budget codes:', data.length);
            setBudgetCodes(data);
            return data;
        } catch (error) {
            console.error('❌ [useBudgets] Error fetching budget codes:', error);
            return [];
        }
    }, []);

    // ✅ Fetch periods
    const fetchPeriods = useCallback(async () => {
        try {
            console.log('📡 [useBudgets] Fetching financial periods...');
            const response = await getAllFinancialPeriods({ isClosed: false });

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

            console.log('📥 [useBudgets] Parsed periods:', data.length);
            setPeriods(data);
            return data;
        } catch (error) {
            console.error('❌ [useBudgets] Error fetching periods:', error);
            showToast.error('Failed to load financial periods');
            return [];
        }
    }, []);

    // ✅ Fetch all data
    // src/hooks/finance/useBudgets.ts

    const fetchData = useCallback(async () => {
        if (isFetching.current) return;

        try {
            isFetching.current = true;
            setLoading(true);
            setIsRefreshing(true);

            // ✅ Build query parameters for budgets
            const budgetParams: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                sortBy: 'StartDate',
                sortDirection: 'DESC'
            };

            // ✅ Add filters
            if (searchTerm) {
                budgetParams.search = searchTerm;
            }
            if (filterStatus && filterStatus !== 'All') {
                budgetParams.status = filterStatus;
            }
            if (filterPeriodId && filterPeriodId !== 'all') {
                budgetParams.periodId = filterPeriodId;
            }

            console.log('📡 [useBudgets] Fetching budgets with params:', budgetParams);

            const [budgetsRes, branchesRes, departmentsRes, accountsRes, periodsData, codesData] = await Promise.all([
                getBudgets(budgetParams),
                getBranches(),
                getDepartments(),
                getAccounts(),
                getAllFinancialPeriods({ isClosed: false }),
                getBudgetCodes(),
            ]);

            console.log('📥 [useBudgets] RAW budgetsRes:', budgetsRes);
            console.log('📥 [useBudgets] budgetsRes.data:', budgetsRes?.data);
            console.log('📥 [useBudgets] budgetsRes.data.items:', budgetsRes?.data?.items);

            // Parse periods
            let periodsList = [];
            if (periodsData?.data) {
                if (periodsData.data.data && Array.isArray(periodsData.data.data)) {
                    periodsList = periodsData.data.data;
                } else if (Array.isArray(periodsData.data)) {
                    periodsList = periodsData.data;
                } else if (periodsData.data.$values && Array.isArray(periodsData.data.$values)) {
                    periodsList = periodsData.data.$values;
                }
            }
            setPeriods(periodsList);

            // Parse budget codes
            let codesList = [];
            if (codesData?.data) {
                if (codesData.data.data && Array.isArray(codesData.data.data)) {
                    codesList = codesData.data.data;
                } else if (Array.isArray(codesData.data)) {
                    codesList = codesData.data;
                } else if (codesData.data.$values && Array.isArray(codesData.data.$values)) {
                    codesList = codesData.data.$values;
                }
            }
            setBudgetCodes(codesList);

            // ✅ FIXED: Parse budgets - Check items first
            let budgetsData = [];
            if (budgetsRes) {
                // Check for PaginatedResponse format: { data: { items: [...] } }
                if (budgetsRes.data && budgetsRes.data.items && Array.isArray(budgetsRes.data.items)) {
                    budgetsData = budgetsRes.data.items;
                    console.log('✅ Found budgets in data.items:', budgetsData.length);
                }
                // Check for { data: { data: [...] } }
                else if (budgetsRes.data && budgetsRes.data.data && Array.isArray(budgetsRes.data.data)) {
                    budgetsData = budgetsRes.data.data;
                    console.log('✅ Found budgets in data.data:', budgetsData.length);
                }
                // Check for { data: [...] }
                else if (budgetsRes.data && Array.isArray(budgetsRes.data)) {
                    budgetsData = budgetsRes.data;
                    console.log('✅ Found budgets in data (array):', budgetsData.length);
                }
                // Check for { data: { $values: [...] } }
                else if (budgetsRes.data && budgetsRes.data.$values && Array.isArray(budgetsRes.data.$values)) {
                    budgetsData = budgetsRes.data.$values;
                    console.log('✅ Found budgets in data.$values:', budgetsData.length);
                }
                // Check for { data: { results: [...] } }
                else if (budgetsRes.data && budgetsRes.data.results && Array.isArray(budgetsRes.data.results)) {
                    budgetsData = budgetsRes.data.results;
                    console.log('✅ Found budgets in data.results:', budgetsData.length);
                }
                // Check if budgetsRes itself is an array
                else if (Array.isArray(budgetsRes)) {
                    budgetsData = budgetsRes;
                    console.log('✅ Found budgets in root (array):', budgetsData.length);
                }
            }

            console.log('📊 [useBudgets] budgetsData count:', budgetsData.length);
            console.log('📊 [useBudgets] First budget item:', budgetsData[0]);

            // Filter by period (if not already filtered by API)
            if (filterPeriodId && filterPeriodId !== 'all') {
                budgetsData = budgetsData.filter((b: any) => b.periodId === filterPeriodId);
            }

            // Parse branches
            let branchesData = [];
            if (branchesRes.data) {
                if (Array.isArray(branchesRes.data)) {
                    branchesData = branchesRes.data;
                } else if (branchesRes.data.data && Array.isArray(branchesRes.data.data)) {
                    branchesData = branchesRes.data.data;
                } else if (branchesRes.data.$values && Array.isArray(branchesRes.data.$values)) {
                    branchesData = branchesRes.data.$values;
                }
            }

            // Parse departments
            let departmentsData = [];
            if (departmentsRes.data) {
                if (Array.isArray(departmentsRes.data)) {
                    departmentsData = departmentsRes.data;
                } else if (departmentsRes.data.data && Array.isArray(departmentsRes.data.data)) {
                    departmentsData = departmentsRes.data.data;
                } else if (departmentsRes.data.$values && Array.isArray(departmentsRes.data.$values)) {
                    departmentsData = departmentsRes.data.$values;
                }
            }

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

            // Build maps
            const branchMap: Record<string, string> = {};
            branchesData.forEach((b: any) => {
                const id = b.id || b.branchId;
                if (id) branchMap[id] = b.name || 'Unknown';
            });

            const deptMap: Record<string, string> = {};
            departmentsData.forEach((d: any) => {
                const id = d.id || d.departmentId;
                if (id) deptMap[id] = d.name || 'Unknown';
            });

            const accountMap: Record<string, any> = {};
            accountsData.forEach((a: any) => {
                const id = a.id || a.accountId;
                if (id) accountMap[id] = a;
            });

            // Map budgets
            const mappedBudgets: Budget[] = budgetsData.map((b: any) => ({
                id: b.id,
                name: b.name || 'Unnamed Budget',
                budgetCodeId: b.budgetCodeId || b.budgetCode || '',
                budgetCode: b.budgetCode || b.code || '',
                description: b.description || '',
                totalAmount: b.totalAmount || 0,
                startDate: b.startDate || new Date().toISOString(),
                endDate: b.endDate || new Date().toISOString(),
                status: b.status || 'Draft',
                branchId: b.branchId || '',
                branchName: branchMap[b.branchId] || b.branchName || '',
                departmentId: b.departmentId || '',
                departmentName: deptMap[b.departmentId] || b.departmentName || '',
                periodId: b.periodId || '',
                periodName: b.periodName || '',
                lines: (b.lines || []).map((line: any) => ({
                    id: line.id,
                    accountId: line.accountId || '',
                    accountName: accountMap[line.accountId]?.name || line.accountName || '',
                    accountCode: accountMap[line.accountId]?.code || line.accountCode || '',
                    allocatedAmount: line.allocatedAmount || 0,
                    spentAmount: line.spentAmount || 0,
                    description: line.description || '',
                    periodId: line.periodId || b.periodId || '',
                })),
                dateAdd: b.dateAdd || new Date().toISOString(),
                dateMod: b.dateMod,
                rowVersion: b.rowVersion || '',
            }));

            console.log('📥 [useBudgets] Mapped budgets count:', mappedBudgets.length);

            setBudgets(mappedBudgets);
            setTotalCount(mappedBudgets.length);
            setBranches(branchesData);
            setDepartments(departmentsData);
            setAccounts(accountsData);

        } catch (error) {
            console.error('Error fetching budgets:', error);
            showToast.error('Failed to load budgets');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
            isFetching.current = false;
        }
    }, [currentPage, searchTerm, filterStatus, filterPeriodId]); // ✅ Added dependencies

    // Initial load
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchData();
        }
    }, [fetchData]);

    // Reload on filter change
    useEffect(() => {
        if (!isInitialMount.current) {
            const timer = setTimeout(() => {
                fetchData();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [filterPeriodId, filterStatus, searchTerm, fetchData]);

    // ============================================================
    // ✅ CRUD OPERATIONS
    // ============================================================

    // ✅ Create Budget - FIXED: Use budgetCodeId
    const createBudget = async (formData: BudgetFormData) => {
        // ✅ Validate required fields
        if (!formData.budgetCodeId) {
            showToast.error('Please select a budget code');
            return false;
        }

        setIsSubmitting(true);
        try {
            const totalAmount = formData.lines.reduce((sum, l) => sum + l.allocatedAmount, 0);
            const startDate = new Date(formData.startDate).toISOString();
            const endDate = new Date(formData.endDate).toISOString();

            // ✅ Find the selected budget code to get the actual code string
            const selectedBudgetCode = budgetCodes.find(c => c.id === formData.budgetCodeId);
            const codeValue = selectedBudgetCode?.code?.trim() || formData.budgetCodeId;

            const payload = {
                budgetCodeId: formData.budgetCodeId,  // ✅ Send the ID
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                totalAmount: totalAmount,
                startDate: startDate,
                endDate: endDate,
                branchId: formData.branchId || null,
                departmentId: formData.departmentId || null,
                periodId: formData.periodId,
                status: formData.status || 'Draft',
                lines: formData.lines.map(line => ({
                    accountId: line.accountId,
                    allocatedAmount: line.allocatedAmount,
                    description: line.description?.trim() || '',
                    periodId: formData.periodId,
                })),
            };

            console.log('📤 Creating budget with payload:', JSON.stringify(payload, null, 2));

            const result = await createBudgetApi(payload);
            console.log('✅ Budget created successfully:', result);

            showToast.success('Budget created successfully');
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('Error creating budget:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.join(', ') ||
                'Failed to create budget';
            showToast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // src/hooks/finance/useBudgets.ts - ✅ This is correct

    const updateBudget = async (id: string, formData: BudgetFormData, rowVersion: string) => {
        if (!formData.budgetCodeId) {
            showToast.error('Please select a budget code');
            return false;
        }

        setIsSubmitting(true);
        try {
            const totalAmount = formData.lines.reduce((sum, l) => sum + l.allocatedAmount, 0);

            const payload = {
                id,
                budgetCodeId: formData.budgetCodeId,  // ✅ Send the ID
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                totalAmount: totalAmount,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                branchId: formData.branchId || null,
                departmentId: formData.departmentId || null,
                periodId: formData.periodId,
                status: formData.status || 'Draft',
                lines: formData.lines.map(line => ({
                    id: line.id || undefined,  // ✅ Include id for existing lines
                    accountId: line.accountId,
                    allocatedAmount: line.allocatedAmount,
                    description: line.description?.trim() || '',
                    periodId: formData.periodId,
                })),
                rowVersion,
            };

            console.log('📤 Updating budget with payload:', JSON.stringify(payload, null, 2));

            await updateBudgetApi(payload);
            showToast.success('Budget updated successfully');
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('Error updating budget:', error);
            showToast.error(error.response?.data?.message || 'Failed to update budget');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };
    // ✅ Delete Budget
    const deleteBudget = async (id: string) => {
        try {
            await deleteBudgetApi(id);
            showToast.success('Budget deleted successfully');
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('Error deleting budget:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete budget');
            return false;
        }
    };

    // ✅ Toggle Budget Status
    const toggleBudgetStatus = async (id: string) => {
        try {
            await toggleBudgetStatusApi(id);
            showToast.success('Budget status toggled successfully');
            await fetchData();
            return true;
        } catch (error: any) {
            console.error('Error toggling budget status:', error);
            showToast.error(error.response?.data?.message || 'Failed to toggle budget status');
            return false;
        }
    };

    // ============================================================
    // ✅ FILTERED AND PAGINATED DATA
    // ============================================================

    const filteredBudgets = budgets.filter(b => {
        const matchesSearch =
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.budgetCode || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredBudgets.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBudgets = filteredBudgets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const stats: BudgetStats = {
        total: budgets.length,
        active: budgets.filter(b => b.status === 'Active').length,
        draft: budgets.filter(b => b.status === 'Draft').length,
        totalAmount: budgets.reduce((sum, b) => sum + b.totalAmount, 0),
    };

    // ============================================================
    // ✅ RETURN
    // ============================================================

    return {
        // Data
        budgets,
        filteredBudgets,
        paginatedBudgets,
        branches,
        departments,
        accounts,
        periods,
        budgetCodes,
        loading,
        isRefreshing,
        isSubmitting,
        currentPage,
        totalCount,
        totalPages,
        selectedBudget,
        stats,

        // Filters
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterPeriodId,
        setFilterPeriodId,

        // Actions
        fetchData,
        fetchPeriods,
        fetchBudgetCodes,
        createBudget,
        updateBudget,
        deleteBudget,
        toggleBudgetStatus,
        setSelectedBudget,
        setCurrentPage,
    };
}