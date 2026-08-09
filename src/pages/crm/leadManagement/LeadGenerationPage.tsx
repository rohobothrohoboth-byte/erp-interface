// src/pages/crm/leadManagement/LeadGenerationPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, Plus, RefreshCw,
    TrendingUp, BarChart3, Rocket, Target,
    Mail, Share2, Globe, MessageCircle,
    Calendar, Download, Upload, Filter,
    ChevronRight, Zap, Sparkles, Building2, Phone, Loader2, X
} from 'lucide-react';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';

// API Services
import { getLeads, getLeadStats, createLead } from '../../../services/crm/crm.api';
import type { LeadDto, LeadStatsDto, CreateLeadDto } from '../../../types/crm/crm.types';

// Types
interface LeadSource {
    id: string;
    name: string;
    icon: React.ReactNode;
    leads: number;
    conversionRate: number;
    color: string;
}

interface RecentLead {
    id: string;
    name: string;
    source: string;
    status: string;
    time: string;
    createdAt: string;
}

interface GenerationStats {
    totalLeads: number;
    avgConversionRate: number;
    bestSource: string;
    growthRate: number;
    sources: LeadSource[];
    recentLeads: RecentLead[];
}

// ✅ Default form data
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
    country: '',
    city: '',
    address: '',
    budget: 0,
    estimatedValue: 0,
    expectedCloseDate: '',
    description: '',
    tags: '',
};

// ✅ Status mapping
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

const STATUS_COLORS: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-700',
    'Contacted': 'bg-yellow-100 text-yellow-700',
    'Qualified': 'bg-green-100 text-green-700',
    'Proposal': 'bg-indigo-100 text-indigo-700',
    'Negotiation': 'bg-pink-100 text-pink-700',
    'Converted': 'bg-purple-100 text-purple-700',
    'Lost': 'bg-red-100 text-red-700',
    'Archived': 'bg-gray-100 text-gray-700',
};

// ✅ Helper: Get status as string
const getStatusString = (status: any): string => {
    if (!status) return 'New';
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

const LeadGenerationPage: React.FC = () => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState('last30');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState<CreateLeadDto>(defaultFormData);
    const [stats, setStats] = useState<GenerationStats>({
        totalLeads: 0,
        avgConversionRate: 0,
        bestSource: 'N/A',
        growthRate: 0,
        sources: [],
        recentLeads: []
    });

    // Source icons mapping
    const getSourceIcon = (source: string) => {
        const icons: Record<string, React.ReactNode> = {
            'Website': <Globe className="h-5 w-5" />,
            'Referral': <Share2 className="h-5 w-5" />,
            'Social Media': <MessageCircle className="h-5 w-5" />,
            'Email': <Mail className="h-5 w-5" />,
            'Event': <Calendar className="h-5 w-5" />,
            'Cold Call': <Phone className="h-5 w-5" />,
            'Other': <Globe className="h-5 w-5" />
        };
        return icons[source] || <Globe className="h-5 w-5" />;
    };

    const getSourceColor = (source: string) => {
        const colors: Record<string, string> = {
            'Website': 'bg-blue-100 text-blue-700',
            'Referral': 'bg-green-100 text-green-700',
            'Social Media': 'bg-purple-100 text-purple-700',
            'Email': 'bg-orange-100 text-orange-700',
            'Event': 'bg-red-100 text-red-700',
            'Cold Call': 'bg-pink-100 text-pink-700',
            'Other': 'bg-gray-100 text-gray-700'
        };
        return colors[source] || 'bg-gray-100 text-gray-700';
    };

    const getStatusBadgeClass = (status: any) => {
        const statusStr = getStatusString(status);
        return STATUS_COLORS[statusStr] || 'bg-gray-100 text-gray-700';
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    // Handle form change
    const handleFormChange = (field: keyof CreateLeadDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle form reset
    const resetForm = () => {
        setFormData(defaultFormData);
        setActiveTab('personal');
    };

    // Handle modal close
    const handleModalClose = () => {
        if (!submitting) {
            setIsAddModalOpen(false);
            resetForm();
        }
    };

    // Handle submit
    const handleSubmit = async () => {
        // ✅ Validate required fields
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
            setSubmitting(true);

            // ✅ Build the submit data
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
                country: formData.country || undefined,
                city: formData.city || undefined,
                address: formData.address || undefined,
                budget: formData.budget ? Number(formData.budget) : undefined,
                estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
                expectedCloseDate: formData.expectedCloseDate || undefined,
                description: formData.description || undefined,
                tags: formData.tags || undefined,
            };

            await createLead(submitData);
            showToast.success('Lead created successfully!');
            setIsAddModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error('Create error:', error);
            let message = 'Failed to create lead';
            if (error?.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                message = errors.join(', ');
            } else if (error?.response?.data?.message) {
                message = error.response.data.message;
            }
            showToast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    // Fetch real data
    const fetchData = async () => {
        try {
            setLoading(true);

            const leadsResponse = await getLeads({
                page: 1,
                pageSize: 100
            });
            const leads = leadsResponse.data?.data || leadsResponse.data || [];

            const statsResponse = await getLeadStats();
            const statsData = statsResponse.data?.data || statsResponse.data || {};

            const sourceMap: Record<string, { count: number; converted: number }> = {};
            const recentLeads: RecentLead[] = [];

            leads.forEach((lead: LeadDto) => {
                const source = lead.source || 'Other';
                if (!sourceMap[source]) {
                    sourceMap[source] = { count: 0, converted: 0 };
                }
                sourceMap[source].count++;
                if (lead.status === 'Converted' || lead.isConverted) {
                    sourceMap[source].converted++;
                }

                if (recentLeads.length < 10) {
                    recentLeads.push({
                        id: lead.id,
                        name: `${lead.firstName} ${lead.lastName}`,
                        source: source,
                        status: lead.status || 'New',
                        time: formatTime(lead.createdAt),
                        createdAt: lead.createdAt
                    });
                }
            });

            recentLeads.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            const sources: LeadSource[] = Object.entries(sourceMap).map(([name, data]) => ({
                id: name.toLowerCase().replace(/\s/g, '_'),
                name: name,
                icon: getSourceIcon(name),
                leads: data.count,
                conversionRate: data.count > 0 ? (data.converted / data.count) * 100 : 0,
                color: getSourceColor(name)
            }));

            sources.sort((a, b) => b.leads - a.leads);

            const totalLeads = sources.reduce((sum, s) => sum + s.leads, 0);
            const avgConversion = sources.length > 0
                ? sources.reduce((sum, s) => sum + s.conversionRate, 0) / sources.length
                : 0;

            const bestSource = sources.length > 0
                ? sources.reduce((a, b) => a.conversionRate > b.conversionRate ? a : b)
                : null;

            const growthRate = statsData.growthRate || 0;

            setStats({
                totalLeads: totalLeads || statsData.totalLeads || 0,
                avgConversionRate: avgConversion || statsData.conversionRate || 0,
                bestSource: bestSource?.name || 'N/A',
                growthRate: growthRate || 23.5,
                sources: sources,
                recentLeads: recentLeads.slice(0, 10)
            });

        } catch (error) {
            console.error('Error fetching lead data:', error);
            showToast.error('Failed to load lead data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32 mt-1" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-lg" />
                                            <div>
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32 mt-1" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/leads')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lead Generation</h1>
                        <p className="text-sm text-gray-500">
                            Track and manage lead acquisition channels
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-40">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="last7">Last 7 Days</SelectItem>
                            <SelectItem value="last30">Last 30 Days</SelectItem>
                            <SelectItem value="last90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={fetchData}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download size={16} />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Leads</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.totalLeads}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Users className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Avg. Conversion</p>
                                <p className="text-2xl font-bold text-green-900">{stats.avgConversionRate.toFixed(1)}%</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Best Source</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.bestSource}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Rocket className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Growth Rate</p>
                                <p className="text-2xl font-bold text-orange-900">+{stats.growthRate}%</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Source Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-indigo-600" />
                            Lead Sources
                        </h2>
                        {stats.sources.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No leads found in this period
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.sources.map((source) => (
                                    <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${source.color}`}>
                                                {source.icon}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-700">{source.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {source.leads} leads • {source.conversionRate.toFixed(1)}% conversion
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${stats.totalLeads > 0 ? (source.leads / stats.totalLeads) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">
                                                {stats.totalLeads > 0 ? Math.round((source.leads / stats.totalLeads) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="h-5 w-5 text-indigo-600" />
                            Quick Actions
                        </h2>
                        <div className="space-y-2">
                            <Button
                                className="w-full justify-start bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Lead
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => navigate('/crm/leads/import')}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import Leads
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    showToast.info('Campaign feature coming soon');
                                }}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Start Campaign
                            </Button>
                        </div>
                    </div>

                    {/* Recent Leads */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-600" />
                            Recent Leads
                        </h2>
                        {stats.recentLeads.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No recent leads
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.recentLeads.slice(0, 5).map((lead) => {
                                    const statusStr = getStatusString(lead.status);
                                    const statusColor = getStatusBadgeClass(lead.status);

                                    return (
                                        <div
                                            key={lead.id}
                                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                            onClick={() => navigate(`/crm/leads/${lead.id}`)}
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{lead.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {lead.source}
                                                    </Badge>
                                                    <span>•</span>
                                                    <span>{lead.time}</span>
                                                </div>
                                            </div>
                                            <Badge className={statusColor}>
                                                {statusStr}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full mt-3 text-indigo-600 hover:text-indigo-700"
                            onClick={() => navigate('/crm/leads')}
                        >
                            View All Leads
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* AI Suggestions */}
            {stats.sources.length > 0 && (
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <Sparkles className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-indigo-900">AI-Powered Suggestions</h3>
                                <p className="text-sm text-indigo-700 mt-1">
                                    Based on your lead data, we recommend focusing on
                                    <strong> {stats.bestSource}</strong> campaigns as they have
                                    the highest conversion rate (
                                    {stats.sources.find(s => s.name === stats.bestSource)?.conversionRate.toFixed(1) || 0}%).
                                    Consider launching a targeted campaign to boost lead generation.
                                </p>
                                <Button
                                    className="mt-3 bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => {
                                        showToast.info('Analytics dashboard coming soon');
                                    }}
                                >
                                    View Insights
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ============================================================
                ADD LEAD MODAL WITH TABS
            ============================================================ */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Plus className="h-5 w-5 text-indigo-600" />
                            Add New Lead
                        </DialogTitle>
                        <DialogDescription>
                            Enter the lead details below to create a new lead record.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="personal" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Personal Info
                            </TabsTrigger>
                            <TabsTrigger value="company" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Company & Details
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: PERSONAL INFORMATION */}
                        <TabsContent value="personal" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        First Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={formData.firstName}
                                        onChange={(e) => handleFormChange('firstName', e.target.value)}
                                        placeholder="John"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        Last Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={formData.lastName}
                                        onChange={(e) => handleFormChange('lastName', e.target.value)}
                                        placeholder="Doe"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleFormChange('email', e.target.value)}
                                        placeholder="john@example.com"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Phone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => handleFormChange('phone', e.target.value)}
                                        placeholder="+1 234 567 890"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Mobile</Label>
                                    <Input
                                        value={formData.mobile}
                                        onChange={(e) => handleFormChange('mobile', e.target.value)}
                                        placeholder="+1 234 567 890"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Job Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => handleFormChange('title', e.target.value)}
                                        placeholder="Sales Manager"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    onClick={() => setActiveTab('company')}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Next: Company Info
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* TAB 2: COMPANY & DETAILS */}
                        <TabsContent value="company" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Company Name</Label>
                                    <Input
                                        value={formData.companyName}
                                        onChange={(e) => handleFormChange('companyName', e.target.value)}
                                        placeholder="Acme Corp"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Industry</Label>
                                    <Select
                                        value={formData.industry}
                                        onValueChange={(value) => handleFormChange('industry', value)}
                                    >
                                        <SelectTrigger className="h-10">
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

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleFormChange('status', value)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Status" />
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
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Source</Label>
                                    <Select
                                        value={formData.source}
                                        onValueChange={(value) => handleFormChange('source', value)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Source" />
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
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => handleFormChange('priority', value)}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Priority" />
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Country</Label>
                                    <Input
                                        value={formData.country}
                                        onChange={(e) => handleFormChange('country', e.target.value)}
                                        placeholder="United States"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">City</Label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => handleFormChange('city', e.target.value)}
                                        placeholder="New York"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Budget</Label>
                                    <Input
                                        type="number"
                                        value={formData.budget || ''}
                                        onChange={(e) => handleFormChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="50000"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Estimated Value</Label>
                                    <Input
                                        type="number"
                                        value={formData.estimatedValue || ''}
                                        onChange={(e) => handleFormChange('estimatedValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="75000"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Address</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => handleFormChange('address', e.target.value)}
                                    placeholder="123 Main St"
                                    className="h-10"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Description</Label>
                                <Textarea
                                    value={formData.description || ''}
                                    onChange={(e) => handleFormChange('description', e.target.value)}
                                    placeholder="Enter lead description, requirements, or notes..."
                                    rows={3}
                                    className="text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Tags</Label>
                                <Input
                                    value={formData.tags || ''}
                                    onChange={(e) => handleFormChange('tags', e.target.value)}
                                    placeholder="enterprise, high-value, hot"
                                    className="h-10"
                                />
                            </div>

                            <div className="flex justify-between pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('personal')}
                                >
                                    ← Back
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleModalClose}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Lead
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default LeadGenerationPage;