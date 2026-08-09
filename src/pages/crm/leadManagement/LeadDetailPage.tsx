// src/pages/crm/leadManagement/LeadDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Edit, Trash2, User, Mail, Phone, Building2,
    MapPin, Briefcase, DollarSign, Calendar, Tag, Star,
    AlertCircle, CheckCircle, Clock, FileText, Users, UserPlus, Settings,Activity,
    Loader2, GitBranch, TrendingUp, Award, Target, Zap
} from 'lucide-react';
import { getLeadById, deleteLead, convertLeadToCustomer, getEmployeeById, getEmployeesForAssignment } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import LeadStatusBadge from '../../../components/crm/leadManagement/shared/LeadStatusBadge';
import LeadPriorityBadge from '../../../components/crm/leadManagement/shared/LeadPriorityBadge';
import LeadScoreBadge from '../../../components/crm/leadManagement/shared/LeadScoreBadge';
import DeleteLeadModal from '../../../components/crm/leadManagement/leadGeneration/DeleteLeadModal';
import { useAuthStore } from '../../../stores/auth.store';
import { crmApi } from '../../../services/crm/crm.api';
import type { LeadDto } from '../../../types/crm/crm.types';

const LeadDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userId: authUserId } = useAuthStore();
    const [lead, setLead] = useState<LeadDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [assignedUserName, setAssignedUserName] = useState<string>('');

    useEffect(() => {
        if (id) {
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
            if (!isValidUUID) {
                setError('Invalid lead ID');
                setLoading(false);
                showToast.error('Invalid lead ID');
                navigate('/crm/leads');
                return;
            }
            fetchLead(id);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (lead?.assignedToUserId) {
            fetchAssignedUserName(lead.assignedToUserId);
        } else {
            setAssignedUserName('');
        }
    }, [lead]);

    const fetchAssignedUserName = async (userId: string) => {
        try {
            console.log('📡 Fetching employee name for user ID:', userId);

            if (userId === authUserId) {
                setAssignedUserName('You');
                return;
            }

            try {
                const users = await getEmployeesForAssignment();
                if (users && users.length > 0) {
                    const foundUser = users.find((u: any) => u.id === userId || u.appUserId === userId);
                    if (foundUser) {
                        const firstName = foundUser.firstName || '';
                        const lastName = foundUser.lastName || '';
                        const displayName = foundUser.displayName || `${firstName} ${lastName}`.trim() || 'User';
                        setAssignedUserName(displayName);
                        return;
                    }
                }
            } catch (e) {
                console.warn('⚠️ ForAssignment failed:', e);
            }

            try {
                const employee = await getEmployeeById(userId);
                if (employee) {
                    const fullName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim();
                    setAssignedUserName(fullName || employee.code || 'User');
                    return;
                }
            } catch (e) {
                console.warn('⚠️ GetEmployee failed:', e);
            }

            setAssignedUserName('User');

        } catch (error) {
            console.error('❌ Error fetching assigned user name:', error);
            setAssignedUserName('User');
        }
    };

    const fetchLead = async (leadId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getLeadById(leadId);
            const data = response.data?.data || response.data;

            if (!data) {
                throw new Error('Lead not found');
            }

            setLead(data);
        } catch (error: any) {
            console.error('Error fetching lead:', error);
            const errorMessage = error?.response?.status === 404
                ? 'Lead not found'
                : error?.response?.data?.message || 'Failed to load lead details';
            setError(errorMessage);
            showToast.error(errorMessage);

            setTimeout(() => {
                navigate('/crm/leads');
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!lead) return;
        try {
            setIsDeleting(true);
            await deleteLead(lead.id);
            showToast.success('Lead deleted successfully');
            navigate('/crm/leads');
        } catch (error) {
            showToast.error('Failed to delete lead');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConvert = async () => {
        if (!lead) return;
        try {
            setIsConverting(true);
            await convertLeadToCustomer(lead.id);
            showToast.success('Lead converted to customer successfully');
            fetchLead(lead.id);
        } catch (error) {
            showToast.error('Failed to convert lead');
        } finally {
            setIsConverting(false);
        }
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getFullName = (lead: LeadDto) => {
        if (lead.fullName) return lead.fullName;
        return `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown';
    };

    const getStatusString = (status: any): string => {
        if (!status) return 'New';
        if (typeof status === 'string') return status;
        if (typeof status === 'number') {
            const statusMap: Record<number, string> = {
                1: 'New',
                2: 'Contacted',
                3: 'Qualified',
                4: 'Proposal',
                5: 'Negotiation',
                6: 'Converted',
                7: 'Lost',
                8: 'Archived',
            };
            return statusMap[status] || 'New';
        }
        return String(status);
    };

    const getPriorityString = (priority: any): string => {
        if (!priority) return 'Medium';
        if (typeof priority === 'string') return priority;
        if (typeof priority === 'number') {
            const priorityMap: Record<number, string> = {
                1: 'Low',
                2: 'Medium',
                3: 'High',
                4: 'Urgent',
            };
            return priorityMap[priority] || 'Medium';
        }
        return String(priority);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-500">Loading lead details...</p>
            </div>
        );
    }

    if (error || !lead) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Lead not found</h2>
                <p className="text-gray-500">{error || "The lead you're looking for doesn't exist."}</p>
                <Button onClick={() => navigate('/crm/leads')} className="mt-4">
                    Back to Leads
                </Button>
            </div>
        );
    }

    const statusStr = getStatusString(lead.status);
    const priorityStr = getPriorityString(lead.priority);

    // Determine if lead is qualified based on score
    const isQualified = (lead.score || 0) >= 70;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/leads')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {getFullName(lead)}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <LeadStatusBadge status={statusStr} />
                            <LeadPriorityBadge priority={priorityStr} />
                            {lead.isConverted && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Converted
                                </Badge>
                            )}
                            {!lead.isConverted && isQualified && (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Qualified
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/crm/leads/edit/${lead.id}`)}
                        className="flex items-center gap-2"
                    >
                        <Edit size={16} />
                        Edit
                    </Button>
                    {!lead.isConverted && (
                        <Button
                            onClick={handleConvert}
                            disabled={isConverting}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isConverting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Users size={16} />
                            )}
                            {isConverting ? 'Converting...' : 'Convert to Customer'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Lead Score</p>
                                <div className="mt-1">
                                    <LeadScoreBadge score={lead.score || 0} />
                                </div>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Star className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Estimated Value</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {formatCurrency(lead.estimatedValue || lead.budget)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Created</p>
                                <p className="text-lg font-bold text-purple-900">
                                    {formatDate(lead.createdAt)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Calendar className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Last Contact</p>
                                <p className="text-lg font-bold text-orange-900">
                                    {lead.lastContactDate ? formatDate(lead.lastContactDate) : 'Never'}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <Clock className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-600" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    {lead.email || 'N/A'}
                                </p>
                            </div>
                            {lead.phone && (
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {lead.phone}
                                    </p>
                                </div>
                            )}
                            {lead.mobile && (
                                <div>
                                    <p className="text-sm text-gray-500">Mobile</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {lead.mobile}
                                    </p>
                                </div>
                            )}
                            {lead.companyName && (
                                <div>
                                    <p className="text-sm text-gray-500">Company</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        {lead.companyName}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    {(lead.address || lead.city || lead.state || lead.country) && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-indigo-600" />
                                Address
                            </h2>
                            <p className="text-gray-700">
                                {[lead.address, lead.city, lead.state, lead.country]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        </div>
                    )}

                    {/* Lead Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-indigo-600" />
                            Lead Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Source</p>
                                <p className="font-medium">{lead.source || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Industry</p>
                                <p className="font-medium">{lead.industry || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Title</p>
                                <p className="font-medium">{lead.title || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tags</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {lead.tags?.split(',').filter(Boolean).map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {tag.trim()}
                                        </Badge>
                                    )) || <span className="text-gray-400">-</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Budget</p>
                                <p className="font-medium">{formatCurrency(lead.budget)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Expected Close Date</p>
                                <p className="font-medium">{lead.expectedCloseDate ? formatDate(lead.expectedCloseDate) : '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {lead.description && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                Description
                            </h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{lead.description}</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Assigned To */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-indigo-600" />
                            Assigned To
                        </h2>
                        {lead.assignedToUserId ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                    {assignedUserName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {assignedUserName || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-400">ID: {lead.assignedToUserId.slice(0, 8)}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>Unassigned</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                    onClick={() => {
                                        navigate('/crm/leads/assigned');
                                    }}
                                >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Assign Lead
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-600" />
                            Score Breakdown
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Total Score</span>
                                <span className="text-xl font-bold text-indigo-600">{lead.score || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Engagement Score</span>
                                <span className="font-medium">{lead.engagementScore || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Qualification Status</span>
                                <Badge className={isQualified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                    {isQualified ? 'Qualified' : 'Needs Review'}
                                </Badge>
                            </div>
                            {isQualified && (
                                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-700 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        This lead is qualified based on the scoring rules.
                                    </p>
                                </div>
                            )}
                            {!isQualified && lead.score && lead.score > 0 && (
                                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-sm text-yellow-700 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Score is below the qualification threshold (70).
                                    </p>
                                </div>
                            )}
                            {(!lead.score || lead.score === 0) && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        No score calculated yet.
                                    </p>
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                onClick={() => navigate('/settings/crm/lead-scoring')}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Scoring Rules
                            </Button>
                        </div>
                    </div>

                    {/* Routing Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-indigo-600" />
                            Routing Info
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Assigned To</span>
                                <span className="font-medium">
                                    {lead.assignedToUserId ? (assignedUserName || 'User') : 'Unassigned'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Priority</span>
                                <Badge className={priorityStr === 'High' || priorityStr === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                                    {priorityStr}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Routing Status</span>
                                <Badge className={lead.assignedToUserId ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                    {lead.assignedToUserId ? 'Routed' : 'Pending'}
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                onClick={() => navigate('/settings/crm/routing-rules')}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure Routing Rules
                            </Button>
                        </div>
                    </div>

                    {/* Engagement */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            Engagement
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Engagement Score</span>
                                <span className="font-medium">{lead.engagementScore || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Contact Count</span>
                                <span className="font-medium">{lead.contactCount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Last Contact</span>
                                <span className="font-medium">{lead.lastContactDate ? formatDate(lead.lastContactDate) : 'Never'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => navigate(`/crm/leads/edit/${lead.id}`)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Lead
                            </Button>
                            {!lead.isConverted && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    onClick={handleConvert}
                                    disabled={isConverting}
                                >
                                    {isConverting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Users className="h-4 w-4 mr-2" />
                                    )}
                                    {isConverting ? 'Converting...' : 'Convert to Customer'}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                onClick={() => navigate(`/crm/leads/qualification`)}
                            >
                                <Target className="h-4 w-4 mr-2" />
                                View Qualification
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Lead
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteLeadModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                lead={lead}
                onDelete={handleDelete}
                loading={isDeleting}
            />
        </motion.div>
    );
};

export default LeadDetailPage;