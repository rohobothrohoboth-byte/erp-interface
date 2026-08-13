// src/pages/hr/recruitmentpage/jobRequisition/JobRequisitionDetail.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Users,
    DollarSign,
    Calendar,
    FileText,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    Megaphone,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { useJobRequisition, useDeleteJobRequisition } from '@/modules/hr/services/recruitment/jobRequisition/jobRequisition.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import AddJobPostingModal from '@/modules/hr/components/recruitment/jobPosting/AddJobPostingModal';

const JobRequisitionDetail: React.FC = () => {
    const { reqId = '' } = useParams<{ reqId: string }>();
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPostingModal, setShowPostingModal] = useState(false);

    const { data: requisition, isLoading, refetch } = useJobRequisition(reqId);
    const deleteMutation = useDeleteJobRequisition({
        onSuccess: () => {
            toast.success('Requisition deleted successfully');
            navigate('/hr/recruitment/requisitions');
        },
        onError: (error) => toast.error(error.message || 'Failed to delete requisition'),
    });

    const isHR = ['admin','super_admin','superadmin','hr','hr manager','hrmanager','hr admin','ceo','manager','mgr'].includes((role || '').toLowerCase());
    const canEdit = requisition?.statusStr === 'Draft' && isHR;
    const canDelete = (requisition?.statusStr === 'Draft' || requisition?.statusStr === 'Rejected') && isHR;
    const canCreatePosting = requisition?.statusStr === 'Approved' && isHR;

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'Draft': {
                label: 'Draft',
                className: 'bg-gray-100 text-gray-700',
                icon: <Clock className="w-3.5 h-3.5" />,
            },
            'Review': {
                label: 'Under Review',
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

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
                <span className="ml-3 text-gray-600">Loading requisition...</span>
            </div>
        );
    }

    if (!requisition) {
        return (
            <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Requisition not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/hr/recruitment/requisitions')}
                >
                    Back to Requisitions
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/recruitment/requisitions')}
                        className="flex items-center gap-2 mt-0.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">{requisition.position}</h1>
                            {getStatusBadge(requisition.statusStr)}
                            <span className="text-xs text-gray-400 font-mono">#{requisition.reqNumber}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{requisition.department}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                  {requisition.numOpen} openings
              </span>
                            <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                                {requisition.workLocation || 'N/A'}
              </span>
                            <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created: {formatDate(requisition.createdDate)}
              </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canEdit && (
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/hr/recruitment/requisition/edit/${reqId}`)}
                            className="text-blue-600"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    )}
                    {canCreatePosting && (
                        <Button
                            onClick={() => setShowPostingModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Megaphone className="w-4 h-4 mr-2" />
                            Create Posting
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(true)}
                            className="text-red-600"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Open Positions</p>
                        <p className="text-2xl font-bold text-gray-900">{requisition.numOpen}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Salary Range</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(requisition.salary || 0, requisition.salaryCurrency || 'USD')}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Employment Type</p>
                        <p className="text-xl font-semibold text-gray-900">{requisition.employmentType || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="mt-1">{getStatusBadge(requisition.statusStr)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="p-4 border-b w-full justify-start">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Job Description</h3>
                                    <p className="text-sm text-gray-600 whitespace-pre-line">{requisition.desc}</p>
                                </div>

                                {requisition.reqReason && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Reason for Requisition</h3>
                                        <p className="text-sm text-gray-600">{requisition.reqReason}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Requisition Details</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Position</dt>
                                                <dd className="font-medium text-gray-900">{requisition.position}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Department</dt>
                                                <dd className="font-medium text-gray-900">{requisition.department}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Job Grade</dt>
                                                <dd className="font-medium text-gray-900">{requisition.jobGrade}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Employment Type</dt>
                                                <dd className="font-medium text-gray-900">{requisition.employmentType || 'N/A'}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Preferred Gender</dt>
                                                <dd className="font-medium text-gray-900">{requisition.preferredGender || 'Any'}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Location & Compensation</h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Work Location</dt>
                                                <dd className="font-medium text-gray-900">{requisition.workLocation || 'N/A'}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Salary</dt>
                                                <dd className="font-medium text-gray-900">
                                                    {formatCurrency(requisition.salary || 0, requisition.salaryCurrency || 'USD')}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Openings</dt>
                                                <dd className="font-medium text-gray-900">{requisition.numOpen}</dd>
                                            </div>
                                            <div className="flex justify-between py-1 border-b">
                                                <dt className="text-gray-500">Created Date</dt>
                                                <dd className="font-medium text-gray-900">{formatDate(requisition.createdDate)}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Key Skills</h3>
                                        {requisition.keySkills ? (
                                            <div className="flex flex-wrap gap-2">
                                                {requisition.keySkills.split(/[,\n•]+/).map((skill, i) => (
                                                    <Badge key={i} className="bg-emerald-100 text-emerald-700">
                                                        {skill.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">No skills listed</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Qualifications Tab */}
                        {activeTab === 'qualifications' && (
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Required Qualifications</h3>
                                        {requisition.qualification ? (
                                            <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                                                {requisition.qualification}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">No qualifications specified</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Requisition</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{requisition.position}</strong>?
                        This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(reqId)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Posting Modal */}
            <AddJobPostingModal
                isOpen={showPostingModal}
                reqId={reqId}
                reqNumber={requisition.reqNumber}
                onClose={() => setShowPostingModal(false)}
                isLoading={false}
                onSubmit={() => {
                    setShowPostingModal(false);
                    refetch();
                    toast.success('Job posting created successfully');
                }}
            />
        </motion.div>
    );
};

export default JobRequisitionDetail;