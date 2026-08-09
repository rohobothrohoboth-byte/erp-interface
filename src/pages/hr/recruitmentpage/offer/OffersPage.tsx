// src/pages/hr/recruitmentpage/offer/OffersPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Plus,
    Search,
    RefreshCw,
    Loader2,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    User,
    DollarSign,
    Calendar,
    Send,
    Mail,
    Users,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import {
    useOffers,
    useDeleteOffer,
    useSendOffer,
    useCreateOffer
} from '../../../../services/hr/recruitment/offer/offer.queries';
import { useAllApplicants } from '../../../../services/hr/recruitment/applicant/applicant.queries';
import { useJobPostings } from '../../../../services/hr/recruitment/jobPosting/jobPosting.queries';
import { useAuthStore } from '../../../../stores/auth.store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import OfferCreateModal from '../../../../components/hr/recruitment/offer/OfferCreate';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

const OffersPage: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);

    // ✅ State for Create Offer Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedApplicantId, setSelectedApplicantId] = useState('');
    const [selectedJobPostingId, setSelectedJobPostingId] = useState('');

    // ✅ State for "Create Offer" dropdown
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const [selectedApplicantForOffer, setSelectedApplicantForOffer] = useState('');

    const { data: offers = [], isLoading, refetch } = useOffers();
    const { data: applicants = [] } = useAllApplicants();
    const { data: postings = [] } = useJobPostings();

    const deleteMutation = useDeleteOffer({
        onSuccess: () => {
            toast.success('Offer deleted successfully');
            setShowDeleteModal(false);
            refetch();
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

    const filteredOffers = offers?.filter(offer => {
        const matchesTab = activeTab === 'all' || offer.status?.toLowerCase() === activeTab;
        const matchesSearch = offer.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            offer.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            offer.applicantEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

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

    // ✅ Handler to open create modal
    const openCreateModal = (applicantId: string) => {
        const applicant = applicants.find(a => a.id === applicantId);
        if (applicant) {
            setSelectedApplicantId(applicantId);
            setSelectedJobPostingId(applicant.jobPostingId || '');
            setShowCreateModal(true);
            setShowCreateDropdown(false);
            setSelectedApplicantForOffer('');
        } else {
            toast.error('Please select a valid applicant');
        }
    };

    // ✅ Get applicants who don't have offers yet (or you can remove this filter)
    const availableApplicants = applicants.filter(app =>
        !offers.some(offer => offer.applicantId === app.id)
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage job offers</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {isHR && (
                        <div className="relative">
                            <Button
                                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Offer
                            </Button>

                            {/* ✅ Dropdown for selecting applicant */}
                            {showCreateDropdown && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-3">
                                    <div className="mb-2">
                                        <p className="text-xs font-medium text-gray-500">Select Applicant</p>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {availableApplicants.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-2">No applicants available</p>
                                        ) : (
                                            availableApplicants.map((app) => (
                                                <button
                                                    key={app.id}
                                                    onClick={() => openCreateModal(app.id)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm flex items-center gap-2"
                                                >
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{app.applicant}</p>
                                                        <p className="text-xs text-gray-500">{app.position}</p>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => setShowCreateDropdown(false)}
                                            className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Offers</p>
                        <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Sent</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {offers.filter(o => o.status === 'Sent').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Accepted</p>
                        <p className="text-2xl font-bold text-green-600">
                            {offers.filter(o => o.status === 'Accepted').length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">
                            {offers.filter(o => o.status === 'Rejected').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="draft">Draft</TabsTrigger>
                                <TabsTrigger value="sent">Sent</TabsTrigger>
                                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search offers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="space-y-4">
                {filteredOffers && filteredOffers.length > 0 ? (
                    filteredOffers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
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
                                                    <FileText className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {offer.position || 'Position'}
                                                        </h3>
                                                        {getStatusBadge(offer.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <User className="w-3.5 h-3.5 inline mr-1" />
                                                        {offer.applicantName}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-3.5 h-3.5" />
                                                            {formatCurrency(offer.salary || 0, offer.currency || 'USD')}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Start: {offer.startDate ? formatDate(offer.startDate) : 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {offer.applicantEmail}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/hr/recruitment/offer/${offer.id}`)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                View
                                            </Button>
                                            {isHR && offer.status === 'Draft' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedOffer(offer.id);
                                                            setShowSendModal(true);
                                                        }}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <Send className="w-3.5 h-3.5 mr-1" />
                                                        Send
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/hr/recruitment/offer/${offer.id}`)}
                                                        className="text-blue-600"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                            {isHR && (offer.status === 'Draft' || offer.status === 'Rejected') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedOffer(offer.id);
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
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No offers found</p>
                            <p className="text-sm text-gray-400">Create an offer to get started</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Offer</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">Are you sure you want to delete this offer? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => selectedOffer && deleteMutation.mutate(selectedOffer)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Modal */}
            <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Offer</DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-600">
                        Are you sure you want to send this offer to the candidate?
                        They will receive an email with the offer details.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSendModal(false)} disabled={sendMutation.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={() => selectedOffer && sendMutation.mutate(selectedOffer)} disabled={sendMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Send Offer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ✅ Create Offer Modal */}
            <OfferCreateModal
                isOpen={showCreateModal}
                applicantId={selectedApplicantId}
                jobPostingId={selectedJobPostingId}
                onClose={() => {
                    setShowCreateModal(false);
                    setSelectedApplicantId('');
                    setSelectedJobPostingId('');
                }}
                onSuccess={() => {
                    setShowCreateModal(false);
                    setSelectedApplicantId('');
                    setSelectedJobPostingId('');
                    refetch();
                }}
            />
        </motion.div>
    );
};

export default OffersPage;