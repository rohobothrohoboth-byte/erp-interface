// src/pages/crm/contactManagement/AddContactPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    User,
    Mail,
    Phone,
    Building2,
    Briefcase,
    UserCheck,
    Star,
    MessageCircle,
    Linkedin,
    Twitter,
    Facebook,
    Link,
    FileText,
    Loader2,
} from 'lucide-react';
import { createContact, getCustomers } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { CreateContactDto, CustomerDto } from '@/modules/crm/types/crm.types';

const AddContactPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [formData, setFormData] = useState<CreateContactDto>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobile: '',
        title: '',
        department: '',
        customerId: '',
        isPrimary: false,
        isDecisionMaker: false,
        notes: '',
        acceptsEmail: true,
        acceptsSMS: true,
        acceptsCalls: true,
        acceptsMarketing: true,
        preferredContactMethod: 'Email',
        linkedIn: '',
        twitter: '',
        facebook: '',
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoadingCustomers(true);
            const response = await getCustomers({ pageSize: 100 });
            const data = response.data?.data || response.data || [];
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            showToast.error('Failed to load customers');
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handleChange = (field: keyof CreateContactDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            showToast.error('First name and last name are required');
            return;
        }

        try {
            setLoading(true);
            await createContact(formData);
            showToast.success('Contact created successfully!');
            navigate('/crm/contacts');
        } catch (error: any) {
            console.error('Error creating contact:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/contacts')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Contact</h1>
                        <p className="text-sm text-gray-500">Create a new contact record</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/crm/contacts')}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Contact
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-600" />
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    placeholder="John"
                                    className="h-10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    placeholder="Doe"
                                    className="h-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="john@example.com"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="+1 234 567 890"
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Mobile</Label>
                                <Input
                                    value={formData.mobile}
                                    onChange={(e) => handleChange('mobile', e.target.value)}
                                    placeholder="+1 234 567 890"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="Sales Manager"
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Company Information */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            Company Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Company / Customer</Label>
                                <Select
                                    value={formData.customerId}
                                    onValueChange={(value) => handleChange('customerId', value)}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingCustomers ? (
                                            <div className="flex items-center justify-center py-6">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                                                <span className="text-sm text-gray-500">Loading customers...</span>
                                            </div>
                                        ) : customers.length === 0 ? (
                                            <div className="py-6 text-center">
                                                <p className="text-sm text-gray-500">No customers found</p>
                                            </div>
                                        ) : (
                                            customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    <div className="flex flex-col">
                                                        <span>{customer.name}</span>
                                                        {customer.companyName && (
                                                            <span className="text-xs text-gray-400">{customer.companyName}</span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Department</Label>
                                <Input
                                    value={formData.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    placeholder="Sales"
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isPrimary}
                                    onCheckedChange={(checked) => handleChange('isPrimary', checked)}
                                />
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    Primary Contact
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isDecisionMaker}
                                    onCheckedChange={(checked) => handleChange('isDecisionMaker', checked)}
                                />
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <UserCheck className="h-4 w-4 text-purple-500" />
                                    Decision Maker
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Communication Preferences */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-indigo-600" />
                            Communication Preferences
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Preferred Contact Method</Label>
                                <Select
                                    value={formData.preferredContactMethod}
                                    onValueChange={(value) => handleChange('preferredContactMethod', value)}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Email">Email</SelectItem>
                                        <SelectItem value="Phone">Phone</SelectItem>
                                        <SelectItem value="SMS">SMS</SelectItem>
                                        <SelectItem value="Video Call">Video Call</SelectItem>
                                        <SelectItem value="In Person">In Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.acceptsEmail}
                                    onCheckedChange={(checked) => handleChange('acceptsEmail', checked)}
                                />
                                <Label className="text-sm font-medium">Accepts Email</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.acceptsSMS}
                                    onCheckedChange={(checked) => handleChange('acceptsSMS', checked)}
                                />
                                <Label className="text-sm font-medium">Accepts SMS</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.acceptsCalls}
                                    onCheckedChange={(checked) => handleChange('acceptsCalls', checked)}
                                />
                                <Label className="text-sm font-medium">Accepts Calls</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.acceptsMarketing}
                                    onCheckedChange={(checked) => handleChange('acceptsMarketing', checked)}
                                />
                                <Label className="text-sm font-medium">Accepts Marketing</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Link className="h-5 w-5 text-indigo-600" />
                            Social Media
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Linkedin className="h-4 w-4 text-blue-600" />
                                    LinkedIn
                                </Label>
                                <Input
                                    value={formData.linkedIn}
                                    onChange={(e) => handleChange('linkedIn', e.target.value)}
                                    placeholder="linkedin.com/in/username"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Twitter className="h-4 w-4 text-blue-400" />
                                    Twitter
                                </Label>
                                <Input
                                    value={formData.twitter}
                                    onChange={(e) => handleChange('twitter', e.target.value)}
                                    placeholder="@username"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Facebook className="h-4 w-4 text-blue-700" />
                                    Facebook
                                </Label>
                                <Input
                                    value={formData.facebook}
                                    onChange={(e) => handleChange('facebook', e.target.value)}
                                    placeholder="facebook.com/username"
                                    className="h-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Notes
                        </h2>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Add any notes about this contact..."
                            rows={4}
                            className="resize-none"
                        />
                    </CardContent>
                </Card>
            </form>
        </motion.div>
    );
};

export default AddContactPage;