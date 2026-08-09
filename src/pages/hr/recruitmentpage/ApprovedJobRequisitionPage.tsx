// src/pages/hr/recruitment/ApprovedJobRequisitionPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, X, Megaphone, FileText,
    Eye, Edit, Trash2, Send, MoreVertical,
    ChevronLeft, ChevronRight, Loader2,
    RefreshCw, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useJobRequisitions } from '../../../services/hr/recruitment/jobRequisition/jobRequisition.queries';
import { useCreateJobPosting, useCreateAllJobPosting } from '../../../services/hr/recruitment/jobPosting/jobPosting.queries';
import { useJobPostings } from '../../../services/hr/recruitment/jobPosting/jobPosting.queries';
import { useAuthStore } from '../../../stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ApprovedJobRequisitionPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequisition, setSelectedRequisition] = useState<string | null>(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const { data: allRequisitions = [], isLoading, refetch } = useJobRequisitions('all');
    const { data: jobPostings, refetch: refetchPostings } = useJobPostings();

    const createPostingMutation = useCreateJobPosting({
        onSuccess: () => {
            toast.success('Job posting created successfully');
            setShowPostModal(false);
            refetch();
            refetchPostings();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create job posting');
        }
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

    // Filter only approved requisitions
    const approvedRequisitions = allRequisitions.filter(req =>
        req.statusStr === 'Approved' || req.statusStr === 'Approve'
    );

    const filteredRequisitions = approvedRequisitions.filter(req => {
        const searchLower = searchTerm.toLowerCase();
        return req.reqNumber?.toLowerCase().includes(searchLower) ||
            req.reqReason?.toLowerCase().includes(searchLower) ||
            req.position?.toLowerCase().includes(searchLower);
    });

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            'Approved': { label: 'Approved', className: 'bg-green-100 text-green-700' },
            'Approve': { label: 'Approved', className: 'bg-green-100 text-green-700' },
            'Pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
            'Rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        };
        const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
        return <Badge className={info.className}>{info.label}</Badge>;
    };

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const handleCreatePosting = async (requisitionId: string) => {
        if (!isHR) {
            toast.error('You do not have permission to create postings');
            return;
        }

        setActionLoading(true);
        try {
            await createPostingMutation.mutateAsync({
                id: requisitionId,
                postType: '0',
                deadlineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Approved Job Requisitions</h1>
                    <p className="text-sm text-gray-500 mt-1">Create job postings from approved requisitions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-l-4 border-green-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Approved</p>
                        <p className="text-2xl font-bold text-green-600">{approvedRequisitions.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Pending Posting</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {approvedRequisitions.filter(r =>
                                !jobPostings?.some(jp => jp.reqNumber === r.reqNumber)
                            ).length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-emerald-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Posted</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {approvedRequisitions.filter(r =>
                                jobPostings?.some(jp => jp.reqNumber === r.reqNumber)
                            ).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by req number, reason, or position..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Req Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No approved requisitions found
                                    </td>
                                </tr>
                            ) : (
                                filteredRequisitions.map((req) => {
                                    const isPosted = jobPostings?.some(jp => jp.reqNumber === req.reqNumber);
                                    const posting = jobPostings?.find(jp => jp.reqNumber === req.reqNumber);

                                    return (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">
                                                {req.reqNumber}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                                                {req.reqReason}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{req.position}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-center">{req.reqQuantity}</td>
                                            <td className="px-4 py-3">{getStatusBadge(req.statusStr)}</td>
                                            <td className="px-4 py-3">
                                                {isPosted ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Posted
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
                                                        <Clock className="w-3 h-3" />
                                                        Not Posted
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {isPosted ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/recruitment/job-posting/${posting?.id}`)}
                                                        className="text-blue-600"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1" />
                                                        View Posting
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleCreatePosting(req.id)}
                                                        disabled={actionLoading || !isHR}
                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                    >
                                                        {actionLoading ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                                        ) : (
                                                            <Send className="w-3.5 h-3.5 mr-1" />
                                                        )}
                                                        Create Posting
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ApprovedJobRequisitionPage;