// src/pages/hr/recruitmentpage/interview/InterviewDetail.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    User,
    Calendar,
    Clock,
    MapPin,
    Link as LinkIcon,
    FileText,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
    Users,
    Edit,
    Trash2,
    AlertCircle,
    Calendar as CalendarIcon,
    Send,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useInterview, useCancelInterview, useDeleteInterview } from '@/modules/hr/services/recruitment/interview/interview.queries';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import FeedbackModal from '@/modules/hr/components/recruitment/interview/FeedbackModal';

// ✅ Simple status display
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

const InterviewDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const { data: interview, isLoading, error, refetch } = useInterview(id);
    const cancelMutation = useCancelInterview();
    const deleteMutation = useDeleteInterview();

    const formatDateTime = (date: string | undefined) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy h:mm a');
        } catch {
            return 'Invalid date';
        }
    };

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

    const handleCancel = () => {
        if (window.confirm('Cancel this interview?')) {
            cancelMutation.mutate(id!, {
                onSuccess: () => {
                    toast.success('Interview cancelled');
                    refetch();
                },
                onError: () => toast.error('Failed to cancel'),
            });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Delete this interview?')) {
            deleteMutation.mutate(id!, {
                onSuccess: () => {
                    toast.success('Deleted');
                    navigate('/hr/recruitment/interviews');
                },
                onError: () => toast.error('Failed to delete'),
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                <span className="mt-4 text-gray-600">Loading...</span>
            </div>
        );
    }

    if (error || !interview) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Interview Not Found</h2>
                <Button className="mt-4" variant="outline" onClick={() => navigate('/hr/recruitment/interviews')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>
        );
    }

    const canCancel = getStatusDisplay(interview.status) !== 'Completed' &&
        getStatusDisplay(interview.status) !== 'Cancelled';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/hr/recruitment/interviews')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Interview Details</h1>
                        <p className="text-sm text-gray-500">
                            {interview.interviewType} · {formatDateTime(interview.scheduledDate)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canCancel && (
                        <Button variant="outline" onClick={handleCancel} className="text-yellow-600 border-yellow-200">
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-200">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                    {getStatusBadge(interview.status)}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-semibold">{interview.interviewType || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold">{formatDateTime(interview.scheduledDate)}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Applicant</p>
                        <p className="font-semibold">{interview.applicantName || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Interviewer</p>
                        <p className="font-semibold">{interview.interviewerName || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="border-b rounded-none bg-transparent h-12 px-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="feedback">Feedback</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Interview Information</h3>
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                                        <div>
                                            <p className="text-xs text-gray-500">Type</p>
                                            <p className="font-medium">{interview.interviewType || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Date</p>
                                            <p className="font-medium">{formatDateTime(interview.scheduledDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Location</p>
                                            <p className="font-medium">{interview.location || 'N/A'}</p>
                                        </div>
                                        {interview.meetingLink && (
                                            <div>
                                                <p className="text-xs text-gray-500">Meeting Link</p>
                                                <a href={interview.meetingLink} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                                    {interview.meetingLink}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3">Participants</h3>
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                                        <div>
                                            <p className="text-xs text-gray-500">Applicant</p>
                                            <p className="font-medium">{interview.applicantName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Position</p>
                                            <p className="font-medium">{interview.position || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Interviewer</p>
                                            <p className="font-medium">{interview.interviewerName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Status</p>
                                            {getStatusBadge(interview.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {interview.notes && (
                                <div className="mt-6">
                                    <h3 className="font-semibold mb-2">Notes</h3>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="whitespace-pre-line">{interview.notes}</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="feedback" className="p-6">
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No feedback yet</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => setShowFeedbackModal(true)}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Add Feedback
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="notes" className="p-6">
                            {interview.notes ? (
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold">Notes</h3>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/hr/recruitment/interviews/${interview.id}/edit`)}>
                                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                                            Edit
                                        </Button>
                                    </div>
                                    <p className="whitespace-pre-line">{interview.notes}</p>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-600">No notes</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/hr/recruitment/interviews')}>
                    Back
                </Button>
                {canCancel && (
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/hr/recruitment/interviews/${interview.id}/edit`)}
                        className="text-blue-600 border-blue-200"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                )}
            </div>

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                interviewId={id!}
                applicantName={interview.applicantName || 'N/A'}
                onSuccess={() => {
                    refetch();
                    setShowFeedbackModal(false);
                }}
            />
        </motion.div>
    );
};

export default InterviewDetail;