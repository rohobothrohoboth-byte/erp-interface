// src/pages/finance/ap/components/VoucherModals/VoucherAddModal.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
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
import type { VoucherFormData } from '@/modules/finance/pages/ap/components/types/voucher.types';
import { formatCurrency } from '@/modules/finance/pages/ap/components/utils/voucher.utils';

interface VoucherAddModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: VoucherFormData;
    onUpdateField: (field: keyof VoucherFormData, value: any) => void;
    onAddLine: () => void;
    onRemoveLine: (index: number) => void;
    onUpdateLine: (index: number, field: string, value: any) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    periods: any[];
    vendors: any[];
    accounts: any[];
    totals: { totalDebit: number; totalCredit: number };
    isBalanced: boolean;
    loadingPeriods?: boolean;
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

// ✅ Renamed to checkPeriodIsActive to avoid naming conflict
const checkPeriodIsActive = (period: any): boolean => {
    if (!period) return false;
    if (period.isClosed) return false;
    if (period.isActive) return true;

    // Check if current date is within period range
    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        return now >= start && now <= end;
    }

    return false;
};

export const VoucherAddModal: React.FC<VoucherAddModalProps> = ({
                                                                    isOpen,
                                                                    onOpenChange,
                                                                    formData,
                                                                    onUpdateField,
                                                                    onAddLine,
                                                                    onRemoveLine,
                                                                    onUpdateLine,
                                                                    onSubmit,
                                                                    isSubmitting,
                                                                    periods = [],
                                                                    vendors = [],
                                                                    accounts = [],
                                                                    totals,
                                                                    isBalanced,
                                                                    loadingPeriods = false,
                                                                }) => {
    const selectedPeriod = periods?.find(p => p.id === formData.periodId);
    const isPeriodClosed = selectedPeriod?.isClosed || false;
    // ✅ Use the renamed function
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

    // ✅ Filter only active periods for the dropdown (using checkPeriodIsActive)
    const activePeriods = periods.filter(p => checkPeriodIsActive(p));

    // Auto-set voucher date to period start date when period changes
    useEffect(() => {
        if (selectedPeriod && selectedPeriod.startDate) {
            const startDate = new Date(selectedPeriod.startDate);
            const formattedDate = startDate.toISOString().split('T')[0];

            if (!formData.voucherDate || (selectedPeriod && !isDateInPeriodRange(formData.voucherDate, selectedPeriod))) {
                onUpdateField('voucherDate', formattedDate);
            }
        }
    }, [selectedPeriod?.id]);

    // ✅ Auto-select first active period if none selected
    useEffect(() => {
        if (isOpen && activePeriods.length > 0 && !formData.periodId) {
            const firstActivePeriod = activePeriods[0];
            if (firstActivePeriod) {
                onUpdateField('periodId', firstActivePeriod.id);
                const startDate = new Date(firstActivePeriod.startDate);
                onUpdateField('voucherDate', startDate.toISOString().split('T')[0]);
            }
        }
    }, [isOpen, activePeriods]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-indigo-600" />
                        New Voucher
                    </DialogTitle>
                    <DialogDescription>
                        Create a new financial voucher with balanced entries.
                        {activePeriods.length === 0 && hasPeriods && (
                            <span className="block mt-1 text-amber-600">
                                ⚠️ No active periods available. Please open a period first.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Financial Period */}
                    <div>
                        <Label className="text-sm font-medium">
                            Financial Period <span className="text-red-500">*</span>
                        </Label>
                        {loadingPeriods ? (
                            <div className="flex items-center gap-2 p-2 border rounded-lg mt-1 bg-gray-50">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                <span className="text-sm text-gray-500">Loading periods...</span>
                            </div>
                        ) : !hasPeriods ? (
                            <div className="flex items-center gap-2 p-2 border rounded-lg border-amber-200 bg-amber-50 mt-1">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <span className="text-sm text-amber-600">No periods available. Please create a financial period first.</span>
                            </div>
                        ) : activePeriods.length === 0 ? (
                            <div className="flex items-center gap-2 p-2 border rounded-lg border-red-200 bg-red-50 mt-1">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-600">
                                    No active periods available. Please open a period before creating vouchers.
                                </span>
                            </div>
                        ) : (
                            <Select
                                value={formData.periodId || ''}
                                onValueChange={(value) => onUpdateField('periodId', value)}
                                disabled={isSubmitting || isPeriodClosed}
                            >
                                <SelectTrigger className={`mt-1 ${periodStatus?.color || ''}`}>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activePeriods.map((period) => {
                                        const status = getPeriodStatus(period);
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
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
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
                                {selectedPeriod.isClosed && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        ⚠️ This period is closed. Cannot create voucher.
                                    </p>
                                )}
                                {!selectedPeriod.isClosed && !isPeriodActive && (
                                    <p className="text-xs text-amber-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        ⚠️ This period is not active. Please select an active period.
                                    </p>
                                )}
                                {isPeriodActive && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        ✅ Period is active and accepting entries
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Voucher Type and Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Voucher Type *</Label>
                            <Select
                                value={formData.voucherType}
                                onValueChange={(value: any) => onUpdateField('voucherType', value)}
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
                        <div>
                            <Label>Voucher Date *</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={formData.voucherDate}
                                    onChange={(e) => onUpdateField('voucherDate', e.target.value)}
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
                            {formData.voucherDate && selectedPeriod && !isDateInRange && (
                                <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>
                                        Voucher date must be within the period range:
                                        {new Date(selectedPeriod.startDate).toLocaleDateString()} - {new Date(selectedPeriod.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {formData.voucherDate && selectedPeriod && isDateInRange && isPeriodActive && (
                                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Date is within period range ✓
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vendor */}
                    <div>
                        <Label>Vendor (Optional)</Label>
                        <Select
                            value={formData.vendorId || 'none'}
                            onValueChange={(value) => onUpdateField('vendorId', value === 'none' ? '' : value)}
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

                    {/* Description */}
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => onUpdateField('description', e.target.value)}
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
                                onClick={onAddLine}
                                disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                            >
                                <Plus size={14} className="mr-1" /> Add Line
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 border rounded-lg p-3 bg-gray-50">
                            {formData.lines.length === 0 ? (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                    No voucher lines added. Click "Add Line" to start.
                                </div>
                            ) : (
                                formData.lines.map((line, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                                        <div className="flex-1 min-w-[120px]">
                                            <Select
                                                value={line.accountId}
                                                onValueChange={(value) => onUpdateLine(index, 'accountId', value)}
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
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                value={line.description}
                                                onChange={(e) => onUpdateLine(index, 'description', e.target.value)}
                                                placeholder="Description"
                                                disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                                            />
                                        </div>
                                        <div className="w-28">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={line.debitAmount || ''}
                                                onChange={(e) => onUpdateLine(index, 'debitAmount', parseFloat(e.target.value) || 0)}
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
                                                onChange={(e) => onUpdateLine(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                                                placeholder="Credit"
                                                className="text-orange-600"
                                                disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                                            />
                                        </div>
                                        {formData.lines.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => onRemoveLine(index)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                disabled={isSubmitting || isPeriodClosed || !isPeriodActive}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
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
                        {!isBalanced && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                Total Debits must equal Total Credits for the voucher to be balanced.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={onSubmit}
                        disabled={
                            isSubmitting ||
                            !isBalanced ||
                            isPeriodClosed ||
                            !isPeriodActive || // ✅ Only active periods
                            !formData.periodId ||
                            !formData.voucherDate ||
                            !isDateInRange ||
                            formData.lines.length === 0 ||
                            !hasPeriods ||
                            activePeriods.length === 0
                        }
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Creating...' : 'Create Voucher'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default VoucherAddModal;