// src/hooks/finance/useJournalEntriesQuery.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { journalEntryService } from '../../services/finance/journal-entries/journalEntryService';
import { showToast } from '../../layout/layout';
import { ITEMS_PER_PAGE } from '../../constants/finance/journalEntryConstants';
import { FINANCE_QUERY_KEYS } from './queryKeys';
import type { JournalEntryFilters } from '../../types/finance/journalEntry.types';

export function useJournalEntriesQuery() {
    const queryClient = useQueryClient();

    // State for pagination and filters
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<JournalEntryFilters>({
        searchTerm: '',
        filterStatus: 'All',
        filterType: 'All',
        selectedPeriod: 'all',
    });

    // ✅ Query: Journal Entries with pagination (cached for 2 minutes)
    const entriesQuery = useQuery({
        queryKey: FINANCE_QUERY_KEYS.entries(currentPage, filters),
        queryFn: async () => {
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                sortBy: 'EntryDate',
                sortOrder: 'DESC',
            };

            if (filters.searchTerm) params.search = filters.searchTerm;
            if (filters.filterType !== 'All') params.entryType = filters.filterType;
            if (filters.selectedPeriod !== 'all') params.periodId = filters.selectedPeriod;

            const result = await journalEntryService.getEntries(params);
            console.log('📥 Fetched entries from API:', result.data?.length || 0);
            return result;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        placeholderData: (previousData) => previousData,
    });

    // ✅ Query: Summary (cached for 2 minutes)
    const summaryQuery = useQuery({
        queryKey: FINANCE_QUERY_KEYS.summary(
            filters.selectedPeriod !== 'all' ? filters.selectedPeriod : undefined
        ),
        queryFn: async () => {
            const params: any = {};
            if (filters.selectedPeriod !== 'all') {
                params.periodId = filters.selectedPeriod;
            }
            const result = await journalEntryService.getSummary(params);
            console.log('📊 Fetched summary from API:', result);
            return result;
        },
        staleTime: 2 * 60 * 1000,
    });

    // ✅ Query: Accounts (cached for 30 minutes - rarely changes)
    const accountsQuery = useQuery({
        queryKey: FINANCE_QUERY_KEYS.accounts(),
        queryFn: async () => {
            const data = await journalEntryService.getReferenceData();
            console.log('📚 Fetched accounts from API:', data.accounts?.length || 0);
            return data.accounts || [];
        },
        staleTime: 30 * 60 * 1000,
    });

    // ✅ Query: Cost Centers (cached for 30 minutes)
    const costCentersQuery = useQuery({
        queryKey: FINANCE_QUERY_KEYS.costCenters(),
        queryFn: async () => {
            const data = await journalEntryService.getReferenceData();
            console.log('📚 Fetched cost centers from API:', data.costCenters?.length || 0);
            return data.costCenters || [];
        },
        staleTime: 30 * 60 * 1000,
    });

    // ✅ Query: Financial Periods (cached for 30 minutes)
    const periodsQuery = useQuery({
        queryKey: FINANCE_QUERY_KEYS.periods(),
        queryFn: async () => {
            const data = await journalEntryService.getReferenceData();
            console.log('📚 Fetched periods from API:', data.financialPeriods?.length || 0);
            return data.financialPeriods || [];
        },
        staleTime: 30 * 60 * 1000,
    });

    // ✅ Helper to invalidate and refetch
    const invalidateAndRefetch = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: ['journalEntries']
        });
        await queryClient.invalidateQueries({
            queryKey: ['journalSummary']
        });
        console.log('🔄 Journal caches invalidated');
    }, [queryClient]);

    // ✅ Create Entry Mutation
    const createEntryMutation = useMutation({
        mutationFn: (data: any) => journalEntryService.createEntry(data),
        onSuccess: () => {
            showToast.success('Journal entry created successfully');
            invalidateAndRefetch();
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to create journal entry');
        },
    });

    // ✅ Update Entry Mutation
    const updateEntryMutation = useMutation({
        mutationFn: (data: any) => journalEntryService.updateEntry(data),
        onSuccess: () => {
            showToast.success('Journal entry updated successfully');
            invalidateAndRefetch();
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to update journal entry');
        },
    });

    // ✅ Delete Entry Mutation
    const deleteEntryMutation = useMutation({
        mutationFn: (id: string) => journalEntryService.deleteEntry(id),
        onSuccess: () => {
            showToast.success('Journal entry deleted successfully');
            invalidateAndRefetch();
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to delete journal entry');
        },
    });

    // ✅ Post Entry Mutation
    const postEntryMutation = useMutation({
        mutationFn: (id: string) => journalEntryService.postEntry(id),
        onSuccess: () => {
            showToast.success('Journal entry posted successfully');
            invalidateAndRefetch();
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to post journal entry');
        },
    });

    // ✅ Unpost Entry Mutation
    const unpostEntryMutation = useMutation({
        mutationFn: (id: string) => journalEntryService.unpostEntry(id),
        onSuccess: () => {
            showToast.success('Journal entry unposted successfully');
            invalidateAndRefetch();
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to unpost journal entry');
        },
    });

    // ✅ Approve Entry Mutation
    const approveEntryMutation = useMutation({
        mutationFn: (id: string) => journalEntryService.approveEntry(id),
        onSuccess: () => {
            showToast.success('Journal entry approved successfully');
            invalidateAndRefetch();
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to approve journal entry');
        },
    });

    // ✅ Reject Entry Mutation
    const rejectEntryMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            journalEntryService.rejectEntry(id, reason),
        onSuccess: () => {
            showToast.success('Journal entry rejected successfully');
            invalidateAndRefetch();
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to reject journal entry');
        },
    });

    // ✅ Reverse Entry Mutation
    const reverseEntryMutation = useMutation({
        mutationFn: ({ id, reason, date }: { id: string; reason: string; date: string }) =>
            journalEntryService.reverseEntry(id, reason, date),
        onSuccess: () => {
            showToast.success('Journal entry reversed successfully');
            invalidateAndRefetch();
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to reverse journal entry');
        },
    });

    // ✅ Export Entries
    const exportEntriesMutation = useMutation({
        mutationFn: ({ params, format }: { params: any; format: 'csv' | 'json' }) =>
            journalEntryService.exportEntries(params, format),
        onSuccess: (data, variables) => {
            const filename = `journal-entries-${new Date().toISOString().slice(0, 10)}.${variables.format}`;
            const blob = new Blob([data], {
                type: variables.format === 'csv' ? 'text/csv' : 'application/json'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast.success(`Exported successfully as ${variables.format.toUpperCase()}`);
        },
        onError: (error: any) => {
            showToast.error(error.response?.data?.message || 'Failed to export journal entries');
        },
    });

    // ✅ Computed loading states
    const isLoading =
        entriesQuery.isLoading ||
        summaryQuery.isLoading ||
        accountsQuery.isLoading ||
        costCentersQuery.isLoading ||
        periodsQuery.isLoading;

    const isRefreshing =
        entriesQuery.isFetching ||
        summaryQuery.isFetching ||
        accountsQuery.isFetching ||
        costCentersQuery.isFetching ||
        periodsQuery.isFetching;

    const isSubmitting =
        createEntryMutation.isPending ||
        updateEntryMutation.isPending ||
        deleteEntryMutation.isPending ||
        postEntryMutation.isPending ||
        unpostEntryMutation.isPending ||
        approveEntryMutation.isPending ||
        rejectEntryMutation.isPending ||
        reverseEntryMutation.isPending;

    return {
        // Data
        entries: entriesQuery.data?.data || [],
        totalCount: entriesQuery.data?.totalCount || 0,
        totalPages: entriesQuery.data?.totalPages || 1,
        summary: summaryQuery.data || null,
        accounts: accountsQuery.data || [],
        costCenters: costCentersQuery.data || [],
        financialPeriods: periodsQuery.data || [],

        // State
        loading: isLoading,
        isRefreshing,
        isSubmitting,
        currentPage,
        setCurrentPage,
        filters,
        setFilters,

        // Query objects (for advanced usage)
        entriesQuery,
        summaryQuery,
        accountsQuery,
        costCentersQuery,
        periodsQuery,

        // Mutations
        createEntry: createEntryMutation.mutateAsync,
        updateEntry: updateEntryMutation.mutateAsync,
        deleteEntry: deleteEntryMutation.mutateAsync,
        postEntry: postEntryMutation.mutateAsync,
        unpostEntry: unpostEntryMutation.mutateAsync,
        approveEntry: approveEntryMutation.mutateAsync,
        rejectEntry: rejectEntryMutation.mutateAsync,
        reverseEntry: reverseEntryMutation.mutateAsync,
        exportEntries: exportEntriesMutation.mutateAsync,

        // Mutation states
        isCreating: createEntryMutation.isPending,
        isUpdating: updateEntryMutation.isPending,
        isDeleting: deleteEntryMutation.isPending,
        isPosting: postEntryMutation.isPending,
        isUnposting: unpostEntryMutation.isPending,
        isApproving: approveEntryMutation.isPending,
        isRejecting: rejectEntryMutation.isPending,
        isReversing: reverseEntryMutation.isPending,
        isExporting: exportEntriesMutation.isPending,

        // Utility
        invalidateAndRefetch,
        refetch: () => {
            entriesQuery.refetch();
            summaryQuery.refetch();
        },
    };
}