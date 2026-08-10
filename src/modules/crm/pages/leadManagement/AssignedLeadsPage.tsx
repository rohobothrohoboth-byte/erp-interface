// src/pages/crm/leadManagement/AssignedLeadsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, RefreshCw, Users, User,
    CheckCircle, Clock, AlertCircle, Star,
    Mail, Phone, Building2, Filter,
    ChevronLeft, ChevronRight, XCircle,Loader2,
    Zap, X, UserPlus, Search
} from 'lucide-react';
import { getLeadsByAssignedUser, assignLead, getEmployeesForAssignment } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { useAuthStore } from '@/shared/stores/auth.store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import type { LeadDto } from '@/modules/crm/types/crm.types';

const ITEMS_PER_PAGE = 10;

// ✅ Status mapping
const STATUS_MAP: Record<number, string> = {
    1: 'New',
    2: 'Contacted',
    3: 'Qualified',
    4: 'Proposal',
    5: 'Negotiation',
    6: 'Converted',
    7: 'Lost',
    8: 'Archived',
};

const STATUS_COLORS: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-700 border-blue-200',
    'Contacted': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Qualified': 'bg-green-100 text-green-700 border-green-200',
    'Proposal': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Negotiation': 'bg-pink-100 text-pink-700 border-pink-200',
    'Converted': 'bg-purple-100 text-purple-700 border-purple-200',
    'Lost': 'bg-red-100 text-red-700 border-red-200',
    'Archived': 'bg-gray-100 text-gray-700 border-gray-200',
};

const PRIORITY_COLORS: Record<string, string> = {
    'Low': 'bg-blue-100 text-blue-700 border-blue-200',
    'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'High': 'bg-orange-100 text-orange-700 border-orange-200',
    'Urgent': 'bg-red-100 text-red-700 border-red-200',
};

// ✅ Helper: Get status as string
const getStatusString = (status: any): string => {
    if (!status) return 'New';
    if (typeof status === 'string') {
        const num = parseInt(status);
        if (!isNaN(num) && num in STATUS_MAP) return STATUS_MAP[num];
        return status;
    }
    if (typeof status === 'number') {
        return STATUS_MAP[status] || 'New';
    }
    return String(status);
};

// ✅ Helper: Get priority as string
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

// ✅ Helper: Get full name
const getFullName = (lead: LeadDto) => {
    if (lead.fullName) return lead.fullName;
    return `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown';
};

// ✅ Helper: Format currency
const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
};

// ✅ Helper: Get initials
const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

interface AssignableUser {
    id: string;
    appUserId?: string;
    name: string;
    email: string;
    code?: string;
}

const AssignedLeadsPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId: authUserId, userName: authUserName } = useAuthStore();

    const [leads, setLeads] = useState<LeadDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');

    // Assign modal state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
    const [assigning, setAssigning] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // ✅ Use auth store for user ID
    useEffect(() => {
        console.log('👤 Auth user ID:', authUserId);
        console.log('👤 Auth user name:', authUserName);

        if (authUserId) {
            setUserId(authUserId);
            setUserName(authUserName || 'User');
            fetchLeads(authUserId);
        } else {
            console.warn('⚠️ No user ID found in auth store');
            showToast.error('User not authenticated');
            navigate('/login');
        }
    }, [authUserId]);

    const fetchLeads = async (id: string) => {
        console.log('📡 Fetching leads for user:', id);
        try {
            setLoading(true);
            const response = await getLeadsByAssignedUser(id);
            console.log('📦 Leads response:', response);
            let data = response.data?.data || response.data || [];
            setLeads(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('❌ Error fetching assigned leads:', error);
            showToast.error('Failed to load assigned leads');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignableUsers = async () => {
        try {
            setLoadingUsers(true);
            const employees = await getEmployeesForAssignment();

            const mappedUsers = (employees || [])
                .filter((emp: any) => emp?.id)
                .map((emp: any) => ({
                    id: emp.id,
                    appUserId: emp.appUserId,
                    name: emp.displayName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.code || 'Unknown',
                    email: emp.email || '',
                    code: emp.code || ''
                }));

            setAssignableUsers(mappedUsers.length > 0 ? mappedUsers : []);
        } catch (error: any) {
            console.error('Error fetching employees:', error);

            // Fallback: use current user
            if (authUserId) {
                setAssignableUsers([{
                    id: authUserId,
                    appUserId: authUserId,
                    name: authUserName || 'Current User',
                    email: '',
                    code: ''
                }]);
                showToast.warning('Using current user as fallback');
            } else {
                setAssignableUsers([]);
                showToast.error('Failed to load employees');
            }
        } finally {
            setLoadingUsers(false);
        }
    };

    const openAssignModal = (lead: LeadDto) => {
        setSelectedLead(lead);
        setSelectedUserId('');
        setIsAssignModalOpen(true);
        fetchAssignableUsers();
    };

    const handleAssign = async () => {
        if (!selectedLead || !selectedUserId) {
            showToast.error('Please select a user');
            return;
        }

        try {
            setAssigning(true);

            const selectedUser = assignableUsers.find(u => u.id === selectedUserId);
            const userIdToAssign = selectedUser?.appUserId || selectedUserId;

            await assignLead(selectedLead.id, userIdToAssign);
            showToast.success(`Lead assigned successfully`);
            setIsAssignModalOpen(false);
            setSelectedLead(null);
            setSelectedUserId('');
            if (authUserId) {
                await fetchLeads(authUserId);
            }
        } catch (error: any) {
            console.error('Error assigning lead:', error);
            let errorMessage = 'Failed to assign lead';
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            }
            showToast.error(errorMessage);
        } finally {
            setAssigning(false);
        }
    };

    const getStatusBadge = (status: any) => {
        const statusStr = getStatusString(status);
        return <Badge className={STATUS_COLORS[statusStr] || 'bg-gray-100 text-gray-700'}>{statusStr}</Badge>;
    };

    const getPriorityBadge = (priority: any) => {
        const priorityStr = getPriorityString(priority);
        return <Badge className={PRIORITY_COLORS[priorityStr] || 'bg-gray-100 text-gray-700'}>{priorityStr}</Badge>;
    };

    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        const name = getFullName(lead).toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const company = (lead.companyName || '').toLowerCase();
        const status = getStatusString(lead.status).toLowerCase();
        const priority = getPriorityString(lead.priority).toLowerCase();

        const matchesSearch = name.includes(search) || email.includes(search) || company.includes(search);
        const matchesStatus = filterStatus === 'All' || status === filterStatus.toLowerCase();
        const matchesPriority = filterPriority === 'All' || priority === filterPriority.toLowerCase();
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32 mt-1" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24 mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const stats = {
        total: leads.length,
        needsAction: leads.filter(l => {
            const status = getStatusString(l.status);
            return status === 'New' || status === 'Contacted';
        }).length,
        highPriority: leads.filter(l => {
            const priority = getPriorityString(l.priority);
            return priority === 'High' || priority === 'Urgent';
        }).length,
        converted: leads.filter(l => {
            const status = getStatusString(l.status);
            return status === 'Converted';
        }).length,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/leads')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            My Assigned Leads
                            <Badge variant="secondary" className="text-xs">
                                {userName}
                            </Badge>
                        </h1>
                        <p className="text-sm text-gray-500">
                            Leads assigned to you for follow-up
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => fetchLeads(authUserId)}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Assigned</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Users className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Needs Action</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.needsAction}</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">High Priority</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.highPriority}</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Converted</p>
                                <p className="text-2xl font-bold text-green-900">{stats.converted}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40">
                        <Star className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Priority</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('All');
                        setFilterPriority('All');
                    }}
                    className="flex items-center gap-2"
                >
                    <XCircle size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedLeads.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No leads assigned to you
                                </td>
                            </tr>
                        ) : (
                            paginatedLeads.map((lead) => {
                                const displayStatus = getStatusString(lead.status);
                                const displayPriority = getPriorityString(lead.priority);
                                const fullName = getFullName(lead);

                                return (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/crm/leads/${lead.id}`)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                                                    {getInitials(lead.firstName, lead.lastName)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {fullName}
                                                    </p>
                                                    {lead.companyName && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Building2 size={12} />
                                                            {lead.companyName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Mail size={14} className="text-gray-400" />
                                                {lead.email || 'No email'}
                                            </p>
                                            {lead.phone && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {lead.phone}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(lead.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getPriorityBadge(lead.priority)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-indigo-600">
                                            {formatCurrency(lead.estimatedValue || lead.budget)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                                <span className={`font-medium ${lead.score >= 70 ? 'text-green-600' : lead.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {lead.score || 0}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate(`/crm/leads/${lead.id}`)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                                    onClick={() => openAssignModal(lead)}
                                                    title="Reassign Lead"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length} leads
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {leads.length === 0 && (
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <Zap className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-indigo-900">No Leads Assigned</h3>
                                <p className="text-sm text-indigo-700 mt-1">
                                    You don't have any leads assigned to you at the moment.
                                    Check back later or ask your team lead to assign you some leads.
                                </p>
                                <Button
                                    className="mt-3 bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => navigate('/crm/leads')}
                                >
                                    View All Leads
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ============================================================
                ASSIGN LEAD MODAL
            ============================================================ */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                            <UserPlus className="h-5 w-5" />
                            Assign Lead
                        </DialogTitle>
                        <DialogDescription>
                            Assign this lead to a team member for follow-up.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLead && (
                        <div className="py-4 space-y-4">
                            {/* Lead Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                        {getInitials(selectedLead.firstName, selectedLead.lastName)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {getFullName(selectedLead)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {selectedLead.email}
                                            {selectedLead.companyName && ` • ${selectedLead.companyName}`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* User Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Select User <span className="text-red-500">*</span>
                                </Label>
                                {loadingUsers ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                    </div>
                                ) : (
                                    <Select
                                        value={selectedUserId}
                                        onValueChange={setSelectedUserId}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select an employee to assign" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assignableUsers.length === 0 ? (
                                                <SelectItem value="" disabled>
                                                    No employees available
                                                </SelectItem>
                                            ) : (
                                                assignableUsers.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-medium">
                                                                {user.name?.[0]?.toUpperCase() || 'E'}
                                                            </div>
                                                            <span>{user.name}</span>
                                                            {user.code && (
                                                                <span className="text-xs text-gray-400">
                                                                    ({user.code})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                This will reassign the lead to the selected employee. The lead will appear in their assigned list.
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={assigning || !selectedUserId}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {assigning ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Assign Lead
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default AssignedLeadsPage;