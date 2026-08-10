// src/pages/hr/recruitmentpage/offer/OfferDetail.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    User,
    DollarSign,
    Calendar,
    Mail,
    Edit,
    Trash2,
    Send,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Briefcase,
    Save,
    AlertCircle,
    Download,
    Printer,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { useOffer, useUpdateOffer, useDeleteOffer, useSendOffer } from '@/modules/hr/services/recruitment/offer/offer.queries';
import { useAuthStore } from '@/shared/stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const OfferDetail: React.FC = () => {
    const { offerId = '' } = useParams<{ offerId: string }>();
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [form, setForm] = useState({
        salary: 0,
        benefits: '',
        startDate: '',
        expiryDate: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ✅ Check if offerId is valid (not "new" or empty)
    const isValidId = offerId && offerId !== 'new' && offerId.length > 5;

    const { data: offer, isLoading, refetch } = useOffer(isValidId ? offerId : undefined);
    const updateMutation = useUpdateOffer({
        onSuccess: () => {
            toast.success('Offer updated successfully');
            setIsEditing(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to update offer'),
    });
    const deleteMutation = useDeleteOffer({
        onSuccess: () => {
            toast.success('Offer deleted successfully');
            navigate('/hr/recruitment/offers');
        },
        onError: (error) => toast.error(error.message || 'Failed to delete offer'),
    });
    const sendMutation = useSendOffer({
        onSuccess: () => {
            toast.success('Offer sent successfully');
            setShowSendModal(false);
            refetch();
        },
        onError: (error) => toast.error(error.message || 'Failed to send offer'),
    });

    const isHR = role === 'admin' || role === 'hr' || role === 'HR Manager';
    const canEdit = isHR && offer?.status === 'Draft';
    const canSend = isHR && offer?.status === 'Draft';
    const canDelete = isHR && (offer?.status === 'Draft' || offer?.status === 'Rejected');

    useEffect(() => {
        if (offer) {
            setForm({
                salary: offer.salary || 0,
                benefits: offer.benefits || '',
                startDate: offer.startDate?.split('T')[0] || '',
                expiryDate: offer.expiryDate?.split('T')[0] || '',
                notes: offer.notes || '',
            });
        }
    }, [offer]);

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'Draft': {
                label: 'Draft',
                className: 'bg-gray-100 text-gray-700',
                icon: <FileText className="w-3.5 h-3.5" />,
            },
            'Sent': {
                label: 'Sent',
                className: 'bg-blue-100 text-blue-700',
                icon: <Mail className="w-3.5 h-3.5" />,
            },
            'Accepted': {
                label: 'Accepted',
                className: 'bg-green-100 text-green-700',
                icon: <CheckCircle className="w-3.5 h-3.5" />,
            },
            'Rejected': {
                label: 'Rejected',
                className: 'bg-red-100 text-red-700',
                icon: <XCircle className="w-3.5 h-3.5" />,
            },
            'Expired': {
                label: 'Expired',
                className: 'bg-orange-100 text-orange-700',
                icon: <Clock className="w-3.5 h-3.5" />,
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

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.salary || form.salary <= 0) {
            newErrors.salary = 'Please enter a valid salary';
        }
        if (!form.startDate) {
            newErrors.startDate = 'Please select a start date';
        }
        if (!form.expiryDate) {
            newErrors.expiryDate = 'Please select an expiry date';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = () => {
        if (!validate() || !offer) return;
        updateMutation.mutate({
            id: offerId,
            salary: form.salary,
            benefits: form.benefits,
            startDate: form.startDate,
            expiryDate: form.expiryDate,
            status: offer.status,
            notes: form.notes,
            rowVersion: offer.rowVersion,
        });
    };

    // ✅ If invalid ID or loading, show appropriate state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
                <span className="ml-3 text-gray-600">Loading offer details...</span>
            </div>
        );
    }

    // ✅ Check if this is a "new" route (should redirect to offers page)
    if (offerId === 'new' || !isValidId) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-600">Invalid offer ID</p>
                <p className="text-sm text-gray-400">Please navigate to an existing offer</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/hr/recruitment/offers')}
                >
                    Back to Offers
                </Button>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Offer not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/hr/recruitment/offers')}
                >
                    Back to Offers
                </Button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header - same as before */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/hr/recruitment/offers')}
                        className="flex items-center gap-2 mt-0.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">Offer Details</h1>
                            {getStatusBadge(offer.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            <User className="w-3.5 h-3.5 inline mr-1" />
                            {offer.applicantName}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {canSend && (
                        <Button
                            onClick={() => setShowSendModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send Offer
                        </Button>
                    )}
                    {canEdit && (
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-blue-600"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            {isEditing ? 'Cancel' : 'Edit'}
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
                    <Button variant="outline">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Offer Details - rest of the component stays the same */}
            {/* ... */}
        </motion.div>
    );
};

export default OfferDetail;