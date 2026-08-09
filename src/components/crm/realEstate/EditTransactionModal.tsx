// src/components/crm/realEstate/EditTransactionModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    FileText,
    DollarSign,
    Calendar,
    Users,
    Building2,
    User,
    Loader2,
    Home,
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
import { updateTransaction } from '../../../services/crm/crm.api';
import { getProperties, getCustomers, getAllEmployees } from '../../../services/crm/crm.api';
import type { RealEstateTransaction, Property, CustomerDto } from '../../../types/crm/crm.types';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transaction: RealEstateTransaction | null;
}

const statusOptions = [
    { value: '1', label: 'Negotiation' },
    { value: '2', label: 'Accepted' },
    { value: '3', label: 'Pending Inspection' },
    { value: '4', label: 'Pending Financing' },
    { value: '5', label: 'Pending Appraisal' },
    { value: '6', label: 'Closing' },
    { value: '7', label: 'Completed' },
    { value: '8', label: 'Cancelled' },
];

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onSuccess,
                                                                       transaction,
                                                                   }) => {
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [properties, setProperties] = useState<Property[]>([]);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [agents, setAgents] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        propertyId: '',
        buyerId: '',
        sellerId: '',
        buyerAgentId: '',
        sellerAgentId: '',
        salePrice: '',
        depositAmount: '',
        commissionAmount: '',
        status: '1',
        offerDate: '',
        acceptanceDate: '',
        closingDate: '',
        possessionDate: '',
        notes: '',
    });

    useEffect(() => {
        if (isOpen && transaction) {
            setFormData({
                propertyId: transaction.propertyId || '',
                buyerId: transaction.buyerId || '',
                sellerId: transaction.sellerId || '',
                buyerAgentId: transaction.buyerAgentId || '',
                sellerAgentId: transaction.sellerAgentId || '',
                salePrice: transaction.salePrice?.toString() || '',
                depositAmount: transaction.depositAmount?.toString() || '',
                commissionAmount: transaction.commissionAmount?.toString() || '',
                status: getStatusValue(transaction.status),
                offerDate: transaction.offerDate ? new Date(transaction.offerDate).toISOString().split('T')[0] : '',
                acceptanceDate: transaction.acceptanceDate ? new Date(transaction.acceptanceDate).toISOString().split('T')[0] : '',
                closingDate: transaction.closingDate ? new Date(transaction.closingDate).toISOString().split('T')[0] : '',
                possessionDate: transaction.possessionDate ? new Date(transaction.possessionDate).toISOString().split('T')[0] : '',
                notes: transaction.notes || '',
            });
            fetchOptions();
        }
    }, [isOpen, transaction]);

    const getStatusValue = (status: string): string => {
        const map: Record<string, string> = {
            'Negotiation': '1',
            'Accepted': '2',
            'PendingInspection': '3',
            'PendingFinancing': '4',
            'PendingAppraisal': '5',
            'Closing': '6',
            'Completed': '7',
            'Cancelled': '8',
        };
        return map[status] || '1';
    };

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);
            const [propertiesRes, customersRes, agentsRes] = await Promise.all([
                getProperties({ page: 1, pageSize: 1000 }),
                getCustomers({ page: 1, pageSize: 1000 }),
                getEmployees({ page: 1, pageSize: 1000 }),
            ]);
            setProperties(propertiesRes.data?.data || []);
            setCustomers(customersRes.data?.data || []);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!transaction) return;

        if (!formData.propertyId) {
            showToast.error('Please select a property');
            return;
        }

        if (!formData.buyerId) {
            showToast.error('Please select a buyer');
            return;
        }

        if (!formData.sellerId) {
            showToast.error('Please select a seller');
            return;
        }

        if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
            showToast.error('Please enter a valid sale price');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                propertyId: formData.propertyId,
                buyerId: formData.buyerId,
                sellerId: formData.sellerId,
                buyerAgentId: formData.buyerAgentId || null,
                sellerAgentId: formData.sellerAgentId || null,
                salePrice: parseFloat(formData.salePrice),
                depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
                commissionAmount: formData.commissionAmount ? parseFloat(formData.commissionAmount) : null,
                status: parseInt(formData.status),
                offerDate: formData.offerDate ? new Date(formData.offerDate).toISOString() : null,
                acceptanceDate: formData.acceptanceDate ? new Date(formData.acceptanceDate).toISOString() : null,
                closingDate: formData.closingDate ? new Date(formData.closingDate).toISOString() : null,
                possessionDate: formData.possessionDate ? new Date(formData.possessionDate).toISOString() : null,
                notes: formData.notes.trim() || null,
            };

            await updateTransaction(transaction.id, payload);
            showToast.success('Transaction updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating transaction:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update transaction');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !transaction) return null;

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
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
                    >
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 rounded-lg p-2">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        Edit Transaction
                                    </h2>
                                    <p className="text-sm text-indigo-200">
                                        {transaction.transactionNumber}
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
                                    {/* Same fields as AddTransactionModal */}
                                    {/* ... (same fields as AddTransactionModal) ... */}

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
                                                    Update Transaction
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

export default EditTransactionModal;