// src/pages/hr/recruitmentpage/jobPosting/JobPostingEdit.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Megaphone,
    Calendar,
    AlertCircle,
    Info,
    Globe,
    Lock,
    Users as UsersIcon,
    Save,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { useJobPostingDetail, useUpdateJobPosting } from '@/modules/hr/services/recruitment/jobPosting/jobPosting.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { JobPostingModDto } from '@/modules/hr/types/recruit/jobPosting';

const JobPostingEdit: React.FC = () => {
    const { postId = '' } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [form, setForm] = useState<JobPostingModDto>({
        id: postId,
        postType: '0' as any,
        deadlineDate: '',
        rowVersion: '',
    });
    const [errors, setErrors] = useState<{ deadlineDate?: string; postType?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: posting, isLoading, refetch } = useJobPostingDetail(postId);
    const updateMutation = useUpdateJobPosting({
        onSuccess: () => {
            showToast.success('Job posting updated successfully');
            setIsSubmitting(false);
            navigate(`/hr/recruitment/posting/${postId}`);
        },
        onError: (error) => {
            showToast.error(error.message || 'Failed to update job posting');
            setIsSubmitting(false);
        },
    });

    // The list DTO only exposes the display string (postTypeStr), so map it back to the
    // enum key the backend expects ("0" Internal / "1" External / "2" Internal & External).
    const postTypeKeyFromStr = (str?: string): string => {
        if (!str) return '0';
        const s = str.toLowerCase();
        if (s.includes('int') && s.includes('ext')) return '2';
        if (s === 'both') return '2';
        if (s.startsWith('ext')) return '1';
        return '0';
    };

    // Load data when posting is fetched
    useEffect(() => {
        if (posting) {
            setForm({
                id: postId,
                postType: postTypeKeyFromStr(posting.postTypeStr),
                deadlineDate: posting.deadlineDateStr || '',
                rowVersion: posting.rowVersion || '',
            });
        }
    }, [posting, postId]);

    // Calculate min and max dates
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const postTypes = [
        { value: '0', label: 'Internal', icon: <Lock className="w-4 h-4" /> },
        { value: '1', label: 'External', icon: <Globe className="w-4 h-4" /> },
        { value: '2', label: 'Both', icon: <UsersIcon className="w-4 h-4" /> },
    ];

    const getPostTypeLabel = (value: string): string => {
        const labels: Record<string, string> = {
            '0': 'Internal',
            '1': 'External',
            '2': 'Both',
        };
        return labels[value] || 'Unknown';
    };

    const validate = (): boolean => {
        const newErrors: { deadlineDate?: string; postType?: string } = {};

        if (!form.postType || form.postType === '') {
            newErrors.postType = 'Please select a post type';
        }

        if (!form.deadlineDate) {
            newErrors.deadlineDate = 'Please select a deadline date';
        } else {
            const selectedDate = new Date(form.deadlineDate);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);

            if (selectedDate < todayDate) {
                newErrors.deadlineDate = 'Deadline date cannot be in the past';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        updateMutation.mutate({
            id: postId,
            postType: form.postType,
            deadlineDate: form.deadlineDate ? new Date(form.deadlineDate).toISOString() : '',
            rowVersion: form.rowVersion,
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent" />
                <span className="ml-3 text-gray-600">Loading posting...</span>
            </div>
        );
    }

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

    const canEdit = posting.statusStr === 'Draft';

    if (!canEdit) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-600">This posting cannot be edited</p>
                <p className="text-sm text-gray-400">Current status: {posting.statusStr}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate(`/hr/recruitment/posting/${postId}`)}
                >
                    View Posting
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/hr/recruitment/posting/${postId}`)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Job Posting</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        #{posting.postNumber} - {posting.position}
                    </p>
                </div>
                <Badge className="bg-gray-100 text-gray-700 ml-auto">{posting.statusStr}</Badge>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Posting Info */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Post Number</p>
                                    <p className="font-medium text-gray-900">#{posting.postNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Requisition</p>
                                    <p className="font-medium text-gray-900">#{posting.reqNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Position</p>
                                    <p className="font-medium text-gray-900">{posting.position}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Department</p>
                                    <p className="font-medium text-gray-900">{posting.department}</p>
                                </div>
                            </div>
                        </div>

                        {/* Post Type */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">
                                Post Type <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {postTypes.map((type) => (
                                    <div
                                        key={type.value}
                                        onClick={() => {
                                            setForm(f => ({ ...f, postType: type.value as any }));
                                            setErrors(e => ({ ...e, postType: '' }));
                                        }}
                                        className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${form.postType === type.value
                                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                        }
                      ${errors.postType ? 'border-red-500' : ''}
                    `}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                      <span className={form.postType === type.value ? 'text-purple-600' : 'text-gray-400'}>
                        {type.icon}
                      </span>
                                            <span className={`font-medium ${form.postType === type.value ? 'text-purple-700' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.postType && <p className="text-xs text-red-500">{errors.postType}</p>}
                            {form.postType && (
                                <p className="text-xs text-gray-500">
                                    Selected: <span className="font-medium">{getPostTypeLabel(form.postType as string)}</span>
                                </p>
                            )}
                        </div>

                        {/* Deadline Date */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Deadline Date <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="date"
                                    required
                                    value={form.deadlineDate}
                                    min={today}
                                    max={maxDateStr}
                                    onChange={(e) => {
                                        setForm(f => ({ ...f, deadlineDate: e.target.value }));
                                        setErrors(e => ({ ...e, deadlineDate: '' }));
                                    }}
                                    disabled={isSubmitting}
                                    className={`pl-9 ${errors.deadlineDate ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.deadlineDate && <p className="text-xs text-red-500">{errors.deadlineDate}</p>}
                        </div>

                        {/* Hidden rowVersion */}
                        <input type="hidden" name="rowVersion" value={form.rowVersion} />

                        {/* Info Box */}
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-purple-700">Update Information</p>
                                    <p className="text-xs text-purple-600 mt-1">
                                        Changes to the post type and deadline will affect applicant visibility.
                                        Please review before saving.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/hr/recruitment/posting/${postId}`)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={isSubmitting || !form.deadlineDate}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default JobPostingEdit;