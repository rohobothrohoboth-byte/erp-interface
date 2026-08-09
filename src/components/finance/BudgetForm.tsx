// src/components/finance/budget/BudgetForm.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Calendar, DollarSign, Building2, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { showToast } from '../../layout/layout';

interface BudgetLine {
    id: string;
    accountId: string;
    allocatedAmount: number;
    description: string;
}

interface BudgetFormData {
    id?: string;
    name: string;
    description: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    branchId: string;
    departmentId: string;
    status: string;
    lines: BudgetLine[];
}

interface BudgetFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: BudgetFormData) => Promise<void>;
    initialData?: BudgetFormData | null;
    branches: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string }>;
    accounts: Array<{ id: string; code: string; name: string }>;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
                                                   isOpen,
                                                   onClose,
                                                   onSubmit,
                                                   initialData,
                                                   branches,
                                                   departments,
                                                   accounts,
                                               }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<BudgetFormData>({
        name: '',
        description: '',
        totalAmount: 0,
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
        branchId: '',
        departmentId: '',
        status: 'Draft',
        lines: [{ id: crypto.randomUUID(), accountId: '', allocatedAmount: 0, description: '' }],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                lines: initialData.lines.length > 0 ? initialData.lines : [{ id: crypto.randomUUID(), accountId: '', allocatedAmount: 0, description: '' }],
            });
        }
    }, [initialData]);

    const handleInputChange = (field: keyof BudgetFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Update total amount when lines change
        if (field === 'lines') {
            const total = value.reduce((sum: number, line: BudgetLine) => sum + line.allocatedAmount, 0);
            setFormData(prev => ({ ...prev, totalAmount: total }));
        }
    };

    const handleLineChange = (index: number, field: keyof BudgetLine, value: any) => {
        const newLines = [...formData.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setFormData(prev => ({ ...prev, lines: newLines }));

        // Update total amount
        const total = newLines.reduce((sum, line) => sum + line.allocatedAmount, 0);
        setFormData(prev => ({ ...prev, totalAmount: total }));
    };

    const addLine = () => {
        setFormData(prev => ({
            ...prev,
            lines: [...prev.lines, { id: crypto.randomUUID(), accountId: '', allocatedAmount: 0, description: '' }],
        }));
    };

    const removeLine = (index: number) => {
        if (formData.lines.length > 1) {
            const newLines = formData.lines.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, lines: newLines }));
            const total = newLines.reduce((sum, line) => sum + line.allocatedAmount, 0);
            setFormData(prev => ({ ...prev, totalAmount: total }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            showToast.error('Budget name is required');
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            showToast.error('Start and end dates are required');
            return;
        }
        if (!formData.branchId) {
            showToast.error('Branch is required');
            return;
        }
        if (!formData.departmentId) {
            showToast.error('Department is required');
            return;
        }
        if (formData.lines.some(line => !line.accountId)) {
            showToast.error('All budget lines must have an account selected');
            return;
        }
        if (formData.lines.some(line => line.allocatedAmount <= 0)) {
            showToast.error('All budget lines must have a positive amount');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting budget:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Budget' : 'Create New Budget'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Budget Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="e.g., Annual Operating Budget 2026"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Brief description of the budget"
                            rows={2}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Branch & Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="branchId">Branch <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.branchId}
                                onValueChange={(value) => handleInputChange('branchId', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="departmentId">Department <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.departmentId}
                                onValueChange={(value) => handleInputChange('departmentId', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Budget Lines */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-lg font-semibold">Budget Lines</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLine}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Line
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.lines.map((line, index) => (
                                <div key={line.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="md:col-span-5 space-y-1">
                                        <Label className="text-xs text-gray-500">Account</Label>
                                        <Select
                                            value={line.accountId}
                                            onValueChange={(value) => handleLineChange(index, 'accountId', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id}>
                                                        {account.code} - {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <Label className="text-xs text-gray-500">Amount</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={line.allocatedAmount || ''}
                                            onChange={(e) => handleLineChange(index, 'allocatedAmount', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <Label className="text-xs text-gray-500">Description</Label>
                                        <Input
                                            type="text"
                                            value={line.description}
                                            onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                                            placeholder="Line description"
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex items-end justify-center">
                                        {formData.lines.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLine(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Amount */}
                        <div className="flex justify-end items-center gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <span className="text-lg font-semibold text-gray-900">Total Budget Amount:</span>
                            <span className="text-2xl font-bold text-indigo-600">
                ${formData.totalAmount.toFixed(2)}
              </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : initialData ? 'Update Budget' : 'Create Budget'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default BudgetForm;