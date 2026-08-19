// src/components/crm/salesManagement/components/contracts/EditContractModal.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    FileText,
    DollarSign,
    Calendar,
    Building2,
    Users,
    Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { updateContract } from '@/modules/crm/services/crm.api';
import { getCustomers } from '@/modules/crm/services/crm.api';
import { getOpportunities } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import type { ContractDto, CustomerDto, OpportunityDto } from '@/modules/crm/types/crm.types';

interface EditContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contract: ContractDto | null;
}

const EditContractModal: React.FC<EditContractModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onSuccess,
                                                                 contract,
                                                             }) => {
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);

    const [formData, setFormData] = useState({
        customerId: '',
        opportunityId: '',
        title: '',
        description: '',
        totalValue: 0,
        status: 'Draft',
        startDate: '',
        endDate: '',
        termsAndConditions: '',
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            if (contract) {
                setFormData({
                    customerId: contract.customerId || '',
                    opportunityId: contract.opportunityId || '',
                    title: contract.title || '',
                    description: contract.description || '',
                    totalValue: contract.totalValue || 0,
                    status: contract.status || 'Draft',
                    startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
                    endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
                    termsAndConditions: contract.termsAndConditions || '',
                    notes: contract.notes || '',
                });
            }
        }
    }, [isOpen, contract]);

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);
            const [customersRes, opportunitiesRes] = await Promise.all([
                getCustomers({ page: 1, pageSize: 100 }),
                getOpportunities({ page: 1, pageSize: 100 }),
            ]);
            setCustomers(customersRes.data?.data || []);
            setOpportunities(opportunitiesRes.data?.data || []);
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

    const handleNumberChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contract) return;

        if (!formData.customerId) {
            showToast.error('Please select a customer');
            return;
        }

        if (!formData.title.trim()) {
            showToast.error('Contract title is required');
            return;
        }

        try {
            setLoading(true);
            await updateContract(contract.id, formData);
            showToast.success('Contract updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating contract:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update contract');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = ['Draft', 'Pending', 'Active', 'Signed', 'Expired', 'Terminated'];

    if (!isOpen || !contract) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Contract</h2>
                            <p className="text-sm text-gray-500">{contract.contractNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {loadingOptions ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <span className="ml-3 text-gray-600">Loading options...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="customerId" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-500" />
                                    Customer *
                                </Label>
                                <Select value={formData.customerId} onValueChange={(value) => handleSelectChange('customerId', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select customer" />
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
                                <Label htmlFor="opportunityId" className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    Opportunity
                                </Label>
                                <Select value={formData.opportunityId} onValueChange={(value) => handleSelectChange('opportunityId', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select opportunity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {opportunities.map((opp) => (
                                            <SelectItem key={opp.id} value={opp.id}>
                                                {opp.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="title" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    Contract Title *
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter contract title"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="totalValue" className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                    Total Value
                                </Label>
                                <Input
                                    id="totalValue"
                                    name="totalValue"
                                    type="number"
                                    value={formData.totalValue}
                                    onChange={(e) => handleNumberChange('totalValue', e.target.value)}
                                    placeholder="0"
                                    className="mt-1"
                                    min={0}
                                    step={1000}
                                />
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="startDate" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    Start Date
                                </Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="endDate" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    End Date
                                </Label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the contract..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                                <Textarea
                                    id="termsAndConditions"
                                    name="termsAndConditions"
                                    value={formData.termsAndConditions}
                                    onChange={handleChange}
                                    placeholder="Terms and conditions..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Additional notes..."
                                    className="mt-1"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Contract'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default EditContractModal;