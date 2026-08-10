// src/pages/crm/leadManagement/LeadBulkAction.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, Tag, RefreshCw, Search,
    CheckSquare, Square, AlertCircle, CheckCircle,
    UserPlus, Star, Trash2, Filter, X
} from 'lucide-react';
import { getLeads, bulkLeadAction, bulkAssignLeads } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import type { LeadDto } from '@/modules/crm/types/crm.types';

const LeadBulkAction: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<LeadDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [actionType, setActionType] = useState('assign');
    const [actionValue, setActionValue] = useState('');
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    React.useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await getLeads({ page: 1, pageSize: 100 });
            let data = response.data?.data || response.data || [];
            setLeads(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching leads:', error);
            showToast.error('Failed to load leads');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredLeads.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredLeads.map(l => l.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkAction = async () => {
        if (selectedIds.size === 0) {
            showToast.error('Please select at least one lead');
            return;
        }

        try {
            if (actionType === 'assign') {
                if (!actionValue) {
                    showToast.error('Please enter a user ID');
                    return;
                }
                const userIds = actionValue.split(',').map(id => id.trim());
                for (const userId of userIds) {
                    await bulkAssignLeads(Array.from(selectedIds), userId);
                }
                showToast.success(`Assigned ${selectedIds.size} leads to ${userIds.length} user(s)`);
            } else {
                const payload = {
                    leadIds: Array.from(selectedIds),
                    action: actionType,
                    data: actionValue
                };
                await bulkLeadAction(payload);
                showToast.success(`Bulk action "${actionType}" completed on ${selectedIds.size} leads`);
            }

            setSelectedIds(new Set());
            setIsActionModalOpen(false);
            fetchLeads();
        } catch (error: any) {
            showToast.error(error.response?.data?.message || 'Bulk action failed');
        }
    };

    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        return (
            lead.firstName?.toLowerCase().includes(search) ||
            lead.lastName?.toLowerCase().includes(search) ||
            lead.email?.toLowerCase().includes(search) ||
            lead.companyName?.toLowerCase().includes(search)
        );
    });

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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/leads')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Bulk Lead Actions</h1>
                        <p className="text-sm text-gray-500">
                            Perform actions on multiple leads at once
                        </p>
                    </div>
                </div>
                <Button
                    onClick={fetchLeads}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Leads</p>
                                <p className="text-2xl font-bold text-blue-900">{leads.length}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Users className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Selected</p>
                                <p className="text-2xl font-bold text-green-900">{selectedIds.size}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <CheckSquare className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Actions Available</p>
                                <p className="text-2xl font-bold text-purple-900">6</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Tag className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
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
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                        {selectedIds.size} selected
                    </Badge>
                    {selectedIds.size > 0 && (
                        <Button
                            onClick={() => setIsActionModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Tag className="h-4 w-4 mr-2" />
                            Apply Action
                        </Button>
                    )}
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    {selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? (
                                        <CheckSquare size={18} className="text-indigo-600" />
                                    ) : (
                                        <Square size={18} />
                                    )}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                    No leads found
                                </td>
                            </tr>
                        ) : (
                            filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleSelect(lead.id)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            {selectedIds.has(lead.id) ? (
                                                <CheckSquare size={18} className="text-indigo-600" />
                                            ) : (
                                                <Square size={18} />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {lead.fullName || `${lead.firstName} ${lead.lastName}`}
                                        </p>
                                        {lead.companyName && (
                                            <p className="text-xs text-gray-500">{lead.companyName}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="secondary" className="text-xs">
                                            {lead.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="secondary" className="text-xs">
                                            {lead.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{lead.score || 0}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Modal */}
            <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-indigo-600" />
                            Bulk Action
                        </DialogTitle>
                        <DialogDescription>
                            Apply action to {selectedIds.size} selected lead(s)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Action Type</Label>
                            <Select value={actionType} onValueChange={setActionType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="assign">Assign to User</SelectItem>
                                    <SelectItem value="changestatus">Change Status</SelectItem>
                                    <SelectItem value="addtags">Add Tags</SelectItem>
                                    <SelectItem value="delete">Delete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>
                                {actionType === 'assign' && 'User ID(s)'}
                                {actionType === 'changestatus' && 'Status'}
                                {actionType === 'addtags' && 'Tags (comma-separated)'}
                                {actionType === 'delete' && 'Confirm Delete'}
                            </Label>
                            {actionType === 'delete' ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                    <AlertCircle className="h-4 w-4 inline mr-1" />
                                    This action cannot be undone. {selectedIds.size} lead(s) will be permanently deleted.
                                </div>
                            ) : actionType === 'changestatus' ? (
                                <Select value={actionValue} onValueChange={setActionValue}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Contacted">Contacted</SelectItem>
                                        <SelectItem value="Qualified">Qualified</SelectItem>
                                        <SelectItem value="Proposal">Proposal</SelectItem>
                                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                                        <SelectItem value="Converted">Converted</SelectItem>
                                        <SelectItem value="Lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    className="mt-1"
                                    value={actionValue}
                                    onChange={(e) => setActionValue(e.target.value)}
                                    placeholder={
                                        actionType === 'assign'
                                            ? 'Enter user ID(s) separated by commas'
                                            : 'Enter tags separated by commas'
                                    }
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
                        <Button
                            className={actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                            onClick={handleBulkAction}
                        >
                            {actionType === 'delete' ? 'Delete Leads' : 'Apply Action'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default LeadBulkAction;