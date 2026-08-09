// src/pages/crm/marketingAutomation/MarketingAutomation.tsx

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
    BarChart3,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Calendar,
    Send,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Target,
    Zap,
    Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

// Types
interface CampaignStats {
    total: number;
    active: number;
    completed: number;
    draft: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    totalLeads: number;
}

interface RecentCampaign {
    id: string;
    name: string;
    type: 'Email' | 'SMS' | 'Social Media' | 'Advertisement';
    status: 'Draft' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
    sent: number;
    opens: number;
    clicks: number;
    conversions: number;
    createdAt: string;
}

// Mock data
const mockStats: CampaignStats = {
    total: 24,
    active: 5,
    completed: 12,
    draft: 7,
    openRate: 42.5,
    clickRate: 18.3,
    conversionRate: 8.7,
    totalLeads: 12500,
};

const mockRecentCampaigns: RecentCampaign[] = [
    {
        id: 'C-001',
        name: 'Summer Product Launch',
        type: 'Email',
        status: 'Active',
        sent: 2500,
        opens: 1125,
        clicks: 458,
        conversions: 210,
        createdAt: '2026-07-10T10:00:00Z',
    },
    {
        id: 'C-002',
        name: 'Customer Appreciation SMS',
        type: 'SMS',
        status: 'Completed',
        sent: 5000,
        opens: 0,
        clicks: 850,
        conversions: 320,
        createdAt: '2026-07-08T14:30:00Z',
    },
    {
        id: 'C-003',
        name: 'Social Media Campaign',
        type: 'Social Media',
        status: 'Draft',
        sent: 0,
        opens: 0,
        clicks: 0,
        conversions: 0,
        createdAt: '2026-07-12T09:15:00Z',
    },
];

const MarketingAutomation: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<CampaignStats>(mockStats);
    const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>(mockRecentCampaigns);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        // Simulate loading - replace with actual API call
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
            'Active': 'bg-green-100 text-green-700 border-green-200',
            'Paused': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Completed': 'bg-blue-100 text-blue-700 border-blue-200',
            'Cancelled': 'bg-red-100 text-red-700 border-red-200',
        };
        return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Email':
                return <Mail className="h-4 w-4" />;
            case 'SMS':
                return <MessageSquare className="h-4 w-4" />;
            case 'Social Media':
                return <Users className="h-4 w-4" />;
            default:
                return <Mail className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
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
                        <Card>
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="space-y-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-32 mt-1" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-6 w-16" />
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="space-y-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Marketing Automation</h1>
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
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => setLoading(false), 1000);
                        }}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => navigate('/crm/campaigns/add')}
                    >
                        <Plus size={16} />
                        New Campaign
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Campaigns</p>
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
                                <p className="text-sm text-purple-700 font-medium">Open Rate</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.openRate}%</p>
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
                                <p className="text-sm text-orange-700 font-medium">Conversion Rate</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.conversionRate}%</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <Zap className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200 bg-gradient-to-r from-indigo-50 to-white"
                    onClick={() => navigate('/crm/campaigns/email')}
                >
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <Mail className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Email Campaigns</h3>
                            <p className="text-sm text-gray-500">Create and manage email campaigns</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 bg-gradient-to-r from-green-50 to-white"
                    onClick={() => navigate('/crm/campaigns/sms')}
                >
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">SMS Campaigns</h3>
                            <p className="text-sm text-gray-500">Send bulk SMS campaigns</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 bg-gradient-to-r from-purple-50 to-white"
                    onClick={() => navigate('/crm/campaigns')}
                >
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">All Campaigns</h3>
                            <p className="text-sm text-gray-500">View and manage all campaigns</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Campaigns */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/crm/campaigns')}
                        >
                            View All
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Search campaigns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-36 h-9">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                                <SelectItem value="SMS">SMS</SelectItem>
                                <SelectItem value="Social Media">Social Media</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-36 h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {recentCampaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/crm/campaigns/${campaign.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-gray-100 rounded">
                                                {getTypeIcon(campaign.type)}
                                            </div>
                                            <p className="font-medium text-gray-900">{campaign.name}</p>
                                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                                {campaign.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <span>Sent: {campaign.sent.toLocaleString()}</span>
                                            {campaign.type !== 'SMS' && (
                                                <>
                                                    <span>• Opens: {campaign.opens.toLocaleString()}</span>
                                                    <span>• Clicks: {campaign.clicks.toLocaleString()}</span>
                                                </>
                                            )}
                                            <span>• Conversions: {campaign.conversions.toLocaleString()}</span>
                                            <span>• {formatDate(campaign.createdAt)}</span>
                                        </div>
                                    </div>
                                    <Badge className={getStatusBadge(campaign.status)}>
                                        {campaign.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <Sparkles className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-indigo-900">AI-Powered Suggestions</h3>
                            <p className="text-sm text-indigo-700 mt-1">
                                Based on your campaign performance, we recommend:
                            </p>
                            <ul className="text-sm text-indigo-700 mt-2 space-y-1 list-disc list-inside">
                                <li>Email campaigns with personalized subject lines have 26% higher open rates</li>
                                <li>Send SMS campaigns on weekdays between 10 AM - 2 PM for best engagement</li>
                                <li>Your best performing campaign had a conversion rate of 12.3%</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default MarketingAutomation;