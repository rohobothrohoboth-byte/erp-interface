// src/components/crm/realEstate/AddCommissionModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    DollarSign,
    Users,
    User,
    Loader2,
    FileText,
    Percent,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { showToast } from '../../../layout/layout';
import { createCommission } from '../../../services/crm/crm.api';
import { getTransactions, getAllEmployees } from '../../../services/crm/crm.api';
import type { RealEstateTransaction } from '../../../types/crm/crm.types';

interface AddCommissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const statusOptions = [
    { value: '1', label: 'Pending' },
    { value: '2', label: 'Approved' },
    { value: '3', label: 'Paid' },
    { value: '4', label: 'Disputed' },
];

const AddCommissionModal: React.FC<AddCommissionModalProps> = ({
                                                                   isOpen,
                                                                   onClose,
                                                                   onSuccess,
                                                               }) => {
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [transactions, setTransactions] = useState<RealEstateTransaction[]>([]);
    const [agents, setAgents] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        transactionId: '',
        agentId: '',
        amount: '',
        percentage: '',
        status: '1',
        notes: '',
        isBuyerAgent: false,
        isSellerAgent: false,
    });

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
        }
    }, [isOpen]);

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);
            const [transactionsRes, agentsRes] = await Promise.all([
                getTransactions({ page: 1, pageSize: 1000 }),
                getEmployees({ page: 1, pageSize: 1000 }),
            ]);
            setTransactions(transactionsRes.data?.data || []);
            setAgents(agentsRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.transactionId) {
            showToast.error('Please select a transaction');
            return;
        }

        if (!formData.agentId) {
            showToast.error('Please select an agent');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            showToast.error('Please enter a valid amount');
            return;
        }

        if (!formData.percentage || parseFloat(formData.percentage) <= 0) {
            showToast.error('Please enter a valid percentage');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                transactionId: formData.transactionId,
                agentId: formData.agentId,
                amount: parseFloat(formData.amount),
                percentage: parseFloat(formData.percentage),
                status: parseInt(formData.status),
                notes: formData.notes.trim() || null,
                isBuyerAgent: formData.isBuyerAgent,
                isSellerAgent: formData.isSellerAgent,
            };

            await createCommission(payload);
            showToast.success('Commission created successfully');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error creating commission:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create commission');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            transactionId: '',
            agentId: '',
            amount: '',
            percentage: '',
            status: '1',
            notes: '',
            isBuyerAgent: false,
            isSellerAgent: false,
        });
    };

    if (!isOpen) return null;

    const isLoading = loading || loadingOptions;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 rounded-lg p-2">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Add Commission
                                    </h2>
                                    <p className="text-sm text-indigo-200">
                                        Create a new agent commission
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    <span className="ml-3 text-gray-600">Loading...</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Transaction & Agent */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Transaction & Agent
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="transactionId">Transaction *</Label>
                                                <Select
                                                    value={formData.transactionId}
                                                    onValueChange={(value) => handleSelectChange('transactionId', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select transaction" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {transactions.map((transaction) => (
                                                            <SelectItem key={transaction.id} value={transaction.id}>
                                                                {transaction.transactionNumber}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="agentId" className="flex items-center gap-1">
                                                    <User className="h-4 w-4" /> Agent *
                                                </Label>
                                                <Select
                                                    value={formData.agentId}
                                                    onValueChange={(value) => handleSelectChange('agentId', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select agent" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {agents.map((agent) => (
                                                            <SelectItem key={agent.id} value={agent.id}>
                                                                {agent.fullName || `${agent.firstName} ${agent.lastName}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount & Percentage */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Financial Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="amount">Amount *</Label>
                                                <Input
                                                    id="amount"
                                                    name="amount"
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className="mt-1"
                                                    min={0}
                                                    step={0.01}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="percentage" className="flex items-center gap-1">
                                                    <Percent className="h-4 w-4" /> Percentage *
                                                </Label>
                                                <Input
                                                    id="percentage"
                                                    name="percentage"
                                                    type="number"
                                                    value={formData.percentage}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className="mt-1"
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Type */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Status & Type
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value) => handleSelectChange('status', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((status) => (
                                                            <SelectItem key={status.value} value={status.value}>
                                                                {status.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="isBuyerAgent"
                                                        checked={formData.isBuyerAgent}
                                                        onChange={(e) => handleCheckboxChange('isBuyerAgent', e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <Label htmlFor="isBuyerAgent" className="cursor-pointer">
                                                        Buyer Agent
                                                    </Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="isSellerAgent"
                                                        checked={formData.isSellerAgent}
                                                        onChange={(e) => handleCheckboxChange('isSellerAgent', e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <Label htmlFor="isSellerAgent" className="cursor-pointer">
                                                        Seller Agent
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Additional notes..."
                                            className="mt-1"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="sticky bottom-0 bg-gray-50 -mx-6 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <DollarSign className="h-4 w-4 mr-2" />
                                                    Create Commission
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddCommissionModal;