// src/pages/finance/ap/components/VoucherModals/VoucherEditModal.tsx
import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import type { Voucher } from '@/modules/finance/pages/ap/components/types/voucher.types';
import { formatCurrency } from '@/modules/finance/pages/ap/components/utils/voucher.utils';
import { showToast } from '@/shared/layout/layout';

interface VoucherEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    voucher: Voucher | null;
    onSave: (id: string, data: any) => Promise<void>;
    accounts: any[];
    periods: any[];
    vendors: any[];
    isSubmitting?: boolean;
}

// Helper to get period status
const getPeriodStatus = (period: any) => {
    if (!period) return { status: 'unknown', label: 'Unknown', icon: '❓', color: 'text-gray-500' };

    if (period.isClosed) {
        return { status: 'closed', label: 'Closed', icon: '🔒', color: 'text-red-500' };
    }

    if (period.isActive) {
        return { status: 'active', label: 'Active', icon: '✅', color: 'text-green-500' };
    }

    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);

        if (now >= start && now <= end) {
            return { status: 'active', label: 'Active', icon: '✅', color: 'text-green-500' };
        }
        if (now < start) {
            return { status: 'future', label: 'Future', icon: '📅', color: 'text-amber-500' };
        }
        if (now > end) {
            return { status: 'expired', label: 'Expired', icon: '⏰', color: 'text-orange-500' };
        }
    }

    return { status: 'inactive', label: 'Inactive', icon: '⏳', color: 'text-gray-500' };
};

// Helper to check if date is within period range
const isDateInPeriodRange = (date: string, period: any): boolean => {
    if (!date || !period) return false;

    const voucherDate = new Date(date);
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    voucherDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return voucherDate >= startDate && voucherDate <= endDate;
};

// Helper to check if period is active/open
const checkPeriodIsActive = (period: any): boolean => {
    if (!period) return false;
    if (period.isClosed) return false;
    if (period.isActive) return true;

    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        return now >= start && now <= end;
    }

    return false;
};

export const VoucherEditModal: React.FC<VoucherEditModalProps> = ({
                                                                      isOpen,
                                                                      onOpenChange,
                                                                      voucher,
                                                                      onSave,
                                                                      accounts,
                                                                      periods,
                                                                      vendors,
                                                                      isSubmitting = false,
                                                                  }) => {
    const [formData, setFormData] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (voucher && isOpen) {
            console.log('📡 [VoucherEditModal] Editing voucher:', voucher);
            console.log('📡 [VoucherEditModal] RowVersion:', voucher.rowVersion);

            setFormData({
                voucherType: voucher.voucherType,
                vendorId: voucher.vendorId || '',
                voucherDate: voucher.voucherDate.split('T')[0],
                description: voucher.description || '',
                periodId: voucher.periodId || '',
                lines: voucher.lines.map(line => ({
                    id: line.id,
                    accountId: line.accountId,
                    description: line.description || '',
                    debitAmount: line.debitAmount || 0,
                    creditAmount: line.creditAmount || 0,
                    periodId: line.periodId || voucher.periodId || '',
                })),
            });
            setErrors({});
        }
    }, [voucher, isOpen]);

    if (!formData) return null;

    const selectedPeriod = periods?.find(p => p.id === formData.periodId);
    const isPeriodClosed = selectedPeriod?.isClosed || false;
    const isPeriodActive = selectedPeriod ? checkPeriodIsActive(selectedPeriod) : false;
    const periodStatus = selectedPeriod ? getPeriodStatus(selectedPeriod) : null;
    const hasPeriods = periods && periods.length > 0;

    // Check if voucher date is within period range
    const isDateInRange = formData.voucherDate && selectedPeriod
        ? isDateInPeriodRange(formData.voucherDate, selectedPeriod)
        : false;

    // Get the min and max dates for the input
    const minDate = selectedPeriod?.startDate?.split('T')[0] || '';
    const maxDate = selectedPeriod?.endDate?.split('T')[0] || '';

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const addLine = () => {
        setFormData((prev: any) => ({
            ...prev,
            lines: [
                ...prev.lines,
                {
                    accountId: '',
                    description: '',
                    debitAmount: 0,
                    creditAmount: 0,
                    periodId: formData.periodId,
                },
            ],
        }));
    };

    const removeLine = (index: number) => {
        if (formData.lines.length > 1) {
            setFormData((prev: any) => ({
                ...prev,
                lines: prev.lines.filter((_: any, i: number) => i !== index),
            }));
        }
    };

    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...formData.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, lines: newLines }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const totalDebit = formData.lines.reduce((sum: number, l: any) => sum + (l.debitAmount || 0), 0);
        const totalCredit = formData.lines.reduce((sum: number, l: any) => sum + (l.creditAmount || 0), 0);

        if (!formData.periodId) newErrors.periodId = 'Period is required';
        if (!formData.voucherDate) newErrors.voucherDate = 'Date is required';

        // ✅ Validate date is within period range
        if (formData.voucherDate && formData.periodId && selectedPeriod) {
            if (!isDateInPeriodRange(formData.voucherDate, selectedPeriod)) {
                newErrors.dateRange = `Date must be within period range: ${new Date(selectedPeriod.startDate).toLocaleDateString()} - ${new Date(selectedPeriod.endDate).toLocaleDateString()}`;
            }
        }

        // ✅ Validate period is active
        if (formData.periodId && selectedPeriod && !checkPeriodIsActive(selectedPeriod)) {
            newErrors.periodActive = 'Selected period is not active. Please select an active period.';
        }

        if (totalDebit !== totalCredit) {
            newErrors.balance = 'Total Debits must equal Total Credits';
        }
        formData.lines.forEach((line: any, index: number) => {
            if (!line.accountId) {
                newErrors[`line_${index}_account`] = 'Account is required';
            }
            if (!line.debitAmount && !line.creditAmount) {
                newErrors[`line_${index}_amount`] = 'Amount is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm() || !voucher) {
            console.error('❌ [VoucherEditModal] Validation failed or no voucher');
            return;
        }

        if (!voucher.id) {
            console.error('❌ [VoucherEditModal] Voucher ID is missing');
            showToast.error('Voucher ID is missing');
            return;
        }

        console.log('📡 [VoucherEditModal] Submitting update for voucher ID:', voucher.id);
        console.log('📡 [VoucherEditModal] Current RowVersion:', voucher.rowVersion);

        const payload = {
            id: voucher.id,
            voucherType: formData.voucherType,
            vendorId: formData.vendorId || null,
            voucherDate: new Date(formData.voucherDate).toISOString(),
            description: formData.description || '',
            periodId: formData.periodId,
            status: voucher.status,
            lines: formData.lines.map((line: any) => ({
                id: line.id || null,
                accountId: line.accountId,
                description: line.description || '',
                debitAmount: parseFloat(line.debitAmount) || 0,
                creditAmount: parseFloat(line.creditAmount) || 0,
                periodId: line.periodId || formData.periodId,
            })),
            rowVersion: voucher.rowVersion || null,
        };

        console.log('📡 [VoucherEditModal] Sending payload:', JSON.stringify(payload, null, 2));

        try {
            await onSave(voucher.id, payload);
        } catch (error) {
            console.error('❌ [VoucherEditModal] Error in handleSubmit:', error);
            throw error;
        }
    };

    const totals = {
        totalDebit: formData.lines.reduce((sum: number, l: any) => sum + (l.debitAmount || 0), 0),
        totalCredit: formData.lines.reduce((sum: number, l: any) => sum + (l.creditAmount || 0), 0),
    };

    const isBalanced = totals.totalDebit === totals.totalCredit && totals.totalDebit > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Save className="h-5 w-5 text-yellow-600" />
                            <span>Edit Voucher</span>
                        </div>
                        {voucher?.rowVersion && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                Version: {voucher.rowVersion.substring(0, 8)}...
                            </span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Edit voucher details. Only draft and pending vouchers can be modified.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Voucher Number</Label>
                            <Input value={voucher?.voucherNumber || ''} disabled className="bg-gray-50" />
                        </div>
                        <div>
                            <Label>Voucher Type *</Label>
                            <Select
                                value={formData.voucherType}
                                onValueChange={(value) => updateField('voucherType', value)}
                                disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Payment">Payment</SelectItem>
                                    <SelectItem value="Receipt">Receipt</SelectItem>
                                    <SelectItem value="Journal">Journal</SelectItem>
                                    <SelectItem value="Contra">Contra</SelectItem>
                                    <SelectItem value="Transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Financial Period *</Label>
                            <Select
                                value={formData.periodId}
                                onValueChange={(value) => updateField('periodId', value)}
                                disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                            >
                                <SelectTrigger className={periodStatus?.color || ''}>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periods.map((period) => {
                                        const status = getPeriodStatus(period);
                                        const isActive = checkPeriodIsActive(period);
                                        return (
                                            <SelectItem key={period.id} value={period.id}>
                                                <span className="flex items-center gap-2">
                                                    <span>{period.name || period.periodName || 'Period'}</span>
                                                    {period.startDate && period.endDate && (
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs ${status.color}`}>
                                                        {status.icon} {status.label}
                                                    </span>
                                                    {!isActive && period.id === formData.periodId && (
                                                        <span className="text-xs text-red-500">⚠️ Not Active</span>
                                                    )}
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            {errors.periodId && (
                                <p className="text-sm text-red-500 mt-1">{errors.periodId}</p>
                            )}
                            {errors.periodActive && (
                                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.periodActive}
                                </p>
                            )}
                            {selectedPeriod && periodStatus && (
                                <div className="mt-1 space-y-1">
                                    <p className={`text-xs ${periodStatus.color}`}>
                                        Status: {periodStatus.icon} {periodStatus.label}
                                    </p>
                                    {selectedPeriod.startDate && selectedPeriod.endDate && (
                                        <p className="text-xs text-gray-400">
                                            📅 {new Date(selectedPeriod.startDate).toLocaleDateString()} - {new Date(selectedPeriod.endDate).toLocaleDateString()}
                                        </p>
                                    )}
                                    {isPeriodClosed && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            ⚠️ This period is closed. Cannot edit voucher.
                                        </p>
                                    )}
                                    {!isPeriodClosed && !isPeriodActive && (
                                        <p className="text-xs text-amber-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            ⚠️ This period is not active. Please select an active period.
                                        </p>
                                    )}
                                    {isPeriodActive && (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            ✅ Period is active
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>Voucher Date *</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={formData.voucherDate}
                                    onChange={(e) => updateField('voucherDate', e.target.value)}
                                    disabled={isSubmitting || isPeriodClosed || !isPeriodActive || !selectedPeriod}
                                    className={!isDateInRange && formData.voucherDate ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                    min={minDate}
                                    max={maxDate}
                                />
                                {selectedPeriod && (
                                    <span className="text-xs text-gray-400 mt-1 block">
                                        Period range: {new Date(selectedPeriod.startDate).toLocaleDateString()} - {new Date(selectedPeriod.endDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            {errors.voucherDate && (
                                <p className="text-sm text-red-500 mt-1">{errors.voucherDate}</p>
                            )}
                            {errors.dateRange && (
                                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.dateRange}
                                </p>
                            )}
                            {formData.voucherDate && selectedPeriod && isDateInRange && isPeriodActive && (
                                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Date is within period range ✓
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>Vendor</Label>
                        <Select
                            value={formData.vendorId || 'none'}
                            onValueChange={(value) => updateField('vendorId', value === 'none' ? '' : value)}
                            disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {vendors.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.name || v.vendorName || 'Unknown'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Voucher description..."
                            rows={2}
                            disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                        />
                    </div>

                    {/* Voucher Lines */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-base font-semibold">Voucher Lines</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLine}
                                disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                            >
                                <Plus size={14} className="mr-1" /> Add Line
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 border rounded-lg p-3 bg-gray-50">
                            {formData.lines.map((line: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                                    <div className="flex-1 min-w-[120px]">
                                        <Select
                                            value={line.accountId}
                                            onValueChange={(value) => updateLine(index, 'accountId', value)}
                                            disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((acc) => (
                                                    <SelectItem key={acc.id || acc.accountId} value={acc.id || acc.accountId}>
                                                        {acc.code || acc.accountCode} - {acc.name || acc.accountName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors[`line_${index}_account`] && (
                                            <p className="text-xs text-red-500 mt-1">{errors[`line_${index}_account`]}</p>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            value={line.description}
                                            onChange={(e) => updateLine(index, 'description', e.target.value)}
                                            placeholder="Description"
                                            disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={line.debitAmount || ''}
                                            onChange={(e) => updateLine(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                                            placeholder="Debit"
                                            className="text-blue-600"
                                            disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={line.creditAmount || ''}
                                            onChange={(e) => updateLine(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                                            placeholder="Credit"
                                            className="text-orange-600"
                                            disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                                        />
                                    </div>
                                    {formData.lines.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLine(index)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 p-2 bg-gray-100 rounded-lg grid grid-cols-2 gap-4">
                            <div className="flex justify-between">
                                <span className="font-medium">Total Debit:</span>
                                <span className="font-bold text-blue-600">
                                    {formatCurrency(totals.totalDebit)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Total Credit:</span>
                                <span className="font-bold text-orange-600">
                                    {formatCurrency(totals.totalCredit)}
                                </span>
                            </div>
                        </div>
                        {errors.balance && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                ⚠️ {errors.balance}
                            </div>
                        )}
                        {!isBalanced && !errors.balance && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                                ⚠️ Voucher is not balanced. Please adjust entries.
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Info className="h-4 w-4" />
                            <span>Current Status: <strong>{voucher?.status}</strong></span>
                            {isPeriodClosed && (
                                <span className="ml-2 text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Period Closed
                                </span>
                            )}
                            {!isPeriodActive && !isPeriodClosed && (
                                <span className="ml-2 text-amber-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Period Not Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            !isBalanced ||
                            isPeriodClosed ||
                            !isPeriodActive ||
                            !isDateInRange ||
                            !formData.periodId ||
                            !formData.voucherDate
                        }
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};