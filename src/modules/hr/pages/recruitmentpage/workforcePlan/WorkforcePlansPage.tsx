// src/pages/hr/recruitment/WorkforcePlansPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Plus, Search, RefreshCw, Loader2,
    Eye, Edit, Trash2, CheckCircle, XCircle, Clock,
    Calendar, Users, FileText, MoreVertical, Filter,
    ChevronDown, Download, Printer, BarChart
} from 'lucide-react';
import { Button }  from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { useWorkforcePlans, useDeleteWorkforcePlan } from '@/modules/hr/services/recruitment/workforcePlan/workforcePlan.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const WorkforcePlansPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data: plans, isLoading, refetch } = useWorkforcePlans();
    const deleteMutation = useDeleteWorkforcePlan({
        onSuccess: () => {
            toast.success('Workforce plan deleted successfully');
            setShowDeleteModal(false);
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete workforce plan');
        }
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

    const filteredPlans = plans?.filter(plan => {
        const matchesTab = activeTab === 'all' || plan.statusStr?.toLowerCase() === activeTab;
        const matchesSearch = plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.planCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.department?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const stats = {
        total: plans?.length || 0,
        active: plans?.filter(p => p.statusStr === 'Active').length || 0,
        pending: plans?.filter(p => p.statusStr === 'Pending').length || 0,
        completed: plans?.filter(p => p.statusStr === 'Completed').length || 0,
        cancelled: plans?.filter(p => p.statusStr === 'Cancelled').length || 0,
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            'Active': { label: 'Active', className: 'bg-green-100 text-green-700' },
            'Pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
            'Completed': { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
            'Cancelled': { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
            'Approve': { label: 'Approved', className: 'bg-green-100 text-green-700' },
            'Approved': { label: 'Approved', className: 'bg-green-100 text-green-700' },
            'Reject': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
            'Rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
            'Draft': { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
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

    const handleDelete = async () => {
        if (selectedPlan) {
            await deleteMutation.mutateAsync(selectedPlan);
        }
    };

    // Navigate to review page
    const handleReview = (planId: string) => {
        navigate(`/hr/recruitment/workforce-plan/review/${planId}`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="ml-3 text-gray-600">Loading workforce plans...</span>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Workforce Plans</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage workforce planning and requisitions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="flex items-center gap-2">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </Button>
                    {isHR && (
                        <Button
                            onClick={() => navigate('/hr/recruitment/workforce-plan/new')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Plan
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Plans</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-yellow-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-red-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Cancelled</p>
                        <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
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
                                <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
                                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
                                <TabsTrigger value="cancelled">Cancelled ({stats.cancelled})</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search plans..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Plans List */}
            <div className="space-y-4">
                {filteredPlans && filteredPlans.length > 0 ? (
                    filteredPlans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-emerald-50 rounded-lg">
                                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                                                        {getStatusBadge(plan.statusStr)}
                                                        <span className="text-xs text-gray-400 font-mono">{plan.planCode}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{plan.desc}</p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {plan.totalPositions} positions
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3.5 h-3.5" />
                                                            {plan.department}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* View/Detail */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/hr/recruitment/workforce-plan/${plan.id}`)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                View
                                            </Button>

                                            {/* Review (for pending plans) */}
                                            {plan.statusStr === 'Pending' && isHR && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReview(plan.id)}
                                                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                    Review
                                                </Button>
                                            )}

                                            {/* Add Requisition (for approved/active plans) */}
                                            {['Approved', 'Approve', 'Active'].includes(plan.statusStr as string) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/hr/recruitment/requisition/new?planId=${plan.id}`)}
                                                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                                >
                                                    <FileText className="w-3.5 h-3.5 mr-1" />
                                                    Requisition
                                                </Button>
                                            )}

                                            {/* Edit (for draft plans) */}
                                            {isHR && plan.statusStr === 'Draft' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/hr/recruitment/workforce-plan/edit/${plan.id}`)}
                                                    className="text-blue-600"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                            )}

                                            {/* Delete (for draft, cancelled, rejected) */}
                                            {isHR &&
                                                (plan.statusStr === 'Draft' ||
                                                    plan.statusStr === 'Cancelled' ||
                                                    plan.statusStr === 'Rejected') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedPlan(plan.id);
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
                            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No workforce plans found</p>
                            <p className="text-sm text-gray-400">Create a new workforce plan to get started</p>
                            {isHR && (
                                <Button
                                    onClick={() => navigate('/hr/recruitment/workforce-plan/new')}
                                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Plan
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-600" />
                            Confirm Deletion
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to delete this workforce plan?
                        <br />
                        <span className="text-sm text-red-500 font-medium">This action cannot be undone.</span>
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleteMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Yes, Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default WorkforcePlansPage;