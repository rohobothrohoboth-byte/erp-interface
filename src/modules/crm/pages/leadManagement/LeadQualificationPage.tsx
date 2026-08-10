// src/pages/crm/leadManagement/LeadQualificationPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Users,
    Star,
    TrendingUp,
    Filter,
    Search,
    Plus,
    User,
    Mail,
    Phone,
    Building2,
    RefreshCw,
    Loader2,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
    Eye,
    Edit,
    MoreVertical,
    BarChart3,
    PieChart,
    Download,
    Calendar,
    Zap,
    Target,
    Award,
    GitBranch,

    Settings,
} from 'lucide-react';
import { getLeads, updateLead } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type { LeadDto, UpdateLeadDto } from '@/modules/crm/types/crm.types';

// ============================================================
// CONSTANTS & HELPERS
// ============================================================

// ✅ Correct mapping based on backend enum
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
    'New': 'bg-blue-100 text-blue-700 border-blue-200',
    'Contacted': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Qualified': 'bg-green-100 text-green-700 border-green-200',
    'Proposal': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Negotiation': 'bg-pink-100 text-pink-700 border-pink-200',
    'Converted': 'bg-purple-100 text-purple-700 border-purple-200',
    'Lost': 'bg-red-100 text-red-700 border-red-200',
    'Archived': 'bg-gray-100 text-gray-700 border-gray-200',
};

const PRIORITY_MAP: Record<number, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
};

const PRIORITY_COLORS: Record<string, string> = {
    'Low': 'bg-blue-100 text-blue-700 border-blue-200',
    'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'High': 'bg-orange-100 text-orange-700 border-orange-200',
    'Urgent': 'bg-red-100 text-red-700 border-red-200',
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

// ✅ Helper: Check if lead is truly converted
const isTrulyConverted = (lead: LeadDto): boolean => {
    const status = getStatusString(lead.status);
    return status === 'Converted' && lead.isConverted === true;
};

// ✅ Helper: Get priority as string
const getPriorityString = (priority: any): string => {
    if (!priority) return 'Medium';
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

// ✅ Helper: Get full name
const getFullName = (lead: LeadDto) => {
    if (lead.fullName) return lead.fullName;
    return `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown';
};

// ✅ Helper: Format date
const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
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

// ✅ Helper: Get score color
const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
};

// ✅ Helper: Get score label
const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
};

// ✅ Helper: Get display status for qualification
const getQualificationStatus = (lead: LeadDto): string => {
    const status = getStatusString(lead.status);
    if (status === 'Converted' && lead.isConverted === true) {
        return 'Converted';
    }
    if (status === 'Lost') {
        return 'Lost';
    }
    if (status === 'Qualified') {
        return 'Qualified';
    }
    if (status === 'New' || status === 'Contacted') {
        return 'Pending';
    }
    return status;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const LeadQualificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<LeadDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('pending');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        qualified: 0,
        lost: 0,
        pending: 0,
        converted: 0,
        conversionRate: 0,
        avgScore: 0,
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await getLeads({ page: 1, pageSize: 100 });
            const data = response.data?.data || response.data || [];
            setLeads(Array.isArray(data) ? data : []);
            calculateStats(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
            showToast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (leadsData: LeadDto[]) => {
        const total = leadsData.length;
        const qualified = leadsData.filter(l => {
            const status = getStatusString(l.status);
            return status === 'Qualified' && !isTrulyConverted(l);
        }).length;
        const lost = leadsData.filter(l => getStatusString(l.status) === 'Lost').length;
        const converted = leadsData.filter(l => isTrulyConverted(l)).length;
        const pending = leadsData.filter(l => {
            const status = getStatusString(l.status);
            return (status === 'New' || status === 'Contacted') && !isTrulyConverted(l);
        }).length;
        const avgScore = total > 0
            ? Math.round(leadsData.reduce((acc, l) => acc + (l.score || 0), 0) / total)
            : 0;
        const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

        setStats({ total, qualified, lost, pending, converted, conversionRate, avgScore });
    };

    const handleQualify = async (lead: LeadDto, qualified: boolean) => {
        const currentStatus = getStatusString(lead.status);

        if (qualified && currentStatus === 'Qualified') {
            showToast.info('Lead is already qualified');
            return;
        }
        if (!qualified && currentStatus === 'Lost') {
            showToast.info('Lead is already lost');
            return;
        }
        if (isTrulyConverted(lead)) {
            showToast.info('Cannot modify converted lead');
            return;
        }

        try {
            setUpdating(lead.id);
            const newStatus = qualified ? 3 : 7;

            const updateData: UpdateLeadDto = {
                id: lead.id,
                status: String(newStatus),
            };

            await updateLead(lead.id, updateData);
            showToast.success(`Lead ${qualified ? 'qualified' : 'marked as lost'} successfully`);
            await fetchLeads();
        } catch (error: any) {
            console.error('Update error:', error);
            const message = error?.response?.data?.message || 'Failed to update lead';
            showToast.error(message);
        } finally {
            setUpdating(null);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        const name = getFullName(lead).toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const company = (lead.companyName || '').toLowerCase();
        const status = getStatusString(lead.status).toLowerCase();
        const source = (lead.source || '').toLowerCase();
        const qualificationStatus = getQualificationStatus(lead);

        const matchesSearch = name.includes(search) || email.includes(search) || company.includes(search);
        const matchesStatus = statusFilter === 'all' || status === statusFilter.toLowerCase();
        const matchesSource = sourceFilter === 'all' || source === sourceFilter.toLowerCase();

        let matchesTab = true;
        switch (activeTab) {
            case 'pending':
                matchesTab = qualificationStatus === 'Pending';
                break;
            case 'qualified':
                matchesTab = qualificationStatus === 'Qualified';
                break;
            case 'lost':
                matchesTab = qualificationStatus === 'Lost';
                break;
            case 'converted':
                matchesTab = qualificationStatus === 'Converted';
                break;
            default:
                matchesTab = true;
        }

        return matchesSearch && matchesStatus && matchesSource && matchesTab;
    });

    const getStatusBadge = (status: string) => {
        return <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}>{status}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        return <Badge className={PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700'}>{priority}</Badge>;
    };

    // Loading state
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
                    <Skeleton className="h-10 w-24" />
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
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24 mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
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
            {/* ============================================================
                HEADER
            ============================================================ */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/leads')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lead Qualification</h1>
                        <p className="text-sm text-gray-500">
                            Review and qualify leads based on their score and fit
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLeads}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {/* Export logic */}}
                    >
                        <Download size={16} />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => navigate('/crm/leads/add')}
                    >
                        <Plus size={16} />
                        New Lead
                    </Button>
                </div>
            </div>

            {/* ============================================================
                STATS CARDS
            ============================================================ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
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
                                <p className="text-sm text-green-700 font-medium">Qualified</p>
                                <p className="text-2xl font-bold text-green-900">{stats.qualified}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Lost</p>
                                <p className="text-2xl font-bold text-red-900">{stats.lost}</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Converted</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.converted}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Avg Score</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.avgScore}</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <Star className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ============================================================
                FILTERS
            ============================================================ */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search leads by name, email, or company..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="proposal">Proposal</SelectItem>
                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="referral">Referral</SelectItem>
                                <SelectItem value="social media">Social Media</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="event">Event</SelectItem>
                                <SelectItem value="cold call">Cold Call</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Filter size={16} />
                            More Filters
                        </Button>

                        {(searchTerm || statusFilter !== 'all' || sourceFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setSourceFilter('all');
                                }}
                                className="text-red-500 hover:text-red-600"
                            >
                                <XCircle size={16} className="mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ============================================================
                TABS
            ============================================================ */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock size={16} />
                        Pending
                        <Badge variant="secondary" className="ml-1">
                            {leads.filter(l => {
                                const status = getQualificationStatus(l);
                                return status === 'Pending';
                            }).length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="qualified" className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        Qualified
                        <Badge variant="secondary" className="ml-1">
                            {leads.filter(l => {
                                const status = getQualificationStatus(l);
                                return status === 'Qualified';
                            }).length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="lost" className="flex items-center gap-2">
                        <XCircle size={16} />
                        Lost
                        <Badge variant="secondary" className="ml-1">
                            {leads.filter(l => getQualificationStatus(l) === 'Lost').length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="converted" className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        Converted
                        <Badge variant="secondary" className="ml-1">
                            {leads.filter(l => getQualificationStatus(l) === 'Converted').length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* ============================================================
                LEADS LIST
            ============================================================ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredLeads.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No leads found</h3>
                        <p className="text-gray-500">
                            {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Start by creating a new lead'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && sourceFilter === 'all' && (
                            <Button
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => navigate('/crm/leads/add')}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Lead
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredLeads.map((lead) => {
                            const status = getStatusString(lead.status);
                            const priority = getPriorityString(lead.priority);
                            const qualificationStatus = getQualificationStatus(lead);
                            const isQualified = qualificationStatus === 'Qualified';
                            const isLost = qualificationStatus === 'Lost';
                            const isConverted = qualificationStatus === 'Converted';
                            const isPending = qualificationStatus === 'Pending';
                            const isQualifiedByScore = (lead.score || 0) >= 70;

                            return (
                                <motion.div
                                    key={lead.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4"
                                >
                                    {/* Left - Lead Info */}
                                    <div className="flex items-start gap-4 flex-1 min-w-0 w-full md:w-auto">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-indigo-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium text-gray-900">
                                                    {getFullName(lead)}
                                                </p>
                                                {getStatusBadge(qualificationStatus)}
                                                {getPriorityBadge(priority)}
                                                <Badge
                                                    variant="outline"
                                                    className={`font-medium ${getScoreColor(lead.score || 0)}`}
                                                >
                                                    Score: {lead.score || 0} ({getScoreLabel(lead.score || 0)})
                                                </Badge>
                                                {!isQualified && !isLost && !isConverted && isQualifiedByScore && (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Auto-Qualified
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {lead.email || 'No email'}
                                                </span>
                                                {lead.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {lead.phone}
                                                    </span>
                                                )}
                                                {lead.companyName && (
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {lead.companyName}
                                                    </span>
                                                )}
                                                {lead.estimatedValue && (
                                                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                                        <BarChart3 className="h-3 w-3" />
                                                        {formatCurrency(lead.estimatedValue)}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    <Calendar className="h-3 w-3 inline mr-1" />
                                                    {formatDate(lead.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right - Actions */}
                                    <div className="flex items-center gap-2 ml-auto md:ml-0 flex-wrap">
                                        {isPending && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                                    onClick={() => handleQualify(lead, true)}
                                                    disabled={updating === lead.id}
                                                >
                                                    {updating === lead.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <ThumbsUp className="h-4 w-4 mr-1" />
                                                            Qualify
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleQualify(lead, false)}
                                                    disabled={updating === lead.id}
                                                >
                                                    {updating === lead.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <ThumbsDown className="h-4 w-4 mr-1" />
                                                            Lost
                                                        </>
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                        {isQualified && (
                                            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Qualified
                                            </Badge>
                                        )}
                                        {isLost && (
                                            <Badge className="bg-red-100 text-red-700 border-red-200 px-3 py-1">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Lost
                                            </Badge>
                                        )}
                                        {isConverted && (
                                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                Converted
                                            </Badge>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => navigate(`/crm/leads/${lead.id}`)}
                                            className="hover:bg-gray-100"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" variant="ghost" className="hover:bg-gray-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => navigate(`/crm/leads/${lead.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => navigate(`/crm/leads/edit/${lead.id}`)}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Lead
                                                </DropdownMenuItem>
                                                {isPending && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => handleQualify(lead, true)}
                                                            className="text-green-600"
                                                        >
                                                            <ThumbsUp className="h-4 w-4 mr-2" />
                                                            Qualify
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleQualify(lead, false)}
                                                            className="text-red-600"
                                                        >
                                                            <ThumbsDown className="h-4 w-4 mr-2" />
                                                            Mark as Lost
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => navigate('/settings/crm/lead-scoring')}
                                                    className="text-indigo-600"
                                                >
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Configure Scoring
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ============================================================
                SUMMARY
            ============================================================ */}
            {filteredLeads.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 gap-4">
                    <p>
                        Showing <span className="font-medium text-gray-700">{filteredLeads.length}</span> of{' '}
                        <span className="font-medium text-gray-700">{leads.length}</span> leads
                        {searchTerm && ` (filtered by "${searchTerm}")`}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            Qualified: {stats.qualified}
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            Pending: {stats.pending}
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            Lost: {stats.lost}
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            Converted: {stats.converted}
                        </span>
                        <span className="flex items-center gap-1 ml-4 font-medium text-indigo-600">
                            <PieChart className="h-4 w-4" />
                            Conversion Rate: {stats.conversionRate}%
                        </span>
                        <span className="flex items-center gap-1 ml-4 font-medium text-orange-600">
                            <Star className="h-4 w-4" />
                            Avg Score: {stats.avgScore}
                        </span>
                    </div>
                </div>
            )}

            {/* ============================================================
                AI SUGGESTIONS
            ============================================================ */}
            {stats.total > 0 && (
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <Zap className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-indigo-900">AI-Powered Insights</h3>
                                <p className="text-sm text-indigo-700 mt-1">
                                    {stats.pending > 0 ? (
                                        <>
                                            You have <strong>{stats.pending}</strong> pending leads waiting for qualification.
                                            {stats.qualified > 0 && (
                                                <> Your qualification rate is <strong>{stats.qualified > 0 ? Math.round((stats.qualified / (stats.qualified + stats.lost)) * 100) : 0}%</strong>.</>
                                            )}
                                            {stats.lost > 0 && (
                                                <> Consider reviewing why <strong>{stats.lost}</strong> leads were lost to improve your qualification process.</>
                                            )}
                                            {stats.avgScore > 0 && (
                                                <> The average lead score is <strong>{stats.avgScore}</strong>.</>
                                            )}
                                        </>
                                    ) : stats.qualified > 0 ? (
                                        <>
                                            Great job! You have <strong>{stats.qualified}</strong> qualified leads.
                                            Focus on converting them to customers.
                                            {stats.converted > 0 && (
                                                <> You've already converted <strong>{stats.converted}</strong> leads.</>
                                            )}
                                            {stats.pending === 0 && (
                                                <> All leads have been processed. Great work!</>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            Start qualifying your leads to identify the best opportunities.
                                            Qualified leads have a higher chance of conversion.
                                            {stats.total > 0 && stats.avgScore > 0 && (
                                                <> The average score is <strong>{stats.avgScore}</strong>. Consider setting up scoring rules to automate this process.</>
                                            )}
                                        </>
                                    )}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                        onClick={() => navigate('/settings/crm/lead-scoring')}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Configure Scoring
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                        onClick={() => navigate('/crm/leads')}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        View All Leads
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default LeadQualificationPage;