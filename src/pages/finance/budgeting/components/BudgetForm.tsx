// src/pages/finance/budget/components/BudgetForm.tsx

import React from 'react';
import { Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../components/ui/select';
import type { BudgetLine, BudgetFormData } from '../types';

interface BudgetFormProps {
    formData: BudgetFormData;
    onFormChange: (field: keyof BudgetFormData, value: any) => void;
    onLineAdd: () => void;
    onLineRemove: (index: number) => void;
    onLineUpdate: (index: number, field: keyof BudgetLine, value: any) => void;
    accounts: any[];
    branches: any[];
    departments: any[];
    periods: any[];
    budgetCodes: any[];
    loadingPeriods?: boolean;
    loadingCodes?: boolean;
    isSubmitting: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    mode: 'add' | 'edit';
    title: string;
    description: string;
}

// ✅ Helper to get period status
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

export const BudgetForm: React.FC<BudgetFormProps> = ({
                                                          formData,
                                                          onFormChange,
                                                          onLineAdd,
                                                          onLineRemove,
                                                          onLineUpdate,
                                                          accounts,
                                                          branches,
                                                          departments,
                                                          periods,
                                                          budgetCodes = [],
                                                          loadingPeriods = false,
                                                          loadingCodes = false,
                                                          isSubmitting,
                                                          onSubmit,
                                                          onCancel,
                                                          mode,
                                                          title,
                                                          description,
                                                      }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const selectedPeriod = periods?.find(p => p.id === formData.periodId);
    const isPeriodClosed = selectedPeriod?.isClosed || false;
    const periodStatus = selectedPeriod ? getPeriodStatus(selectedPeriod) : null;
    const totalAmount = formData.lines.reduce((sum, l) => sum + l.allocatedAmount, 0);

    const hasPeriods = periods && periods.length > 0;
    const hasBudgetCodes = budgetCodes && budgetCodes.length > 0;

    return (
        <div className="space-y-4 py-4">
            {/* Name and Budget Code */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Name *</Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => onFormChange('name', e.target.value)}
                        placeholder="Budget name"
                        disabled={isSubmitting || isPeriodClosed}
                    />
                </div>
                <div>
                    <Label>Budget Code *</Label>
                    {loadingCodes ? (
                        <div className="flex items-center gap-2 p-2 border rounded-lg mt-1">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            <span className="text-sm text-gray-500">Loading codes...</span>
                        </div>
                    ) : !hasBudgetCodes ? (
                        <div className="flex items-center gap-2 p-2 border rounded-lg border-amber-200 bg-amber-50 mt-1">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-amber-600">No budget codes available. Please create a budget code first.</span>
                        </div>
                    ) : (
                        <Select
                            value={formData.budgetCodeId || ''}
                            onValueChange={(value) => onFormChange('budgetCodeId', value)}
                            disabled={isSubmitting || isPeriodClosed}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select budget code" />
                            </SelectTrigger>
                            <SelectContent>
                                {budgetCodes && budgetCodes.length > 0 ? (
                                    budgetCodes.map((code) => (
                                        <SelectItem key={code.id} value={code.id}>
                                        <span className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-medium">
                                                {code.code?.trim() || code.code}
                                            </span>
                                            <span className="text-sm text-gray-600">- {code.name}</span>
                                        </span>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-2 p-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                        <span className="text-sm text-gray-500">Loading budget codes...</span>
                                    </div>
                                )}

                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Status */}
            <div>
                <Label>Status</Label>
                <Select
                    value={formData.status}
                    onValueChange={(value) => onFormChange('status', value)}
                    disabled={isSubmitting || isPeriodClosed}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Financial Period */}
            <div>
                <Label className="text-sm font-medium">
                    Financial Period <span className="text-red-500">*</span>
                </Label>
                {loadingPeriods ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg mt-1">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                        <span className="text-sm text-gray-500">Loading periods...</span>
                    </div>
                ) : !hasPeriods ? (
                    <div className="flex items-center gap-2 p-2 border rounded-lg border-amber-200 bg-amber-50 mt-1">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-amber-600">No periods available. Please create a financial period first.</span>
                    </div>
                ) : (
                    <Select
                        value={formData.periodId || ''}
                        onValueChange={(value) => onFormChange('periodId', value)}
                        disabled={isSubmitting || isPeriodClosed}
                    >
                        <SelectTrigger className={`mt-1 ${periodStatus?.color || ''}`}>
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
                                ⚠️ This period is closed. Cannot {mode === 'add' ? 'create' : 'update'} budget.
                            </p>
                        )}
                        {!selectedPeriod.isClosed && periodStatus.status === 'inactive' && (
                            <p className="text-xs text-amber-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                ⚠️ This period is not active. Please select an active period.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <Label>Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => onFormChange('description', e.target.value)}
                    placeholder="Budget description"
                    rows={2}
                    disabled={isSubmitting || isPeriodClosed}
                />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Start Date *</Label>
                    <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => onFormChange('startDate', e.target.value)}
                        disabled={isSubmitting || isPeriodClosed}
                    />
                </div>
                <div>
                    <Label>End Date *</Label>
                    <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => onFormChange('endDate', e.target.value)}
                        disabled={isSubmitting || isPeriodClosed}
                    />
                </div>
            </div>

            {/* Branch and Department */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Branch</Label>
                    <Select
                        value={formData.branchId}
                        onValueChange={(value) => onFormChange('branchId', value)}
                        disabled={isSubmitting || isPeriodClosed}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reset">None</SelectItem>
                            {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Department</Label>
                    <Select
                        value={formData.departmentId}
                        onValueChange={(value) => onFormChange('departmentId', value)}
                        disabled={isSubmitting || isPeriodClosed}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reset">None</SelectItem>
                            {departments.map((d) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Budget Lines */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-semibold">Budget Lines</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onLineAdd}
                        disabled={isSubmitting || isPeriodClosed}
                    >
                        <Plus size={14} className="mr-1" /> Add Line
                    </Button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 border rounded-lg p-3 bg-gray-50">
                    {formData.lines.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">
                            No budget lines added. Click "Add Line" to start.
                        </div>
                    ) : (
                        formData.lines.map((line, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                                <div className="flex-1 min-w-[150px]">
                                    <Select
                                        value={line.accountId}
                                        onValueChange={(value) => onLineUpdate(index, 'accountId', value)}
                                        disabled={isSubmitting || isPeriodClosed}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.code} - {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-32">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={line.allocatedAmount || ''}
                                        onChange={(e) => onLineUpdate(index, 'allocatedAmount', parseFloat(e.target.value) || 0)}
                                        placeholder="Amount"
                                        disabled={isSubmitting || isPeriodClosed}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Input
                                        value={line.description || ''}
                                        onChange={(e) => onLineUpdate(index, 'description', e.target.value)}
                                        placeholder="Description"
                                        disabled={isSubmitting || isPeriodClosed}
                                    />
                                </div>
                                {formData.lines.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => onLineRemove(index)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        disabled={isSubmitting || isPeriodClosed}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-2 p-2 bg-gray-100 rounded-lg flex justify-between">
                    <span className="font-medium">Total Budget:</span>
                    <span className="font-bold text-indigo-600">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={onSubmit}
                    disabled={
                        isSubmitting ||
                        isPeriodClosed ||
                        !formData.name ||
                        !formData.budgetCodeId ||
                        !formData.periodId ||
                        formData.lines.length === 0 ||
                        loadingPeriods ||
                        !hasPeriods ||
                        loadingCodes ||
                        !hasBudgetCodes
                    }
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {mode === 'add' ? 'Creating...' : 'Updating...'}
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {mode === 'add' ? 'Create Budget' : 'Update Budget'}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default BudgetForm;