// src/pages/crm/marketingAutomation/CampaignsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    RefreshCw,
    Plus,
    Search,
    Filter,
    Mail,
    MessageSquare,
    Users,
    Target,
    Loader2,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Send,
    CheckCircle,
    TrendingUp,
    Calendar,
    Clock,
    FileText,
    Copy,
    Pause,
    Play,
    Archive,
    XCircle,
    Zap,
    BarChart3,
    Phone,
    Megaphone,
    PenTool,
} from 'lucide-react';
import {
    getCampaigns,
    deleteCampaign,
    pauseCampaign,
    resumeCampaign,
    archiveCampaign,
    duplicateCampaign,
    startCampaign,
    cancelCampaign
} from '../../../services/crm/crm.api';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '../../../components/ui/dropdown-menu';
import type { Campaign } from '../../../types/crm/crm.types';
import ViewCampaignModal from '../../../components/crm/campaigns/ViewCampaignModal';
import AddCampaignModal from '../../../components/crm/campaigns/AddCampaignModal';
import EditCampaignModal from '../../../components/crm/campaigns/EditCampaignModal';

const ITEMS_PER_PAGE = 10;

// ============================================================
// CAMPAIGN MAPPINGS - FIXED to match backend enums
// ============================================================

// ✅ CORRECTED: Match backend CampaignStatus enum (1-7)
const CampaignStatusMap: Record<number, string> = {
    1: 'Draft',
    2: 'Active',
    3: 'Paused',
    4: 'Completed',
    5: 'Cancelled',
    6: 'Archived',
    7: 'Scheduled',
};

// ✅ CORRECTED: Match backend CampaignType enum (1-8)
const CampaignTypeMap: Record<number, string> = {
    1: 'Email',
    2: 'Social Media',
    3: 'Advertisement',
    4: 'Event',
    5: 'Direct Mail',
    6: 'Telemarketing',
    7: 'Content Marketing',
    8: 'Other',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getStatusString = (status: number | string | undefined): string => {
    if (status === undefined || status === null) return 'Unknown';

    if (typeof status === 'string') {
        const num = parseInt(status);
        if (!isNaN(num) && CampaignStatusMap[num]) {
            return CampaignStatusMap[num];
        }
        if (Object.values(CampaignStatusMap).includes(status)) {
            return status;
        }
        return status;
    }

    return CampaignStatusMap[status] || 'Unknown';
};

const getTypeString = (type: number | string | undefined): string => {
    if (type === undefined || type === null) return 'Unknown';

    if (typeof type === 'string') {
        const num = parseInt(type);
        if (!isNaN(num) && CampaignTypeMap[num]) {
            return CampaignTypeMap[num];
        }
        if (Object.values(CampaignTypeMap).includes(type)) {
            return type;
        }
        return type;
    }

    return CampaignTypeMap[type] || 'Unknown';
};

const getTypeIcon = (type: number | string) => {
    const typeStr = getTypeString(type);
    switch (typeStr) {
        case 'Email':
            return <Mail className="h-4 w-4" />;
        case 'Social Media':
            return <Users className="h-4 w-4" />;
        case 'Advertisement':
            return <Megaphone className="h-4 w-4" />;
        case 'Event':
            return <Calendar className="h-4 w-4" />;
        case 'Direct Mail':
            return <Mail className="h-4 w-4" />;
        case 'Telemarketing':
            return <Phone className="h-4 w-4" />;
        case 'Content Marketing':
            return <PenTool className="h-4 w-4" />;
        default:
            return <Mail className="h-4 w-4" />;
    }
};

const getStatusBadgeVariant = (status: number | string) => {
    const statusStr = getStatusString(status);
    const variants: Record<string, string> = {
        'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
        'Active': 'bg-green-100 text-green-700 border-green-200',
        'Paused': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Completed': 'bg-blue-100 text-blue-700 border-blue-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200',
        'Archived': 'bg-gray-100 text-gray-700 border-gray-200',
        'Scheduled': 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return variants[statusStr] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status: number | string) => {
    const statusStr = getStatusString(status);
    switch (statusStr) {
        case 'Active':
            return <Send className="h-3 w-3" />;
        case 'Draft':
            return <FileText className="h-3 w-3" />;
        case 'Paused':
            return <Pause className="h-3 w-3" />;
        case 'Completed':
            return <CheckCircle className="h-3 w-3" />;
        case 'Cancelled':
            return <XCircle className="h-3 w-3" />;
        case 'Archived':
            return <Archive className="h-3 w-3" />;
        case 'Scheduled':
            return <Calendar className="h-3 w-3" />;
        default:
            return <Clock className="h-3 w-3" />;
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};

const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const CampaignsPage: React.FC = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'pause' | 'resume' | 'archive' | 'cancel' | 'start' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }
            if (filterType !== 'all') {
                params.type = filterType;
            }
            if (searchTerm) params.search = searchTerm;

            const response = await getCampaigns(params);
            const data = response.data?.data || response.data || [];
            setCampaigns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            showToast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await deleteCampaign(selectedCampaign.id);
            showToast.success('Campaign deleted successfully');
            setIsDeleteModalOpen(false);
            setIsViewModalOpen(false);
            fetchCampaigns();
        } catch (error) {
            showToast.error('Failed to delete campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDuplicate = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await duplicateCampaign(selectedCampaign.id);
            showToast.success('Campaign duplicated successfully');
            setIsDuplicateModalOpen(false);
            fetchCampaigns();
        } catch (error) {
            showToast.error('Failed to duplicate campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStartCampaign = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await startCampaign(selectedCampaign.id);
            showToast.success('Campaign started successfully');
            setIsActionModalOpen(false);
            fetchCampaigns();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to start campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePauseCampaign = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await pauseCampaign(selectedCampaign.id);
            showToast.success('Campaign paused successfully');
            setIsActionModalOpen(false);
            fetchCampaigns();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to pause campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResumeCampaign = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await resumeCampaign(selectedCampaign.id);
            showToast.success('Campaign resumed successfully');
            setIsActionModalOpen(false);
            fetchCampaigns();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to resume campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleArchiveCampaign = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await archiveCampaign(selectedCampaign.id);
            showToast.success('Campaign archived successfully');
            setIsActionModalOpen(false);
            fetchCampaigns();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to archive campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelCampaign = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await cancelCampaign(selectedCampaign.id);
            showToast.success('Campaign cancelled successfully');
            setIsActionModalOpen(false);
            fetchCampaigns();
        } catch (error: any) {
            showToast.error(error?.message || 'Failed to cancel campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewCampaign = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsViewModalOpen(true);
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsEditModalOpen(true);
    };

    const handleActionClick = (campaign: Campaign, action: 'pause' | 'resume' | 'archive' | 'cancel' | 'start') => {
        setSelectedCampaign(campaign);
        setActionType(action);
        setIsActionModalOpen(true);
    };

    const handleActionConfirm = () => {
        if (actionType === 'start') handleStartCampaign();
        else if (actionType === 'pause') handlePauseCampaign();
        else if (actionType === 'resume') handleResumeCampaign();
        else if (actionType === 'archive') handleArchiveCampaign();
        else if (actionType === 'cancel') handleCancelCampaign();
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const search = searchTerm.toLowerCase();
        const name = campaign.name?.toLowerCase() || '';
        const description = campaign.description?.toLowerCase() || '';
        const matchesSearch = name.includes(search) || description.includes(search);

        const statusStr = getStatusString(campaign.status);
        const typeStr = getTypeString(campaign.type);

        const matchesStatus = filterStatus === 'all' || statusStr === filterStatus;
        const matchesType = filterType === 'all' || typeStr === filterType;

        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const stats = {
        total: campaigns.length,
        active: campaigns.filter(c => getStatusString(c.status) === 'Active').length,
        completed: campaigns.filter(c => getStatusString(c.status) === 'Completed').length,
        draft: campaigns.filter(c => getStatusString(c.status) === 'Draft').length,
        paused: campaigns.filter(c => getStatusString(c.status) === 'Paused').length,
        scheduled: campaigns.filter(c => getStatusString(c.status) === 'Scheduled').length,
    };

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
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32 mt-1" />
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/marketing')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Campaigns</h1>
                        <p className="text-sm text-gray-500">
                            Manage and track all marketing campaigns
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={fetchCampaigns}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={16} />
                        New Campaign
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Target className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Active</p>
                                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <Send className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Completed</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.completed}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Draft</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.draft}</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <FileText className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Paused</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.paused}</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Pause className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Scheduled</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.scheduled}</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-lg">
                                <Calendar className="h-6 w-6 text-indigo-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Advertisement">Advertisement</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Direct Mail">Direct Mail</SelectItem>
                        <SelectItem value="Telemarketing">Telemarketing</SelectItem>
                        <SelectItem value="Content Marketing">Content Marketing</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterType('all');
                        fetchCampaigns();
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedCampaigns.length === 0 ? (
                    <div className="text-center py-12">
                        <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No campaigns found</h3>
                        <p className="text-gray-500">Create your first marketing campaign.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Campaign
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Target</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Leads</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedCampaigns.map((campaign) => {
                                const statusStr = getStatusString(campaign.status);
                                const typeStr = getTypeString(campaign.type);

                                return (
                                    <tr
                                        key={campaign.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => handleViewCampaign(campaign)}
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{campaign.name}</p>
                                                {campaign.description && (
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">
                                                        {campaign.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-gray-100 rounded">
                                                    {getTypeIcon(campaign.type)}
                                                </div>
                                                <span className="text-sm">{typeStr}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                className={`${getStatusBadgeVariant(campaign.status)} flex items-center gap-1 w-fit`}
                                            >
                                                {getStatusIcon(campaign.status)}
                                                {statusStr}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {campaign.targetCount || 0}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {campaign.leadCount || 0}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatCurrency(campaign.budget)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {formatDate(campaign.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewCampaign(campaign);
                                                    }}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditCampaign(campaign);
                                                    }}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCampaign(campaign);
                                                        setIsDuplicateModalOpen(true);
                                                    }}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <Zap className="h-4 w-4 mr-2" />
                                                            Change Status
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            {/* ✅ Only show valid actions based on current status */}
                                                            {statusStr === 'Draft' && (
                                                                <DropdownMenuItem onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleActionClick(campaign, 'start');
                                                                }}>
                                                                    <Play className="h-4 w-4 mr-2 text-green-600" />
                                                                    Start Campaign
                                                                </DropdownMenuItem>
                                                            )}
                                                            {statusStr === 'Active' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleActionClick(campaign, 'pause');
                                                                    }}>
                                                                        <Pause className="h-4 w-4 mr-2 text-yellow-600" />
                                                                        Pause Campaign
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleActionClick(campaign, 'cancel');
                                                                    }} className="text-red-600">
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        Cancel Campaign
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {statusStr === 'Paused' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleActionClick(campaign, 'resume');
                                                                    }}>
                                                                        <Play className="h-4 w-4 mr-2 text-green-600" />
                                                                        Resume Campaign
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleActionClick(campaign, 'cancel');
                                                                    }} className="text-red-600">
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        Cancel Campaign
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {statusStr === 'Scheduled' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleActionClick(campaign, 'start');
                                                                    }}>
                                                                        <Play className="h-4 w-4 mr-2 text-green-600" />
                                                                        Start Now
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleActionClick(campaign, 'cancel');
                                                                    }} className="text-red-600">
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        Cancel Campaign
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {(statusStr === 'Completed' || statusStr === 'Cancelled') && (
                                                                <DropdownMenuItem onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleActionClick(campaign, 'archive');
                                                                }}>
                                                                    <Archive className="h-4 w-4 mr-2 text-gray-600" />
                                                                    Archive
                                                                </DropdownMenuItem>
                                                            )}
                                                            {statusStr === 'Archived' && (
                                                                <DropdownMenuItem disabled className="text-gray-400">
                                                                    <Archive className="h-4 w-4 mr-2" />
                                                                    Already Archived
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCampaign(campaign);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
                {paginatedCampaigns.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Campaign Modal */}
            <ViewCampaignModal
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
                campaign={selectedCampaign}
                onEdit={() => {
                    setIsViewModalOpen(false);
                    if (selectedCampaign) {
                        handleEditCampaign(selectedCampaign);
                    }
                }}
                onDelete={() => {
                    setIsViewModalOpen(false);
                    setIsDeleteModalOpen(true);
                }}
                onDuplicate={() => {
                    setIsViewModalOpen(false);
                    if (selectedCampaign) {
                        setSelectedCampaign(selectedCampaign);
                        setIsDuplicateModalOpen(true);
                    }
                }}
            />

            {/* Add Campaign Modal */}
            <AddCampaignModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSuccess={fetchCampaigns}
            />

            {/* Edit Campaign Modal */}
            <EditCampaignModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                campaign={selectedCampaign}
                onSuccess={() => {
                    fetchCampaigns();
                    setIsEditModalOpen(false);
                }}
            />

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Campaign
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this campaign? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCampaign && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedCampaign.name}</p>
                                <p className="text-sm text-gray-500">{getTypeString(selectedCampaign.type)}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Campaign
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Duplicate Modal */}
            <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600">
                            <Copy className="h-5 w-5" />
                            Duplicate Campaign
                        </DialogTitle>
                        <DialogDescription>
                            Create a copy of this campaign with all its settings.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCampaign && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedCampaign.name}</p>
                                <p className="text-sm text-gray-500">{getTypeString(selectedCampaign.type)}</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                The new campaign will be created with status "Draft".
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDuplicateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleDuplicate}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Duplicating...
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate Campaign
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Action Modal */}
            <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {actionType === 'start' && <Play className="h-5 w-5 text-green-600" />}
                            {actionType === 'pause' && <Pause className="h-5 w-5 text-yellow-600" />}
                            {actionType === 'resume' && <Play className="h-5 w-5 text-green-600" />}
                            {actionType === 'archive' && <Archive className="h-5 w-5 text-gray-600" />}
                            {actionType === 'cancel' && <XCircle className="h-5 w-5 text-red-600" />}
                            {actionType === 'start' && 'Start Campaign'}
                            {actionType === 'pause' && 'Pause Campaign'}
                            {actionType === 'resume' && 'Resume Campaign'}
                            {actionType === 'archive' && 'Archive Campaign'}
                            {actionType === 'cancel' && 'Cancel Campaign'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'start' && 'Are you sure you want to start this campaign? It will begin sending to the target audience.'}
                            {actionType === 'pause' && 'Are you sure you want to pause this campaign? It will stop sending until resumed.'}
                            {actionType === 'resume' && 'Are you sure you want to resume this campaign? It will continue sending.'}
                            {actionType === 'archive' && 'Are you sure you want to archive this campaign? It will be hidden from active views.'}
                            {actionType === 'cancel' && 'Are you sure you want to cancel this campaign? This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCampaign && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedCampaign.name}</p>
                                <p className="text-sm text-gray-500">
                                    Current status: {getStatusString(selectedCampaign.status)}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleActionConfirm}
                            disabled={isProcessing}
                            className={
                                actionType === 'start' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                    actionType === 'resume' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                        actionType === 'pause' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                                            actionType === 'archive' ? 'bg-gray-600 hover:bg-gray-700 text-white' :
                                                'bg-red-600 hover:bg-red-700 text-white'
                            }
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {actionType === 'start' && <Play className="h-4 w-4 mr-2" />}
                                    {actionType === 'pause' && <Pause className="h-4 w-4 mr-2" />}
                                    {actionType === 'resume' && <Play className="h-4 w-4 mr-2" />}
                                    {actionType === 'archive' && <Archive className="h-4 w-4 mr-2" />}
                                    {actionType === 'cancel' && <XCircle className="h-4 w-4 mr-2" />}
                                    {actionType === 'start' && 'Start Campaign'}
                                    {actionType === 'pause' && 'Pause Campaign'}
                                    {actionType === 'resume' && 'Resume Campaign'}
                                    {actionType === 'archive' && 'Archive Campaign'}
                                    {actionType === 'cancel' && 'Cancel Campaign'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default CampaignsPage;