// components/finance/journal-entries/JournalEntryForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Save, Loader2, Calendar, AlertCircle, Building, Users, CheckCircle, Hash, FileText, Type } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { journalEntryHelpers } from '@/modules/finance/utils/journalEntryHelpers';
import { ENTRY_TYPES } from '@/modules/finance/constants/journalEntryConstants';
import type { JournalEntryFormData, JournalLine } from '@/modules/finance/types/journalEntry.types';
import { getAllFinancialPeriods } from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

interface Props {
    formData: JournalEntryFormData;
    onFormChange: <K extends keyof JournalEntryFormData>(
        field: K,
        value: JournalEntryFormData[K]
    ) => void;
    onAddLine: () => void;
    onRemoveLine: (index: number) => void;
    onUpdateLine: (index: number, field: keyof JournalLine, value: any) => void;
    accounts: any[];
    costCenters: any[];
    branches?: any[];
    employees?: any[];
    financialPeriods?: any[];
    isSubmitting: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    mode: 'add' | 'edit';
    isAutoFill?: boolean;
}

const isPeriodCurrentlyActive = (period: any) => {
    if (!period) return false;
    if (period.isActive) return true;
    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        return now >= start && now <= end;
    }
    return false;
};

const getPeriodStatus = (period: any) => {
    if (!period) return { status: 'unknown', label: 'Unknown', icon: '❓', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (period.isClosed) {
        return { status: 'closed', label: 'Closed', icon: '🔒', color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (period.isActive || isPeriodCurrentlyActive(period)) {
        return { status: 'active', label: 'Active', icon: '✅', color: 'text-green-600', bg: 'bg-green-50' };
    }
    if (period.startDate && period.endDate) {
        const now = new Date();
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        if (now < start) {
            return { status: 'future', label: 'Future', icon: '📅', color: 'text-amber-600', bg: 'bg-amber-50' };
        }
        if (now > end) {
            return { status: 'expired', label: 'Expired', icon: '⏰', color: 'text-orange-600', bg: 'bg-orange-50' };
        }
    }
    return { status: 'inactive', label: 'Inactive', icon: '⏳', color: 'text-gray-500', bg: 'bg-gray-100' };
};

const validateForm = (formData: JournalEntryFormData): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (!formData.reference?.trim()) errors.reference = 'Reference is required';
    if (!formData.entryDate) errors.entryDate = 'Entry date is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.periodId) errors.periodId = 'Financial period is required';
    if (!formData.entryType) errors.entryType = 'Entry type is required';
    if (formData.lines.length === 0) errors.lines = 'At least one journal line is required';

    formData.lines.forEach((line, index) => {
        if (!line.accountId) errors[`line_${index}_account`] = `Line ${index + 1}: Account is required`;
        if (!line.direction) errors[`line_${index}_direction`] = `Line ${index + 1}: Direction is required`;
        if (!line.amount || line.amount <= 0) errors[`line_${index}_amount`] = `Line ${index + 1}: Amount must be greater than 0`;
    });

    const totals = journalEntryHelpers.calculateTotals(formData.lines);
    if (!totals.isBalanced) errors.balance = 'Total debits must equal total credits';

    return { isValid: Object.keys(errors).length === 0, errors };
};

export const JournalEntryForm: React.FC<Props> = ({
                                                      formData,
                                                      onFormChange,
                                                      onAddLine,
                                                      onRemoveLine,
                                                      onUpdateLine,
                                                      accounts,
                                                      costCenters,
                                                      branches = [],
                                                      employees = [],
                                                      financialPeriods: propFinancialPeriods,
                                                      isSubmitting,
                                                      onSubmit,
                                                      onCancel,
                                                      mode,
                                                      isAutoFill = true,
                                                  }) => {
    const [periods, setPeriods] = useState<any[]>(propFinancialPeriods || []);
    const [loadingPeriods, setLoadingPeriods] = useState(!propFinancialPeriods);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        const fetchPeriods = async () => {
            if (propFinancialPeriods && propFinancialPeriods.length > 0) {
                setPeriods(propFinancialPeriods);
                setLoadingPeriods(false);
                return;
            }
            try {
                setLoadingPeriods(true);
                const response = await getAllFinancialPeriods({ isClosed: false });
                const data = response?.data?.data || response?.data || [];
                setPeriods(data);
                if (!formData.periodId) {
                    const active = data.find((p: any) => p.isActive || isPeriodCurrentlyActive(p));
                    if (active) onFormChange('periodId', active.id);
                }
            } catch (error) {
                console.error('Error fetching financial periods:', error);
                showToast.error('Failed to load financial periods');
            } finally {
                setLoadingPeriods(false);
            }
        };
        fetchPeriods();
    }, [propFinancialPeriods]);

    const totals = journalEntryHelpers.calculateTotals(formData.lines);
    const isBalanced = totals.isBalanced;
    const selectedPeriod = periods.find(p => p.id === formData.periodId);
    const isPeriodClosed = selectedPeriod?.isClosed || false;
    const periodStatus = selectedPeriod ? getPeriodStatus(selectedPeriod) : null;

    const selectedBranch = branches.find(b => b.id === formData.branchId);
    const selectedEmployee = employees.find(e => e.id === formData.employeeId);
    const selectedDepartment = costCenters.find(c => c.id === formData.departmentId);

    const handleSubmit = () => {
        const { isValid, errors } = validateForm(formData);
        setValidationErrors(errors);
        setShowErrors(true);
        if (isValid) {
            onSubmit();
        } else {
            const firstError = Object.values(errors)[0];
            if (firstError) showToast.error(firstError);
        }
    };

    useEffect(() => {
        if (showErrors) {
            const { isValid } = validateForm(formData);
            if (isValid) {
                setShowErrors(false);
                setValidationErrors({});
            }
        }
    }, [formData, showErrors]);

    const hasError = (field: string) => showErrors && validationErrors[field];
    const getError = (field: string) => validationErrors[field] || '';

    const hasAutoFilledValues = formData.branchId || formData.departmentId || formData.employeeId;

    return (
        <div className="space-y-6 py-2">
            {/* ========================================================== */}
            {/* HEADER - Mode and Auto-fill Status */}
            {/* ========================================================== */}

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {mode === 'add' ? 'Create Journal Entry' : 'Edit Journal Entry'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {mode === 'add' ? 'Record a new journal entry with balanced debits and credits' : 'Update the journal entry details'}
                    </p>
                </div>
                {isAutoFill && hasAutoFilledValues && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3" />
                        Auto-filled
                    </Badge>
                )}
            </div>

            <Separator />

            {/* ========================================================== */}
            {/* BASIC INFORMATION */}
            {/* ========================================================== */}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                        Reference <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={formData.reference || ''}
                        onChange={(e) => onFormChange('reference', e.target.value)}
                        placeholder="e.g., JE-001"
                        disabled={isSubmitting}
                        className={`h-10 ${hasError('reference') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {hasError('reference') && (
                        <p className="text-xs text-red-500">{getError('reference')}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="date"
                        value={formData.entryDate || ''}
                        onChange={(e) => onFormChange('entryDate', e.target.value)}
                        disabled={isSubmitting}
                        className={`h-10 ${hasError('entryDate') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {hasError('entryDate') && (
                        <p className="text-xs text-red-500">{getError('entryDate')}</p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    Description <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={formData.description || ''}
                    onChange={(e) => onFormChange('description', e.target.value)}
                    placeholder="Enter journal entry description..."
                    disabled={isSubmitting}
                    className={`h-10 ${hasError('description') ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {hasError('description') && (
                    <p className="text-xs text-red-500">{getError('description')}</p>
                )}
            </div>

            {/* ========================================================== */}
            {/* CLASSIFICATION */}
            {/* ========================================================== */}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Type className="h-3.5 w-3.5 text-gray-400" />
                        Entry Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.entryType || ''}
                        onValueChange={(value) => onFormChange('entryType', value)}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className={`h-10 ${hasError('entryType') ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select entry type" />
                        </SelectTrigger>
                        <SelectContent>
                            {ENTRY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {hasError('entryType') && (
                        <p className="text-xs text-red-500">{getError('entryType')}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        Financial Period <span className="text-red-500">*</span>
                    </Label>
                    {loadingPeriods ? (
                        <div className="flex items-center gap-2 h-10 px-3 border rounded-lg bg-gray-50">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            <span className="text-sm text-gray-500">Loading periods...</span>
                        </div>
                    ) : periods.length === 0 ? (
                        <div className="flex items-center gap-2 h-10 px-3 border rounded-lg border-amber-200 bg-amber-50">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-amber-600">No periods available</span>
                        </div>
                    ) : (
                        <Select
                            value={formData.periodId || ''}
                            onValueChange={(value) => onFormChange('periodId', value)}
                            disabled={isSubmitting || isPeriodClosed}
                        >
                            <SelectTrigger className={`h-10 ${hasError('periodId') ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                {periods.map((period) => {
                                    const status = getPeriodStatus(period);
                                    return (
                                        <SelectItem key={period.id} value={period.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{period.name}</span>
                                                {period.startDate && period.endDate && (
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                <Badge className={`text-[10px] ${status.bg} ${status.color}`}>
                                                    {status.icon} {status.label}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    )}
                    {hasError('periodId') && (
                        <p className="text-xs text-red-500">{getError('periodId')}</p>
                    )}
                    {selectedPeriod && periodStatus && (
                        <div className="flex items-center gap-2 mt-1.5">
                            <Badge className={`${periodStatus.bg} ${periodStatus.color} text-xs`}>
                                {periodStatus.icon} {periodStatus.label}
                            </Badge>
                            {selectedPeriod.startDate && selectedPeriod.endDate && (
                                <span className="text-xs text-gray-400">
                                    📅 {new Date(selectedPeriod.startDate).toLocaleDateString()} - {new Date(selectedPeriod.endDate).toLocaleDateString()}
                                </span>
                            )}
                            {selectedPeriod.isClosed && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Period closed
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================== */}
            {/* AUTO-FILLED ORGANIZATION INFO */}
            {/* ========================================================== */}

            {isAutoFill && hasAutoFilledValues && (
                <Card className="bg-green-50/50 border-green-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Auto-filled from your profile</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {formData.branchId && selectedBranch && (
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Branch</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedBranch.name}</p>
                                    </div>
                                </div>
                            )}
                            {formData.departmentId && selectedDepartment && (
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Department</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedDepartment.name}</p>
                                    </div>
                                </div>
                            )}
                            {formData.employeeId && selectedEmployee && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Employee</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEmployee.firstName} {selectedEmployee.lastName}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ========================================================== */}
            {/* ORGANIZATION FIELDS (Hidden when auto-filled) */}
            {/* ========================================================== */}

            {!isAutoFill && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-gray-400" />
                            Department
                        </Label>
                        <Select
                            value={formData.departmentId || 'none'}
                            onValueChange={(value) => onFormChange('departmentId', value === 'none' ? '' : value)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {costCenters.map((cc) => (
                                    <SelectItem key={cc.id} value={cc.id}>
                                        {cc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-gray-400" />
                            Branch
                        </Label>
                        <Select
                            value={formData.branchId || 'none'}
                            onValueChange={(value) => onFormChange('branchId', value === 'none' ? '' : value)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            Employee
                        </Label>
                        <Select
                            value={formData.employeeId || 'none'}
                            onValueChange={(value) => onFormChange('employeeId', value === 'none' ? '' : value)}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                        {employee.firstName} {employee.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <Separator />

            {/* ========================================================== */}
            {/* JOURNAL LINES */}
            {/* ========================================================== */}

            <div>
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        Journal Lines <span className="text-red-500">*</span>
                        <Badge variant="outline" className="text-xs font-normal">
                            {formData.lines.length} line{formData.lines.length !== 1 ? 's' : ''}
                        </Badge>
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddLine}
                        disabled={isSubmitting || isPeriodClosed}
                        className="h-8"
                    >
                        <Plus size={14} className="mr-1" /> Add Line
                    </Button>
                </div>

                {hasError('lines') && (
                    <p className="text-xs text-red-500 mb-2">{getError('lines')}</p>
                )}

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {formData.lines.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg border-gray-200 text-gray-400">
                            <p className="text-sm">No journal lines added</p>
                            <p className="text-xs mt-1">Click "Add Line" to start building your journal entry</p>
                        </div>
                    ) : (
                        formData.lines.map((line, index) => {
                            const hasAccountError = hasError(`line_${index}_account`);
                            const hasDirectionError = hasError(`line_${index}_direction`);
                            const hasAmountError = hasError(`line_${index}_amount`);

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                                        hasAccountError || hasDirectionError || hasAmountError
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 hover:border-indigo-300 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex-[2] min-w-0">
                                        <Select
                                            value={line.accountId || ''}
                                            onValueChange={(value) => onUpdateLine(index, 'accountId', value)}
                                            disabled={isSubmitting || isPeriodClosed}
                                        >
                                            <SelectTrigger className={`h-9 ${hasAccountError ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((acc) => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        <span className="font-mono text-xs text-gray-500">{acc.code}</span>
                                                        <span className="ml-2">{acc.name}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {hasAccountError && (
                                            <p className="text-xs text-red-500 mt-0.5">{getError(`line_${index}_account`)}</p>
                                        )}
                                    </div>

                                    <div className="w-24">
                                        <Select
                                            value={line.direction || ''}
                                            onValueChange={(value) => onUpdateLine(index, 'direction', value)}
                                            disabled={isSubmitting || isPeriodClosed}
                                        >
                                            <SelectTrigger className={`h-9 ${hasDirectionError ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder="Dir" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Debit" className="text-emerald-600 font-medium">Debit</SelectItem>
                                                <SelectItem value="Credit" className="text-rose-600 font-medium">Credit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {hasDirectionError && (
                                            <p className="text-xs text-red-500 mt-0.5">{getError(`line_${index}_direction`)}</p>
                                        )}
                                    </div>

                                    <div className="w-32">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={line.amount || ''}
                                            onChange={(e) => onUpdateLine(index, 'amount', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className={`h-9 text-right font-mono ${hasAmountError ? 'border-red-500' : ''}`}
                                            disabled={isSubmitting || isPeriodClosed}
                                        />
                                        {hasAmountError && (
                                            <p className="text-xs text-red-500 mt-0.5">{getError(`line_${index}_amount`)}</p>
                                        )}
                                    </div>

                                    <div className="flex-[2] min-w-0">
                                        <Input
                                            value={line.description || ''}
                                            onChange={(e) => onUpdateLine(index, 'description', e.target.value)}
                                            placeholder="Line description"
                                            className="h-9"
                                            disabled={isSubmitting || isPeriodClosed}
                                        />
                                    </div>

                                    {formData.lines.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveLine(index)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                                            disabled={isSubmitting || isPeriodClosed}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Totals */}
                <div className={`mt-4 p-3 rounded-lg flex items-center justify-between border ${
                    isBalanced ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                }`}>
                    <span className="text-sm font-medium text-gray-700">Totals</span>
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium">
                            Debit: <span className="text-emerald-600 font-mono">
                                {journalEntryHelpers.formatCurrency(totals.totalDebit)}
                            </span>
                        </span>
                        <span className="text-sm font-medium">
                            Credit: <span className="text-rose-600 font-mono">
                                {journalEntryHelpers.formatCurrency(totals.totalCredit)}
                            </span>
                        </span>
                        <Badge className={isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {isBalanced ? '✓ Balanced' : '✗ Unbalanced'}
                        </Badge>
                    </div>
                </div>
                {hasError('balance') && (
                    <p className="text-xs text-red-500 mt-1">{getError('balance')}</p>
                )}
            </div>

            {/* ========================================================== */}
            {/* ACTIONS */}
            {/* ========================================================== */}

            <DialogFooter className="pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                >
                    Cancel
                </Button>
                <Button
                    className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleSubmit}
                    disabled={isSubmitting || isPeriodClosed || formData.lines.length === 0}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {mode === 'add' ? 'Creating...' : 'Updating...'}
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {mode === 'add' ? 'Create Entry' : 'Update Entry'}
                        </>
                    )}
                </Button>
            </DialogFooter>
        </div>
    );
};

export default JournalEntryForm;