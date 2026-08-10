// src/pages/hr/recruitmentpage/jobPosting/JobPostingDetail.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Megaphone,
    Calendar,
    Users,
    Building2,
    FileText,
    Edit,
    Trash2,
    Send,
    XCircle,
    Eye,
    ClipboardCheck,
    Users as UsersIcon,
    Clock,
    CheckCircle,
    AlertCircle,
    Globe,
    Lock,
    MapPin,
    Briefcase,
    DollarSign,
    LayoutDashboard,
    Loader2,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { useJobPostingDetail, useDeleteJobPosting } from '../../../../services/hr/recruitment/jobPosting/jobPosting.queries';
import { usePublishJobPosting, useCloseJobPosting } from '../../../../services/hr/recruitment/JobPublish/jobPublish.queries';
import { useApplicantsByPost } from '../../../../services/hr/recruitment/applicant/applicant.queries';
import { useJpEvalFlows } from '../../../../services/hr/recruitment/jpEvalFlow/jpEvalFlow.queries';
import { useAuthStore } from '../../../../stores/auth.store';
import { format, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import { useJobRequisition } from '../../../../services/hr/recruitment/jobRequisition/jobRequisition.queries';
import PublishJobPostingModal from '../../../../components/hr/recruitment/jobPosting/PublishJobPostingModal';

// ✅ Helper function to safely format dates
const safeFormatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Not set';
    try {
        const date = new Date(dateStr);
        if (!isValid(date)) return 'Invalid date';
        return format(date, 'MMM dd, yyyy');
    } catch {
        return 'Invalid date';
    }
};

// ✅ Helper function to get status display name
const getStatusDisplayName = (status: string): string => {
    const statusMap: Record<string, string> = {
        '0': 'Draft',
        '1': 'Pending Approval',
        '2': 'Approved',
        '3': 'Published',
        '4': 'Closed',
        '5': 'Cancelled',
        '6': 'Expired',
        'Draft': 'Draft',
        'Pending': 'Pending Approval',
        'Pending Approval': 'Pending Approval',
        'Approved': 'Approved',
        'Published': 'Published',
        'Closed': 'Closed',
        'Cancelled': 'Cancelled',
        'Expired': 'Expired',
    };
    return statusMap[status] || status || 'Draft';
};

// ✅ Helper function to get status color
const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
        '0': 'bg-gray-100 text-gray-700',
        '1': 'bg-yellow-100 text-yellow-700',
        '2': 'bg-green-100 text-green-700',
        '3': 'bg-green-100 text-green-700',
        '4': 'bg-red-100 text-red-700',
        '5': 'bg-gray-100 text-gray-700',
        '6': 'bg-orange-100 text-orange-700',
        'Draft': 'bg-gray-100 text-gray-700',
        'Pending': 'bg-yellow-100 text-yellow-700',
        'Pending Approval': 'bg-yellow-100 text-yellow-700',
        'Approved': 'bg-green-100 text-green-700',
        'Published': 'bg-green-100 text-green-700',
        'Closed': 'bg-red-100 text-red-700',
        'Cancelled': 'bg-gray-100 text-gray-700',
        'Expired': 'bg-orange-100 text-orange-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
};

const JobPostingDetail: React.FC = () => {
    const { postId = '' } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);

    // ✅ Fetch all data with proper error handling
    const { data: posting, isLoading: postingLoading, refetch } = useJobPostingDetail(postId);
    const { data: applicants = [] } = useApplicantsByPost(postId);
    const { data: evalFlows = [], isLoading: evalFlowsLoading, error: evalFlowsError } = useJpEvalFlows(postId);
    const { data: requisition, isLoading: reqLoading } = useJobRequisition(posting?.jobReqId || '');

    // ✅ LOGGING: Log all data when it arrives
    useEffect(() => {
        console.log('🔍 === JOB POSTING DETAIL DEBUG ===');
        console.log('📌 Posting ID:', postId);
        console.log('📌 Posting Data:', posting);
        console.log('📌 Position field:', posting?.position);
        console.log('📌 Department field:', posting?.department);
        console.log('📌 PostTypeStr:', posting?.postTypeStr);
        console.log('📌 StatusStr:', posting?.statusStr);
        console.log('📌 DeadlineDateStr:', posting?.deadlineDateStr);
        console.log('📌 PublishedDateStr:', posting?.publishedDateStr);
        console.log('📌 Requisition Data:', requisition);
        console.log('📌 Applicants:', applicants);
        console.log('📌 Eval Flows:', evalFlows);
        console.log('🔍 === END DEBUG ===');
    }, [posting, requisition, applicants, evalFlows, postId]);

    const deleteMutation = useDeleteJobPosting({
        onSuccess: () => {
            toast.success('Job posting deleted successfully');
            navigate('/hr/recruitment/postings');
        },
        onError: (error) => toast.error(error.message || 'Failed to delete posting'),
    });

    const publishMutation = usePublishJobPosting({
        onSuccess: () => {
            toast.success('Job posting published successfully');
            setShowPublishModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to publish posting'),
    });

    const closeMutation = useCloseJobPosting({
        onSuccess: () => {
            toast.success('Job posting closed successfully');
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to close posting'),
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';

    // ✅ Get status display
    const statusDisplay = getStatusDisplayName(posting?.statusStr || posting?.status || '');
    const statusColor = getStatusColor(posting?.statusStr || posting?.status || '');

    // ✅ Check if user can perform actions
    const canEdit = (posting?.statusStr === 'Draft' || posting?.status === '0') && isHR;
    const canDelete = (posting?.statusStr === 'Draft' || posting?.status === '0' ||
        posting?.statusStr === 'Closed' || posting?.status === '4') && isHR;
    const canPublish = (posting?.statusStr === 'Draft' || posting?.status === '0' ||
        posting?.statusStr === 'Pending' || posting?.status === '1') && isHR;
    const canClose = (posting?.statusStr === 'Published' || posting?.status === '3') && isHR;

    // ✅ Use posting data directly (no fallback to requisition)
    const position = posting?.position ?? 'Not specified';
    const department = posting?.department ?? 'N/A';
    const reqNumber = posting?.reqNumber ?? 'N/A';

    const getStatusBadge = (status: string) => {
        const displayName = getStatusDisplayName(status);
        const colorClass = getStatusColor(status);
        return <Badge className={colorClass}>{displayName}</Badge>;
    };

    const getPostTypeIcon = (type: string) => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower === 'internal') return <Lock className="w-4 h-4" />;
        if (typeLower === 'external') return <Globe className="w-4 h-4" />;
        return <UsersIcon className="w-4 h-4" />;
    };

    const getPostTypeDisplay = (type: string) => {
        if (!type) return 'N/A';
        const typeLower = type.toLowerCase();
        if (typeLower === 'internal') return 'Internal';
        if (typeLower === 'external') return 'External';
        if (typeLower === 'both') return 'Both';
        return type;
    };

    const handlePublish = (id: string, comment: string | null) => {
        publishMutation.mutate({ id, comment });
    };

    // ✅ Loading state
    if (postingLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-3 text-gray-600">Loading posting details...</span>
            </div>
        );
    }

    // ✅ Not found state
    if (!posting) {
        return (
            <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Job posting not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/hr/recruitment/postings')}
                >
                    Back to Postings
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
                        onClick={() => navigate('/hr/recruitment/postings')}
                        className="flex items-center gap-2 mt-0.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">{posting.postNumber}</h1>
                            {getStatusBadge(posting.statusStr || posting.status || '')}
                            <span className="text-xs text-gray-400 font-mono">Req: {reqNumber}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{position}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                {department}
                            </span>
                            <span className="flex items-center gap-1">
                                {getPostTypeIcon(posting.postTypeStr)}
                                {getPostTypeDisplay(posting.postTypeStr)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                              Deadline: {posting.deadlineDateStr || 'Not set'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {applicants.length} applicants
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canPublish && (
                        <Button
                            onClick={() => setShowPublishModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Publish
                        </Button>
                    )}
                    {canClose && (
                        <Button
                            variant="outline"
                            onClick={() => closeMutation.mutate(postId)}
                            className="text-orange-600"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Close
                        </Button>
                    )}
                    {canEdit && (
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/hr/recruitment/posting/edit/${postId}`)}
                            className="text-blue-600"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/hr/recruitment/posting/${postId}/applicants`)}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Applicants ({applicants.length})
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/hr/recruitment/posting/${postId}/dashboard`)}
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                    </Button>
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
                        <p className="text-sm text-gray-500">Applicants</p>
                        <p className="text-2xl font-bold text-gray-900">{applicants.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Post Type</p>
                        <p className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            {getPostTypeIcon(posting.postTypeStr)}
                            {getPostTypeDisplay(posting.postTypeStr)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Evaluation Flows</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {evalFlowsLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                evalFlows.length
                            )}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="mt-1">{getStatusBadge(posting.statusStr || posting.status || '')}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="p-4 border-b w-full justify-start">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
                            <TabsTrigger value="evaluation">Evaluation Flow</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Requisition Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Requisition</p>
                                            <p className="text-sm font-medium text-gray-900">#{posting.reqNumber ?? 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Position</p>
                                            <p className="text-sm font-medium text-gray-900">{posting.position ?? 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Department</p>
                                            <p className="text-sm font-medium text-gray-900">{posting.department ?? 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Post Type</p>
                                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                {getPostTypeIcon(posting.postTypeStr)}
                                                {posting.postTypeStr ?? 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Deadline</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {posting.deadlineDateStr ?? 'Not set'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Published Date</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {posting.publishedDateStr ?? 'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {requisition && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Requisition Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Openings</p>
                                                <p className="text-sm font-medium text-gray-900">{requisition.reqQuantity ?? 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Status</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {getStatusDisplayName(requisition.statusStr ?? requisition.status ?? '')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {posting.desc && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                                        <p className="text-sm text-gray-600 whitespace-pre-line">{posting.desc}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Applicants Tab */}
                        {activeTab === 'applicants' && (
                            <div className="p-6">
                                {applicants.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No applicants yet</p>
                                        <p className="text-xs text-gray-400">Applicants will appear here once they apply</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {applicants.map((applicant) => (
                                            <div
                                                key={applicant.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                                onClick={() => navigate(`/hr/recruitment/applicant/${applicant.id}`)}
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">{applicant.applicant}</p>
                                                    <p className="text-sm text-gray-500">{applicant.email}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                        <span>Status: {getStatusDisplayName(applicant.statusStr || applicant.status || 'Applied')}</span>
                                                        <span>Applied: {safeFormatDate(applicant.appliedDate)}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/hr/recruitment/applicant/${applicant.id}/evaluate`);
                                                    }}
                                                >
                                                    <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
                                                    Evaluate
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Evaluation Flow Tab */}
                        {activeTab === 'evaluation' && (
                            <div className="p-6">
                                {evalFlowsLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                        <span className="ml-3 text-gray-500">Loading evaluation flows...</span>
                                    </div>
                                ) : evalFlowsError || evalFlows.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No evaluation flow assigned</p>
                                        <p className="text-xs text-gray-400">Assign an evaluation flow to this posting</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => navigate(`/hr/recruitment/posting/${postId}/eval-flow`)}
                                        >
                                            Assign Flow
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {evalFlows.map((flow) => (
                                            <div key={flow.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{flow.evalFlowName}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            Effective: {safeFormatDate(flow.effeDateFrom)}
                                                        </p>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                                                </div>
                                                {flow.steps && flow.steps.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs text-gray-500 mb-2">Steps ({flow.steps.length})</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {flow.steps.map((step, index) => (
                                                                <Badge key={index} className="bg-blue-50 text-blue-700">
                                                                    {step.stepName}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Job Posting</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{posting.postNumber}</strong>?
                        This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(postId)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Modal */}
            <PublishJobPostingModal
                isOpen={showPublishModal}
                item={posting}
                isLoading={publishMutation.isPending}
                onClose={() => setShowPublishModal(false)}
                onSubmit={handlePublish}
            />
        </motion.div>
    );
};

export default JobPostingDetail;