// services/finance/journal-entries/journalEntryService.ts

import {
    getJournalEntries,
    getJournalEntryById,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    postJournalEntry,
    unpostJournalEntry,
    approveJournalEntry,
    rejectJournalEntry,
    reverseJournalEntry,
    getJournalEntrySummary,
    exportJournalEntries,
    getAccounts,
    getCostCenters,
    getFinancialPeriods
} from '@/modules/finance/services/finance.api';
import type { JournalEntry, JournalEntryFormData, JournalEntrySummary } from '@/modules/finance/types/journalEntry.types';
import { journalEntryValidators } from '@/modules/finance/services/journal-entries/journalEntryValidators';

export const journalEntryService = {
    // Fetch all entries with pagination and filters
    async getEntries(params: any) {
        const response = await getJournalEntries(params);
        return {
            data: response.data?.data || response.data || [],
            totalCount: response.data?.totalCount || 0,
            totalPages: response.data?.totalPages || 1,
            page: response.data?.page || 1,
        };
    },

    // Get a single entry
    async getEntryById(id: string) {
        const response = await getJournalEntryById(id);
        return response.data?.data || response.data;
    },

    // ✅ Create new entry - FIXED with ALL fields
    async createEntry(data: any) {
        // ✅ Validate
        const validation = journalEntryValidators.validateForm(data);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // ✅ Calculate totals
        const totalDebit = data.lines
            ?.filter((l: any) => l.direction === 'Debit')
            .reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0) || 0;

        const totalCredit = data.lines
            ?.filter((l: any) => l.direction === 'Credit')
            .reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0) || 0;

        // ✅ Format payload with ALL fields
        const payload = {
            reference: data.reference?.trim(),
            entryDate: data.entryDate,
            description: data.description?.trim(),
            entryType: data.entryType || 'General',
            periodId: data.periodId,
            // ✅ Organization fields
            branchId: data.branchId || null,
            departmentId: data.departmentId || null,
            employeeId: data.employeeId || null,
            // ✅ Audit fields - from auth store
            createdByUserId: data.createdByUserId || null,
            createdByUserName: data.createdByUserName || null,
            // ✅ Financial totals
            totalDebit: totalDebit,
            totalCredit: totalCredit,
            // ✅ Lines
            lines: data.lines?.map((line: any) => ({
                accountId: line.accountId,
                direction: line.direction,
                amount: Number(line.amount) || 0,
                description: line.description?.trim() || '',
            })) || [],
        };

        console.log('📤 Creating journal entry with payload:', JSON.stringify(payload, null, 2));

        return await createJournalEntry(payload);
    },

    // ✅ Update entry - FIXED with ALL fields
    async updateEntry(data: any) {
        // ✅ Validate
        const validation = journalEntryValidators.validateForm(data);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // ✅ Calculate totals
        const totalDebit = data.lines
            ?.filter((l: any) => l.direction === 'Debit')
            .reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0) || 0;

        const totalCredit = data.lines
            ?.filter((l: any) => l.direction === 'Credit')
            .reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0) || 0;

        // ✅ Format payload with ALL fields
        const payload = {
            id: data.id,
            reference: data.reference?.trim(),
            entryDate: data.entryDate,
            description: data.description?.trim(),
            entryType: data.entryType || 'General',
            periodId: data.periodId,
            // ✅ Organization fields
            branchId: data.branchId || null,
            departmentId: data.departmentId || null,
            employeeId: data.employeeId || null,
            // ✅ Audit fields - from auth store
            updatedByUserId: data.updatedByUserId || null,
            updatedByUserName: data.updatedByUserName || null,
            // ✅ Financial totals
            totalDebit: totalDebit,
            totalCredit: totalCredit,
            // ✅ Row version for concurrency
            rowVersion: data.rowVersion || '',
            // ✅ Lines
            lines: data.lines?.map((line: any) => ({
                id: line.id,
                accountId: line.accountId,
                direction: line.direction,
                amount: Number(line.amount) || 0,
                description: line.description?.trim() || '',
            })) || [],
        };

        console.log('📤 Updating journal entry with payload:', JSON.stringify(payload, null, 2));

        return await updateJournalEntry(payload);
    },

    // Delete entry
    async deleteEntry(id: string) {
        return await deleteJournalEntry(id);
    },

    // Post entry
    async postEntry(id: string) {
        return await postJournalEntry(id);
    },

    // Unpost entry
    async unpostEntry(id: string) {
        return await unpostJournalEntry(id);
    },

    // Approve entry
    async approveEntry(id: string) {
        return await approveJournalEntry(id);
    },

    // Reject entry
    async rejectEntry(id: string, reason: string) {
        return await rejectJournalEntry(id, reason);
    },

    // Reverse entry
    async reverseEntry(id: string, reason: string, reverseDate: string) {
        return await reverseJournalEntry({ id, reason, reverseDate });
    },

    // Get summary
    async getSummary(params?: any) {
        const response = await getJournalEntrySummary(params);
        return response.data?.data || response.data;
    },

    // Export entries
    async exportEntries(params: any, format: 'csv' | 'json') {
        const response = await exportJournalEntries(params, format);
        return response.data;
    },

    // Get reference data
    async getReferenceData() {
        const [accountsRes, costCentersRes, periodsRes] = await Promise.all([
            getAccounts({ isActive: true }),
            getCostCenters({ isActive: true }),
            getFinancialPeriods({ status: 'All' }),
        ]);

        return {
            accounts: accountsRes.data?.data || accountsRes.data || [],
            costCenters: costCentersRes.data?.data || costCentersRes.data || [],
            financialPeriods: periodsRes.data?.data || periodsRes.data || [],
        };
    }
};