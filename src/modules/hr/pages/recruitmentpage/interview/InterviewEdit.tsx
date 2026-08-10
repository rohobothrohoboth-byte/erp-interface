// src/pages/hr/recruitmentpage/interview/InterviewEdit.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Save,
    Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useInterview, useUpdateInterview } from '@/modules/hr/services/recruitment/interview/interview.queries';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const InterviewEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: interview, isLoading, error, refetch } = useInterview(id);
    const updateInterviewMutation = useUpdateInterview();

    const [interviewType, setInterviewType] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [location, setLocation] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [notes, setNotes] = useState('');
    const [interviewerId, setInterviewerId] = useState('');
    const [status, setStatus] = useState('');

    // Populate form when interview data loads
    useEffect(() => {
        if (interview) {
            setInterviewType(interview.interviewType || '');
            const date = new Date(interview.scheduledDate);
            setScheduledDate(format(date, 'yyyy-MM-dd'));
            setScheduledTime(format(date, 'HH:mm'));
            setLocation(interview.location || '');
            setMeetingLink(interview.meetingLink || '');
            setNotes(interview.notes || '');
            setInterviewerId(interview.interviewerId || '');
            setStatus(interview.status || 'Scheduled');
        }
    }, [interview]);

    const handleSubmit = () => {
        if (!scheduledDate || !interviewType) {
            toast.error('Please fill in all required fields');
            return;
        }

        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

        const data = {
            id: id!,
            interviewType: interviewType,
            scheduledDate: scheduledDateTime.toISOString(),
            location: location || null,
            meetingLink: meetingLink || null,
            notes: notes || null,
            interviewerId: interviewerId || null,
            status: status,
            rowVersion: interview?.rowVersion || '',
        };

        updateInterviewMutation.mutate({ id: id!, data }, {
            onSuccess: () => {
                toast.success('Interview updated successfully!');
                navigate(`/hr/recruitment/interviews/${id}`);
            },
            onError: (error: any) => {
                toast.error('Failed to update interview');
                console.error('Error updating interview:', error);
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <span className="mt-4 text-gray-600 font-medium">Loading interview details...</span>
            </div>
        );
    }

    if (error || !interview) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Interview Not Found</h2>
                <p className="text-gray-500 max-w-md mx-auto">The interview you're looking for could not be found.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/hr/recruitment/interviews')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Interviews
                </Button>
            </div>
        );
    }

    const statusOptions = ['Scheduled', 'InProgress', 'Completed', 'Cancelled', 'Rescheduled', 'NoShow'];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate(`/hr/recruitment/interviews/${id}`)} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        Edit Interview
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Update interview details</p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="shadow-lg border-gray-200 overflow-hidden">
                <CardContent className="p-6 space-y-6">
                    {/* Applicant Info */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{interview.applicantName || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{interview.position || 'No position specified'}</p>
                            </div>
                            <Badge className="ml-auto bg-green-100 text-green-700">{interview.status}</Badge>
                        </div>
                    </div>

                    {/* Interview Type */}
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

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
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
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location */}
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
                            className="w-full"
                        />
                    </div>

                    {/* Meeting Link */}
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
                            className="w-full"
                        />
                    </div>

                    {/* Interviewer */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Interviewer (Optional)
                        </Label>
                        <Input
                            type="text"
                            placeholder="Enter interviewer name or ID"
                            value={interviewerId}
                            onChange={(e) => setInterviewerId(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Notes</Label>
                        <Textarea
                            placeholder="Add any additional notes or instructions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/hr/recruitment/interviews/${id}`)}
                            disabled={updateInterviewMutation.isPending}
                            className="cursor-pointer"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!scheduledDate || !interviewType || updateInterviewMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        >
                            {updateInterviewMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default InterviewEdit;