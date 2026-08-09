// src/components/hr/recruitment/applicant/ApplicantDetailModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Briefcase, MapPin, GraduationCap, Star,
    Mail, Phone, Calendar, Building2, FileText,
    Award, Clock, CheckCircle, XCircle, AlertCircle,
    Download, Printer, UserCheck, UserX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { useApplicantDetail } from '../../../../services/hr/recruitment/applicant/applicant.queries';
import { format } from 'date-fns';
import { Skeleton } from '../../../ui/skeleton';

interface ApplicantDetailModalProps {
    applicantId: string | null;
    onClose: () => void;
    onShortlist?: (id: string) => void;
    onReject?: (id: string) => void;
}

const Field = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) =>
    value ? (
        <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
            {icon && <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>}
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">{value}</p>
            </div>
        </div>
    ) : null;

const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        'Applied': {
            label: 'Applied',
            className: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: <Clock className="w-3 h-3" />
        },
        'Reviewed': {
            label: 'Reviewed',
            className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            icon: <Star className="w-3 h-3" />
        },
        'Shortlisted': {
            label: 'Shortlisted',
            className: 'bg-purple-100 text-purple-700 border-purple-200',
            icon: <UserCheck className="w-3 h-3" />
        },
        'Interviewed': {
            label: 'Interviewed',
            className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            icon: <User className="w-3 h-3" />
        },
        'Offered': {
            label: 'Offered',
            className: 'bg-green-100 text-green-700 border-green-200',
            icon: <FileText className="w-3 h-3" />
        },
        'Hired': {
            label: 'Hired',
            className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            icon: <Award className="w-3 h-3" />
        },
        'Rejected': {
            label: 'Rejected',
            className: 'bg-red-100 text-red-700 border-red-200',
            icon: <XCircle className="w-3 h-3" />
        },
    };

    const info = statusMap[status] || {
        label: status || 'Unknown',
        className: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <AlertCircle className="w-3 h-3" />
    };

    return (
        <Badge className={`flex items-center gap-1 px-2 py-1 ${info.className}`}>
            {info.icon}
            {info.label}
        </Badge>
    );
};

const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({
                                                                       applicantId,
                                                                       onClose,
                                                                       onShortlist,
                                                                       onReject
                                                                   }) => {
    const { data, isLoading, error } = useApplicantDetail(applicantId ?? '');

    console.log('ApplicantDetailModal - Data:', data);
    console.log('ApplicantDetailModal - Error:', error);

    // Handle ESC key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const formatDate = (date: string | undefined) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <AnimatePresence>
            {applicantId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10 shrink-0">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <User size={20} className="text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-gray-800">Applicant Details</h2>
                                {data && (
                                    <p className="text-xs text-gray-500 truncate">
                                        {data.applicant || 'N/A'} · {data.jobPostingNum || 'N/A'}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-full rounded-xl" />
                                    <Skeleton className="h-16 w-full rounded-xl" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <AlertCircle className="w-16 h-16 text-red-300 mb-4" />
                                    <p className="text-gray-500 font-medium">Error loading applicant</p>
                                    <p className="text-sm text-gray-400">{(error as Error)?.message || 'Please try again'}</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => window.location.reload()}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : data ? (
                                <div className="space-y-6">
                                    {/* Applicant Profile */}
                                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                            <User className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <p className="font-bold text-gray-900 text-xl">{data.applicant || 'N/A'}</p>
                                                <StatusBadge status={data.statusStr || 'Applied'} />
                                            </div>
                                            <p className="text-sm text-gray-600">{data.position || 'N/A'}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    Applied: {formatDate(data.appliedDate)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Building2 size={12} />
                                                    {data.department || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <Mail size={14} /> Contact Information
                                        </p>
                                        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {data.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{data.email}</span>
                                                </div>
                                            )}
                                            {data.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{data.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Posting Info */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <Briefcase size={14} /> Job Information
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Field label="Post Number" value={data.jobPostingNum} icon={<FileText size={14} />} />
                                            <Field label="Position" value={data.position} icon={<Briefcase size={14} />} />
                                            <Field label="Department" value={data.department} icon={<Building2 size={14} />} />
                                            <Field label="Applied Date" value={formatDate(data.appliedDate)} icon={<Calendar size={14} />} />
                                        </div>
                                    </div>

                                    {/* Status History - Optional */}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <Clock size={14} /> Status
                                        </p>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={data.statusStr || 'Applied'} />
                                                <span className="text-xs text-gray-400">
                                                    Updated: {formatDate(data.dateMod || data.dateAdd)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">No details found</p>
                                    <p className="text-sm text-gray-400">The applicant data could not be loaded</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 text-gray-600"
                                    onClick={() => {
                                        if (data) {
                                            // Download logic
                                            toast.info('Export functionality coming soon');
                                        }
                                    }}
                                >
                                    <Download size={14} />
                                    Export
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                {data && data.statusStr !== 'Shortlisted' && data.statusStr !== 'Rejected' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                                        onClick={() => {
                                            if (onShortlist && data) {
                                                onShortlist(data.id);
                                                onClose();
                                            }
                                        }}
                                    >
                                        <UserCheck size={14} />
                                        Shortlist
                                    </Button>
                                )}
                                {data && data.statusStr !== 'Rejected' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => {
                                            if (onReject && data) {
                                                onReject(data.id);
                                                onClose();
                                            }
                                        }}
                                    >
                                        <UserX size={14} />
                                        Reject
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="cursor-pointer"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ApplicantDetailModal;