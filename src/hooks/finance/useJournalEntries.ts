// hooks/finance/useJournalEntries.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { journalEntryService } from '../../services/finance/journal-entries/journalEntryService';
import { journalEntryValidators } from '../../services/finance/journal-entries/journalEntryValidators';
import { journalEntryHelpers } from '../../utils/finance/journalEntryHelpers';
import { showToast } from '../../layout/layout';
import { DEFAULT_FORM_DATA, ITEMS_PER_PAGE } from '../../constants/finance/journalEntryConstants';
import { getBranches, getEmployees, getDepartments } from '../../services/finance/finance.api'; // ✅ ADD getDepartments
import { useAuthStore } from '../../stores/auth.store';
import type {
    JournalEntry,
    JournalEntrySummary,
    JournalEntryFormData,
    JournalEntryFilters,
    JournalLine
} from '../../types/finance/journalEntry.types';

export function useJournalEntries() {
    // ✅ Get auth state from store
    const {
        branchId: userBranchId,
        branchName: userBranchName,
        departmentId: userDepartmentId,
        departmentName: userDepartmentName,
        employeeId: userEmployeeId,
        userId: userUserId,
        userName: userUserName,
    } = useAuthStore();

    // State
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [costCenters, setCostCenters] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]); // ✅ ADD THIS
    const [financialPeriods, setFinancialPeriods] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [summary, setSummary] = useState<JournalEntrySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    // ✅ Add refs to prevent duplicate calls
    const isFetching = useRef(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastFetchParams = useRef<string>('');
    const isInitialMount = useRef(true);

    // Filters
    const [filters, setFilters] = useState<JournalEntryFilters>({
        searchTerm: '',
        filterStatus: 'All',
        filterType: 'All',
        selectedPeriod: 'all',
    });

    // Form state
    const [formData, setFormData] = useState<JournalEntryFormData>(DEFAULT_FORM_DATA);

    // Modal states
    const [modals, setModals] = useState({
        view: false,
        edit: false,
        add: false,
        delete: false,
        post: false,
        unpost: false,
        approve: false,
        reject: false,
        reverse: false,
        summary: false,
        export: false,
    });

    // Action states
    const [rejectReason, setRejectReason] = useState('');
    const [reverseReason, setReverseReason] = useState('');
    const [reverseDate, setReverseDate] = useState(new Date().toISOString().split('T')[0]);
    const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
    const [exporting, setExporting] = useState(false);

    // ✅ Get user data from auth store (no need for localStorage)
    const getUserData = useCallback(() => {
        console.log('👤 User data from auth store:', {
            branchId: userBranchId,
            branchName: userBranchName,
            departmentId: userDepartmentId,
            departmentName: userDepartmentName,
            employeeId: userEmployeeId,
            userId: userUserId,
            userName: userUserName,
        });

        return {
            branchId: userBranchId || '',
            branchName: userBranchName || '',
            departmentId: userDepartmentId || '',
            departmentName: userDepartmentName || '',
            employeeId: userEmployeeId || '',
            userId: userUserId || '',
            userName: userUserName || '',
        };
    }, [userBranchId, userBranchName, userDepartmentId, userDepartmentName, userEmployeeId, userUserId, userUserName]);

    // ✅ Create a unique key for the current fetch params
    const getFetchKey = useCallback(() => {
        return JSON.stringify({
            page: currentPage,
            pageSize: ITEMS_PER_PAGE,
            searchTerm: filters.searchTerm,
            filterType: filters.filterType,
            selectedPeriod: filters.selectedPeriod,
        });
    }, [currentPage, filters.searchTerm, filters.filterType, filters.selectedPeriod]);


    const fetchDepartments = useCallback(async () => {
        try {
            console.log('🔍 Fetching departments...');
            const response = await getDepartments();
            const depts = response?.data?.data || response?.data || response || [];
            console.log(`✅ Departments: ${depts.length}`);
            setDepartments(depts);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setDepartments([]);
        }
    }, []);

    // ✅ Fetch branches and employees
    const fetchBranchesAndEmployees = useCallback(async () => {
        try {
            console.log('🔍 Fetching branches and employees...');
            const [branchesRes, employeesRes] = await Promise.all([
                getBranches(),
                getEmployees()
            ]);

            // Handle response formats
            const branchesData = branchesRes?.data?.data || branchesRes?.data || branchesRes || [];
            const employeesData = employeesRes?.data?.data || employeesRes?.data || employeesRes || [];

            console.log(`✅ Branches: ${branchesData.length}, Employees: ${employeesData.length}`);

            setBranches(branchesData);
            setEmployees(employeesData);
        } catch (error) {
            console.error('Error fetching branches/employees:', error);
            // Don't show toast - these are non-critical
        }
    }, []);

    // Fetch data with duplicate prevention
    const fetchData = useCallback(async () => {
        if (isFetching.current) {
            console.log('🛑 Skipping duplicate fetch - already in progress');
            return;
        }

        const currentKey = getFetchKey();
        if (currentKey === lastFetchParams.current && !isInitialMount.current) {
            console.log('🛑 Skipping duplicate fetch - same params');
            return;
        }

        try {
            isFetching.current = true;
            lastFetchParams.current = currentKey;
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                sortBy: 'EntryDate',
                sortOrder: 'DESC'
            };

            if (filters.searchTerm) params.search = filters.searchTerm;
            if (filters.filterType !== 'All') params.entryType = filters.filterType;
            if (filters.selectedPeriod !== 'all') params.periodId = filters.selectedPeriod;

            console.log('📡 Fetching entries with params:', params);

            // ✅ Include departments in reference data fetch
            const [entriesResult, referenceData, summaryResult] = await Promise.all([
                journalEntryService.getEntries(params),
                journalEntryService.getReferenceData(),
                journalEntryService.getSummary({ periodId: filters.selectedPeriod !== 'all' ? filters.selectedPeriod : undefined })
            ]);

            console.log('📥 Entries received:', entriesResult.data?.length || 0);

            setEntries(entriesResult.data);
            setTotalCount(entriesResult.totalCount);
            setTotalPages(entriesResult.totalPages);
            setAccounts(referenceData.accounts);
            setCostCenters(referenceData.costCenters);
            setFinancialPeriods(referenceData.financialPeriods);
            setSummary(summaryResult);

            // ✅ Fetch branches, employees, and departments
            await Promise.all([
                fetchBranchesAndEmployees(),
                fetchDepartments()
            ]);

        } catch (error) {
            console.error('Error fetching journal entries:', error);
            showToast.error('Failed to load journal entries');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
            isFetching.current = false;
        }
    }, [currentPage, filters, getFetchKey, fetchBranchesAndEmployees, fetchDepartments]);

    // ✅ Helper to reset and fetch (used after mutations)
    const resetAndFetch = useCallback(async () => {
        lastFetchParams.current = '';
        await fetchData();
    }, [fetchData]);

    // ============================================================
    // CRUD Operations
    // ============================================================


    // hooks/finance/useJournalEntries.ts

    const createEntry = async (data: Partial<JournalEntryFormData>) => {
        const validation = journalEntryValidators.validateForm(data);
        if (!validation.isValid) {
            showToast.error(validation.errors.join(', '));
            return false;
        }

        setIsSubmitting(true);
        try {
            // ✅ Calculate totals
            const totals = journalEntryHelpers.calculateTotals(data.lines || []);

            if (!totals.isBalanced) {
                showToast.error('Total debits must equal total credits');
                return false;
            }

            // ✅ Get user data from auth store
            const userData = getUserData();

            // ✅ Format the payload - matches what Postman sent
            const payload = {
                reference: data.reference,
                entryDate: data.entryDate,
                description: data.description,
                entryType: data.entryType || 'General',
                periodId: data.periodId,
                branchId: data.branchId || null,
                departmentId: data.departmentId || null,
                employeeId: data.employeeId || null,
                createdByUserId: userData.userId || null,
                createdByUserName: userData.userName || null,
                lines: data.lines?.map(line => ({
                    accountId: line.accountId,
                    direction: line.direction,
                    amount: line.amount,
                    description: line.description || '',
                })) || [],
            };

            console.log('📤 Creating journal entry with payload:', payload);

            const response = await journalEntryService.createEntry(payload);
            console.log('✅ Journal entry created:', response.data);

            showToast.success('Journal entry created successfully');
            closeModal('add');
            resetForm();
            await resetAndFetch();
            return true;
        } catch (error: any) {
            console.error('Error creating journal entry:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.join(', ') ||
                'Failed to create journal entry';
            showToast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateEntry = async (data: Partial<JournalEntryFormData>) => {
        if (!selectedEntry) return false;

        const validation = journalEntryValidators.validateForm(data);
        if (!validation.isValid) {
            showToast.error(validation.errors.join(', '));
            return false;
        }

        const canEdit = journalEntryValidators.canEdit(selectedEntry, financialPeriods);
        if (!canEdit.canEdit) {
            showToast.error(canEdit.reason || 'Cannot edit this entry');
            return false;
        }

        setIsSubmitting(true);
        try {
            // ✅ Calculate totals inside the function
            const totals = journalEntryHelpers.calculateTotals(data.lines || []);

            // ✅ Get user data from auth store
            const userData = getUserData();

            const payload = {
                id: selectedEntry.id,
                reference: data.reference,
                entryDate: data.entryDate,
                description: data.description,
                entryType: data.entryType || 'General',
                periodId: data.periodId,
                departmentId: data.departmentId || null,
                branchId: data.branchId || null,
                employeeId: data.employeeId || null,
                totalDebit: totals.totalDebit,
                totalCredit: totals.totalCredit,
                rowVersion: formData.rowVersion,
                updatedByUserId: userData.userId || null,
                updatedByUserName: userData.userName || null,
                lines: data.lines?.map(line => ({
                    id: line.id,
                    accountId: line.accountId,
                    direction: line.direction,
                    amount: line.amount,
                    description: line.description || '',
                })) || [],
            };

            console.log('📤 Updating journal entry with payload:', payload);

            await journalEntryService.updateEntry(payload);
            showToast.success('Journal entry updated successfully');
            closeModal('edit');
            await resetAndFetch();
            return true;
        } catch (error: any) {
            console.error('Error updating journal entry:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.join(', ') ||
                'Failed to update journal entry';
            showToast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteEntry = async () => {
        if (!selectedEntry) return false;

        const canDelete = journalEntryValidators.canDelete(selectedEntry);
        if (!canDelete.canDelete) {
            showToast.error(canDelete.reason || 'Cannot delete this entry');
            return false;
        }

        setIsSubmitting(true);
        try {
            await journalEntryService.deleteEntry(selectedEntry.id);
            showToast.success('Journal entry deleted successfully');
            closeModal('delete');
            setSelectedEntry(null);
            await resetAndFetch();
            return true;
        } catch (error: any) {
            console.error('Error deleting journal entry:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete journal entry');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const postEntry = async () => {
        if (!selectedEntry) return false;

        setIsSubmitting(true);
        try {
            await journalEntryService.postEntry(selectedEntry.id);
            showToast.success('Journal entry posted successfully');
            closeModal('post');
            setSelectedEntry(null);
            await resetAndFetch();
            return true;
        } catch (error: any) {
            console.error('Error posting journal entry:', error);
            showToast.error(error.response?.data?.message || 'Failed to post journal entry');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const unpostEntry = async () => {
        if (!selectedEntry) return false;

        setIsSubmitting(true);
        try {
            await journalEntryService.unpostEntry(selectedEntry.id);
            showToast.success('Journal entry unposted successfully');
            closeModal('unpost');
            setSelectedEntry(null);
            await resetAndFetch();
            return true;
        } catch (error: any) {
            console.error('Error unposting journal entry:', error);
            showToast.error(error.response?.data?.message || 'Failed to unpost journal entry');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const approveEntry = async () => {
        if (!selectedEntry) return false;

        setIsSubmitting(true);
        try {
            await journalEntryService.approveEntry(selectedEntry.id);
            showToast.success('Journal entry approved successfully');
            closeModal('approve');
            setSelectedEntry(null);
            await resetAndFetch();
            return true;
        } catch (error: any) {
            console.error('Error approving journal entry:', error);
            showToast.error(error.response?.data?.message || 'Failed to approve journal entry');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const rejectEntry = async () => {
        if (!selectedEntry) return false;
        if (!rejectReason) {
            showToast.error('Please provide a rejection reason');
            return false;
        }

        setIsSubmitting(true);
        try {
            await journalEntryService.rejectEntry(selectedEntry.id, rejectReason);
            showToast.success('Journal entry rejected successfully');
            closeModal('reject');
            setRejectReason('');
            setSelectedEntry(null);
            await resetAndFetch();
            return true;
        } catch (error: any) {
            console.error('Error rejecting journal entry:', error);
            showToast.error(error.response?.data?.message || 'Failed to reject journal entry');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const reverseEntry = async () => {
        if (!selectedEntry) return false;

        setIsSubmitting(true);
        try {
            await journalEntryService.reverseEntry(
                selectedEntry.id,
                reverseReason || 'Reversal',
                reverseDate
            );
            showToast.success('Journal entry reversed successfully');
            closeModal('reverse');
            setReverseReason('');
            setSelectedEntry(null);
            await resetAndFetch();
            return true;
        } catch (error: any) {
            console.error('Error reversing journal entry:', error);
            showToast.error(error.response?.data?.message || 'Failed to reverse journal entry');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const exportEntries = async () => {
        setExporting(true);
        try {
            const params: any = {};
            if (filters.selectedPeriod !== 'all') params.periodId = filters.selectedPeriod;
            if (filters.filterType !== 'All') params.entryType = filters.filterType;
            if (filters.filterStatus !== 'All') params.isPosted = filters.filterStatus === 'Posted';

            const data = await journalEntryService.exportEntries(params, exportFormat);
            const filename = `journal-entries-${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
            journalEntryHelpers.downloadFile(data, filename, exportFormat);

            showToast.success(`Exported successfully as ${exportFormat.toUpperCase()}`);
            closeModal('export');
        } catch (error) {
            console.error('Error exporting:', error);
            showToast.error('Failed to export journal entries');
        } finally {
            setExporting(false);
        }
    };

    // ============================================================
    // Form Helpers
    // ============================================================

    const resetForm = () => {
        setFormData(DEFAULT_FORM_DATA);
    };

    const setFormField = <K extends keyof JournalEntryFormData>(
        field: K,
        value: JournalEntryFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [
                ...prev.lines,
                { accountId: '', direction: 'Debit', amount: 0, description: '' }
            ],
        }));
    };

    const removeLine = (index: number) => {
        if (formData.lines.length > 2) {
            setFormData(prev => ({
                ...prev,
                lines: prev.lines.filter((_, i) => i !== index),
            }));
        }
    };

    const updateLine = (index: number, field: keyof JournalLine, value: any) => {
        setFormData(prev => {
            const newLines = [...prev.lines];
            newLines[index] = { ...newLines[index], [field]: value };
            return { ...prev, lines: newLines };
        });
    };

    // ============================================================
    // Modal Helpers
    // ============================================================

    const openModal = (modal: keyof typeof modals, entry?: JournalEntry) => {
        if (entry) setSelectedEntry(entry);
        setModals(prev => ({ ...prev, [modal]: true }));
    };

    const closeModal = (modal: keyof typeof modals) => {
        setModals(prev => ({ ...prev, [modal]: false }));
        if (modal === 'edit' || modal === 'view') {
            setSelectedEntry(null);
        }
    };

    const openEditModal = (entry: JournalEntry) => {
        const canEdit = journalEntryValidators.canEdit(entry, financialPeriods);
        if (!canEdit.canEdit) {
            showToast.error(canEdit.reason || 'Cannot edit this entry');
            return;
        }

        setSelectedEntry(entry);
        setFormData({
            reference: entry.reference,
            entryDate: entry.entryDate.split('T')[0],
            description: entry.description,
            entryType: entry.entryType || 'General',
            periodId: entry.periodId || '',
            departmentId: entry.departmentId || '',
            branchId: entry.branchId || '',
            employeeId: entry.employeeId || '',
            rowVersion: entry.rowVersion || '',
            lines: entry.lines.map(line => ({
                id: line.id,
                accountId: line.accountId,
                direction: line.direction,
                amount: line.amount,
                description: line.description || '',
            })),
        });
        openModal('edit');
    };

    // ✅ FIXED: Auto-fill from logged-in user when opening add modal
    const openAddModal = () => {
        const userData = getUserData();
        console.log('👤 User data for auto-fill:', userData);

        // Reset form
        resetForm();

        // ✅ Auto-fill from logged-in user data
        const branchId = userData.branchId || '';
        const departmentId = userData.departmentId || '';
        const employeeId = userData.employeeId || '';

        console.log('📝 Auto-filling form with:', { branchId, departmentId, employeeId });

        if (branchId) setFormField('branchId', branchId);
        if (departmentId) setFormField('departmentId', departmentId);
        if (employeeId) setFormField('employeeId', employeeId);

        // ✅ Set default entry type
        if (!formData.entryType) {
            setFormField('entryType', 'General');
        }

        // ✅ Set default date if not set
        if (!formData.entryDate) {
            setFormField('entryDate', new Date().toISOString().split('T')[0]);
        }

        // ✅ Try to find and set default period
        if (!formData.periodId && financialPeriods.length > 0) {
            const activePeriod = financialPeriods.find(p => p.isActive || isPeriodCurrentlyActive(p));
            if (activePeriod) {
                setFormField('periodId', activePeriod.id);
            } else {
                setFormField('periodId', financialPeriods[0].id);
            }
        }

        openModal('add');
    };

    // ============================================================
    // Effects
    // ============================================================

    // ✅ Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = null;
            }
        };
    }, []);

    // ✅ SINGLE useEffect for initial load + filter changes
    useEffect(() => {
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = null;
        }

        fetchTimeoutRef.current = setTimeout(() => {
            if (currentPage !== 1 && !isInitialMount.current) {
                setCurrentPage(1);
            }
            lastFetchParams.current = '';
            fetchData();
            fetchTimeoutRef.current = null;
            isInitialMount.current = false;
        }, isInitialMount.current ? 0 : 300);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
                fetchTimeoutRef.current = null;
            }
        };
    }, [filters.searchTerm, filters.filterStatus, filters.filterType, filters.selectedPeriod]);

    // ✅ Handle page changes separately
    useEffect(() => {
        if (isInitialMount.current || loading) {
            return;
        }
        lastFetchParams.current = '';
        fetchData();
    }, [currentPage]);

    // ============================================================
    // Return
    // ============================================================

    return {
        // State
        entries,
        accounts,
        costCenters,
        departments,
        financialPeriods,
        branches,
        employees,
        summary,
        loading,
        isRefreshing,
        isSubmitting,
        currentPage,
        totalCount,
        totalPages,
        selectedEntry,
        filters,
        setFilters,
        formData,
        modals,
        rejectReason,
        setRejectReason,
        reverseReason,
        setReverseReason,
        reverseDate,
        setReverseDate,
        exportFormat,
        setExportFormat,
        exporting,

        // Actions
        fetchData,
        createEntry,
        updateEntry,
        deleteEntry,
        postEntry,
        unpostEntry,
        approveEntry,
        rejectEntry,
        reverseEntry,
        exportEntries,
        openModal,
        closeModal,
        openEditModal,
        openAddModal,
        setFormField,
        addLine,
        removeLine,
        updateLine,
        resetForm,
        setSelectedEntry,
        setCurrentPage,

        // ✅ User data from auth store
        userData: {
            branchId: userBranchId,
            branchName: userBranchName,
            departmentId: userDepartmentId,
            departmentName: userDepartmentName,
            employeeId: userEmployeeId,
            userId: userUserId,
            userName: userUserName,
        },
    };
}