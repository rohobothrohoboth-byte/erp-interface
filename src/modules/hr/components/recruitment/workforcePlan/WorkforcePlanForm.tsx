// src/components/hr/recruitment/workforcePlan/WorkforcePlanForm.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, Users, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useDepartments } from '@/modules/core/services/department/dept.queries';
import { useQuery } from '@tanstack/react-query';
import { getBudgets } from '@/modules/finance/services/finance.api';
import { getAllBudgets } from '@/modules/plandev/services/project.api';

import type { WorkforcePlanAddDto, WorkforcePlanModDto } from '@/modules/hr/types/recruit/workforcePlan';

interface WorkforcePlanFormProps {
    initialData?: Partial<WorkforcePlanAddDto | WorkforcePlanModDto>;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    isEdit?: boolean;
}

const WorkforcePlanForm: React.FC<WorkforcePlanFormProps> = ({
                                                                 initialData,
                                                                 onSubmit,
                                                                 onCancel,
                                                                 isSubmitting = false,
                                                                 isEdit = false,
                                                             }) => {
    const { data: departments = [] } = useDepartments();

    // Finance budgets to encumber the plan against (Phase 1 budget control).
    const { data: budgetsRaw } = useQuery({
        queryKey: ['financeBudgets'],
        queryFn: () => getBudgets({ pageSize: 100 }),
        staleTime: 60 * 1000,
    });
    const budgets: any[] = (() => {
        const d: any = (budgetsRaw as any)?.data;
        return d?.data?.items ?? d?.items ?? d?.data ?? (Array.isArray(d) ? d : []);
    })();

    // Plan & Development planned budgets — the source that feeds the Finance allocation.
    const { data: planDevBudgets = [] } = useQuery({
        queryKey: ['planDevPersonnelBudgets'],
        queryFn: () => getAllBudgets('Personnel'),
        staleTime: 60 * 1000,
    });

    const [form, setForm] = useState<any>({
        planCode: '',
        title: '',
        desc: '',
        departmentId: '',
        year: new Date().getFullYear(),
        startDate: '',
        endDate: '',
        totalPositions: 1,
        budget: 0,
        budgetCurrency: 'USD',
        budgetId: '',
        planDevBudgetId: '',
        ...initialData,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-generate plan code if not provided
    useEffect(() => {
        if (!form.planCode && form.departmentId && form.year) {
            const dept = departments.find(d => d.id === form.departmentId);
            if (dept) {
                const code = `${dept.code}-${form.year}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
                setForm(f => ({ ...f, planCode: code }));
            }
        }
    }, [form.departmentId, form.year, departments]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.planCode?.trim()) {
            newErrors.planCode = 'Plan code is required';
        }

        if (!form.title?.trim()) {
            newErrors.title = 'Title is required';
        } else if (form.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        if (!form.departmentId) {
            newErrors.departmentId = 'Department is required';
        }

        if (!form.year || form.year < 2000 || form.year > 2100) {
            newErrors.year = 'Please enter a valid year';
        }

        if (!form.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!form.endDate) {
            newErrors.endDate = 'End date is required';
        } else if (form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
            newErrors.endDate = 'End date must be after start date';
        }

        if (!form.totalPositions || form.totalPositions < 1) {
            newErrors.totalPositions = 'Must have at least 1 position';
        }

        if (!form.budget || form.budget < 0) {
            newErrors.budget = 'Please enter a valid budget';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(form);
        }
    };

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'NGN', 'KES', 'ZAR'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Plan Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={form.planCode}
                        onChange={(e) => {
                            setForm(f => ({ ...f, planCode: e.target.value.toUpperCase() }));
                            setErrors(e => ({ ...e, planCode: '' }));
                        }}
                        placeholder="e.g. ENG-2024-001"
                        className={errors.planCode ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.planCode && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.planCode}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={form.title}
                        onChange={(e) => {
                            setForm(f => ({ ...f, title: e.target.value }));
                            setErrors(e => ({ ...e, title: '' }));
                        }}
                        placeholder="e.g. 2024 Engineering Hiring Plan"
                        className={errors.title ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.title && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.title}
                        </p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                    value={form.desc || ''}
                    onChange={(e) => setForm(f => ({ ...f, desc: e.target.value }))}
                    placeholder="Describe the workforce plan..."
                    rows={3}
                    disabled={isSubmitting}
                />
            </div>

            {/* Department & Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Department <span className="text-red-500">*</span>
                    </Label>
                    <select
                        value={form.departmentId}
                        onChange={(e) => {
                            setForm(f => ({ ...f, departmentId: e.target.value }));
                            setErrors(e => ({ ...e, departmentId: '' }));
                        }}
                        className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            errors.departmentId ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                    >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                    {errors.departmentId && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.departmentId}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Year <span className="text-red-500">*</span>
                    </Label>
                    <select
                        value={form.year}
                        onChange={(e) => {
                            setForm(f => ({ ...f, year: parseInt(e.target.value) }));
                            setErrors(e => ({ ...e, year: '' }));
                        }}
                        className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            errors.year ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    {errors.year && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.year}
                        </p>
                    )}
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => {
                            setForm(f => ({ ...f, startDate: e.target.value }));
                            setErrors(e => ({ ...e, startDate: '' }));
                        }}
                        className={errors.startDate ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.startDate && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.startDate}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        End Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => {
                            setForm(f => ({ ...f, endDate: e.target.value }));
                            setErrors(e => ({ ...e, endDate: '' }));
                        }}
                        className={errors.endDate ? 'border-red-500' : ''}
                        disabled={isSubmitting}
                        min={form.startDate}
                    />
                    {errors.endDate && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.endDate}
                        </p>
                    )}
                </div>
            </div>

            {/* Positions & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Total Positions <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="number"
                            min={1}
                            value={form.totalPositions}
                            onChange={(e) => {
                                setForm(f => ({ ...f, totalPositions: parseInt(e.target.value) || 1 }));
                                setErrors(e => ({ ...e, totalPositions: '' }));
                            }}
                            className={`pl-9 ${errors.totalPositions ? 'border-red-500' : ''}`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.totalPositions && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.totalPositions}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        Budget <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="number"
                            min={0}
                            step={1000}
                            value={form.budget}
                            onChange={(e) => {
                                setForm(f => ({ ...f, budget: parseFloat(e.target.value) || 0 }));
                                setErrors(e => ({ ...e, budget: '' }));
                            }}
                            className={`pl-9 ${errors.budget ? 'border-red-500' : ''}`}
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.budget && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.budget}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Currency</Label>
                    <select
                        value={form.budgetCurrency}
                        onChange={(e) => setForm(f => ({ ...f, budgetCurrency: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={isSubmitting}
                    >
                        {currencies.map(curr => (
                            <option key={curr} value={curr}>{curr}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Plan & Development planned budget — the source that feeds the Finance allocation. */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Plan &amp; Development Budget (planned source)</Label>
                <select
                    value={form.planDevBudgetId || ''}
                    onChange={(e) => setForm(f => ({ ...f, planDevBudgetId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={isSubmitting}
                >
                    <option value="">None (not linked to a planned budget)</option>
                    {planDevBudgets.map((b: any) => (
                        <option key={b.id} value={b.id}>
                            {b.category}{b.plannedAmount != null ? ` — planned ${Number(b.plannedAmount).toLocaleString()}` : ''}
                        </option>
                    ))}
                </select>
                <p className="text-[11px] text-gray-400">
                    The originating planned personnel budget from Plan &amp; Development. Finance allocates against this plan.
                </p>
            </div>

            {/* Finance budget to encumber against (optional). When set, approval checks & reserves it. */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Finance Budget (allocation to check &amp; reserve)</Label>
                <select
                    value={form.budgetId || ''}
                    onChange={(e) => setForm(f => ({ ...f, budgetId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={isSubmitting}
                >
                    <option value="">None (no budget control)</option>
                    {budgets.map((b: any) => (
                        <option key={b.id} value={b.id}>
                            {b.name}{b.totalAmount != null ? ` — ${Number(b.totalAmount).toLocaleString()}` : ''}
                        </option>
                    ))}
                </select>
                <p className="text-[11px] text-gray-400">
                    If selected, approving this plan reserves the budget amount from Finance and is blocked if there isn't enough available.
                </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            {isEdit ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>
                            <FileText className="w-4 h-4 mr-2" />
                            {isEdit ? 'Update Plan' : 'Create Plan'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default WorkforcePlanForm;