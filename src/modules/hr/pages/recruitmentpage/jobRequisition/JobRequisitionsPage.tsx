// src/pages/hr/recruitmentpage/jobRequisition/JobRequisitionsPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Plus,
    Search,
    RefreshCw,
    Loader2,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Users,
    Calendar,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import {
    useJobRequisitions,
    useDeleteJobRequisition
} from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const JobRequisitionsPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedReq, setSelectedReq] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ✅ Fetch ALL requisitions (no filter)
    const { data: requisitions = [], isLoading, error, refetch } = useJobRequisitions();

    // ✅ Log the data to debug
    console.log('📊 Requisitions data:', requisitions);

    const deleteMutation = useDeleteJobRequisition({
        onSuccess: () => {
            toast.success('Requisition deleted successfully');
            setShowDeleteModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to delete requisition'),
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

    // ✅ Filter requisitions based on tab and search
    const filteredRequisitions = requisitions?.filter(req => {
        const matchesTab = activeTab === 'all' || req.statusStr?.toLowerCase() === activeTab;
        const matchesSearch = req.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.reqNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.department?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // ✅ Calculate stats
    const stats = {
        total: requisitions.length,
        draft: requisitions.filter(r => r.statusStr === 'Draft').length,
        review: requisitions.filter(r => r.statusStr === 'Review').length,
        approved: requisitions.filter(r => r.statusStr === 'Approved').length,
        rejected: requisitions.filter(r => r.statusStr === 'Rejected').length,
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'Draft': {
                label: 'Draft',
                className: 'bg-gray-100 text-gray-700',
                icon: <FileText className="w-3.5 h-3.5" />,
            },
            'Review': {
                label: 'Review',
                className: 'bg-yellow-100 text-yellow-700',
                icon: <Clock className="w-3.5 h-3.5" />,
            },
            'Approved': {
                label: 'Approved',
                className: 'bg-green-100 text-green-700',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            'Rejected': {
                label: 'Rejected',
                className: 'bg-red-100 text-red-700',
                icon: <XCircle className="w-3.5 h-3.5" />,
            },
        };
        const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700', icon: null };
        return (
            <Badge className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${info.className}`}>
                {info.icon}
                {info.label}
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">Error loading requisitions: {error.message}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => refetch()}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Requisitions</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all job requisitions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {isHR && (
                        <Button
                            onClick={() => navigate('/hr/recruitment/requisition/new')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Requisition
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-yellow-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Draft</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-red-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                                <TabsTrigger value="draft">Draft ({stats.draft})</TabsTrigger>
                                <TabsTrigger value="review">Review ({stats.review})</TabsTrigger>
                                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search requisitions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="space-y-4">
                {filteredRequisitions && filteredRequisitions.length > 0 ? (
                    filteredRequisitions.map((req, index) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {req.position || 'Position'}
                                                        </h3>
                                                        {getStatusBadge(req.statusStr)}
                                                        <span className="text-xs text-gray-400 font-mono">#{req.reqNumber}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            {req.department || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {req.numOpen || 0} openings
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {req.createdDate ? formatDate(req.createdDate) : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/hr/recruitment/requisition/${req.id}`)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                View
                                            </Button>
                                            {isHR && req.statusStr === 'Draft' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/hr/recruitment/requisition/edit/${req.id}`)}
                                                    className="text-blue-600"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                            {isHR && (req.statusStr === 'Draft' || req.statusStr === 'Rejected') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedReq(req.id);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No job requisitions found</p>
                            <p className="text-sm text-gray-400">Create a new requisition to get started</p>
                            {isHR && (
                                <Button
                                    onClick={() => navigate('/hr/recruitment/requisition/new')}
                                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Requisition
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to delete this requisition? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => selectedReq && deleteMutation.mutate(selectedReq)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default JobRequisitionsPage;