// src/pages/crm/marketingAutomation/SMSCampaignsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare,
    Send,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Copy,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Loader2,
    FileText,
} from 'lucide-react';
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { showToast } from '@/shared/layout/layout';
import {
    getSmsCampaigns,
    deleteSmsCampaign,
    duplicateSmsCampaign,
    sendSmsCampaign,
} from '@/modules/crm/services/crm.api';
import type { SMSCampaign } from '@/modules/crm/types/crm.types';

const ITEMS_PER_PAGE = 10;

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

const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
        'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
        'Scheduled': 'bg-purple-100 text-purple-700 border-purple-200',
        'Sending': 'bg-blue-100 text-blue-700 border-blue-200',
        'Sent': 'bg-green-100 text-green-700 border-green-200',
        'Failed': 'bg-red-100 text-red-700 border-red-200',
        'Paused': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Draft': return <FileText className="h-3 w-3" />;
        case 'Scheduled': return <Calendar className="h-3 w-3" />;
        case 'Sending': return <Send className="h-3 w-3" />;
        case 'Sent': return <CheckCircle className="h-3 w-3" />;
        case 'Failed': return <XCircle className="h-3 w-3" />;
        case 'Paused': return <Clock className="h-3 w-3" />;
        default: return <MessageSquare className="h-3 w-3" />;
    }
};

const SMSCampaignsPage: React.FC = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<SMSCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCampaign, setSelectedCampaign] = useState<SMSCampaign | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, [currentPage]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
            };
            if (filterStatus !== 'all') params.status = filterStatus;
            if (searchTerm) params.search = searchTerm;

            const response = await getSmsCampaigns(params);
            const data = response.data?.data || response.data || [];
            setCampaigns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching SMS campaigns:', error);
            showToast.error('Failed to load SMS campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await deleteSmsCampaign(selectedCampaign.id);
            showToast.success('SMS campaign deleted successfully');
            setIsDeleteModalOpen(false);
            fetchCampaigns();
        } catch (error) {
            showToast.error('Failed to delete SMS campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDuplicate = async () => {
        if (!selectedCampaign) return;
        try {
            setIsProcessing(true);
            await duplicateSmsCampaign(selectedCampaign.id);
            showToast.success('SMS campaign duplicated successfully');
            setIsDuplicateModalOpen(false);
            fetchCampaigns();
        } catch (error) {
            showToast.error('Failed to duplicate SMS campaign');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSend = async (campaign: SMSCampaign) => {
        try {
            setIsSending(true);
            await sendSmsCampaign(campaign.id);
            showToast.success('SMS campaign sent successfully');
            fetchCampaigns();
        } catch (error) {
            showToast.error('Failed to send SMS campaign');
        } finally {
            setIsSending(false);
        }
    };

    const handleView = (campaign: SMSCampaign) => {
        navigate(`/crm/campaigns/sms/${campaign.id}`);
    };

    const handleEdit = (campaign: SMSCampaign) => {
        navigate(`/crm/campaigns/sms/edit/${campaign.id}`);
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const search = searchTerm.toLowerCase();
        return campaign.name?.toLowerCase().includes(search) ||
            campaign.message?.toLowerCase().includes(search);
    });

    const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const stats = {
        total: campaigns.length,
        sent: campaigns.filter(c => c.status === 'Sent').length,
        scheduled: campaigns.filter(c => c.status === 'Scheduled').length,
        draft: campaigns.filter(c => c.status === 'Draft').length,
        sending: campaigns.filter(c => c.status === 'Sending').length,
    };

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-32 mt-1" /></div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex-1"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32 mt-1" /></div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-16" /><Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg"><MessageSquare className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">SMS Campaigns</h1>
                        <p className="text-sm text-gray-500">Create and manage SMS marketing campaigns</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={fetchCampaigns}>
                        <RefreshCw size={16} /> Refresh
                    </Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2" onClick={() => navigate('/crm/campaigns/sms/add')}>
                        <Plus size={16} /> New Campaign
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total', value: stats.total, icon: MessageSquare, color: 'blue' },
                    { title: 'Sent', value: stats.sent, icon: CheckCircle, color: 'green' },
                    { title: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'purple' },
                    { title: 'Draft', value: stats.draft, icon: FileText, color: 'orange' },
                ].map((stat, index) => (
                    <Card key={index} className={`bg-gradient-to-r from-${stat.color}-50 to-${stat.color}-100 border-${stat.color}-200`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm text-${stat.color}-700 font-medium`}>{stat.title}</p>
                                    <p className={`text-2xl font-bold text-${stat.color}-900`}>{stat.value}</p>
                                </div>
                                <div className={`p-3 bg-${stat.color}-200 rounded-lg`}>
                                    <stat.icon className={`h-6 w-6 text-${stat.color}-700`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input placeholder="Search SMS campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {['Draft', 'Scheduled', 'Sending', 'Sent', 'Failed', 'Paused'].map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); fetchCampaigns(); }} className="flex items-center gap-2">
                    Clear Filters
                </Button>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedCampaigns.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No SMS campaigns found</h3>
                        <p className="text-gray-500">Create your first SMS marketing campaign.</p>
                        <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/crm/campaigns/sms/add')}>
                            <Plus className="h-4 w-4 mr-2" /> Create Campaign
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recipients</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent Date</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedCampaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleView(campaign)}>
                                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{campaign.name}</p></td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{campaign.message}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={`${getStatusBadge(campaign.status)} flex items-center gap-1 w-fit`}>
                                            {getStatusIcon(campaign.status)} {campaign.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">{campaign.recipientCount || 0}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(campaign.sentAt)}</td>
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleView(campaign)}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                                                {(campaign.status === 'Draft' || campaign.status === 'Scheduled') && (
                                                    <DropdownMenuItem onClick={() => handleEdit(campaign)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                                                )}
                                                {(campaign.status === 'Draft' || campaign.status === 'Scheduled') && (
                                                    <DropdownMenuItem onClick={() => handleSend(campaign)} disabled={isSending}>
                                                        <Send className="h-4 w-4 mr-2" /> {isSending ? 'Sending...' : 'Send Now'}
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => { setSelectedCampaign(campaign); setIsDuplicateModalOpen(true); }}>
                                                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedCampaign(campaign); setIsDeleteModalOpen(true); }}>
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {paginatedCampaigns.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" /> Delete SMS Campaign</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this SMS campaign? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    {selectedCampaign && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedCampaign.name}</p>
                                <p className="text-sm text-gray-500">{selectedCampaign.message}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
                            {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" /> Delete Campaign</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Duplicate Modal */}
            <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600"><Copy className="h-5 w-5" /> Duplicate SMS Campaign</DialogTitle>
                        <DialogDescription>Create a copy of this SMS campaign with all its settings.</DialogDescription>
                    </DialogHeader>
                    {selectedCampaign && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedCampaign.name}</p>
                                <p className="text-sm text-gray-500">{selectedCampaign.message}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDuplicateModalOpen(false)}>Cancel</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleDuplicate} disabled={isProcessing}>
                            {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Duplicating...</> : <><Copy className="h-4 w-4 mr-2" /> Duplicate Campaign</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default SMSCampaignsPage;