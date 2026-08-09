// src/pages/hr/recruitmentpage/interview/InterviewSchedule.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    Link as LinkIcon,
    Users,
    FileText,
    AlertCircle,
    X,
    Building2,
    Hash,
    Send,
    Loader2,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../../components/ui/dialog';
import { useApplicantDetail } from '../../../../services/hr/recruitment/applicant/applicant.queries';
import { useVacancies } from '../../../../services/hr/recruitment/vacancy/vacancy.queries';
import { useCreateInterview } from '../../../../services/hr/recruitment/interview/interview.queries';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { CreateInterviewRequest } from '../../../../services/hr/recruitment/interview/interview.api';

// Props interface for modal mode
interface InterviewScheduleProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    applicantId?: string;
    applicantName?: string;
    jobPostingId?: string;
    jobPostingTitle?: string;
    applicantEmail?: string;
    applicantPhone?: string;
    department?: string;
    onClose?: () => void;
    onSuccess?: () => void;
}

const InterviewSchedule: React.FC<InterviewScheduleProps> = ({
                                                                 isOpen: propIsOpen,
                                                                 onOpenChange,
                                                                 applicantId: propApplicantId,
                                                                 applicantName: propApplicantName,
                                                                 jobPostingId: propJobPostingId,
                                                                 jobPostingTitle: propJobPostingTitle,
                                                                 applicantEmail: propApplicantEmail,
                                                                 applicantPhone: propApplicantPhone,
                                                                 department: propDepartment,
                                                                 onClose: propOnClose,
                                                                 onSuccess: propOnSuccess,
                                                             }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Determine if we're in modal mode or page mode
    const isModalMode = propIsOpen !== undefined;

    // Get IDs from props (modal mode) or URL params (page mode)
    const applicantIdFromUrl = searchParams.get('applicantId') || '';
    const jobPostingIdFromUrl = searchParams.get('jobPostingId') || '';

    const applicantId = propApplicantId || applicantIdFromUrl;
    const jobPostingId = propJobPostingId || jobPostingIdFromUrl;
    const applicantName = propApplicantName || '';
    const jobPostingTitle = propJobPostingTitle || '';
    const applicantEmail = propApplicantEmail || '';
    const applicantPhone = propApplicantPhone || '';
    const department = propDepartment || '';

    // Form state
    const [interviewType, setInterviewType] = useState('TechnicalRound');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('14:00');
    const [location, setLocation] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [notes, setNotes] = useState('');
    const [interviewerId, setInterviewerId] = useState('');
    const [duration, setDuration] = useState('60');

    // Data fetching
    const { data: applicant, isLoading: applicantLoading, error: applicantError } = useApplicantDetail(applicantId);
    const { data: vacancies = [] } = useVacancies();
    const createInterviewMutation = useCreateInterview();

    // Find job posting details
    const jobPosting = vacancies.find(v => v.id === jobPostingId);

    // Set default date to tomorrow
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduledDate(format(tomorrow, 'yyyy-MM-dd'));
    }, []);

    // Log for debugging
    useEffect(() => {
        console.log('🔍 InterviewSchedule - State:', {
            applicantId,
            jobPostingId,
            applicantName,
            jobPostingTitle,
            isModalMode,
            hasValidIds: isValidGuid(applicantId) && isValidGuid(jobPostingId),
        });
    }, [applicantId, jobPostingId, applicantName, jobPostingTitle, isModalMode]);

    // Validate GUID format
    const isValidGuid = (id: string): boolean => {
        if (!id || id === '' || id === 'undefined' || id === 'null') return false;
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return guidRegex.test(id);
    };

    // Validate all form fields
    const validateForm = (): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!applicantId || !isValidGuid(applicantId)) {
            errors.push('Invalid applicant ID');
        }
        if (!jobPostingId || !isValidGuid(jobPostingId)) {
            errors.push('Invalid job posting ID');
        }
        if (!scheduledDate) {
            errors.push('Please select a date');
        }
        if (!interviewType) {
            errors.push('Please select an interview type');
        }

        // Check if date is in the future
        if (scheduledDate && scheduledTime) {
            const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
            if (selectedDateTime < new Date()) {
                errors.push('Please select a future date and time');
            }
        }

        return { isValid: errors.length === 0, errors };
    };

    // Handle form submission
    const handleSubmit = () => {
        console.log('📝 handleSubmit - Starting form submission...');

        // Validate form
        const { isValid, errors } = validateForm();
        if (!isValid) {
            errors.forEach(error => toast.error(error));
            console.error('❌ Validation errors:', errors);
            return;
        }

        try {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

            // Build data with proper handling
            const data: CreateInterviewRequest = {
                applicantId: applicantId.trim(),
                jobPostingId: jobPostingId.trim(),
                interviewType: interviewType,
                scheduledDate: scheduledDateTime.toISOString(),
            };

            // Only add optional fields if they have a value
            if (location && location.trim() !== '') {
                data.location = location.trim();
            }
            if (meetingLink && meetingLink.trim() !== '') {
                data.meetingLink = meetingLink.trim();
            }
            if (notes && notes.trim() !== '') {
                data.notes = notes.trim();
            }

            // Only add interviewerId if it's a valid GUID
            if (interviewerId && interviewerId.trim() !== '') {
                const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (guidRegex.test(interviewerId.trim())) {
                    data.interviewerId = interviewerId.trim();
                    console.log('✅ Valid interviewer ID provided:', interviewerId.trim());
                } else {
                    console.warn('⚠️ Interviewer ID is not a valid GUID, skipping...');
                }
            }

            console.log('📤 Submitting interview data:', data);

            // Submit the mutation
            createInterviewMutation.mutate(data, {
                onSuccess: () => {
                    console.log('✅ Interview scheduled successfully!');
                    toast.success('Interview scheduled successfully!');
                    if (isModalMode && propOnSuccess) {
                        propOnSuccess();
                    } else {
                        navigate('/hr/recruitment/interviews');
                    }
                },
                onError: (error: any) => {
                    console.error('❌ Error scheduling interview:', error);
                    const responseData = error?.response?.data;
                    let errorMessage = 'Failed to schedule interview';

                    if (responseData?.errors) {
                        const errorDetails = Object.values(responseData.errors).flat();
                        errorMessage = errorDetails.join(', ');
                        console.error('❌ Validation errors:', errorDetails);
                    } else if (responseData?.message) {
                        errorMessage = responseData.message;
                    } else if (responseData?.title) {
                        errorMessage = responseData.title;
                    } else if (error?.message) {
                        errorMessage = error.message;
                    }

                    toast.error(errorMessage);
                },
            });
        } catch (error) {
            console.error('❌ Unexpected error in handleSubmit:', error);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    // Page mode: Check if no applicant selected
    if (!isModalMode && !applicantIdFromUrl) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 max-w-4xl mx-auto space-y-6"
            >
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/recruitment/interviews')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-blue-600" />
                            Schedule Interview
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Select an applicant to schedule an interview</p>
                    </div>
                </div>

                <Card className="shadow-lg border-gray-200">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Applicant Selected</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Please select an applicant from the applicants list to schedule an interview.
                        </p>
                        <Button
                            onClick={() => navigate('/hr/recruitment/applicants')}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Go to Applicants
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // Show loading state
    if (applicantLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <span className="mt-4 text-gray-600 font-medium">Loading applicant details...</span>
            </div>
        );
    }

    // Show error state
    if (applicantError) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Applicant</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    {(applicantError as Error)?.message || 'Failed to load applicant details. Please try again.'}
                </p>
                <Button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Retry
                </Button>
            </div>
        );
    }

    const hasValidIds = isValidGuid(applicantId) && isValidGuid(jobPostingId);

    // The content (same for both page and modal)
    const content = (
        <div className="space-y-6">
            {/* Invalid IDs Warning */}
            {!hasValidIds && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Invalid Data</p>
                        <p className="text-sm text-red-600">
                            Please ensure you have selected a valid applicant and job posting.
                        </p>
                        {!isModalMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => navigate('/hr/recruitment/applicants')}
                            >
                                Go to Applicants
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Applicant Information */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Applicant Information
                </h3>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{applicantName || applicant?.applicant || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{jobPostingTitle || applicant?.position || 'No position specified'}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">
                            {applicant?.statusStr || 'Applied'}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-200/50">
                        {(applicantEmail || applicant?.email) && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-800">{applicantEmail || applicant?.email}</p>
                                </div>
                            </div>
                        )}
                        {(applicantPhone || applicant?.phone) && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm font-medium text-gray-800">{applicantPhone || applicant?.phone}</p>
                                </div>
                            </div>
                        )}
                        {(department || applicant?.department) && (
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Department</p>
                                    <p className="text-sm font-medium text-gray-800">{department || applicant?.department}</p>
                                </div>
                            </div>
                        )}
                        {jobPosting && (
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Job Posting</p>
                                    <p className="text-sm font-medium text-gray-800">{jobPosting.postNumber}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs text-gray-500">
                            <span className="font-medium">Applicant ID:</span>
                            <span className="ml-1 font-mono text-gray-600">{applicantId || 'N/A'}</span>
                        </p>
                        {jobPostingId && (
                            <p className="text-xs text-gray-500 ml-2">
                                <span className="font-medium">Job ID:</span>
                                <span className="ml-1 font-mono text-gray-600">{jobPostingId.slice(0, 8)}...</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Interview Details */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Interview Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            Interview Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={interviewType} onValueChange={setInterviewType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select interview type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PhoneScreen">📞 Phone Screening</SelectItem>
                                <SelectItem value="TechnicalRound">💻 Technical Interview</SelectItem>
                                <SelectItem value="BehavioralRound">🧠 Behavioral Interview</SelectItem>
                                <SelectItem value="ManagementRound">👔 Management Interview</SelectItem>
                                <SelectItem value="GroupDiscussion">👥 Group Discussion</SelectItem>
                                <SelectItem value="PresentationRound">📊 Presentation</SelectItem>
                                <SelectItem value="FinalRound">🏆 Final Interview</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Duration (minutes)
                        </Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                                <SelectItem value="90">90 minutes</SelectItem>
                                <SelectItem value="120">120 minutes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            className="w-full"
                            disabled={!hasValidIds}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full"
                            disabled={!hasValidIds}
                        />
                    </div>
                </div>
            </div>

            {/* Location & Meeting */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Location & Meeting
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Location
                        </Label>
                        <Input
                            type="text"
                            placeholder="e.g., Conference Room A, Office Building"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            disabled={!hasValidIds}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <LinkIcon className="w-3.5 h-3.5" />
                            Meeting Link
                        </Label>
                        <Input
                            type="url"
                            placeholder="https://meet.google.com/abc-defg-hij"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            disabled={!hasValidIds}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Interviewer & Notes */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Interviewer (Optional - Enter GUID)
                        </Label>
                        <Input
                            type="text"
                            placeholder="Enter interviewer ID (GUID format)"
                            value={interviewerId}
                            onChange={(e) => setInterviewerId(e.target.value)}
                            disabled={!hasValidIds}
                            className="w-full"
                        />
                        {interviewerId && !isValidGuid(interviewerId) && interviewerId.trim() !== '' && (
                            <p className="text-xs text-yellow-600 mt-1">
                                ⚠️ Please enter a valid GUID (e.g., 123e4567-e89b-12d3-a456-426614174000)
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Notes</Label>
                        <Textarea
                            placeholder="Add any additional notes or instructions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            disabled={!hasValidIds}
                            className="w-full resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            {hasValidIds && scheduledDate && interviewType && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">📋 Interview Summary</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-blue-600">Applicant:</span>
                            <span className="ml-2 text-gray-800 font-medium">{applicantName || applicant?.applicant || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-blue-600">Position:</span>
                            <span className="ml-2 text-gray-800 font-medium">{jobPostingTitle || applicant?.position || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-blue-600">Type:</span>
                            <span className="ml-2 text-gray-800 font-medium">{interviewType}</span>
                        </div>
                        <div>
                            <span className="text-blue-600">Scheduled:</span>
                            <span className="ml-2 text-gray-800 font-medium">
                                {scheduledDate && scheduledTime &&
                                    `${format(new Date(`${scheduledDate}T${scheduledTime}:00`), 'MMM dd, yyyy h:mm a')}`
                                }
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                    variant="outline"
                    onClick={() => {
                        console.log('🔙 Cancel button clicked');
                        if (isModalMode && propOnClose) {
                            propOnClose();
                        } else {
                            navigate('/hr/recruitment/interviews');
                        }
                    }}
                    disabled={createInterviewMutation.isPending}
                    className="cursor-pointer"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!hasValidIds || !scheduledDate || !interviewType || createInterviewMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                    {createInterviewMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Scheduling...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Schedule Interview
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    // If modal mode, wrap in Dialog
    if (isModalMode) {
        return (
            <Dialog open={propIsOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Schedule Interview
                        </DialogTitle>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    // Page mode - wrap in page layout
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-4xl mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate('/hr/recruitment/interviews')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Schedule Interview
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Schedule a new interview for an applicant</p>
                </div>
            </div>

            {/* Main Form Card */}
            <Card className="shadow-lg border-gray-200 overflow-hidden">
                <CardContent className="p-6">
                    {content}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default InterviewSchedule;