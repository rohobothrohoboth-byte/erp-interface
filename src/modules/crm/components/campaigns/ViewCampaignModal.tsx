// src/components/crm/campaigns/ViewCampaignModal.tsx

import React from 'react';
import {
    X,
    Mail,
    MessageSquare,
    Users,
    Calendar,
    Clock,
    TrendingUp,
    BarChart3,
    CheckCircle,
    AlertCircle,
    Edit,
    Trash2,
    Send,
    Eye,
    Target,
    DollarSign,
    Activity,
    Calendar as CalendarIcon,
    UserCheck,
    Zap,
    Award,
    PieChart,
    FileText,
    Play,
    Pause,
    Archive,
    XCircle,
    Copy,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { showToast } from '@/shared/layout/layout';
import { deleteCampaign } from '@/modules/crm/services/crm.api';
import type { CampaignDto } from '@/modules/crm/types/crm.types';

interface ViewCampaignModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign: CampaignDto | null;
    onEdit?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
}

// Map numeric enum values to string representations
const CampaignStatusMap: Record<number, string> = {
    1: 'Draft',
    2: 'Active',
    3: 'Paused',
    4: 'Completed',
    5: 'Cancelled',
    6: 'Archived',
    7: 'Scheduled',
};

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

const getStatusString = (status: number | string): string => {
    if (typeof status === 'string') return status;
    return CampaignStatusMap[status] || 'Unknown';
};

const getTypeString = (type: number | string): string => {
    if (typeof type === 'string') return type;
    return CampaignTypeMap[type] || 'Unknown';
};

const ViewCampaignModal: React.FC<ViewCampaignModalProps> = ({
                                                                 open,
                                                                 onOpenChange,
                                                                 campaign,
                                                                 onEdit,
                                                                 onDelete,
                                                                 onDuplicate,
                                                             }) => {
    const [deleting, setDeleting] = React.useState(false);

    const handleDelete = async () => {
        if (!campaign) return;
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            setDeleting(true);
            await deleteCampaign(campaign.id);
            showToast.success('Campaign deleted successfully');
            onOpenChange(false);
            onDelete?.();
        } catch (error: any) {
            showToast.error(error?.response?.data?.message || 'Failed to delete campaign');
        } finally {
            setDeleting(false);
        }
    };

    if (!campaign) return null;

    // Get string representations
    const statusStr = getStatusString(campaign.status);
    const typeStr = getTypeString(campaign.type);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'Draft': 'bg-gray-100 text-gray-700',
            'Active': 'bg-green-100 text-green-700',
            'Paused': 'bg-yellow-100 text-yellow-700',
            'Completed': 'bg-blue-100 text-blue-700',
            'Cancelled': 'bg-red-100 text-red-700',
            'Archived': 'bg-gray-100 text-gray-700',
            'Scheduled': 'bg-purple-100 text-purple-700',
            'Failed': 'bg-red-100 text-red-700',
        };
        return variants[status] || 'bg-gray-100 text-gray-700';
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'sms':
                return <MessageSquare className="h-4 w-4" />;
            case 'social media':
                return <Users className="h-4 w-4" />;
            case 'event':
                return <Calendar className="h-4 w-4" />;
            case 'advertisement':
                return <TrendingUp className="h-4 w-4" />;
            case 'direct mail':
                return <Mail className="h-4 w-4" />;
            case 'telemarketing':
                return <Phone className="h-4 w-4" />;
            case 'content marketing':
                return <FileText className="h-4 w-4" />;
            default:
                return <Mail className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    };

    const progress = campaign.targetCount
        ? Math.min(Math.round(((campaign.reachCount || 0) / campaign.targetCount) * 100), 100)
        : 0;

    const StatCard = ({
                          label,
                          value,
                          icon: Icon,
                          color
                      }: {
        label: string;
        value: string | number;
        icon: React.ElementType;
        color: string;
    }) => (
        <div className="bg-white rounded-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </div>
    );

    const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
        <div className="flex flex-col">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm text-gray-900 mt-1">{value || 'N/A'}</p>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-2.5 bg-indigo-50 rounded-lg shrink-0">
                                {getTypeIcon(typeStr)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="text-lg font-semibold text-gray-900 truncate">
                                    {campaign.name}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <Badge className={getStatusBadge(statusStr)}>
                                        {statusStr}
                                    </Badge>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-sm text-gray-600">{typeStr}</span>
                                    {campaign.isActive && (
                                        <>
                                            <span className="text-xs text-gray-400">•</span>
                                            <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                                                <Activity className="h-3 w-3" />
                                                Live
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0 ml-4"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Progress */}
                    {campaign.targetCount > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-xs text-gray-500">
                                {campaign.reachCount?.toLocaleString() || 0} reached out of {campaign.targetCount.toLocaleString()} targets
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    {campaign.description && (
                        <div className="bg-gray-50 rounded-lg px-4 py-3">
                            <p className="text-sm text-gray-600 leading-relaxed">{campaign.description}</p>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard
                            label="Target"
                            value={campaign.targetCount || 0}
                            icon={Target}
                            color="bg-blue-50 text-blue-600"
                        />
                        <StatCard
                            label="Leads"
                            value={campaign.leadCount || 0}
                            icon={Users}
                            color="bg-green-50 text-green-600"
                        />
                        <StatCard
                            label="Budget"
                            value={`$${campaign.budget?.toLocaleString() || '0'}`}
                            icon={DollarSign}
                            color="bg-purple-50 text-purple-600"
                        />
                        <StatCard
                            label="Created"
                            value={formatDate(campaign.createdAt)}
                            icon={CalendarIcon}
                            color="bg-orange-50 text-orange-600"
                        />
                    </div>

                    <Separator />

                    {/* Details Grid */}
                    <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Campaign Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Target Audience" value={campaign.targetAudience || 'N/A'} />
                            <DetailItem label="Channel" value={campaign.channel || 'N/A'} />
                            <DetailItem label="Start Date" value={formatDate(campaign.startDate)} />
                            <DetailItem label="End Date" value={formatDate(campaign.endDate)} />
                        </div>
                    </div>

                    {/* Metrics */}
                    {(campaign.reachCount || campaign.engagementCount || campaign.conversionCount) && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Performance</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-blue-50 rounded-lg px-4 py-3 text-center">
                                        <p className="text-xl font-semibold text-blue-600">{campaign.reachCount || 0}</p>
                                        <p className="text-xs text-blue-600 font-medium">Reach</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg px-4 py-3 text-center">
                                        <p className="text-xl font-semibold text-green-600">{campaign.engagementCount || 0}</p>
                                        <p className="text-xs text-green-600 font-medium">Engagement</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg px-4 py-3 text-center">
                                        <p className="text-xl font-semibold text-purple-600">{campaign.conversionCount || 0}</p>
                                        <p className="text-xs text-purple-600 font-medium">Conversion</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Timeline */}
                    <Separator />
                    <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Timeline</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <div className="flex-1 flex justify-between">
                                    <span className="text-sm text-gray-700">Created</span>
                                    <span className="text-sm text-gray-500">{formatDate(campaign.createdAt)}</span>
                                </div>
                            </div>
                            {campaign.startDate && (
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1 flex justify-between">
                                        <span className="text-sm text-gray-700">Started</span>
                                        <span className="text-sm text-gray-500">{formatDate(campaign.startDate)}</span>
                                    </div>
                                </div>
                            )}
                            {campaign.endDate && (
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                    <div className="flex-1 flex justify-between">
                                        <span className="text-sm text-gray-700">Ended</span>
                                        <span className="text-sm text-gray-500">{formatDate(campaign.endDate)}</span>
                                    </div>
                                </div>
                            )}
                            {statusStr === 'Completed' && (
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1 flex justify-between">
                                        <span className="text-sm text-gray-700">Completed</span>
                                        <span className="text-sm text-gray-500">Campaign finished</span>
                                    </div>
                                </div>
                            )}
                            {statusStr === 'Cancelled' && (
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                    <div className="flex-1 flex justify-between">
                                        <span className="text-sm text-gray-700">Cancelled</span>
                                        <span className="text-sm text-gray-500">Campaign was cancelled</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onOpenChange(false);
                                    onEdit?.();
                                }}
                                className="h-9 px-3 text-sm"
                            >
                                <Edit className="h-3.5 w-3.5 mr-1.5" />
                                Edit
                            </Button>
                            {onDuplicate && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onOpenChange(false);
                                        onDuplicate?.();
                                    }}
                                    className="h-9 px-3 text-sm"
                                >
                                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                                    Duplicate
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="h-9 px-3 text-sm"
                            >
                                {deleting ? (
                                    <>
                                        <div className="h-3.5 w-3.5 mr-1.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-9 px-4 text-sm text-gray-600 hover:text-gray-900"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewCampaignModal;