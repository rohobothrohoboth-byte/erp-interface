// src/components/crm/salesManagement/components/opportunities/EditOpportunityModal.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Target,
    DollarSign,
    Calendar,
    Users,
    Building2,
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
import { updateOpportunity } from '@/modules/crm/services/crm.api';
import { getCustomers } from '@/modules/crm/services/crm.api';
import { getLeads } from '@/modules/crm/services/crm.api';
import { getEmployeesForAssignment } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import type { OpportunityDto, CustomerDto, LeadDto, EmployeeAssignmentDto } from '@/modules/crm/types/crm.types';

interface EditOpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    opportunity: OpportunityDto | null;
}

const EditOpportunityModal: React.FC<EditOpportunityModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onSuccess,
                                                                       opportunity,
                                                                   }) => {
    const [loading, setLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [leads, setLeads] = useState<LeadDto[]>([]);
    const [employees, setEmployees] = useState<EmployeeAssignmentDto[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        stage: 'Discovery',
        amount: 0,
        winProbability: 50,
        expectedCloseDate: '',
        customerId: '',
        leadId: '',
        assignedToUserId: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            if (opportunity) {
                setFormData({
                    name: opportunity.name || '',
                    description: opportunity.description || '',
                    stage: opportunity.stage || 'Discovery',
                    amount: opportunity.amount || 0,
                    winProbability: opportunity.winProbability || 50,
                    expectedCloseDate: opportunity.expectedCloseDate
                        ? new Date(opportunity.expectedCloseDate).toISOString().split('T')[0]
                        : '',
                    customerId: opportunity.customerId || '',
                    leadId: opportunity.leadId || '',
                    assignedToUserId: opportunity.assignedToUserId || '',
                });
            }
        }
    }, [isOpen, opportunity]);

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);
            const [customersRes, leadsRes, employeesRes] = await Promise.all([
                getCustomers({ page: 1, pageSize: 100 }),
                getLeads({ page: 1, pageSize: 100 }),
                getEmployeesForAssignment(),
            ]);
            setCustomers(customersRes.data?.data || []);
            setLeads(leadsRes.data?.data || []);
            setEmployees(employeesRes || []);
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

        if (!formData.name.trim()) {
            showToast.error('Opportunity name is required');
            return;
        }

        if (!opportunity) return;

        try {
            setLoading(true);
            await updateOpportunity(opportunity.id, {
                ...formData,
                amount: formData.amount || 0,
                winProbability: formData.winProbability || 50,
                customerId: formData.customerId || undefined,
                leadId: formData.leadId || undefined,
                assignedToUserId: formData.assignedToUserId || undefined,
                expectedCloseDate: formData.expectedCloseDate
                    ? new Date(formData.expectedCloseDate).toISOString()
                    : undefined,
            });
            showToast.success('Opportunity updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating opportunity:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update opportunity');
        } finally {
            setLoading(false);
        }
    };

    const stages = ['Discovery', 'Qualification', 'Proposal', 'Negotiation', 'ClosedWon', 'ClosedLost'];

    if (!isOpen || !opportunity) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Target className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Opportunity</h2>
                            <p className="text-sm text-gray-500">Update opportunity details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
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
                            {/* Name */}
                            <div className="md:col-span-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-gray-500" />
                                    Opportunity Name *
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter opportunity name"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            {/* Stage */}
                            <div>
                                <Label htmlFor="stage">Stage</Label>
                                <Select
                                    value={formData.stage}
                                    onValueChange={(value) => handleSelectChange('stage', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stages.map((stage) => (
                                            <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Amount */}
                            <div>
                                <Label htmlFor="amount" className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                    Amount
                                </Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => handleNumberChange('amount', e.target.value)}
                                    placeholder="0"
                                    className="mt-1"
                                    min={0}
                                    step={1000}
                                />
                            </div>

                            {/* Win Probability */}
                            <div>
                                <Label htmlFor="winProbability">Win Probability (%)</Label>
                                <Input
                                    id="winProbability"
                                    name="winProbability"
                                    type="number"
                                    value={formData.winProbability}
                                    onChange={(e) => handleNumberChange('winProbability', e.target.value)}
                                    className="mt-1"
                                    min={0}
                                    max={100}
                                />
                            </div>

                            {/* Expected Close Date */}
                            <div>
                                <Label htmlFor="expectedCloseDate" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    Expected Close
                                </Label>
                                <Input
                                    id="expectedCloseDate"
                                    name="expectedCloseDate"
                                    type="date"
                                    value={formData.expectedCloseDate}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                            </div>

                            {/* Customer */}
                            <div>
                                <Label htmlFor="customerId" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-500" />
                                    Customer
                                </Label>
                                <Select
                                    value={formData.customerId}
                                    onValueChange={(value) => handleSelectChange('customerId', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Lead */}
                            <div>
                                <Label htmlFor="leadId" className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    Lead
                                </Label>
                                <Select
                                    value={formData.leadId}
                                    onValueChange={(value) => handleSelectChange('leadId', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select lead" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {leads.map((lead) => (
                                            <SelectItem key={lead.id} value={lead.id}>
                                                {lead.firstName} {lead.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Assigned To */}
                            <div className="md:col-span-2">
                                <Label htmlFor="assignedToUserId" className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    Assigned To
                                </Label>
                                <Select
                                    value={formData.assignedToUserId}
                                    onValueChange={(value) => handleSelectChange('assignedToUserId', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Assign to user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned</SelectItem>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.appUserId} value={emp.appUserId}>
                                                {emp.firstName || emp.code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the opportunity..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Opportunity'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default EditOpportunityModal;