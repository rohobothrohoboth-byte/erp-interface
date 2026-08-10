// src/components/crm/interactions/EditInteractionModal.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    MessageSquare,
    Mail,
    Phone,
    Users,
    Calendar,
    Clock,
    User,
    Building2,
    FileText,
    Loader2,
    Target,
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
import { updateInteraction } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { getLeads } from '@/modules/crm/services/crm.api';
import { getCustomers } from '@/modules/crm/services/crm.api';
import { getEmployeesForAssignment } from '@/modules/crm/services/crm.api';
import type { InteractionDto, UpdateInteractionDto, LeadDto, CustomerDto, EmployeeAssignmentDto } from '@/modules/crm/types/crm.types';

interface EditInteractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    interaction: InteractionDto | null;
}

const EditInteractionModal: React.FC<EditInteractionModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       onSuccess,
                                                                       interaction,
                                                                   }) => {
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState<LeadDto[]>([]);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [employees, setEmployees] = useState<EmployeeAssignmentDto[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    const [formData, setFormData] = useState<any>({
        subject: '',
        description: '',
        type: 'Call',
        status: 'Scheduled',  // Changed from number to string
        priority: 'Medium',   // Changed from number to string
        leadId: '',
        customerId: '',
        contactId: '',
        opportunityId: '',
        assignedToUserId: '',
        scheduledDate: '',
        completedDate: '',
        duration: 30,
        outcome: '',
        location: '',
        isAllDay: false,
    });

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            if (interaction) {
                setFormData({
                    subject: interaction.subject || '',
                    description: interaction.description || '',
                    type: interaction.type || 'Call',
                    status: interaction.status || 'Scheduled',  // String
                    priority: interaction.priority || 'Medium',  // String
                    leadId: interaction.leadId || '',
                    customerId: interaction.customerId || '',
                    contactId: interaction.contactId || '',
                    opportunityId: interaction.opportunityId || '',
                    assignedToUserId: interaction.assignedToUserId || '',
                    scheduledDate: interaction.scheduledDate ? new Date(interaction.scheduledDate).toISOString().slice(0, 16) : '',
                    completedDate: interaction.completedDate ? new Date(interaction.completedDate).toISOString().slice(0, 16) : '',
                    duration: interaction.duration || 30,
                    outcome: interaction.outcome || '',
                    location: interaction.location || '',
                    isAllDay: interaction.isAllDay || false,
                });
            }
        }
    }, [isOpen, interaction]);

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);

            // Fetch leads and customers
            const [leadsRes, customersRes] = await Promise.all([
                getLeads({ page: 1, pageSize: 100 }),
                getCustomers({ page: 1, pageSize: 100 }),
            ]);

            setLeads(leadsRes.data?.data || []);
            setCustomers(customersRes.data?.data || []);

            // Fetch employees - this will now return empty array on error
            const employeesRes = await getEmployeesForAssignment();
            setEmployees(employeesRes || []);

        } catch (error) {
            console.error('Error fetching options:', error);
            // Don't show toast for employee error, just set empty arrays
            setLeads([]);
            setCustomers([]);
            setEmployees([]);
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
        setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject?.trim()) {
            showToast.error('Subject is required');
            return;
        }

        if (!interaction) return;

        try {
            setLoading(true);
            const payload = {
                ...formData,
                leadId: formData.leadId || undefined,
                customerId: formData.customerId || undefined,
                contactId: formData.contactId || undefined,
                opportunityId: formData.opportunityId || undefined,
                assignedToUserId: formData.assignedToUserId || undefined,
                scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
                completedDate: formData.completedDate ? new Date(formData.completedDate).toISOString() : undefined,
            };
            await updateInteraction(interaction.id, payload);
            showToast.success('Interaction updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating interaction:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update interaction');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !interaction) return null;

    const typeOptions = ['Call', 'Email', 'Meeting', 'Note', 'Task', 'Chat', 'SMS', 'Letter'];
    const statusOptions = [
        { value: 1, label: 'Scheduled' },
        { value: 2, label: 'In Progress' },
        { value: 3, label: 'Completed' },
        { value: 4, label: 'Cancelled' },
        { value: 5, label: 'Postponed' },
    ];
    const priorityOptions = [
        { value: 1, label: 'Low' },
        { value: 2, label: 'Medium' },
        { value: 3, label: 'High' },
        { value: 4, label: 'Urgent' },
    ];

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
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Edit Interaction</h2>
                            <p className="text-sm text-gray-500">Update interaction details</p>
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
                            {/* Subject */}
                            <div className="md:col-span-2">
                                <Label htmlFor="subject" className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                    Subject *
                                </Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Enter interaction subject"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleSelectChange('type', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
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
                                        {statusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority */}
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => handleSelectChange('priority', value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration */}
                            <div>
                                <Label htmlFor="duration" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    Duration (minutes)
                                </Label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="mt-1"
                                    min={1}
                                />
                            </div>

                            {/* Scheduled Date */}
                            <div>
                                <Label htmlFor="scheduledDate" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    Scheduled Date
                                </Label>
                                <Input
                                    id="scheduledDate"
                                    name="scheduledDate"
                                    type="datetime-local"
                                    value={formData.scheduledDate}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                            </div>

                            {/* Completed Date */}
                            <div>
                                <Label htmlFor="completedDate" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    Completed Date
                                </Label>
                                <Input
                                    id="completedDate"
                                    name="completedDate"
                                    type="datetime-local"
                                    value={formData.completedDate}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                            </div>

                            {/* Lead */}
                            <div>
                                <Label htmlFor="leadId" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
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
                                        {employees.length > 0 ? (
                                            employees.map((emp) => (
                                                <SelectItem key={emp.appUserId} value={emp.appUserId}>
                                                    {emp.fullName || emp.firstName || emp.code || 'User'}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No employees available</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Location */}
                            <div className="md:col-span-2">
                                <Label htmlFor="location" className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-gray-500" />
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Meeting location or platform"
                                    className="mt-1"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <Label htmlFor="description" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Detailed description of the interaction..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            {/* Outcome */}
                            <div className="md:col-span-2">
                                <Label htmlFor="outcome">Outcome</Label>
                                <Textarea
                                    id="outcome"
                                    name="outcome"
                                    value={formData.outcome}
                                    onChange={handleChange}
                                    placeholder="Outcome or result of the interaction..."
                                    className="mt-1"
                                    rows={2}
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
                                    'Update Interaction'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default EditInteractionModal;