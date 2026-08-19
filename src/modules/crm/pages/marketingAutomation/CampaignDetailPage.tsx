// src/pages/crm/marketingAutomation/CampaignDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    MessageSquare,
    Users,
    Calendar,
    BarChart3,
    Edit,
    Trash2,
    Copy,
    Pause,
    Play,
    Archive,
    XCircle,
    Loader2,
    Send,
    CheckCircle,
    TrendingUp,
    Target,
    DollarSign,
    Clock,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getCampaignById,
    deleteCampaign,
    duplicateCampaign,
    pauseCampaign,
    resumeCampaign,
    archiveCampaign,
    cancelCampaign,
    startCampaign,
} from '@/modules/crm/services/crm.api';
import type { Campaign } from '@/modules/crm/types/crm.types';
import ViewCampaignModal from '@/modules/crm/components/campaigns/ViewCampaignModal';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getStatusString = (status: number | string | undefined): string => {
    const statusMap: Record<number, string> = {
        1: 'Draft',
        2: 'Active',
        3: 'Paused',
        4: 'Completed',
        5: 'Cancelled',
        6: 'Archived',
        7: 'Scheduled',
    };

    if (status === undefined || status === null) return 'Unknown';

    if (typeof status === 'string') {
        const num = parseInt(status);
        if (!isNaN(num) && statusMap[num]) {
            return statusMap[num];
        }
        if (Object.values(statusMap).includes(status)) {
            return status;
        }
        return status;
    }

    return statusMap[status] || 'Unknown';
};

const getStatusBadge = (status: number | string) => {
    const statusStr = getStatusString(status);
    const variants: Record<string, string> = {
        'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
        'Active': 'bg-green-100 text-green-700 border-green-200',
        'Paused': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Completed': 'bg-blue-100 text-blue-700 border-blue-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200',
        'Archived': 'bg-gray-100 text-gray-700 border-gray-200',
        'Scheduled': 'bg-purple-100 text-purple-700 border-purple-200',
        'Unknown': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return variants[statusStr] || variants['Unknown'];
};

const getTypeString = (type: number | string | undefined): string => {
    const typeMap: Record<number, string> = {
        1: 'Email',
        2: 'Social Media',
        3: 'Advertisement',
        4: 'Event',
        5: 'Direct Mail',
        6: 'Telemarketing',
        7: 'Content Marketing',
        8: 'Other',
    };

    if (type === undefined || type === null) return 'Unknown';

    if (typeof type === 'string') {
        const num = parseInt(type);
        if (!isNaN(num) && typeMap[num]) {
            return typeMap[num];
        }
        if (Object.values(typeMap).includes(type)) {
            return type;
        }
        return type;
    }

    return typeMap[type] || 'Unknown';
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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

const CampaignDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await getCampaignById(id);
                const data = response.data?.data || response.data;
                setCampaign(data);
            } catch (error) {
                console.error('Error fetching campaign:', error);
                showToast.error('Failed to load campaign');
                navigate('/crm/campaigns');
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id, navigate]);

    const handleAction = async (action: string) => {
        if (!campaign || !id) return;

        try {
            setIsProcessing(true);
            switch (action) {
                case 'start':
                    await startCampaign(id);
                    showToast.success('Campaign started successfully');
                    break;
                case 'pause':
                    await pauseCampaign(id);
                    showToast.success('Campaign paused');
                    break;
                case 'resume':
                    await resumeCampaign(id);
                    showToast.success('Campaign resumed');
                    break;
                case 'archive':
                    await archiveCampaign(id);
                    showToast.success('Campaign archived');
                    break;
                case 'cancel':
                    if (!confirm('Are you sure you want to cancel this campaign?')) return;
                    await cancelCampaign(id);
                    showToast.success('Campaign cancelled');
                    break;
                case 'duplicate':
                    await duplicateCampaign(id);
                    showToast.success('Campaign duplicated');
                    navigate('/crm/campaigns');
                    return;
                case 'delete':
                    if (!confirm('Are you sure you want to delete this campaign?')) return;
                    await deleteCampaign(id);
                    showToast.success('Campaign deleted');
                    navigate('/crm/campaigns');
                    return;
                default:
                    return;
            }

            // Refresh campaign data
            const response = await getCampaignById(id);
            const data = response.data?.data || response.data;
            setCampaign(data);
        } catch (error: any) {
            showToast.error(error?.message || `Failed to ${action} campaign`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!campaign) {
        return null;
    }

    const statusStr = getStatusString(campaign.status);
    const typeStr = getTypeString(campaign.type);

    // Determine which actions to show
    const canStart = statusStr === 'Draft' || statusStr === 'Scheduled';
    const canPause = statusStr === 'Active';
    const canResume = statusStr === 'Paused';
    const canCancel = statusStr === 'Active' || statusStr === 'Paused' || statusStr === 'Draft' || statusStr === 'Scheduled';
    const canArchive = statusStr === 'Completed' || statusStr === 'Cancelled';
    const canEdit = statusStr === 'Draft' || statusStr === 'Scheduled' || statusStr === 'Paused';
    const canDelete = statusStr === 'Draft' || statusStr === 'Scheduled';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-6xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/campaigns')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                            <Badge className={getStatusBadge(campaign.status)}>
                                {statusStr}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{typeStr}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsViewModalOpen(true)}
                    >
                        View Details
                    </Button>
                    {canEdit && (
                        <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => navigate(`/crm/campaigns/edit/${id}`)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Target</p>
                                <p className="text-2xl font-bold">{campaign.targetCount || 0}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Leads</p>
                                <p className="text-2xl font-bold">{campaign.leadCount || 0}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Budget</p>
                                <p className="text-2xl font-bold">{formatCurrency(campaign.budget)}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="text-sm font-medium">{formatDate(campaign.createdAt)}</p>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mb-6">
                {canStart && (
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction('start')}
                        disabled={isProcessing}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Start Campaign
                    </Button>
                )}

                {canResume && (
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAction('resume')}
                        disabled={isProcessing}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Resume Campaign
                    </Button>
                )}

                {canPause && (
                    <Button
                        variant="outline"
                        className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                        onClick={() => handleAction('pause')}
                        disabled={isProcessing}
                    >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Campaign
                    </Button>
                )}

                {canArchive && (
                    <Button
                        variant="outline"
                        onClick={() => handleAction('archive')}
                        disabled={isProcessing}
                    >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                    </Button>
                )}

                {canCancel && (
                    <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleAction('cancel')}
                        disabled={isProcessing}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Campaign
                    </Button>
                )}

                <Button
                    variant="outline"
                    onClick={() => handleAction('duplicate')}
                    disabled={isProcessing}
                >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                </Button>

                {canDelete && (
                    <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleAction('delete')}
                        disabled={isProcessing}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Campaign Details</h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Name</dt>
                                <dd className="font-medium">{campaign.name}</dd>
                            </div>
                            {campaign.description && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Description</dt>
                                    <dd className="font-medium text-right">{campaign.description}</dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Type</dt>
                                <dd className="font-medium">{typeStr}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Channel</dt>
                                <dd className="font-medium">{campaign.channel || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Target Audience</dt>
                                <dd className="font-medium">{campaign.targetAudience || 'N/A'}</dd>
                            </div>
                            {campaign.startDate && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Start Date</dt>
                                    <dd className="font-medium">{formatDate(campaign.startDate)}</dd>
                                </div>
                            )}
                            {campaign.endDate && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">End Date</dt>
                                    <dd className="font-medium">{formatDate(campaign.endDate)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Status</dt>
                                <dd className="font-medium">
                                    <Badge className={getStatusBadge(campaign.status)}>
                                        {statusStr}
                                    </Badge>
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">Performance Metrics</h3>
                        <dl className="space-y-3">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Reach</dt>
                                <dd className="font-medium">{campaign.reachCount || 0}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Engagement</dt>
                                <dd className="font-medium">{campaign.engagementCount || 0}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Conversions</dt>
                                <dd className="font-medium">{campaign.conversionCount || 0}</dd>
                            </div>
                            {campaign.conversionRate !== undefined && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Conversion Rate</dt>
                                    <dd className="font-medium text-green-600">{campaign.conversionRate}%</dd>
                                </div>
                            )}
                            {campaign.engagementRate !== undefined && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Engagement Rate</dt>
                                    <dd className="font-medium text-blue-600">{campaign.engagementRate}%</dd>
                                </div>
                            )}
                            {campaign.actualCost !== undefined && campaign.actualCost > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Actual Cost</dt>
                                    <dd className="font-medium">{formatCurrency(campaign.actualCost)}</dd>
                                </div>
                            )}
                            {campaign.actualRevenue !== undefined && campaign.actualRevenue > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Actual Revenue</dt>
                                    <dd className="font-medium text-green-600">{formatCurrency(campaign.actualRevenue)}</dd>
                                </div>
                            )}
                            {campaign.roi !== undefined && campaign.roi !== 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">ROI</dt>
                                    <dd className={`font-medium ${campaign.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {campaign.roi > 0 ? '+' : ''}{campaign.roi}%
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>
            </div>

            {/* View Modal */}
            <ViewCampaignModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                campaign={campaign}
                onEdit={() => {
                    setIsViewModalOpen(false);
                    navigate(`/crm/campaigns/edit/${id}`);
                }}
                onDelete={() => {
                    setIsViewModalOpen(false);
                    handleAction('delete');
                }}
                onDuplicate={() => {
                    setIsViewModalOpen(false);
                    handleAction('duplicate');
                }}
            />
        </motion.div>
    );
};

export default CampaignDetailPage;