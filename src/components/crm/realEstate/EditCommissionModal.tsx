// src/components/crm/realEstate/EditCommissionModal.tsx

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
    Save,
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
import { updateCommission } from '../../../services/crm/crm.api';
import { getTransactions, getAllEmployees } from '../../../services/crm/crm.api';
import type { Commission, RealEstateTransaction } from '../../../types/crm/crm.types';

interface EditCommissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    commission: Commission | null;
}

const statusOptions = [
    { value: '1', label: 'Pending' },
    { value: '2', label: 'Approved' },
    { value: '3', label: 'Paid' },
    { value: '4', label: 'Disputed' },
];

const EditCommissionModal: React.FC<EditCommissionModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSuccess,
                                                                     commission,
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
        if (isOpen && commission) {
            setFormData({
                transactionId: commission.transactionId || '',
                agentId: commission.agentId || '',
                amount: commission.amount?.toString() || '',
                percentage: commission.percentage?.toString() || '',
                status: getStatusValue(commission.status),
                notes: commission.notes || '',
                isBuyerAgent: commission.isBuyerAgent || false,
                isSellerAgent: commission.isSellerAgent || false,
            });
            fetchOptions();
        }
    }, [isOpen, commission]);

    const getStatusValue = (status: string): string => {
        const map: Record<string, string> = {
            'Pending': '1',
            'Approved': '2',
            'Paid': '3',
            'Disputed': '4',
        };
        return map[status] || '1';
    };

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

        if (!commission) return;

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

            await updateCommission(commission.id, payload);
            showToast.success('Commission updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating commission:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update commission');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !commission) return null;

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
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 rounded-lg p-2">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Edit Commission
                                    </h2>
                                    <p className="text-sm text-indigo-200">
                                        Update commission details
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

                        <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    <span className="ml-3 text-gray-600">Loading...</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Same fields as AddCommissionModal */}
                                    {/* ... (same fields as AddCommissionModal) ... */}

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
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Update Commission
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

export default EditCommissionModal;