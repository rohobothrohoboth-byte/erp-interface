// src/pages/crm/leadManagement/EditLeadPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    Briefcase,
    DollarSign,
    Calendar,
    FileText,
    AlertCircle,
    Loader2,
    Tag,
    Globe,
    Users,
    Award,
    ArrowRight,
    ChevronLeft,
    X
} from 'lucide-react';
import { getLeadById, updateLead } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
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
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { LeadDto, UpdateLeadDto } from '@/modules/crm/types/crm.types';

// ============================================================
// CONSTANTS & HELPERS
// ============================================================

// ✅ Correct status mapping based on backend enum
const STATUS_MAP: Record<number, string> = {
    1: 'New',
    2: 'Contacted',
    3: 'Qualified',
    4: 'Proposal',
    5: 'Negotiation',
    6: 'Converted',
    7: 'Lost',
    8: 'Archived',
};

const STATUS_OPTIONS = [
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Proposal', label: 'Proposal' },
    { value: 'Negotiation', label: 'Negotiation' },
    { value: 'Converted', label: 'Converted' },
    { value: 'Lost', label: 'Lost' },
    { value: 'Archived', label: 'Archived' },
];

const PRIORITY_MAP: Record<number, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
};

const PRIORITY_OPTIONS = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' },
];

const SOURCE_MAP: Record<number, string> = {
    1: 'Website',
    2: 'Referral',
    3: 'SocialMedia',
    4: 'Email',
    5: 'ColdCall',
    6: 'Event',
    7: 'Other',
};

const SOURCE_OPTIONS = [
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'SocialMedia', label: 'Social Media' },
    { value: 'Email', label: 'Email' },
    { value: 'ColdCall', label: 'Cold Call' },
    { value: 'Event', label: 'Event' },
    { value: 'Other', label: 'Other' },
];

const INDUSTRY_MAP: Record<number, string> = {
    1: 'Technology',
    2: 'Healthcare',
    3: 'Finance',
    4: 'Manufacturing',
    5: 'Retail',
    6: 'RealEstate',
    7: 'Education',
    8: 'Hospitality',
    9: 'Other',
};

const INDUSTRY_OPTIONS = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' },
    { value: 'RealEstate', label: 'Real Estate' },
    { value: 'Education', label: 'Education' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Other', label: 'Other' },
];

// ✅ Helper: Get status as string
const getStatusString = (status: any): string => {
    if (!status && status !== 0) return 'New';
    if (typeof status === 'string') {
        const num = parseInt(status);
        if (!isNaN(num) && num in STATUS_MAP) return STATUS_MAP[num];
        return status;
    }
    if (typeof status === 'number') {
        return STATUS_MAP[status] || 'New';
    }
    return String(status);
};

// ✅ Helper: Get priority as string
const getPriorityString = (priority: any): string => {
    if (!priority && priority !== 0) return 'Medium';
    if (typeof priority === 'string') {
        const num = parseInt(priority);
        if (!isNaN(num) && num in PRIORITY_MAP) return PRIORITY_MAP[num];
        return priority;
    }
    if (typeof priority === 'number') {
        return PRIORITY_MAP[priority] || 'Medium';
    }
    return String(priority);
};

// ✅ Helper: Get source as string
const getSourceString = (source: any): string => {
    if (!source) return 'Website';
    if (typeof source === 'string') {
        const num = parseInt(source);
        if (!isNaN(num) && num in SOURCE_MAP) return SOURCE_MAP[num];
        return source;
    }
    if (typeof source === 'number') {
        return SOURCE_MAP[source] || 'Website';
    }
    return String(source);
};

// ✅ Helper: Get industry as string
const getIndustryString = (industry: any): string => {
    if (!industry) return '';
    if (typeof industry === 'string') {
        const num = parseInt(industry);
        if (!isNaN(num) && num in INDUSTRY_MAP) return INDUSTRY_MAP[num];
        return industry;
    }
    if (typeof industry === 'number') {
        return INDUSTRY_MAP[industry] || '';
    }
    return String(industry);
};

// ✅ Helper: Format currency
const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
};

// ✅ Helper: Get full name
const getFullName = (lead: LeadDto) => {
    if (lead.fullName) return lead.fullName;
    return `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown';
};

// ✅ Helper: Get initials
const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

const EditLeadPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [lead, setLead] = useState<LeadDto | null>(null);
    const [formData, setFormData] = useState<UpdateLeadDto>({});

    useEffect(() => {
        if (id) fetchLead();
    }, [id]);

    const fetchLead = async () => {
        try {
            setLoading(true);
            const response = await getLeadById(id!);
            const data = response.data?.data || response.data;
            if (data) {
                setLead(data);
                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    companyName: data.companyName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    mobile: data.mobile || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    country: data.country || '',
                    status: getStatusString(data.status),
                    source: getSourceString(data.source),
                    priority: getPriorityString(data.priority),
                    industry: getIndustryString(data.industry),
                    title: data.title || '',
                    description: data.description || '',
                    budget: data.budget,
                    estimatedValue: data.estimatedValue,
                    expectedCloseDate: data.expectedCloseDate
                        ? new Date(data.expectedCloseDate).toISOString().split('T')[0]
                        : '',
                    tags: data.tags || '',
                    propertyType: data.propertyType || '',
                    propertyPrice: data.propertyPrice,
                    propertyLocation: data.propertyLocation || '',
                    propertySize: data.propertySize,
                    productCategory: data.productCategory || '',
                    orderQuantity: data.orderQuantity,
                    requiredDeliveryDate: data.requiredDeliveryDate
                        ? new Date(data.requiredDeliveryDate).toISOString().split('T')[0]
                        : '',
                    tenderNumber: data.tenderNumber || '',
                    tenderDeadline: data.tenderDeadline
                        ? new Date(data.tenderDeadline).toISOString().split('T')[0]
                        : '',
                    department: data.department || '',
                });
            }
        } catch (error) {
            console.error('Error fetching lead:', error);
            showToast.error('Failed to load lead');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof UpdateLeadDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        // Validate required fields
        if (!formData.firstName?.trim()) {
            showToast.error('First name is required');
            return;
        }
        if (!formData.lastName?.trim()) {
            showToast.error('Last name is required');
            return;
        }
        if (!formData.email?.trim()) {
            showToast.error('Email is required');
            return;
        }

        try {
            setSaving(true);

            // ✅ Convert status string to number for backend
            const statusNumber = Object.keys(STATUS_MAP).find(
                key => STATUS_MAP[Number(key)] === formData.status
            );
            const priorityNumber = Object.keys(PRIORITY_MAP).find(
                key => PRIORITY_MAP[Number(key)] === formData.priority
            );
            const sourceNumber = Object.keys(SOURCE_MAP).find(
                key => SOURCE_MAP[Number(key)] === formData.source
            );
            const industryNumber = Object.keys(INDUSTRY_MAP).find(
                key => INDUSTRY_MAP[Number(key)] === formData.industry
            );

            const updateData: UpdateLeadDto = {
                id: id,
                firstName: formData.firstName?.trim(),
                lastName: formData.lastName?.trim(),
                email: formData.email?.trim(),
                phone: formData.phone || undefined,
                mobile: formData.mobile || undefined,
                companyName: formData.companyName || undefined,
                title: formData.title || undefined,
                source: sourceNumber || '1',
                status: statusNumber || '1',
                priority: priorityNumber || '2',
                industry: industryNumber || undefined,
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
                propertyType: formData.propertyType || undefined,
                propertyPrice: formData.propertyPrice ? Number(formData.propertyPrice) : undefined,
                propertyLocation: formData.propertyLocation || undefined,
                propertySize: formData.propertySize ? Number(formData.propertySize) : undefined,
                productCategory: formData.productCategory || undefined,
                orderQuantity: formData.orderQuantity ? Number(formData.orderQuantity) : undefined,
                requiredDeliveryDate: formData.requiredDeliveryDate
                    ? new Date(formData.requiredDeliveryDate).toISOString()
                    : undefined,
                tenderNumber: formData.tenderNumber || undefined,
                tenderDeadline: formData.tenderDeadline
                    ? new Date(formData.tenderDeadline).toISOString()
                    : undefined,
                department: formData.department || undefined,
            };

            await updateLead(id, updateData);
            showToast.success('Lead updated successfully');
            navigate(`/crm/leads/${id}`);
        } catch (error: any) {
            console.error('Error updating lead:', error);
            let message = 'Failed to update lead';
            if (error?.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                message = errors.join(', ');
            } else if (error?.response?.data?.message) {
                message = error.response.data.message;
            }
            showToast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="text-sm text-gray-500">Loading lead data...</p>
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Lead not found</h2>
                    <p className="text-gray-500">The lead you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/crm/leads')} className="mt-4">
                        Back to Leads
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6 max-w-5xl mx-auto"
        >
            {/* ============================================================
                HEADER
            ============================================================ */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/crm/leads/${id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Edit Lead
                            <Badge variant="secondary" className="text-xs">
                                {lead && getFullName(lead)}
                            </Badge>
                        </h1>
                        <p className="text-sm text-gray-500">
                            Update lead information • ID: {id?.slice(0, 8)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/crm/leads/${id}`)}
                        className="h-10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="h-10 bg-indigo-600 hover:bg-indigo-700"
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

            {/* ============================================================
                TABS
            ============================================================ */}
            <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex-shrink-0">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="personal" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Personal Info
                            </TabsTrigger>
                            <TabsTrigger value="company" className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Company & Details
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ============================================================
                        TAB 1: PERSONAL INFORMATION
                    ============================================================ */}
                    <TabsContent value="personal" className="mt-4 space-y-4">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">
                                            First Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            value={formData.firstName || ''}
                                            onChange={(e) => handleChange('firstName', e.target.value)}
                                            placeholder="John"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">
                                            Last Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            value={formData.lastName || ''}
                                            onChange={(e) => handleChange('lastName', e.target.value)}
                                            placeholder="Doe"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder="john@example.com"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Phone</Label>
                                        <Input
                                            value={formData.phone || ''}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder="+1 234 567 890"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Mobile</Label>
                                        <Input
                                            value={formData.mobile || ''}
                                            onChange={(e) => handleChange('mobile', e.target.value)}
                                            placeholder="+1 234 567 890"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Job Title</Label>
                                        <Input
                                            value={formData.title || ''}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            placeholder="Sales Manager"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        type="button"
                                        onClick={() => setActiveTab('company')}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Next: Company Info
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ============================================================
                        TAB 2: COMPANY & DETAILS
                    ============================================================ */}
                    <TabsContent value="company" className="mt-4 space-y-4">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Company Name</Label>
                                        <Input
                                            value={formData.companyName || ''}
                                            onChange={(e) => handleChange('companyName', e.target.value)}
                                            placeholder="Acme Corp"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Industry</Label>
                                        <Select
                                            value={formData.industry || undefined}
                                            onValueChange={(value) => handleChange('industry', value)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select industry" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {INDUSTRY_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Status</Label>
                                        <Select
                                            value={formData.status || undefined}
                                            onValueChange={(value) => handleChange('status', value)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Source</Label>
                                        <Select
                                            value={formData.source || undefined}
                                            onValueChange={(value) => handleChange('source', value)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SOURCE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Priority</Label>
                                        <Select
                                            value={formData.priority || undefined}
                                            onValueChange={(value) => handleChange('priority', value)}
                                        >
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRIORITY_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        Address
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <Input
                                                value={formData.address || ''}
                                                onChange={(e) => handleChange('address', e.target.value)}
                                                placeholder="123 Main St"
                                                className="h-10 focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                value={formData.city || ''}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                                placeholder="City"
                                                className="h-10 focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                value={formData.state || ''}
                                                onChange={(e) => handleChange('state', e.target.value)}
                                                placeholder="State"
                                                className="h-10 focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                value={formData.country || ''}
                                                onChange={(e) => handleChange('country', e.target.value)}
                                                placeholder="Country"
                                                className="h-10 focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                            Budget
                                        </Label>
                                        <Input
                                            type="number"
                                            value={formData.budget || ''}
                                            onChange={(e) => handleChange('budget', e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="100000"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Est. Value</Label>
                                        <Input
                                            type="number"
                                            value={formData.estimatedValue || ''}
                                            onChange={(e) => handleChange('estimatedValue', e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="50000"
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            Expected Close
                                        </Label>
                                        <Input
                                            type="date"
                                            value={formData.expectedCloseDate || ''}
                                            onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                                            className="h-10 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        Description
                                    </Label>
                                    <Textarea
                                        value={formData.description || ''}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Enter lead description, requirements, or notes..."
                                        rows={3}
                                        className="text-sm focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-gray-400" />
                                        Tags
                                    </Label>
                                    <Input
                                        value={formData.tags || ''}
                                        onChange={(e) => handleChange('tags', e.target.value)}
                                        placeholder="enterprise, high-value, hot"
                                        className="h-10 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex justify-between pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setActiveTab('personal')}
                                        className="h-10"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="h-10 bg-indigo-600 hover:bg-indigo-700"
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
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </motion.div>
    );
};

export default EditLeadPage;