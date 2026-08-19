// src/pages/hr/recruitmentpage/applicant/ApplicantDetail.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    Users,
    Eye,
    AlertCircle,
    Building2,
    Hash,
    MessageSquare,
    Award,
    TrendingUp,
    Calendar as CalendarIcon,
    MapPin,
    UserCheck,
    UserX,
    MoreVertical,
    Download,
    Printer,
    Share2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useApplicantDetail, useUpdateApplicantStatus } from '@/modules/hr/services/recruitment/applicant/applicant.queries';
import { useVacancies } from '@/modules/hr/services/recruitment/vacancy/vacancy.queries';
import { useInterviews } from '@/modules/hr/services/recruitment/interview/interview.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import InterviewSchedule from '@/modules/hr/pages/recruitmentpage/interview/InterviewSchedule';
import OfferCreateModal from '@/modules/hr/components/recruitment/offer/OfferCreate';

interface Interview {
    id: string;
    interviewType: string;
    scheduledDate: string;
    location: string;
    status: string;
    interviewers?: string[];
    feedback?: string;
    score?: number | null;
}

const ApplicantDetail: React.FC = () => {
    const { applicantId = '' } = useParams<{ applicantId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { role } = useAuthStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showShortlistModal, setShowShortlistModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [shortlistNote, setShortlistNote] = useState('');
    const [foundJobPostingId, setFoundJobPostingId] = useState<string | null>(null);

    const action = searchParams.get('action');
    const shouldOpenInterview = action === 'schedule-interview';

    console.log('ApplicantDetail - ID from URL:', applicantId);
    console.log('ApplicantDetail - Action:', action);

    const { data: applicant, isLoading, error, refetch } = useApplicantDetail(applicantId);
    const { data: interviews = [] } = useInterviews({ applicantId });
    const { data: vacancies = [] } = useVacancies();
    const updateStatusMutation = useUpdateApplicantStatus();

    console.log('ApplicantDetail - Data:', applicant);
    console.log('ApplicantDetail - Error:', error);

    useEffect(() => {
        if (applicant?.jobPostingNum && vacancies.length > 0) {
            const found = vacancies.find(v => v.postNumber === applicant.jobPostingNum);
            if (found) {
                setFoundJobPostingId(found.id);
                console.log('Found job posting ID:', found.id, 'for post number:', applicant.jobPostingNum);
            } else {
                const byPosition = vacancies.find(v => v.position === applicant.position);
                if (byPosition) {
                    setFoundJobPostingId(byPosition.id);
                    console.log('Found job posting by position:', byPosition.id);
                }
            }
        }
    }, [applicant, vacancies]);

    useEffect(() => {
        if (shouldOpenInterview && applicant && !isLoading && foundJobPostingId) {
            console.log('Auto-opening interview modal');
            setShowInterviewModal(true);
        }
    }, [shouldOpenInterview, applicant, isLoading, foundJobPostingId]);

    const isHR = ['admin','super_admin','superadmin','hr','hr manager','hrmanager','hr admin','ceo','manager','mgr'].includes((role || '').toLowerCase()) || role === 'ceo'|| role === 'mgr';

    const effectiveJobPostingId = foundJobPostingId || applicant?.jobPostingId || '';
    console.log('Effective JobPostingId:', effectiveJobPostingId);

    const hasValidIds = applicantId && effectiveJobPostingId &&
        applicantId !== 'undefined' && effectiveJobPostingId !== 'undefined' &&
        applicantId !== 'null' && effectiveJobPostingId !== 'null';

    // ✅ BUTTON VISIBILITY - Fixed to show all buttons correctly
    const isHiredOrRejected = applicant?.statusStr === 'Hired' || applicant?.statusStr === 'Rejected';
    const isHRWithActions = isHR && !isHiredOrRejected;

    // ✅ Show Shortlist for Applied and Reviewed
    const showShortlist = isHRWithActions && (applicant?.statusStr === 'Applied' || applicant?.statusStr === 'Reviewed');

    // ✅ Show Schedule Interview for Shortlisted and Reviewed
    const showScheduleInterview = isHRWithActions && hasValidIds && (applicant?.statusStr === 'Shortlisted' || applicant?.statusStr === 'Reviewed');

    // ✅ Show Create Offer for Interviewed
    const showCreateOffer = isHRWithActions && applicant?.statusStr === 'Interviewed';

    // ✅ Show Reject for all except Hired and Rejected
    const showReject = isHRWithActions && applicant?.statusStr !== 'Rejected' && applicant?.statusStr !== 'Hired';

    // ✅ Always show Evaluate
    const showEvaluate = true;

    const handleNavigateToSchedule = () => {
        console.log('📌 Navigating to schedule - applicantId:', applicantId);
        console.log('📌 Navigating to schedule - effectiveJobPostingId:', effectiveJobPostingId);

        if (!applicantId || applicantId === 'undefined' || applicantId === 'null' || applicantId === '') {
            toast.error('Invalid applicant ID');
            return;
        }
        if (!effectiveJobPostingId || effectiveJobPostingId === 'undefined' || effectiveJobPostingId === 'null' || effectiveJobPostingId === '') {
            toast.error('No job posting found for this applicant.');
            return;
        }

        navigate(`/hr/recruitment/interview/schedule?applicantId=${applicantId}&jobPostingId=${effectiveJobPostingId}`);
    };

    const handleShortlist = () => {
        updateStatusMutation.mutate({
            applicantId,
            status: 'Shortlisted',
            reason: shortlistNote || 'Shortlisted for further consideration'
        }, {
            onSuccess: () => {
                toast.success('✅ Applicant shortlisted successfully!');
                setShowShortlistModal(false);
                setShortlistNote('');
                refetch();
            },
            onError: (error) => {
                toast.error('Failed to shortlist applicant');
                console.error('Error shortlisting applicant:', error);
            }
        });
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        updateStatusMutation.mutate({
            applicantId,
            status: 'Rejected',
            reason: rejectReason
        }, {
            onSuccess: () => {
                toast.success('Applicant rejected');
                setShowRejectModal(false);
                setRejectReason('');
                refetch();
            },
            onError: (error) => {
                toast.error('Failed to reject applicant');
                console.error('Error rejecting applicant:', error);
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'Applied': {
                label: 'Applied',
                className: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: <Clock className="w-3.5 h-3.5" />,
            },
            'Reviewed': {
                label: 'Reviewed',
                className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                icon: <Eye className="w-3.5 h-3.5" />,
            },
            'Shortlisted': {
                label: 'Shortlisted',
                className: 'bg-purple-100 text-purple-700 border-purple-200',
                icon: <Star className="w-3.5 h-3.5" />,
            },
            'Interviewed': {
                label: 'Interviewed',
                className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                icon: <Users className="w-3.5 h-3.5" />,
            },
            'Offered': {
                label: 'Offered',
                className: 'bg-green-100 text-green-700 border-green-200',
                icon: <FileText className="w-3.5 h-3.5" />,
            },
            'Hired': {
                label: 'Hired',
                className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            'Rejected': {
                label: 'Rejected',
                className: 'bg-red-100 text-red-700 border-red-200',
                icon: <XCircle className="w-3.5 h-3.5" />,
            },
        };
        const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
        return (
            <Badge className={`inline-flex items-center gap-1.5 px-3 py-1.5 border ${info.className}`}>
                {info.icon}
                {info.label}
            </Badge>
        );
    };

    const getInterviewStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'Scheduled': {
                label: 'Scheduled',
                className: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: <Clock className="w-3.5 h-3.5" />,
            },
            'InProgress': {
                label: 'In Progress',
                className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                icon: <TrendingUp className="w-3.5 h-3.5" />,
            },
            'Completed': {
                label: 'Completed',
                className: 'bg-green-100 text-green-700 border-green-200',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            'Cancelled': {
                label: 'Cancelled',
                className: 'bg-red-100 text-red-700 border-red-200',
                icon: <XCircle className="w-3.5 h-3.5" />,
            },
            'Rescheduled': {
                label: 'Rescheduled',
                className: 'bg-purple-100 text-purple-700 border-purple-200',
                icon: <CalendarIcon className="w-3.5 h-3.5" />,
            },
            'NoShow': {
                label: 'No Show',
                className: 'bg-gray-100 text-gray-700 border-gray-200',
                icon: <AlertCircle className="w-3.5 h-3.5" />,
            },
        };
        const info = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200', icon: null };
        return (
            <Badge className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs border ${info.className}`}>
                {info.icon}
                {info.label}
            </Badge>
        );
    };

    const formatDate = (date: string | undefined) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateTime = (date: string | undefined) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy h:mm a');
        } catch {
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
                <span className="mt-4 text-gray-600 font-medium">Loading applicant details...</span>
            </div>
        );
    }

    if (error || !applicant) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Applicant Not Found</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    The applicant with ID <code className="bg-gray-100 px-2 py-1 rounded text-sm">{applicantId}</code> could not be found.
                </p>
                {error && (
                    <p className="text-sm text-red-500 mt-2">{(error as Error).message}</p>
                )}
                <div className="flex justify-center gap-3 mt-6">
                    <Button variant="outline" onClick={() => navigate('/hr/recruitment/applicants')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Applicants
                    </Button>
                    <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 p-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/recruitment/applicants')}
                        className="flex items-center gap-2 mt-0.5 hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900">{applicant.applicant || 'N/A'}</h1>
                                {getStatusBadge(applicant.statusStr)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                {applicant.position || 'No position specified'}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    {applicant.email || 'N/A'}
                                </span>
                                {applicant.phone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        {applicant.phone}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    Applied: {formatDate(applicant.appliedDate)}
                                </span>
                                {applicant.jobPostingNum && (
                                    <span className="flex items-center gap-1.5">
                                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                                        {applicant.jobPostingNum}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ ACTION BUTTONS - All buttons visible based on status */}
                <div className="flex flex-wrap gap-2">
                    {/* Shortlist Button - Shows for Applied and Reviewed */}
                    {showShortlist && (
                        <Button
                            onClick={() => setShowShortlistModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                            disabled={updateStatusMutation.isPending}
                        >
                            <UserCheck className="w-4 h-4 mr-2" />
                            {updateStatusMutation.isPending ? 'Updating...' : 'Shortlist'}
                        </Button>
                    )}

                    {/* Schedule Interview Button - Shows for Shortlisted and Reviewed */}
                    {showScheduleInterview && (
                        <Button
                            onClick={handleNavigateToSchedule}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Interview
                        </Button>
                    )}

                    {/* Create Offer Button - Shows for Interviewed */}
                    {showCreateOffer && (
                        <Button
                            onClick={() => setShowOfferModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Create Offer
                        </Button>
                    )}

                    {/* Reject Button - Shows for all except Hired and Rejected */}
                    {showReject && (
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectModal(true)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                            disabled={updateStatusMutation.isPending}
                        >
                            <UserX className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                    )}

                    {/* Evaluate Button - Always shows */}
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/hr/recruitment/applicant/${applicantId}/evaluate`)}
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                        <Award className="w-4 h-4 mr-2" />
                        Evaluate
                    </Button>

                    {/* More Options */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {}}>
                                <Download className="w-4 h-4 mr-2" />
                                Export Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {}}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Status</p>
                                <div className="mt-1">{getStatusBadge(applicant.statusStr)}</div>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Interviews</p>
                                <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Applied Date</p>
                                <p className="text-lg font-semibold text-gray-900">{formatDate(applicant.appliedDate)}</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Position</p>
                                <p className="text-lg font-semibold text-gray-900 truncate max-w-[150px]">{applicant.position || 'N/A'}</p>
                            </div>
                            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b border-gray-200 bg-gray-50/50 px-6">
                            <TabsList className="bg-transparent h-12 gap-6">
                                <TabsTrigger
                                    value="overview"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="interviews"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Interviews
                                    {interviews.length > 0 && (
                                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 text-xs">
                                            {interviews.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="documents"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Documents
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    Personal Information
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Full Name</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{applicant.applicant || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{applicant.email || 'N/A'}</p>
                                        </div>
                                        {applicant.phone && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone</p>
                                                <p className="text-sm font-medium text-gray-900 mt-1">{applicant.phone}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Applied Date</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(applicant.appliedDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {applicant.coverLetter && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-400" />
                                        Cover Letter
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{applicant.coverLetter}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                    Application Details
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Position</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">{applicant.position || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Job Posting</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1">
                                                <Hash className="w-3.5 h-3.5 text-gray-400" />
                                                {applicant.jobPostingNum || 'N/A'}
                                            </p>
                                            {effectiveJobPostingId && (
                                                <p className="text-xs text-gray-400 mt-1 font-mono">ID: {effectiveJobPostingId.slice(0, 8)}...</p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Department</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1">
                                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                {applicant.department || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</p>
                                            <div className="mt-1">{getStatusBadge(applicant.statusStr)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Interviews Tab */}
                        <TabsContent value="interviews" className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    Interview History
                                </h3>
                                {showScheduleInterview && (
                                    <Button
                                        size="sm"
                                        onClick={handleNavigateToSchedule}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                    >
                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                        Schedule Interview
                                    </Button>
                                )}
                            </div>

                            {interviews.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-600">No interviews scheduled</p>
                                    <p className="text-xs text-gray-400 mt-1">Schedule an interview to proceed</p>
                                    {showScheduleInterview && (
                                        <Button
                                            size="sm"
                                            onClick={handleNavigateToSchedule}
                                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                            Schedule Interview
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {interviews.map((interview: Interview) => (
                                        <div key={interview.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {interview.interviewType}
                                                        </Badge>
                                                        {getInterviewStatusBadge(interview.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                        {formatDateTime(interview.scheduledDate)}
                                                    </p>
                                                    {interview.interviewers && interview.interviewers.length > 0 && (
                                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                                            With: {interview.interviewers.join(', ')}
                                                        </p>
                                                    )}
                                                    {interview.location && (
                                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                            {interview.location}
                                                        </p>
                                                    )}
                                                    {interview.feedback && (
                                                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-start gap-2">
                                                            <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                            {interview.feedback}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {interview.score !== null && interview.score !== undefined && (
                                                        <Badge className="bg-green-100 text-green-700">
                                                            <Award className="w-3 h-3 mr-1" />
                                                            Score: {interview.score}/100
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Documents Tab */}
                        <TabsContent value="documents" className="p-6">
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-600">No documents uploaded</p>
                                <p className="text-xs text-gray-400 mt-1">Applicant documents will appear here</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Shortlist Dialog */}
            <Dialog open={showShortlistModal} onOpenChange={setShowShortlistModal}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-purple-600 flex items-center gap-2">
                            <UserCheck className="w-5 h-5" />
                            Shortlist Applicant
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to shortlist <strong className="text-gray-900">{applicant.applicant}</strong>?
                        </p>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Notes (Optional)</Label>
                            <Textarea
                                value={shortlistNote}
                                onChange={(e) => setShortlistNote(e.target.value)}
                                placeholder="Add any notes about this decision..."
                                rows={3}
                                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowShortlistModal(false)} className="border-gray-300">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleShortlist}
                            disabled={updateStatusMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {updateStatusMutation.isPending ? 'Shortlisting...' : 'Shortlist Applicant'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-red-600 flex items-center gap-2">
                            <UserX className="w-5 h-5" />
                            Reject Applicant
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to reject <strong className="text-gray-900">{applicant.applicant}</strong>?
                        </p>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Reason <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows={4}
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)} className="border-gray-300">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || updateStatusMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {updateStatusMutation.isPending ? 'Rejecting...' : 'Reject Applicant'}
                        </Button>
                    </DialogFooter>
                    `</DialogContent>
            </Dialog>

            {/* Interview Schedule Modal */}
            {hasValidIds && (
                <InterviewSchedule
                    isOpen={showInterviewModal}
                    onOpenChange={setShowInterviewModal}
                    applicantId={applicantId}
                    applicantName={applicant?.applicant || 'N/A'}
                    jobPostingId={effectiveJobPostingId}
                    jobPostingTitle={applicant?.position || 'N/A'}
                    applicantEmail={applicant?.email || ''}
                    applicantPhone={applicant?.phone || ''}
                    department={applicant?.department || ''}
                    onClose={() => setShowInterviewModal(false)}
                    onSuccess={() => {
                        refetch();
                        setShowInterviewModal(false);
                    }}
                />
            )}

            {/* Offer Create Modal */}
            {hasValidIds && (
                <OfferCreateModal
                    isOpen={showOfferModal}
                    onOpenChange={setShowOfferModal}
                    applicantId={applicantId}
                    jobPostingId={effectiveJobPostingId}
                    applicantName={applicant?.applicant || 'N/A'}
                    jobPostingTitle={applicant?.position || 'N/A'}
                    onClose={() => setShowOfferModal(false)}
                    onSuccess={() => {
                        refetch();
                        setShowOfferModal(false);
                    }}
                />
            )}
        </motion.div>
    );
};

export default ApplicantDetail;