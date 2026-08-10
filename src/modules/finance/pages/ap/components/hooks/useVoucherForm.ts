// hooks/useVoucherForm.ts
import { useState } from 'react';
import { showToast } from '@/shared/layout/layout';
import type { Voucher, VoucherFormData, VoucherLine } from '@/modules/finance/pages/ap/components/types/voucher.types';
import { createVoucher, updateVoucher } from '@/modules/finance/services/finance.api';
import { isVoucherBalanced, calculateTotals } from '@/modules/finance/pages/ap/components/utils/voucher.utils';

export const useVoucherForm = (
    initialData?: VoucherFormData,
    onSuccess?: () => void,
    periods: any[] = []
) => {
    const [formData, setFormData] = useState<VoucherFormData>(initialData || {
        voucherType: 'Journal',
        vendorId: '',
        voucherDate: new Date().toISOString().split('T')[0],
        description: '',
        periodId: '',
        lines: [{ accountId: '', description: '', debitAmount: 0, creditAmount: 0, periodId: '' }],
    });
    const [submitting, setSubmitting] = useState(false);

    const updateField = <K extends keyof VoucherFormData>(
        field: K,
        value: VoucherFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, { accountId: '', description: '', debitAmount: 0, creditAmount: 0, periodId: prev.periodId }],
        }));
    };

    const removeLine = (index: number) => {
        if (formData.lines.length > 1) {
            setFormData(prev => ({
                ...prev,
                lines: prev.lines.filter((_, i) => i !== index),
            }));
        }
    };

    const updateLine = (index: number, field: keyof VoucherLine, value: any) => {
        const newLines = [...formData.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setFormData(prev => ({ ...prev, lines: newLines }));
    };

    const resetForm = (periodId?: string) => {
        setFormData({
            voucherType: 'Journal',
            vendorId: '',
            voucherDate: new Date().toISOString().split('T')[0],
            description: '',
            periodId: periodId || '',
            lines: [{ accountId: '', description: '', debitAmount: 0, creditAmount: 0, periodId: periodId || '' }],
        });
    };

    // src/pages/finance/ap/hooks/useVoucherForm.ts

// Add date range validation in the validateForm function
    const validateForm = (): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];
        const { totalDebit, totalCredit } = calculateTotals(formData.lines);

        if (!formData.periodId) errors.push('Period is required');
        if (!formData.voucherDate) errors.push('Voucher date is required');

        // ✅ Validate date is within period range
        if (formData.voucherDate && formData.periodId) {
            const selectedPeriod = periods.find(p => p.id === formData.periodId);
            if (selectedPeriod) {
                const voucherDate = new Date(formData.voucherDate);
                const startDate = new Date(selectedPeriod.startDate);
                const endDate = new Date(selectedPeriod.endDate);

                voucherDate.setHours(0, 0, 0, 0);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                if (voucherDate < startDate || voucherDate > endDate) {
                    errors.push(`Voucher date must be within period range: ${selectedPeriod.name}`);
                }
            }
        }

        if (totalDebit !== totalCredit) errors.push('Total Debits must equal Total Credits');

        formData.lines.forEach((line, index) => {
            if (!line.accountId) errors.push(`Line ${index + 1}: Account is required`);
            if (!line.debitAmount && !line.creditAmount) errors.push(`Line ${index + 1}: Amount is required`);
        });

        return {
            valid: errors.length === 0,
            errors,
        };
    };

    const submitForm = async () => {
        const { valid, errors } = validateForm();
        if (!valid) {
            showToast.error(errors.join(', '));
            return null;
        }

        setSubmitting(true);
        try {
            const payload = {
                voucherType: formData.voucherType,
                vendorId: formData.vendorId || null,
                voucherDate: new Date(formData.voucherDate).toISOString(),
                description: formData.description || '',
                periodId: formData.periodId,
                status: 'Draft' as const,
                lines: formData.lines.map(line => ({
                    accountId: line.accountId,
                    description: line.description || '',
                    debitAmount: line.debitAmount || 0,
                    creditAmount: line.creditAmount || 0,
                    periodId: formData.periodId,
                })),
            };

            const response = await createVoucher(payload);
            const newVoucherId = response.data?.id || response.id;

            showToast.success(`Voucher ${newVoucherId} created successfully`);
            onSuccess?.();
            return response;
        } catch (error: any) {
            console.error('Error creating voucher:', error);
            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                showToast.error(errors.join(', '));
            } else if (error.response?.data?.message) {
                showToast.error(error.response.data.message);
            } else {
                showToast.error('Failed to create voucher');
            }
            return null;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        formData,
        updateField,
        addLine,
        removeLine,
        updateLine,
        resetForm,
        submitForm,
        submitting,
        validateForm,
        totals: calculateTotals(formData.lines),
        isBalanced: isVoucherBalanced(formData.lines),
    };
};