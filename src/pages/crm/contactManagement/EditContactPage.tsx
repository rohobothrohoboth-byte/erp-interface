// src/pages/crm/contactManagement/EditContactPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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
    Loader2,
    Link,
    AlertCircle,
    FileText,
} from 'lucide-react';
import { getContactById, updateContact, getCustomers } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import type { ContactDto, UpdateContactDto, CustomerDto } from '../../../types/crm/crm.types';

const EditContactPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contact, setContact] = useState<ContactDto | null>(null);
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [formData, setFormData] = useState<UpdateContactDto>({});

    useEffect(() => {
        if (id) {
            fetchContact(id);
            fetchCustomers();
        }
    }, [id]);

    const fetchContact = async (contactId: string) => {
        try {
            setLoading(true);
            const response = await getContactById(contactId);
            const data = response.data?.data || response.data;

            if (!data) {
                throw new Error('Contact not found');
            }

            setContact(data);
            setFormData({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                mobile: data.mobile,
                title: data.title,
                department: data.department,
                customerId: data.customerId,
                isPrimary: data.isPrimary,
                isDecisionMaker: data.isDecisionMaker,
                notes: data.notes,
                acceptsEmail: data.acceptsEmail,
                acceptsSMS: data.acceptsSMS,
                acceptsCalls: data.acceptsCalls,
                acceptsMarketing: data.acceptsMarketing,
                preferredContactMethod: data.preferredContactMethod,
                linkedIn: data.linkedIn,
                twitter: data.twitter,
                facebook: data.facebook,
                isActive: data.isActive,
            });
        } catch (error: any) {
            console.error('Error fetching contact:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load contact');
            navigate('/crm/contacts');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            setLoadingCustomers(true);
            const response = await getCustomers({ pageSize: 100 });
            const data = response.data?.data || response.data || [];
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handleChange = (field: keyof UpdateContactDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) return;

        if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
            showToast.error('First name and last name are required');
            return;
        }

        try {
            setSaving(true);
            await updateContact(id, formData);
            showToast.success('Contact updated successfully!');
            navigate(`/crm/contacts/${id}`);
        } catch (error: any) {
            console.error('Error updating contact:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update contact');
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-500">Loading contact details...</p>
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Contact not found</h2>
                <Button onClick={() => navigate('/crm/contacts')} className="mt-4">
                    Back to Contacts
                </Button>
            </div>
        );
    }

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
                        onClick={() => navigate(`/crm/contacts/${id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                {getInitials(contact.firstName, contact.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Contact</h1>
                            <p className="text-sm text-gray-500">
                                {contact.firstName} {contact.lastName}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/crm/contacts/${id}`)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
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
                                    value={formData.firstName || ''}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={formData.lastName || ''}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Phone</Label>
                                <Input
                                    value={formData.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Mobile</Label>
                                <Input
                                    value={formData.mobile || ''}
                                    onChange={(e) => handleChange('mobile', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Title</Label>
                                <Input
                                    value={formData.title || ''}
                                    onChange={(e) => handleChange('title', e.target.value)}
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
                                    value={formData.customerId || ''}
                                    onValueChange={(value) => handleChange('customerId', value)}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingCustomers ? (
                                            <div className="flex items-center justify-center py-6">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                                                <span className="text-sm text-gray-500">Loading...</span>
                                            </div>
                                        ) : customers.length === 0 ? (
                                            <div className="py-6 text-center text-sm text-gray-500">
                                                No customers found
                                            </div>
                                        ) : (
                                            customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Department</Label>
                                <Input
                                    value={formData.department || ''}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isPrimary || false}
                                    onCheckedChange={(checked) => handleChange('isPrimary', checked)}
                                />
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    Primary Contact
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isDecisionMaker || false}
                                    onCheckedChange={(checked) => handleChange('isDecisionMaker', checked)}
                                />
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <UserCheck className="h-4 w-4 text-purple-500" />
                                    Decision Maker
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isActive !== undefined ? formData.isActive : true}
                                    onCheckedChange={(checked) => handleChange('isActive', checked)}
                                />
                                <Label className="text-sm font-medium">Active</Label>
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
                                    value={formData.preferredContactMethod || ''}
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
                                    checked={formData.acceptsEmail !== undefined ? formData.acceptsEmail : true}
                                    onCheckedChange={(checked) => handleChange('acceptsEmail', checked)}
                                />
                                <Label className="text-sm font-medium">Accepts Email</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.acceptsSMS !== undefined ? formData.acceptsSMS : true}
                                    onCheckedChange={(checked) => handleChange('acceptsSMS', checked)}
                                />
                                <Label className="text-sm font-medium">Accepts SMS</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.acceptsCalls !== undefined ? formData.acceptsCalls : true}
                                    onCheckedChange={(checked) => handleChange('acceptsCalls', checked)}
                                />
                                <Label className="text-sm font-medium">Accepts Calls</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.acceptsMarketing !== undefined ? formData.acceptsMarketing : true}
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
                                    value={formData.linkedIn || ''}
                                    onChange={(e) => handleChange('linkedIn', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Twitter className="h-4 w-4 text-blue-400" />
                                    Twitter
                                </Label>
                                <Input
                                    value={formData.twitter || ''}
                                    onChange={(e) => handleChange('twitter', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <Facebook className="h-4 w-4 text-blue-700" />
                                    Facebook
                                </Label>
                                <Input
                                    value={formData.facebook || ''}
                                    onChange={(e) => handleChange('facebook', e.target.value)}
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
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </CardContent>
                </Card>
            </form>
        </motion.div>
    );
};

export default EditContactPage;