// src/components/crm/leadManagement/leadGeneration/addLead/AddLeadSection.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    Briefcase,
    DollarSign,
    FileText,
    Save,
    X,
    ChevronRight,
    Check,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

import { leadService } from '@/modules/crm/services/lead.service';
import type { CreateLeadDto } from '@/modules/crm/types/crm.types';

// ✅ Define props with optional callbacks
interface AddLeadSectionProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const defaultFormData: CreateLeadDto = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    companyName: '',
    title: '',
    source: 'Website',
    status: 'New',
    priority: 'Medium',
    industry: '',
    address: '',
    city: '',
    state: '',
    country: '',
    budget: undefined,
    estimatedValue: undefined,
    expectedCloseDate: '',
    description: '',
    tags: '',
};

export default function AddLeadSection({ isOpen, onClose, onSuccess }: AddLeadSectionProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateLeadDto>(defaultFormData);
    const [activeTab, setActiveTab] = useState('personal');

    // ✅ Safe close function
    const handleSafeClose = () => {
        if (!loading) {
            if (typeof onClose === 'function') {
                onClose();
            } else {
                console.warn('onClose is not a function');
            }
        }
    };

    const handleChange = (field: keyof CreateLeadDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.firstName.trim()) {
            // Use alert or your toast system
            alert('First name is required');
            return false;
        }
        if (!formData.lastName.trim()) {
            alert('Last name is required');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            alert('Valid email is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const submitData: CreateLeadDto = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: formData.phone || undefined,
                mobile: formData.mobile || undefined,
                companyName: formData.companyName || undefined,
                title: formData.title || undefined,
                source: formData.source || 'Website',
                status: formData.status || 'New',
                priority: formData.priority || 'Medium',
                industry: formData.industry || undefined,
                address: formData.address || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                country: formData.country || undefined,
                budget: formData.budget ? Number(formData.budget) : undefined,
                estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
                expectedCloseDate: formData.expectedCloseDate
                    ? new Date(formData.expectedCloseDate).toISOString()
                    : undefined,
                description: formData.description || undefined,
                tags: formData.tags || undefined,
            };

            await leadService.createLead(submitData);
            alert('Lead created successfully!');

            if (typeof onSuccess === 'function') {
                onSuccess();
            }

            handleSafeClose();
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Failed to create lead');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormData(defaultFormData);
            setActiveTab('personal');
            setLoading(false);
        }
    }, [isOpen]);

    // ✅ Don't render if not open
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleSafeClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-indigo-50 to-white">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Add New Lead</h2>
                        <p className="text-xs text-gray-500">Enter lead details to create a new record</p>
                    </div>
                    <button
                        onClick={handleSafeClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                        type="button"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex-shrink-0 pt-3">
                            <TabsList className="grid w-full grid-cols-2 h-9">
                                <TabsTrigger value="personal" className="flex items-center gap-1.5 text-xs">
                                    <User className="h-3.5 w-3.5" />
                                    Personal Info
                                    {formData.firstName && formData.lastName && formData.email && (
                                        <Badge variant="default" className="ml-1 h-4 w-4 p-0 flex items-center justify-center">
                                            <Check className="h-2.5 w-2.5" />
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="company" className="flex items-center gap-1.5 text-xs">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    Company & Details
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Personal Info Tab */}
                        <TabsContent value="personal" className="mt-3">
                            <Card>
                                <CardContent className="p-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">
                                                First Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                                placeholder="John"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">
                                                Last Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                                placeholder="Doe"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">
                                                Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                placeholder="john@example.com"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Phone</Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                placeholder="+1 234 567 890"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Mobile</Label>
                                            <Input
                                                value={formData.mobile}
                                                onChange={(e) => handleChange('mobile', e.target.value)}
                                                placeholder="+1 234 567 890"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Job Title</Label>
                                            <Input
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                                placeholder="Sales Manager"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2 border-t">
                                        <Button
                                            onClick={() => setActiveTab('company')}
                                            className="h-8 text-sm bg-indigo-600 hover:bg-indigo-700"
                                            type="button"
                                        >
                                            Next: Company Info
                                            <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Company Tab */}
                        <TabsContent value="company" className="mt-3">
                            <Card>
                                <CardContent className="p-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Company</Label>
                                            <Input
                                                value={formData.companyName}
                                                onChange={(e) => handleChange('companyName', e.target.value)}
                                                placeholder="Acme Corp"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Industry</Label>
                                            <Select
                                                value={formData.industry}
                                                onValueChange={(value) => handleChange('industry', value)}
                                            >
                                                <SelectTrigger className="h-8 text-sm focus:ring-2 focus:ring-indigo-500">
                                                    <SelectValue placeholder="Select industry" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Technology">Technology</SelectItem>
                                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                                    <SelectItem value="Finance">Finance</SelectItem>
                                                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                                    <SelectItem value="Retail">Retail</SelectItem>
                                                    <SelectItem value="RealEstate">Real Estate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => handleChange('status', value)}
                                            >
                                                <SelectTrigger className="h-8 text-sm focus:ring-2 focus:ring-indigo-500">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="New">New</SelectItem>
                                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                                    <SelectItem value="Qualified">Qualified</SelectItem>
                                                    <SelectItem value="Proposal">Proposal</SelectItem>
                                                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Source</Label>
                                            <Select
                                                value={formData.source}
                                                onValueChange={(value) => handleChange('source', value)}
                                            >
                                                <SelectTrigger className="h-8 text-sm focus:ring-2 focus:ring-indigo-500">
                                                    <SelectValue placeholder="Select source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Website">Website</SelectItem>
                                                    <SelectItem value="Referral">Referral</SelectItem>
                                                    <SelectItem value="SocialMedia">Social Media</SelectItem>
                                                    <SelectItem value="Email">Email</SelectItem>
                                                    <SelectItem value="ColdCall">Cold Call</SelectItem>
                                                    <SelectItem value="Event">Event</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Priority</Label>
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(value) => handleChange('priority', value)}
                                            >
                                                <SelectTrigger className="h-8 text-sm focus:ring-2 focus:ring-indigo-500">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                            Address
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="md:col-span-2">
                                                <Input
                                                    value={formData.address}
                                                    onChange={(e) => handleChange('address', e.target.value)}
                                                    placeholder="123 Main St"
                                                    className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    value={formData.city}
                                                    onChange={(e) => handleChange('city', e.target.value)}
                                                    placeholder="City"
                                                    className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    value={formData.state}
                                                    onChange={(e) => handleChange('state', e.target.value)}
                                                    placeholder="State"
                                                    className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Input
                                                    value={formData.country}
                                                    onChange={(e) => handleChange('country', e.target.value)}
                                                    placeholder="Country"
                                                    className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium flex items-center gap-1.5">
                                                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                                                Budget
                                            </Label>
                                            <Input
                                                type="number"
                                                value={formData.budget || ''}
                                                onChange={(e) => handleChange('budget', e.target.value ? Number(e.target.value) : undefined)}
                                                placeholder="100000"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Est. Value</Label>
                                            <Input
                                                type="number"
                                                value={formData.estimatedValue || ''}
                                                onChange={(e) => handleChange('estimatedValue', e.target.value ? Number(e.target.value) : undefined)}
                                                placeholder="50000"
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Expected Close</Label>
                                            <Input
                                                type="date"
                                                value={formData.expectedCloseDate || ''}
                                                onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                                                className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium flex items-center gap-1.5">
                                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                                            Description
                                        </Label>
                                        <Textarea
                                            value={formData.description || ''}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            placeholder="Enter lead description, requirements, or notes..."
                                            rows={2}
                                            className="text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Tags</Label>
                                        <Input
                                            value={formData.tags || ''}
                                            onChange={(e) => handleChange('tags', e.target.value)}
                                            placeholder="enterprise, high-value, hot"
                                            className="h-8 text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-between pt-3 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveTab('personal')}
                                            className="h-8 text-sm"
                                            type="button"
                                        >
                                            ← Back
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={handleSafeClose}
                                                disabled={loading}
                                                className="h-8 text-sm"
                                                type="button"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="h-8 text-sm bg-indigo-600 hover:bg-indigo-700"
                                                type="button"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-1.5" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-3.5 w-3.5 mr-1.5" />
                                                        Create Lead
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </motion.div>
        </div>
    );
}