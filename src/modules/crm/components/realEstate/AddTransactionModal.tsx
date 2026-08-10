// src/components/crm/realEstate/AddTransactionModal.tsx

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
    UserPlus,
} from 'lucide-react';
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
import { showToast } from '@/shared/layout/layout';
import { createTransaction } from '@/modules/crm/services/crm.api';
import { getProperties, getCustomers, getAllEmployees } from '@/modules/crm/services/crm.api';
import type { Property, CustomerDto } from '@/modules/crm/types/crm.types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
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

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSuccess,
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
        if (isOpen) {
            fetchOptions();
        }
    }, [isOpen]);

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

            await createTransaction(payload);
            showToast.success('Transaction created successfully');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error creating transaction:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create transaction');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
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
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 rounded-lg p-2">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        New Transaction
                                    </h2>
                                    <p className="text-sm text-indigo-200">
                                        Create a new real estate transaction
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
                                    {/* Property */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Home className="h-4 w-4 mr-2" />
                                            Property Details
                                        </h3>
                                        <div>
                                            <Label htmlFor="propertyId">Property *</Label>
                                            <Select
                                                value={formData.propertyId}
                                                onValueChange={(value) => handleSelectChange('propertyId', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Select property" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {properties.map((property) => (
                                                        <SelectItem key={property.id} value={property.id}>
                                                            {property.title} - {formatCurrency(property.price)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Parties */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            Parties
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="buyerId" className="flex items-center gap-1">
                                                    <User className="h-4 w-4" /> Buyer *
                                                </Label>
                                                <Select
                                                    value={formData.buyerId}
                                                    onValueChange={(value) => handleSelectChange('buyerId', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select buyer" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {customers.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id}>
                                                                {customer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="sellerId" className="flex items-center gap-1">
                                                    <User className="h-4 w-4" /> Seller *
                                                </Label>
                                                <Select
                                                    value={formData.sellerId}
                                                    onValueChange={(value) => handleSelectChange('sellerId', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select seller" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {customers.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id}>
                                                                {customer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="buyerAgentId" className="flex items-center gap-1">
                                                    <User className="h-4 w-4" /> Buyer Agent
                                                </Label>
                                                <Select
                                                    value={formData.buyerAgentId}
                                                    onValueChange={(value) => handleSelectChange('buyerAgentId', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select agent" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {agents.map((agent) => (
                                                            <SelectItem key={agent.id} value={agent.id}>
                                                                {agent.fullName || `${agent.firstName} ${agent.lastName}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="sellerAgentId" className="flex items-center gap-1">
                                                    <User className="h-4 w-4" /> Seller Agent
                                                </Label>
                                                <Select
                                                    value={formData.sellerAgentId}
                                                    onValueChange={(value) => handleSelectChange('sellerAgentId', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select agent" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
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

                                    {/* Financial */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Financial Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="salePrice">Sale Price *</Label>
                                                <Input
                                                    id="salePrice"
                                                    name="salePrice"
                                                    type="number"
                                                    value={formData.salePrice}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className="mt-1"
                                                    min={0}
                                                    step={0.01}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="depositAmount">Deposit Amount</Label>
                                                <Input
                                                    id="depositAmount"
                                                    name="depositAmount"
                                                    type="number"
                                                    value={formData.depositAmount}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className="mt-1"
                                                    min={0}
                                                    step={0.01}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="commissionAmount">Commission Amount</Label>
                                                <Input
                                                    id="commissionAmount"
                                                    name="commissionAmount"
                                                    type="number"
                                                    value={formData.commissionAmount}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className="mt-1"
                                                    min={0}
                                                    step={0.01}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Important Dates
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="offerDate">Offer Date</Label>
                                                <Input
                                                    id="offerDate"
                                                    name="offerDate"
                                                    type="date"
                                                    value={formData.offerDate}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="acceptanceDate">Acceptance Date</Label>
                                                <Input
                                                    id="acceptanceDate"
                                                    name="acceptanceDate"
                                                    type="date"
                                                    value={formData.acceptanceDate}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="closingDate">Closing Date</Label>
                                                <Input
                                                    id="closingDate"
                                                    name="closingDate"
                                                    type="date"
                                                    value={formData.closingDate}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="possessionDate">Possession Date</Label>
                                                <Input
                                                    id="possessionDate"
                                                    name="possessionDate"
                                                    type="date"
                                                    value={formData.possessionDate}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Status
                                        </h3>
                                        <div>
                                            <Label htmlFor="status">Transaction Status</Label>
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
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Additional notes about the transaction..."
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
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Create Transaction
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

const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default AddTransactionModal;