// src/components/finance/accountsPayable/AddPaymentModal/components/PaymentDetailsTab.tsx

import React from 'react';
import { ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../ui/select';
import type { PaymentMethod, VendorWithInvoices } from '../types';
import { BankAccountSelect } from './BankAccountSelect';
import { formatCurrency } from '../utils/paymentHelpers';

// ✅ Helper to determine if period is currently active based on dates
const isPeriodCurrentlyActive = (period: any) => {
    if (period.isActive) return true;
    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        return now >= start && now <= end;
    }
    return false;
};

// ✅ Helper to get period status
const getPeriodStatus = (period: any) => {
    if (!period) return { status: 'unknown', label: 'Unknown', icon: '❓', color: 'text-gray-500' };

    if (period.isClosed) {
        return { status: 'closed', label: 'Closed', icon: '🔒', color: 'text-red-500' };
    }

    if (period.isActive || isPeriodCurrentlyActive(period)) {
        return { status: 'active', label: 'Active', icon: '✅', color: 'text-green-500' };
    }

    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);

        if (now < start) {
            return { status: 'future', label: 'Future', icon: '📅', color: 'text-amber-500' };
        }
        if (now > end) {
            return { status: 'expired', label: 'Expired', icon: '⏰', color: 'text-orange-500' };
        }
    }

    return { status: 'inactive', label: 'Inactive', icon: '⏳', color: 'text-gray-500' };
};

interface PaymentDetailsTabProps {
    periods: any[];
    selectedPeriodId: string;
    onPeriodChange: (value: string) => void;
    loadingPeriods: boolean;
    vendorsWithInvoices: VendorWithInvoices[];
    selectedVendor: string;
    onVendorChange: (value: string) => void;
    loadingVendors: boolean;
    paymentDate: string;
    onPaymentDateChange: (value: string) => void;
    externalBankRef: string;
    onExternalBankRefChange: (value: string) => void;
    paymentMethod: PaymentMethod;
    onPaymentMethodChange: (value: PaymentMethod) => void;
    selectedBankAccount: string;
    onBankAccountChange: (value: string) => void;
    bankAccounts: any[];
    loadingBankAccounts: boolean;
    description: string;
    onDescriptionChange: (value: string) => void;
    onNext: () => void;
    isNextDisabled: boolean;
    selectedPeriod?: any;
    periodStatus?: { status: string; label: string; icon: string; color: string } | null;
}

export const PaymentDetailsTab: React.FC<PaymentDetailsTabProps> = ({
                                                                        periods,
                                                                        selectedPeriodId,
                                                                        onPeriodChange,
                                                                        loadingPeriods,
                                                                        vendorsWithInvoices,
                                                                        selectedVendor,
                                                                        onVendorChange,
                                                                        loadingVendors,
                                                                        paymentDate,
                                                                        onPaymentDateChange,
                                                                        externalBankRef,
                                                                        onExternalBankRefChange,
                                                                        paymentMethod,
                                                                        onPaymentMethodChange,
                                                                        selectedBankAccount,
                                                                        onBankAccountChange,
                                                                        bankAccounts,
                                                                        loadingBankAccounts,
                                                                        description,
                                                                        onDescriptionChange,
                                                                        onNext,
                                                                        isNextDisabled,
                                                                        selectedPeriod,
                                                                        periodStatus,
                                                                    }) => {
    const isCashPayment = paymentMethod === 'Cash';
    const isPeriodClosed = selectedPeriod?.isClosed || false;

    return (
        <div className="space-y-4">
            {/* Row 1: Period + Vendor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                        Financial Period <span className="text-red-500">*</span>
                    </Label>
                    {loadingPeriods ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading periods...
                        </div>
                    ) : periods.length === 0 ? (
                        <div className="flex items-center gap-2 p-2 border rounded-lg border-amber-200 bg-amber-50">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-amber-600">No periods available</span>
                        </div>
                    ) : (
                        <Select
                            value={selectedPeriodId}
                            onValueChange={onPeriodChange}
                            disabled={isPeriodClosed}
                        >
                            <SelectTrigger className={`h-10 bg-white w-full ${periodStatus?.color || ''}`}>
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                {periods.map((period) => {
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
                                    ⚠️ This period is closed. Cannot create payments.
                                </p>
                            )}
                            {!selectedPeriod.isClosed && periodStatus.status === 'inactive' && (
                                <p className="text-xs text-amber-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    ⚠️ This period is not active. Please select an active period.
                                </p>
                            )}
                            {periodStatus.status === 'future' && (
                                <p className="text-xs text-amber-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    ⚠️ This period starts in the future. Payments can only be made in active periods.
                                </p>
                            )}
                            {periodStatus.status === 'expired' && (
                                <p className="text-xs text-orange-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    ⚠️ This period has expired. Please select a current period.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                        Vendor <span className="text-red-500">*</span>
                    </Label>
                    {loadingVendors ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading vendors...
                        </div>
                    ) : (
                        <Select value={selectedVendor} onValueChange={onVendorChange}>
                            <SelectTrigger className="h-10 bg-white w-full">
                                <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendorsWithInvoices.length === 0 ? (
                                    <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                        No vendors with pending invoices found
                                    </div>
                                ) : (
                                    vendorsWithInvoices.map(vendor => (
                                        <SelectItem key={vendor.id} value={vendor.id}>
                                            <div className="flex items-center justify-between w-full gap-3">
                                                <span className="font-medium">{vendor.name}</span>
                                                <span className="text-xs text-gray-400">
                                                    {vendor.invoiceCount} invoice(s) • {formatCurrency(vendor.totalRemaining)} remaining
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Row 2: Payment Date + Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                        Payment Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => onPaymentDateChange(e.target.value)}
                        className="h-10 bg-white w-full"
                        required
                        disabled={isPeriodClosed}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                        Reference Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={externalBankRef}
                        onChange={(e) => onExternalBankRefChange(e.target.value)}
                        placeholder="Enter reference number"
                        className="h-10 bg-white w-full"
                        required
                        disabled={isPeriodClosed}
                    />
                </div>
            </div>

            {/* Row 3: Payment Method + Bank Account */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                        Payment Method <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={paymentMethod}
                        onValueChange={(value: any) => onPaymentMethodChange(value)}
                        disabled={isPeriodClosed}
                    >
                        <SelectTrigger className="h-10 bg-white w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Bank_Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Check">Check</SelectItem>
                            <SelectItem value="Telebirr">Telebirr</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <BankAccountSelect
                    isCashPayment={isCashPayment}
                    bankAccounts={bankAccounts}
                    selectedBankAccount={selectedBankAccount}
                    onBankAccountChange={onBankAccountChange}
                    loadingBankAccounts={loadingBankAccounts}
                    disabled={isPeriodClosed}
                />
            </div>

            {/* Row 4: Description */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Input
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Payment description (optional)"
                    className="h-10 bg-white w-full"
                    disabled={isPeriodClosed}
                />
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    onClick={onNext}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isNextDisabled || isPeriodClosed}
                >
                    Next: Select Invoices
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};