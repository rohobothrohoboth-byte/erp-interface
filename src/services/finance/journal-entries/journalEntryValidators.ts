// services/finance/journal-entries/journalEntryValidators.ts

import type { JournalLine, JournalEntryFormData } from '../../../types/finance/journalEntry.types';

export const journalEntryValidators = {
    validateForm(data: Partial<JournalEntryFormData>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // ✅ Required fields
        if (!data.reference?.trim()) {
            errors.push('Reference is required');
        }

        if (!data.entryDate) {
            errors.push('Entry date is required');
        }

        if (!data.description?.trim()) {
            errors.push('Description is required');
        }

        if (!data.periodId) {
            errors.push('Financial period is required');
        }

        // ✅ Lines validation
        if (!data.lines || data.lines.length === 0) {
            errors.push('At least one line is required');
        } else {
            // ✅ Validate each line
            data.lines.forEach((line, index) => {
                if (!line.accountId) {
                    errors.push(`Line ${index + 1}: Account is required`);
                }
                if (!line.direction) {
                    errors.push(`Line ${index + 1}: Direction is required`);
                }
                if (!line.amount || line.amount <= 0) {
                    errors.push(`Line ${index + 1}: Amount must be greater than 0`);
                }
            });
        }

        // ✅ Check balance
        const totalDebit = data.lines?.filter(l => l.direction === 'Debit')
            .reduce((sum, l) => sum + (l.amount || 0), 0) || 0;
        const totalCredit = data.lines?.filter(l => l.direction === 'Credit')
            .reduce((sum, l) => sum + (l.amount || 0), 0) || 0;

        // ✅ Use small tolerance for floating point
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            errors.push(`Debits (${totalDebit.toFixed(2)}) must equal Credits (${totalCredit.toFixed(2)})`);
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    canEdit(entry: JournalEntry, periods: any[]): { canEdit: boolean; reason?: string } {
        if (entry.isPosted) {
            return { canEdit: false, reason: 'Cannot edit a posted journal entry' };
        }

        const period = periods.find(p => p.id === entry.periodId);
        if (period?.isClosed) {
            return { canEdit: false, reason: 'Cannot edit entry in a closed period' };
        }

        return { canEdit: true };
    },

    canDelete(entry: JournalEntry): { canDelete: boolean; reason?: string } {
        if (entry.isPosted) {
            return { canDelete: false, reason: 'Cannot delete a posted journal entry' };
        }
        if (entry.isReversed) {
            return { canDelete: false, reason: 'Cannot delete a reversed journal entry' };
        }
        return { canDelete: true };
    },
};