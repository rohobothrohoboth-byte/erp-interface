// src/pages/crm/leadManagement/LeadConversion.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    RefreshCw,
    Users,
    UserPlus,
    CheckCircle,
    XCircle,
    AlertCircle,
    Star,
    Calendar,
    DollarSign,
    Building2,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Tag,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    TrendingUp,
    BarChart3,
    Award,
    Clock,
    Zap,
    Sparkles,
} from 'lucide-react';
import { getLeads, convertLeadToCustomer } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { LeadDto } from '@/modules/crm/types/crm.types';

// ============================================================
// CONSTANTS & HELPERS
// ============================================================

const ITEMS_PER_PAGE = 10;

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

// ✅ Correct priority mapping
const PRIORITY_MAP: Record<number, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
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

// ✅ Helper: Check if lead is truly converted
const isTrulyConverted = (lead: LeadDto): boolean => {
    const status = getStatusString(lead.status);
    return status === 'Converted' && lead.isConverted === true;
};

// ✅ Helper: Get display status for conversion
const getDisplayStatus = (lead: LeadDto): string => {
    const status = getStatusString(lead.status);
    if (status === 'Converted' && lead.isConverted === true) {
        return 'Converted';
    }
    return status;
};

// ✅ Helper: Get full name
const getFullName = (lead: LeadDto) => {
    if (lead.fullName) return lead.fullName;
    return `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown';
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

// ✅ Helper: Get initials
const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

// ✅ Helper: Get score label
const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const LeadConversion: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<LeadDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [converting, setConverting] = useState(false);
    const [activeTab, setActiveTab] = useState('converted');

    // Stats
    const [stats, setStats] = useState({
        readyForConversion: 0,
        totalConverted: 0,
        avgConversionScore: 0,
        conversionRate: 0,
        totalLeads: 0,
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const params: any = { page: 1, pageSize: 200 };
            const response = await getLeads(params);
            let data = response.data?.data || response.data || [];
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

        const readyForConversion = leadsData.filter(l => {
            const status = getStatusString(l.status);
            return status === 'Qualified' && !isTrulyConverted(l);
        }).length;

        const totalConverted = leadsData.filter(l => isTrulyConverted(l)).length;

        const convertedLeads = leadsData.filter(l => isTrulyConverted(l));
        const avgConversionScore = convertedLeads.length > 0
            ? Math.round(convertedLeads.reduce((sum, l) => sum + (l.score || 0), 0) / convertedLeads.length)
            : 0;

        const conversionRate = total > 0 ? Math.round((totalConverted / total) * 100) : 0;

        setStats({
            readyForConversion,
            totalConverted,
            avgConversionScore,
            conversionRate,
            totalLeads: total,
        });
    };

    const handleConvert = async () => {
        if (!selectedLead) return;
        try {
            setConverting(true);
            await convertLeadToCustomer(selectedLead.id);
            showToast.success(`Lead "${getFullName(selectedLead)}" converted to customer successfully`);
            setIsConvertModalOpen(false);
            await fetchLeads();
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Conversion failed';
            showToast.error(message);
        } finally {
            setConverting(false);
        }
    };

    const getStatusBadge = (status: string, isConverted: boolean = false) => {
        if (isConverted || status === 'Converted') {
            return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Converted</Badge>;
        }
        return <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}>{status}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        return <Badge className={PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700'}>{priority}</Badge>;
    };

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        const name = getFullName(lead).toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const company = (lead.companyName || '').toLowerCase();
        const displayStatus = getDisplayStatus(lead);
        const isConverted = isTrulyConverted(lead);

        const matchesSearch = name.includes(search) || email.includes(search) || company.includes(search);

        let matchesTab = true;
        switch (activeTab) {
            case 'qualified':
                matchesTab = displayStatus === 'Qualified' && !isConverted;
                break;
            case 'converted':
                matchesTab = isConverted;
                break;
            case 'all':
                matchesTab = true;
                break;
            default:
                matchesTab = true;
        }

        const matchesStatus = filterStatus === 'All' || displayStatus === filterStatus;

        return matchesSearch && matchesTab && matchesStatus;
    });

    const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                                <Skeleton className="h-8 w-20" />
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/leads')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lead Conversion</h1>
                        <p className="text-sm text-gray-500">
                            Convert qualified leads into customers
                        </p>
                    </div>
                </div>
                <Button
                    onClick={fetchLeads}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Ready for Conversion</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.readyForConversion}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <UserPlus className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Total Converted</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats.totalConverted}</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-lg">
                                <Users className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Avg. Conversion Score</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.avgConversionScore}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Star className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Conversion Rate</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.conversionRate}%</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="qualified" className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        Qualified
                        <Badge variant="secondary" className="ml-1">
                            {leads.filter(l => {
                                const status = getStatusString(l.status);
                                return status === 'Qualified' && !isTrulyConverted(l);
                            }).length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="converted" className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        Converted
                        <Badge variant="secondary" className="ml-1">
                            {leads.filter(l => isTrulyConverted(l)).length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="all" className="flex items-center gap-2">
                        <Users size={16} />
                        All Leads
                        <Badge variant="secondary" className="ml-1">
                            {leads.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search leads by name, email, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('All');
                        setActiveTab('all');
                        fetchLeads();
                    }}
                    className="flex items-center gap-2"
                >
                    <XCircle size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedLeads.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    {activeTab === 'qualified'
                                        ? 'No qualified leads ready for conversion'
                                        : activeTab === 'converted'
                                            ? 'No leads have been converted yet'
                                            : 'No leads found'}
                                </td>
                            </tr>
                        ) : (
                            paginatedLeads.map((lead) => {
                                const displayStatus = getDisplayStatus(lead);
                                const isConverted = isTrulyConverted(lead);
                                const isQualified = displayStatus === 'Qualified' && !isConverted;
                                // ✅ Convert priority to string
                                const displayPriority = getPriorityString(lead.priority);

                                return (
                                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                                                    {getInitials(lead.firstName, lead.lastName)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {getFullName(lead)}
                                                    </p>
                                                    {lead.companyName && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Building2 size={12} />
                                                            {lead.companyName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Mail size={14} className="text-gray-400" />
                                                {lead.email}
                                            </p>
                                            {lead.phone && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {lead.phone}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isConverted ? (
                                                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Converted
                                                </Badge>
                                            ) : displayStatus === 'Qualified' ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                                    Qualified
                                                </Badge>
                                            ) : (
                                                <Badge className={STATUS_COLORS[displayStatus] || 'bg-gray-100 text-gray-700'}>
                                                    {displayStatus}
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getPriorityBadge(displayPriority)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-indigo-600">
                                            {formatCurrency(lead.estimatedValue || lead.budget)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center">
                                                    <span className={`font-medium ${lead.score >= 70 ? 'text-green-600' : lead.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {lead.score || 0}
                                                    </span>
                                                <span className="text-xs text-gray-400">
                                                        {getScoreLabel(lead.score || 0)}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {isQualified ? (
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={() => {
                                                        setSelectedLead(lead);
                                                        setIsConvertModalOpen(true);
                                                    }}
                                                >
                                                    <UserPlus className="h-4 w-4 mr-1" />
                                                    Convert
                                                </Button>
                                            ) : isConverted ? (
                                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Converted
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-500 border-gray-200 px-3 py-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Not Ready
                                                </Badge>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredLeads.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{' '}
                            <span className="font-medium text-gray-700">{Math.min(startIndex + ITEMS_PER_PAGE, filteredLeads.length)}</span> of{' '}
                            <span className="font-medium text-gray-700">{filteredLeads.length}</span> leads
                            {searchTerm && ` (filtered by "${searchTerm}")`}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Convert Modal */}
            <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600">
                            <UserPlus className="h-5 w-5" />
                            Convert Lead to Customer
                        </DialogTitle>
                        <DialogDescription>
                            Convert this qualified lead into a customer record.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLead && (
                        <div className="py-4 space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-lg">
                                        {getInitials(selectedLead.firstName, selectedLead.lastName)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {getFullName(selectedLead)}
                                        </p>
                                        <p className="text-sm text-gray-500">{selectedLead.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-200">
                                    <div>
                                        <span className="text-gray-500">Company:</span>
                                        <span className="font-medium ml-1">{selectedLead.companyName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Value:</span>
                                        <span className="font-medium ml-1">{formatCurrency(selectedLead.estimatedValue || selectedLead.budget)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <span className="ml-1">
                                            {getStatusBadge(getDisplayStatus(selectedLead), isTrulyConverted(selectedLead))}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Priority:</span>
                                        <span className="ml-1 font-medium">
                                            {getPriorityString(selectedLead.priority)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Score:</span>
                                        <span className={`font-medium ml-1 ${(selectedLead.score || 0) >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {selectedLead.score || 0}
                                        </span>
                                    </div>
                                    {selectedLead.phone && (
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Phone:</span>
                                            <span className="ml-1">{selectedLead.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                This will create a new customer record with the lead's information.
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleConvert}
                            disabled={converting}
                        >
                            {converting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Convert to Customer
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Suggestions */}
            {stats.totalLeads > 0 && (
                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-100 rounded-lg">
                                <Sparkles className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-emerald-900">AI-Powered Insights</h3>
                                <p className="text-sm text-emerald-700 mt-1">
                                    {stats.readyForConversion > 0 ? (
                                        <>
                                            You have <strong>{stats.readyForConversion}</strong> qualified leads ready for conversion.
                                            {stats.totalConverted > 0 && (
                                                <> You've successfully converted <strong>{stats.totalConverted}</strong> leads with an average score of <strong>{stats.avgConversionScore}</strong>.</>
                                            )}
                                        </>
                                    ) : stats.totalConverted > 0 ? (
                                        <>
                                            Great job! You've converted <strong>{stats.totalConverted}</strong> leads.
                                            {stats.readyForConversion === 0 && (
                                                <> There are no qualified leads ready for conversion at the moment.</>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            Start qualifying leads to identify the best opportunities for conversion.
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
};

export default LeadConversion;