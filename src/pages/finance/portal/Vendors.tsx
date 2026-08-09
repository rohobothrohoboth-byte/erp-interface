// src/pages/finance/portal/VendorPortal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Plus, Search, RefreshCw, Eye, Edit, Trash2,
    DollarSign, Calendar, Building2, User, X, Save,
    AlertCircle, CheckCircle, Clock, Download, Printer,
    Filter, ChevronLeft, ChevronRight, FileText,
    Send, Upload, Paperclip, Link2, MessageCircle,
    Bell, CreditCard, Receipt, Banknote, Landmark,
    Shield, BadgeCheck, ExternalLink, Globe,
    Phone, Mail, MapPin, Award, Star, TrendingUp,
    Activity, Check, EyeOff
} from 'lucide-react';
import { useReportExport } from '../../../hooks/useReportExport';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import {
    getPortalVendors,
    createPortalVendor,
    updatePortalVendor,
    deletePortalVendor,
    getPortalInvoices,
    submitPortalInvoice,
    updatePortalInvoice,
    deletePortalInvoice,
    getInvoiceTracking,
    getPortalNotifications,
    markPortalNotificationRead,
    sendPortalNotification,
    deletePortalNotification,
    getPortalPayments,
} from '../../../services/finance/finance.api';

interface VendorPortalUser {
    id: string;
    vendorId: string;
    vendorName: string;
    email: string;
    phone: string;
    role: 'Admin' | 'Submitter' | 'Viewer';
    status: 'Active' | 'Inactive' | 'Pending';
    lastLogin: string;
    createdAt: string;
    permissions: string[];
    rowVersion?: string;
}

interface VendorInvoice {
    id: string;
    invoiceNumber: string;
    vendorId: string;
    vendorName: string;
    amount: number;
    invoiceDate: string;
    dueDate: string;
    status: 'Draft' | 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Paid' | 'Scheduled';
    submittedBy: string;
    submittedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    paymentDate?: string;
    paymentReference?: string;
    notes: string;
    attachments: string[];
    trackingHistory: TrackingEvent[];
    rowVersion?: string;
}

interface TrackingEvent {
    id: string;
    timestamp: string;
    status: string;
    description: string;
    performedBy: string;
}

interface Notification {
    id: string;
    vendorId: string;
    vendorName: string;
    type: 'Invoice_Approved' | 'Invoice_Rejected' | 'Payment_Scheduled' | 'Payment_Made' | 'Reminder' | 'Portal_Update';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
    rowVersion?: string;
}

interface PortalStats {
    totalVendors: number;
    activeVendors: number;
    totalInvoices: number;
    submittedInvoices: number;
    approvedInvoices: number;
    paidInvoices: number;
    totalAmount: number;
    pendingNotifications: number;
    avgApprovalTime: number;
}

interface InvoiceFormData {
    vendorId: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    amount: string;
    description: string;
    attachments: File[];
    notes: string;
}

const PortalVendors: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'vendors' | 'invoices' | 'notifications'>('vendors');
    const [vendors, setVendors] = useState<VendorPortalUser[]>([]);
    const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState<VendorInvoice | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<VendorPortalUser | null>(null);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isVendorFormModalOpen, setIsVendorFormModalOpen] = useState(false);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invoiceTracking, setInvoiceTracking] = useState<TrackingEvent[]>([]);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [invoiceForm, setInvoiceForm] = useState<InvoiceFormData>({
        vendorId: '',
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        amount: '',
        description: '',
        attachments: [],
        notes: '',
    });
    const [vendorForm, setVendorForm] = useState<Partial<VendorPortalUser>>({
        status: 'Pending',
        role: 'Submitter',
    });

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
        title,
    } = useReportExport('vendor-portal');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterStatus && filterStatus !== 'All') {
                if (activeTab === 'vendors') params.status = filterStatus;
                if (activeTab === 'invoices') params.status = filterStatus;
                if (activeTab === 'notifications') {
                    params.isRead = filterStatus === 'Read';
                }
            }
            if (searchTerm) params.search = searchTerm;

            if (activeTab === 'vendors') {
                const vendorsRes = await getPortalVendors(params);
                let vendorsData: VendorPortalUser[] = [];
                if (vendorsRes?.data) {
                    if (Array.isArray(vendorsRes.data)) {
                        vendorsData = vendorsRes.data;
                    } else if (vendorsRes.data.data && Array.isArray(vendorsRes.data.data)) {
                        vendorsData = vendorsRes.data.data;
                    } else if (vendorsRes.data.$values && Array.isArray(vendorsRes.data.$values)) {
                        vendorsData = vendorsRes.data.$values;
                    }
                }
                setVendors(vendorsData);
            }

            if (activeTab === 'invoices') {
                const invoicesRes = await getPortalInvoices(params);
                let invoicesData: VendorInvoice[] = [];
                if (invoicesRes?.data) {
                    if (Array.isArray(invoicesRes.data)) {
                        invoicesData = invoicesRes.data;
                    } else if (invoicesRes.data.data && Array.isArray(invoicesRes.data.data)) {
                        invoicesData = invoicesRes.data.data;
                    } else if (invoicesRes.data.$values && Array.isArray(invoicesRes.data.$values)) {
                        invoicesData = invoicesRes.data.$values;
                    }
                }
                setInvoices(invoicesData);
            }

            if (activeTab === 'notifications') {
                const notificationsRes = await getPortalNotifications(params);
                let notificationsData: Notification[] = [];
                if (notificationsRes?.data) {
                    if (Array.isArray(notificationsRes.data)) {
                        notificationsData = notificationsRes.data;
                    } else if (notificationsRes.data.data && Array.isArray(notificationsRes.data.data)) {
                        notificationsData = notificationsRes.data.data;
                    } else if (notificationsRes.data.$values && Array.isArray(notificationsRes.data.$values)) {
                        notificationsData = notificationsRes.data.$values;
                    }
                }
                setNotifications(notificationsData);
            }
        } catch (error) {
            console.error('Error fetching portal data:', error);
            showToast.error('Failed to load portal data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [activeTab, filterStatus, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): PortalStats => {
        const active = vendors.filter(v => v.status === 'Active').length;
        const submitted = invoices.filter(i => i.status === 'Submitted' || i.status === 'UnderReview').length;
        const approved = invoices.filter(i => i.status === 'Approved').length;
        const paid = invoices.filter(i => i.status === 'Paid').length;
        const unread = notifications.filter(n => !n.isRead).length;

        return {
            totalVendors: vendors.length,
            activeVendors: active,
            totalInvoices: invoices.length,
            submittedInvoices: submitted,
            approvedInvoices: approved,
            paidInvoices: paid,
            totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
            pendingNotifications: unread,
            avgApprovalTime: 48,
        };
    };

    const stats = getStats();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Active: 'bg-green-100 text-green-700 border-green-200',
            Inactive: 'bg-gray-100 text-gray-700 border-gray-200',
            Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Draft: 'bg-gray-100 text-gray-700 border-gray-200',
            Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
            UnderReview: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Approved: 'bg-green-100 text-green-700 border-green-200',
            Rejected: 'bg-red-100 text-red-700 border-red-200',
            Paid: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            Scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
            Read: 'bg-gray-100 text-gray-700 border-gray-200',
            Unread: 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Submitted': return <Send className="h-4 w-4" />;
            case 'UnderReview': return <Clock className="h-4 w-4" />;
            case 'Approved': return <CheckCircle className="h-4 w-4" />;
            case 'Rejected': return <X className="h-4 w-4" />;
            case 'Paid': return <DollarSign className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const resetInvoiceForm = () => {
        setInvoiceForm({
            vendorId: '',
            invoiceNumber: '',
            invoiceDate: '',
            dueDate: '',
            amount: '',
            description: '',
            attachments: [],
            notes: '',
        });
    };

    const handleSubmitInvoice = async () => {
        if (!invoiceForm.vendorId || !invoiceForm.invoiceDate || !invoiceForm.dueDate || !invoiceForm.amount) {
            showToast.error('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                vendorId: invoiceForm.vendorId,
                invoiceNumber: invoiceForm.invoiceNumber || `INV-${Date.now()}`,
                invoiceDate: new Date(invoiceForm.invoiceDate).toISOString(),
                dueDate: new Date(invoiceForm.dueDate).toISOString(),
                amount: parseFloat(invoiceForm.amount),
                description: invoiceForm.description,
                notes: invoiceForm.notes,
            };

            const response = await submitPortalInvoice(payload);
            showToast.success(`Invoice ${response.data?.invoiceNumber || 'submitted'} successfully`);

            // Send notification to vendor
            await sendPortalNotification({
                vendorId: invoiceForm.vendorId,
                type: 'Reminder',
                title: 'Invoice Submitted',
                message: `Your invoice has been submitted for review`,
            });

            setIsSubmitModalOpen(false);
            resetInvoiceForm();
            await fetchData();
        } catch (error: any) {
            console.error('Error submitting invoice:', error);
            showToast.error(error.response?.data?.message || 'Failed to submit invoice');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTrackInvoice = async (invoiceId: string) => {
        try {
            const response = await getInvoiceTracking(invoiceId);
            if (response?.data) {
                setInvoiceTracking(Array.isArray(response.data) ? response.data : [response.data]);
                setIsTrackingModalOpen(true);
            }
        } catch (error: any) {
            console.error('Error fetching invoice tracking:', error);
            showToast.error('Failed to load invoice tracking');
        }
    };

    const handleMarkNotificationRead = async (notificationId: string) => {
        try {
            await markPortalNotificationRead(notificationId);
            await fetchData();
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
            showToast.error('Failed to update notification');
        }
    };

    const handleViewInvoice = (invoice: VendorInvoice) => {
        setSelectedInvoice(invoice);
        setIsViewModalOpen(true);
    };

    const handleDeleteInvoice = async (invoiceId: string) => {
        try {
            await deletePortalInvoice(invoiceId);
            showToast.success('Invoice deleted successfully');
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting invoice:', error);
            showToast.error('Failed to delete invoice');
        }
    };

    const handleVendorFormSubmit = async () => {
        try {
            setIsSubmitting(true);
            if (formMode === 'create') {
                await createPortalVendor(vendorForm);
                showToast.success('Vendor created successfully');
            } else {
                await updatePortalVendor(vendorForm);
                showToast.success('Vendor updated successfully');
            }
            setIsVendorFormModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error saving vendor:', error);
            showToast.error('Failed to save vendor');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteVendor = async (vendorId: string) => {
        try {
            await deletePortalVendor(vendorId);
            showToast.success('Vendor deleted successfully');
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting vendor:', error);
            showToast.error('Failed to delete vendor');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Globe className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Vendor Self-Service Portal</h1>
                        <p className="text-sm text-gray-500">Invoice submission, payment tracking, and vendor management</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => handleRefresh(fetchData)}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={exporting}
                    >
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport({ vendors, invoices, notifications, stats })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        onClick={() => {
                            setFormMode('create');
                            setVendorForm({ status: 'Pending', role: 'Submitter' });
                            setIsVendorFormModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Users size={16} />
                        Add Vendor
                    </Button>
                    <Button
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Upload size={16} />
                        Submit Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Vendors</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.totalVendors}</p>
                                <p className="text-xs text-blue-600 mt-1">{stats.activeVendors} active</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Users className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Invoices</p>
                                <p className="text-2xl font-bold text-green-900">{stats.totalInvoices}</p>
                                <p className="text-xs text-green-600 mt-1">{stats.submittedInvoices} pending</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <FileText className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Amount</p>
                                <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalAmount)}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Approved</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.approvedInvoices}</p>
                                <p className="text-xs text-indigo-600 mt-1">{stats.paidInvoices} paid</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-xl">
                                <BadgeCheck className="h-6 w-6 text-indigo-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Avg Approval Time</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.avgApprovalTime}h</p>
                                <p className="text-xs text-orange-600 mt-1">Time to approve</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-xl">
                                <Clock className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Notifications</p>
                                <p className="text-2xl font-bold text-red-900">{stats.pendingNotifications}</p>
                                <p className="text-xs text-red-600 mt-1">Unread messages</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-xl">
                                <Bell className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'vendors'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Users className="h-4 w-4 inline mr-2" />
                        Vendors
                    </button>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'invoices'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileText className="h-4 w-4 inline mr-2" />
                        Invoices
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'notifications'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Bell className="h-4 w-4 inline mr-2" />
                        Notifications
                        {stats.pendingNotifications > 0 && (
                            <Badge className="ml-2 bg-red-500 text-white">
                                {stats.pendingNotifications}
                            </Badge>
                        )}
                    </button>
                </nav>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        {activeTab === 'vendors' && (
                            <>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                            </>
                        )}
                        {activeTab === 'invoices' && (
                            <>
                                <SelectItem value="Submitted">Submitted</SelectItem>
                                <SelectItem value="UnderReview">Under Review</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Scheduled">Payment Scheduled</SelectItem>
                            </>
                        )}
                        {activeTab === 'notifications' && (
                            <>
                                <SelectItem value="Read">Read</SelectItem>
                                <SelectItem value="Unread">Unread</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('All');
                        setCurrentPage(1);
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    <X size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Content Tables */}
            {activeTab === 'vendors' && (
                <VendorsTable
                    vendors={vendors}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    onEdit={(vendor) => {
                        setFormMode('edit');
                        setVendorForm(vendor);
                        setIsVendorFormModalOpen(true);
                    }}
                    onDelete={(vendorId) => handleDeleteVendor(vendorId)}
                    onView={(vendor) => {
                        setSelectedVendor(vendor);
                        setIsViewModalOpen(true);
                    }}
                />
            )}

            {activeTab === 'invoices' && (
                <InvoicesTable
                    invoices={invoices}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    onView={(invoice) => handleViewInvoice(invoice)}
                    onTrack={(invoiceId) => handleTrackInvoice(invoiceId)}
                    onDelete={(invoiceId) => handleDeleteInvoice(invoiceId)}
                />
            )}

            {activeTab === 'notifications' && (
                <NotificationsTable
                    notifications={notifications}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    formatDateTime={formatDateTime}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    onMarkRead={(id) => handleMarkNotificationRead(id)}
                    onView={(notification) => {
                        setSelectedNotification(notification);
                        setIsViewModalOpen(true);
                        if (!notification.isRead) {
                            handleMarkNotificationRead(notification.id);
                        }
                    }}
                />
            )}

            {/* Submit Invoice Modal */}
            <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-green-600" />
                            Submit Invoice
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the invoice details and submit for approval
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Vendor *</Label>
                                <Select
                                    value={invoiceForm.vendorId}
                                    onValueChange={(value) => setInvoiceForm({ ...invoiceForm, vendorId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendors.map((vendor) => (
                                            <SelectItem key={vendor.id} value={vendor.id}>
                                                {vendor.vendorName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Invoice Number</Label>
                                <Input
                                    value={invoiceForm.invoiceNumber}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                                    placeholder="e.g., INV-2025-001"
                                />
                            </div>
                            <div>
                                <Label>Invoice Date *</Label>
                                <Input
                                    type="date"
                                    value={invoiceForm.invoiceDate}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Due Date *</Label>
                                <Input
                                    type="date"
                                    value={invoiceForm.dueDate}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Amount *</Label>
                                <Input
                                    type="number"
                                    value={invoiceForm.amount}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label>Attachments</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setInvoiceForm({ ...invoiceForm, attachments: Array.from(e.target.files) });
                                            }
                                        }}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                            {invoiceForm.attachments.length > 0
                                                ? `${invoiceForm.attachments.length} files selected`
                                                : 'Click to upload files'}
                                        </span>
                                        <span className="text-xs text-gray-400">PDF, Excel, Images (Max 10MB)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Input
                                    value={invoiceForm.description}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                                    placeholder="Brief description of the invoice"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={invoiceForm.notes}
                                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                                    placeholder="Additional notes"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleSubmitInvoice}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Invoice'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tracking Modal */}
            <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            Invoice Tracking
                        </DialogTitle>
                        <DialogDescription>
                            Track the status and history of this invoice
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="relative pl-8 space-y-4">
                            {invoiceTracking && invoiceTracking.length > 0 ? (
                                invoiceTracking.map((track, idx) => (
                                    <div key={track.id || idx} className="relative">
                                        {idx < invoiceTracking.length - 1 && (
                                            <div className="absolute left-[-20px] top-5 w-[2px] h-full bg-gray-200"></div>
                                        )}
                                        <div className="flex items-start gap-4">
                                            <div className="relative z-10">
                                                <div className={`w-3 h-3 rounded-full mt-1.5 ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-sm">{track.status}</p>
                                                    <p className="text-xs text-gray-400">{formatDateTime(track.timestamp)}</p>
                                                </div>
                                                <p className="text-sm text-gray-500">{track.description}</p>
                                                <p className="text-xs text-gray-400">By: {track.performedBy}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No tracking information available</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTrackingModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View/Edit Vendor Modal */}
            <Dialog open={isVendorFormModalOpen} onOpenChange={setIsVendorFormModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            {formMode === 'create' ? 'Add Vendor' : 'Edit Vendor'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-4">
                            <div>
                                <Label>Vendor Name *</Label>
                                <Input
                                    value={vendorForm.vendorName || ''}
                                    onChange={(e) => setVendorForm({ ...vendorForm, vendorName: e.target.value })}
                                    placeholder="Vendor name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={vendorForm.email || ''}
                                        onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                                        placeholder="Email"
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={vendorForm.phone || ''}
                                        onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                                        placeholder="Phone"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Role</Label>
                                    <Select
                                        value={vendorForm.role || 'Submitter'}
                                        onValueChange={(value) => setVendorForm({ ...vendorForm, role: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="Submitter">Submitter</SelectItem>
                                            <SelectItem value="Viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        value={vendorForm.status || 'Pending'}
                                        onValueChange={(value) => setVendorForm({ ...vendorForm, status: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>Permissions</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['submit_invoices', 'view_payments', 'view_invoices', 'edit_profile'].map((perm) => (
                                        <Badge
                                            key={perm}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                const current = vendorForm.permissions || [];
                                                const updated = current.includes(perm)
                                                    ? current.filter(p => p !== perm)
                                                    : [...current, perm];
                                                setVendorForm({ ...vendorForm, permissions: updated });
                                            }}
                                        >
                                            {vendorForm.permissions?.includes(perm) ? (
                                                <Check className="h-3 w-3 mr-1 text-green-600" />
                                            ) : null}
                                            {perm.replace('_', ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVendorFormModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleVendorFormSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (formMode === 'create' ? 'Create' : 'Update')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {activeTab === 'vendors' ? (
                                <Users className="h-5 w-5 text-indigo-600" />
                            ) : activeTab === 'invoices' ? (
                                <FileText className="h-5 w-5 text-green-600" />
                            ) : (
                                <Bell className="h-5 w-5 text-blue-600" />
                            )}
                            Details
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {activeTab === 'vendors' && selectedVendor && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Vendor ID</p>
                                        <p className="font-medium">{selectedVendor.vendorId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{selectedVendor.vendorName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{selectedVendor.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{selectedVendor.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Role</p>
                                        <Badge variant="outline">{selectedVendor.role}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <Badge className={getStatusColor(selectedVendor.status)}>{selectedVendor.status}</Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Last Login</p>
                                        <p className="font-medium">{formatDate(selectedVendor.lastLogin)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Permissions</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedVendor.permissions?.map((perm) => (
                                                <Badge key={perm} variant="outline" className="text-xs">
                                                    {perm.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'invoices' && selectedInvoice && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Invoice #</p>
                                        <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Vendor</p>
                                        <p className="font-medium">{selectedInvoice.vendorName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Amount</p>
                                        <p className="font-medium">{formatCurrency(selectedInvoice.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <Badge className={getStatusColor(selectedInvoice.status)}>{selectedInvoice.status}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Invoice Date</p>
                                        <p className="font-medium">{formatDate(selectedInvoice.invoiceDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Due Date</p>
                                        <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Notes</p>
                                        <p className="font-medium">{selectedInvoice.notes || 'No notes'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'notifications' && selectedNotification && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">{selectedNotification.title}</h3>
                                    {!selectedNotification.isRead && (
                                        <Badge className="bg-blue-100 text-blue-700">New</Badge>
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">{selectedNotification.message}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Vendor:</span>
                                        <span className="ml-2 font-medium">{selectedNotification.vendorName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Type:</span>
                                        <span className="ml-2 font-medium">{selectedNotification.type}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Created:</span>
                                        <span className="ml-2 font-medium">{formatDateTime(selectedNotification.createdAt)}</span>
                                    </div>
                                    {selectedNotification.link && (
                                        <div className="col-span-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => window.location.href = selectedNotification.link!}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View Related Item
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export Vendor Portal Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the vendor portal report in your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select
                                value={exportFormat}
                                onValueChange={(value: any) => setExportFormat(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-red-500" />
                                            PDF - Printable Document
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="excel">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-600" />
                                            Excel - Spreadsheet
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="csv">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            CSV - Comma separated values
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Vendors: <strong>{stats.totalVendors}</strong></p>
                                <p>Invoices: <strong>{stats.totalInvoices}</strong></p>
                                <p>Total Amount: <strong>{formatCurrency(stats.totalAmount)}</strong></p>
                                <p>Pending Notifications: <strong>{stats.pendingNotifications}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => handleExport({ vendors, invoices, notifications, stats })}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export {exportFormat.toUpperCase()}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

// Vendors Table Component
const VendorsTable: React.FC<any> = ({
                                         vendors, searchTerm, filterStatus, currentPage, setCurrentPage,
                                         ITEMS_PER_PAGE, formatDate, getStatusColor, onEdit, onDelete, onView
                                     }) => {
    const filtered = vendors.filter((v: any) => {
        const matchesSearch = (v.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No vendors found</td>
                        </tr>
                    ) : (
                        paginated.map((vendor: any) => (
                            <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{vendor.vendorName}</p>
                                        <p className="text-xs text-gray-500">{vendor.vendorId}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm text-gray-600">
                                        <p>{vendor.email}</p>
                                        <p className="text-xs">{vendor.phone}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant="outline" className="text-xs">{vendor.role}</Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {vendor.lastLogin ? formatDate(vendor.lastLogin) : 'Never'}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge className={getStatusColor(vendor.status)}>{vendor.status}</Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => onView(vendor)} className="p-1 hover:bg-blue-100 rounded-lg" title="View">
                                            <Eye size={16} className="text-blue-500" />
                                        </button>
                                        <button onClick={() => onEdit(vendor)} className="p-1 hover:bg-yellow-100 rounded-lg" title="Edit">
                                            <Edit size={16} className="text-yellow-500" />
                                        </button>
                                        <button onClick={() => onDelete(vendor.id)} className="p-1 hover:bg-red-100 rounded-lg" title="Delete">
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Invoices Table Component
const InvoicesTable: React.FC<any> = ({
                                          invoices, searchTerm, filterStatus, currentPage, setCurrentPage,
                                          ITEMS_PER_PAGE, formatDate, formatCurrency, getStatusColor, getStatusIcon,
                                          onView, onTrack, onDelete
                                      }) => {
    const filtered = invoices.filter((inv: any) => {
        const matchesSearch = (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No invoices found</td>
                        </tr>
                    ) : (
                        paginated.map((invoice: any) => (
                            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{invoice.vendorName}</td>
                                <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(invoice.amount)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                                <td className="px-4 py-3">
                                    <Badge className={getStatusColor(invoice.status)}>
                                            <span className="flex items-center gap-1">
                                                {getStatusIcon(invoice.status)}
                                                {invoice.status}
                                            </span>
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => onView(invoice)} className="p-1 hover:bg-blue-100 rounded-lg" title="View">
                                            <Eye size={16} className="text-blue-500" />
                                        </button>
                                        <button onClick={() => onTrack(invoice.id)} className="p-1 hover:bg-purple-100 rounded-lg" title="Track">
                                            <Activity size={16} className="text-purple-500" />
                                        </button>
                                        <button onClick={() => onDelete(invoice.id)} className="p-1 hover:bg-red-100 rounded-lg" title="Delete">
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Notifications Table Component
const NotificationsTable: React.FC<any> = ({
                                               notifications, searchTerm, filterStatus, currentPage, setCurrentPage,
                                               ITEMS_PER_PAGE, formatDateTime, formatDate, getStatusColor, onMarkRead, onView
                                           }) => {
    const filtered = notifications.filter((n: any) => {
        const matchesSearch = (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.message || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Read' && n.isRead) ||
            (filterStatus === 'Unread' && !n.isRead);
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No notifications found</td>
                        </tr>
                    ) : (
                        paginated.map((notification: any) => (
                            <tr key={notification.id} className={`hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
                                <td className="px-4 py-3 text-center">
                                    {!notification.isRead ? (
                                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                                    ) : (
                                        <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{notification.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{notification.vendorName}</td>
                                <td className="px-4 py-3">
                                    <Badge variant="outline" className="text-xs">{notification.type}</Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(notification.createdAt)}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => onView(notification)} className="p-1 hover:bg-blue-100 rounded-lg" title="View">
                                            <Eye size={16} className="text-blue-500" />
                                        </button>
                                        {!notification.isRead && (
                                            <button onClick={() => onMarkRead(notification.id)} className="p-1 hover:bg-green-100 rounded-lg" title="Mark as Read">
                                                <Check size={16} className="text-green-500" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PortalVendors;