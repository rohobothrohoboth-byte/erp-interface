// src/components/crm/interactions/AddInteractionModal.tsx

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
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { createInteraction, getLeads, getCustomers, getEmployeesForAssignment } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import type { CreateInteractionDto, LeadDto, CustomerDto, EmployeeAssignmentDto } from '../../../types/crm/crm.types';

interface AddInteractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preSelectedLeadId?: string;
    preSelectedCustomerId?: string;
}

const AddInteractionModal: React.FC<AddInteractionModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     onSuccess,
                                                                     preSelectedLeadId,
                                                                     preSelectedCustomerId,
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
        leadId: preSelectedLeadId || '',
        customerId: preSelectedCustomerId || '',
        contactId: '',
        opportunityId: '',
        assignedToUserId: '',
        scheduledDate: '',
        duration: 30,
        outcome: '',
        location: '',
        isAllDay: false,
    });

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            if (preSelectedLeadId) {
                setFormData(prev => ({ ...prev, leadId: preSelectedLeadId }));
            }
            if (preSelectedCustomerId) {
                setFormData(prev => ({ ...prev, customerId: preSelectedCustomerId }));
            }
        }
    }, [isOpen, preSelectedLeadId, preSelectedCustomerId]);

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);

            const [leadsRes, customersRes] = await Promise.all([
                getLeads({ page: 1, pageSize: 100 }),
                getCustomers({ page: 1, pageSize: 100 }),
            ]);

            setLeads(leadsRes.data?.data || []);
            setCustomers(customersRes.data?.data || []);

            const employeesRes = await getEmployeesForAssignment();
            setEmployees(employeesRes || []);

        } catch (error) {
            console.error('Error fetching options:', error);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject.trim()) {
            showToast.error('Subject is required');
            return;
        }

        try {
            setLoading(true);

            const payload: CreateInteractionDto = {
                subject: formData.subject,
                description: formData.description || undefined,
                type: formData.type,
                status: formData.status,  // Now sending string
                priority: formData.priority,  // Now sending string
                leadId: formData.leadId && formData.leadId !== 'none' ? formData.leadId : undefined,
                customerId: formData.customerId && formData.customerId !== 'none' ? formData.customerId : undefined,
                contactId: formData.contactId && formData.contactId !== 'none' ? formData.contactId : undefined,
                opportunityId: formData.opportunityId && formData.opportunityId !== 'none' ? formData.opportunityId : undefined,
                assignedToUserId: formData.assignedToUserId && formData.assignedToUserId !== 'none' ? formData.assignedToUserId : undefined,
                scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
                duration: formData.duration || undefined,
                outcome: formData.outcome || undefined,
                location: formData.location || undefined,
                isAllDay: formData.isAllDay || false,
            };

            console.log('Sending payload:', payload);

            await createInteraction(payload);
            showToast.success('Interaction logged successfully');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Error creating interaction:', error);
            console.error('Response:', error?.response?.data);
            showToast.error(error?.response?.data?.message || 'Failed to log interaction');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            subject: '',
            description: '',
            type: 'Call',
            status: 'Scheduled',
            priority: 'Medium',
            leadId: preSelectedLeadId || '',
            customerId: preSelectedCustomerId || '',
            contactId: '',
            opportunityId: '',
            assignedToUserId: '',
            scheduledDate: '',
            duration: 30,
            outcome: '',
            location: '',
            isAllDay: false,
        });
    };

    if (!isOpen) return null;

    const typeOptions = ['Call', 'Email', 'Meeting', 'Note', 'Task', 'Chat', 'SMS', 'Letter'];
    const statusOptions = [
        { value: 'Scheduled', label: 'Scheduled' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'Postponed', label: 'Postponed' },
    ];
    const priorityOptions = [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
        { value: 'Urgent', label: 'Urgent' },
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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Log Interaction</h2>
                            <p className="text-sm text-gray-500">Record a new interaction with a lead or customer</p>
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
                                            <SelectItem key={opt.value} value={opt.value}>
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
                                            <SelectItem key={opt.value} value={opt.value}>
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

                            {/* Lead */}
                            <div>
                                <Label htmlFor="leadId" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    Lead
                                </Label>
                                <Select
                                    value={formData.leadId || 'none'}
                                    onValueChange={(value) => handleSelectChange('leadId', value === 'none' ? '' : value)}
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
                                    value={formData.customerId || 'none'}
                                    onValueChange={(value) => handleSelectChange('customerId', value === 'none' ? '' : value)}
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
                                    value={formData.assignedToUserId || 'none'}
                                    onValueChange={(value) => handleSelectChange('assignedToUserId', value === 'none' ? '' : value)}
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
                                        Logging...
                                    </>
                                ) : (
                                    'Log Interaction'
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default AddInteractionModal;