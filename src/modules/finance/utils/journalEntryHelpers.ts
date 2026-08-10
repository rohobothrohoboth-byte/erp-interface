// utils/finance/journalEntryHelpers.ts

import type { JournalEntry, JournalLine } from '@/modules/finance/types/journalEntry.types';

export const journalEntryHelpers = {
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    },

    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    },

    formatDateTime(dateString: string): string {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    },

    calculateTotals(lines: JournalLine[]) {
        const totalDebit = lines
            .filter(l => l.direction === 'Debit')
            .reduce((sum, l) => sum + l.amount, 0);
        const totalCredit = lines
            .filter(l => l.direction === 'Credit')
            .reduce((sum, l) => sum + l.amount, 0);
        const isBalanced = totalDebit === totalCredit;

        return { totalDebit, totalCredit, isBalanced };
    },

    getStatusBadgeType(entry: JournalEntry): string {
        if (entry.isReversed) return 'purple';
        if (entry.isPosted) return 'green';
        if (entry.isApproved) return 'blue';
        if (entry.rejectionReason) return 'red';
        return 'yellow';
    },

    getStatusLabel(entry: JournalEntry): string {
        if (entry.isReversed) return 'Reversed';
        if (entry.isPosted) return 'Posted';
        if (entry.isApproved) return 'Approved';
        if (entry.rejectionReason) return 'Rejected';
        return 'Draft';
    },

    getAccountName(accountId: string, accounts: any[]): string {
        const account = accounts.find(a => a.id === accountId);
        return account ? `${account.code} - ${account.name}` : 'Unknown';
    },

    getDepartmentName(departmentId: string, departments: any[]): string {
        const department = departments.find(d => d.id === departmentId);
        return department?.name || 'Unknown';
    },

    downloadFile(data: any, filename: string, format: 'csv' | 'json') {
        const blob = new Blob([data], {
            type: format === 'csv' ? 'text/csv' : 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    getFilteredEntries(
        entries: JournalEntry[],
        searchTerm: string,
        filterStatus: string,
        filterType: string,
        selectedPeriod: string
    ): JournalEntry[] {
        return entries.filter(entry => {
            const matchesSearch =
                entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.description.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesStatus = true;
            switch (filterStatus) {
                case 'Posted':
                    matchesStatus = entry.isPosted && !entry.isReversed;
                    break;
                case 'Unposted':
                    matchesStatus = !entry.isPosted && !entry.isReversed;
                    break;
                case 'Approved':
                    matchesStatus = entry.isApproved && !entry.isPosted && !entry.isReversed;
                    break;
                case 'Rejected':
                    matchesStatus = !!entry.rejectionReason && !entry.isPosted && !entry.isReversed;
                    break;
                case 'Draft':
                    matchesStatus = !entry.isPosted && !entry.isApproved && !entry.rejectionReason && !entry.isReversed;
                    break;
                default:
                    matchesStatus = true;
            }

            const matchesType = filterType === 'All' || entry.entryType === filterType;
            const matchesPeriod = selectedPeriod === 'all' || entry.periodId === selectedPeriod;

            return matchesSearch && matchesStatus && matchesType && matchesPeriod;
        });
    }
};