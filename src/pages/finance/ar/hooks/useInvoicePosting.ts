// src/pages/finance/ar/hooks/useInvoicePosting.ts

import { useState } from 'react';
import { showToast } from '../../../../layout/layout';
import { createJournalEntry, updateInvoiceStatus } from '../../../../services/finance/finance.api';
import type{ SalesInvoice, PostingData } from '../types/invoice.types';

export const useInvoicePosting = (
    accounts: any[],
    periods: any[],
    onSuccess?: () => void
) => {
    const [isPosting, setIsPosting] = useState(false);
    const [postingData, setPostingData] = useState<PostingData>({
        revenueAccountId: '',
        receivableAccountId: '',
        taxAccountId: '',
        postingDate: new Date().toISOString().split('T')[0],
        description: '',
        createJournalEntry: true,
        periodId: '',
    });

    // Set default accounts
    const setDefaultAccounts = (accountsData: any[]) => {
        const receivableAccount = accountsData.find((a: any) =>
            a.accountType === 'Asset' && (a.code === '1100' || a.name?.includes('Receivable'))
        );
        const revenueAccount = accountsData.find((a: any) =>
            a.accountType === 'Revenue' || a.code === '4000'
        );
        const taxAccount = accountsData.find((a: any) =>
            a.accountType === 'Liability' && (a.code === '2200' || a.name?.includes('Tax'))
        );

        setPostingData(prev => ({
            ...prev,
            receivableAccountId: receivableAccount?.id || '',
            revenueAccountId: revenueAccount?.id || '',
            taxAccountId: taxAccount?.id || '',
        }));
    };

    const validatePosting = (selectedInvoice: SalesInvoice | null): boolean => {
        if (!selectedInvoice) {
            showToast.error('No invoice selected');
            return false;
        }

        if (!postingData.receivableAccountId) {
            showToast.error('Please select Accounts Receivable account');
            return false;
        }
        if (!postingData.revenueAccountId) {
            showToast.error('Please select Revenue account');
            return false;
        }
        if (!postingData.periodId) {
            showToast.error('Please select a financial period');
            return false;
        }

        const selectedPeriod = periods.find(p => p.id === postingData.periodId);
        if (selectedPeriod?.isClosed) {
            showToast.error('Selected period is closed. Cannot post invoice to a closed period.');
            return false;
        }

        if (selectedPeriod) {
            const postingDate = new Date(postingData.postingDate);
            const startDate = new Date(selectedPeriod.startDate);
            const endDate = new Date(selectedPeriod.endDate);
            postingDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            if (postingDate < startDate || postingDate > endDate) {
                showToast.error(`Posting date must be between ${selectedPeriod.startDate.split('T')[0]} and ${selectedPeriod.endDate.split('T')[0]}`);
                return false;
            }
        }

        return true;
    };

    const confirmPostInvoice = async (selectedInvoice: SalesInvoice | null) => {
        if (!selectedInvoice) return;
        if (!validatePosting(selectedInvoice)) return;

        setIsPosting(true);

        try {
            if (postingData.createJournalEntry) {
                const journalLines = [
                    {
                        accountId: postingData.receivableAccountId,
                        direction: 'Debit',
                        amount: selectedInvoice.totalAmount,
                        description: `AR from ${selectedInvoice.customerName}`,
                        periodId: postingData.periodId,
                    },
                    {
                        accountId: postingData.revenueAccountId,
                        direction: 'Credit',
                        amount: selectedInvoice.subTotal || selectedInvoice.totalAmount,
                        description: `Revenue from ${selectedInvoice.invoiceNumber}`,
                        periodId: postingData.periodId,
                    }
                ];

                if (postingData.taxAccountId && selectedInvoice.taxAmount > 0) {
                    journalLines.push({
                        accountId: postingData.taxAccountId,
                        direction: 'Credit',
                        amount: selectedInvoice.taxAmount,
                        description: `Sales Tax from ${selectedInvoice.invoiceNumber}`,
                        periodId: postingData.periodId,
                    });
                }

                await createJournalEntry({
                    reference: `JE-INV-${selectedInvoice.invoiceNumber}`,
                    entryDate: new Date(postingData.postingDate).toISOString(),
                    description: postingData.description || `Revenue recognition for ${selectedInvoice.invoiceNumber}`,
                    entryType: 'Revenue',
                    isPosted: true,
                    periodId: postingData.periodId,
                    branchId: selectedInvoice.branchId,
                    departmentId: selectedInvoice.departmentId,
                    employeeId: selectedInvoice.employeeId,
                    totalDebit: selectedInvoice.totalAmount,
                    totalCredit: selectedInvoice.totalAmount,
                    lines: journalLines
                });
            }

            await updateInvoiceStatus(selectedInvoice.id, 'Posted');

            showToast.success(`Invoice ${selectedInvoice.invoiceNumber} posted successfully`);
            onSuccess?.();
            return true;

        } catch (error: any) {
            console.error('Error posting invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to post invoice');
            return false;
        } finally {
            setIsPosting(false);
        }
    };

    return {
        postingData,
        setPostingData,
        isPosting,
        setDefaultAccounts,
        confirmPostInvoice,
    };
};