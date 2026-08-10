// src/pages/hr/recruitmentpage/interview/InterviewsPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Users,
    Plus,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    MapPin,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useInterviews, useCancelInterview, useDeleteInterview } from '@/modules/hr/services/recruitment/interview/interview.queries';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ✅ Simple status mapping
const getStatusDisplay = (status: any): string => {
    const statusMap: Record<string, string> = {
        '0': 'Scheduled',
        '1': 'In Progress',
        '2': 'Completed',
        '3': 'Cancelled',
        '4': 'Rescheduled',
        '5': 'No Show',
    };
    return statusMap[String(status)] || String(status) || 'Unknown';
};

// ✅ Simple status badge
const getStatusBadge = (status: any) => {
    const displayStatus = getStatusDisplay(status);

    const styles: Record<string, string> = {
        'Scheduled': 'bg-blue-100 text-blue-700 border-blue-200',
        'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Completed': 'bg-green-100 text-green-700 border-green-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200',
        'Rescheduled': 'bg-purple-100 text-purple-700 border-purple-200',
        'No Show': 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <Badge className={`border ${styles[displayStatus] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {displayStatus}
        </Badge>
    );
};

const InterviewsPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: interviews = [], isLoading, error, refetch } = useInterviews({});
    const cancelMutation = useCancelInterview();
    const deleteMutation = useDeleteInterview();

    console.log('Interviews:', interviews);

    const formatDate = (date: string | undefined) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy h:mm a');
        } catch {
            return 'Invalid date';
        }
    };
// In InterviewsPage.tsx or InterviewDetail.tsx

    const handleCancel = (id: string) => {
        // ✅ Call the UpdateStatus endpoint with "Cancelled"
        updateStatusMutation.mutate({
            id: id,
            status: 'Cancelled'
        }, {
            onSuccess: () => {
                toast.success('Interview cancelled successfully');
                refetch();
            },
            onError: (error) => {
                toast.error('Failed to cancel interview');
                console.error('Error cancelling interview:', error);
            }
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this interview?')) {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    toast.success('Deleted');
                    refetch();
                },
                onError: () => toast.error('Failed to delete'),
            });
        }
    };

    // ✅ Simple filtering
    const filtered = interviews.filter((i: any) => {
        const status = getStatusDisplay(i.status);
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            (i.applicantName?.toLowerCase() || '').includes(search) ||
            (i.interviewType?.toLowerCase() || '').includes(search) ||
            (i.position?.toLowerCase() || '').includes(search);

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'scheduled') return matchesSearch && status === 'Scheduled';
        if (activeTab === 'completed') return matchesSearch && status === 'Completed';
        if (activeTab === 'cancelled') return matchesSearch && status === 'Cancelled';
        return matchesSearch;
    });

    // ✅ Stats
    const total = interviews.length;
    const scheduled = interviews.filter((i: any) => getStatusDisplay(i.status) === 'Scheduled').length;
    const completed = interviews.filter((i: any) => getStatusDisplay(i.status) === 'Completed').length;
    const cancelled = interviews.filter((i: any) => getStatusDisplay(i.status) === 'Cancelled').length;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                <span className="mt-4 text-gray-600">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Error</h2>
                <p className="text-gray-500">{(error as Error)?.message}</p>
                <Button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white">
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Interviews
                    </h1>
                    <p className="text-sm text-gray-500">Manage scheduled interviews</p>
                </div>
                <Button
                    onClick={() => navigate('/hr/recruitment/interviews/schedule')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Interview
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold">{total}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Scheduled</p>
                        <p className="text-2xl font-bold">{scheduled}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold">{completed}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Cancelled</p>
                        <p className="text-2xl font-bold">{cancelled}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Search by applicant, type, or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No interviews found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((interview: any) => (
                                <div
                                    key={interview.id}
                                    className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900">
                                                    {interview.applicantName || 'N/A'}
                                                </h3>
                                                {getStatusBadge(interview.status)}
                                                <Badge variant="outline" className="text-xs">
                                                    {interview.interviewType || 'N/A'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(interview.scheduledDate)}
                                                </span>
                                                {interview.position && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {interview.position}
                                                    </span>
                                                )}
                                                {interview.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {interview.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/hr/recruitment/interviews/${interview.id}`)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/hr/recruitment/interviews/${interview.id}/edit`)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {getStatusDisplay(interview.status) !== 'Completed' &&
                                                        getStatusDisplay(interview.status) !== 'Cancelled' && (
                                                            <DropdownMenuItem onClick={() => handleCancel(interview.id)} className="text-yellow-600">
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        )}
                                                    <DropdownMenuItem onClick={() => handleDelete(interview.id)} className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default InterviewsPage;