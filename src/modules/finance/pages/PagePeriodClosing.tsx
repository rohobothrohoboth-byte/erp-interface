// src/pages/finance/PagePeriodClosing.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Lock, Unlock, RefreshCw, Eye,
    CheckCircle, XCircle, Clock, AlertCircle,
    ChevronLeft, ChevronRight, MoreVertical,
    FileText, DollarSign, TrendingUp, TrendingDown,
    Search, Filter, Plus, Edit2, Trash2,
    Download, History, Activity, Shield,
    BarChart3, Users, AlertTriangle,
    Archive, Loader2
} from 'lucide-react';
import { usePeriodClosing } from '@/modules/finance/hooks/usePeriodClosing';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '@/shared/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter
} from '@/shared/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/shared/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu';
import type { FinancialPeriod, AuditLog } from '@/modules/finance/types/finance.types';

const PagePeriodClosing: React.FC = () => {
    const {
        periods,
        selectedPeriod,
        setSelectedPeriod,
        stats,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        filterClosed,
        setFilterClosed,
        currentPage,
        setCurrentPage,
        totalPages,
        handleClosePeriod,
        handleOpenPeriod,
        handleCreatePeriod,
        handleUpdatePeriod,
        handleDeletePeriod,
        getAuditTrail,
        exportPeriodData,
        fetchData,
        ITEMS_PER_PAGE
    } = usePeriodClosing();

    // ============================================================
    // LOCAL STATE - All hooks must be called before any conditional returns
    // ============================================================
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [auditTrailData, setAuditTrailData] = useState<AuditLog[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [forceClose, setForceClose] = useState(false);
    const [closeNotes, setCloseNotes] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const [editData, setEditData] = useState<Partial<FinancialPeriod>>({
        id: '',
        name: '',
        startDate: '',
        endDate: '',
        periodType: 'MONTHLY',
        notes: ''
    });

    const [newPeriodData, setNewPeriodData] = useState<Partial<FinancialPeriod>>({
        name: '',
        startDate: '',
        endDate: '',
        periodType: 'MONTHLY'
    });

    // ============================================================
    // ✅ DEBUG EFFECT - MUST be before conditional return
    // ============================================================
    useEffect(() => {
        if (periods.length > 0) {
            console.log('📊 Periods with status:', periods.map(p => ({
                name: p.name,
                isClosed: p.isClosed,
                status: p.status,
                display: getStatusDisplay(p)
            })));
        }
    }, [periods]);

    // ============================================================
    // STATUS HELPER FUNCTIONS
    // ============================================================

    const getStatusDisplay = (period: FinancialPeriod): string => {
        if (period.isClosed) return 'Closed';
        if (period.status) {
            return period.status.charAt(0).toUpperCase() + period.status.slice(1).toLowerCase();
        }
        return 'Open';
    };

    const getStatusColor = (period: FinancialPeriod): string => {
        const status = getStatusDisplay(period);
        switch (status) {
            case 'Closed': return 'bg-red-100 text-red-700 border-red-200';
            case 'Archived': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Locked': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    const getStatusIcon = (period: FinancialPeriod) => {
        const status = getStatusDisplay(period);
        switch (status) {
            case 'Closed': return <Lock className="w-4 h-4" />;
            case 'Archived': return <Archive className="w-4 h-4" />;
            case 'Locked': return <Lock className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4" />;
            case 'Draft': return <FileText className="w-4 h-4" />;
            default: return <Unlock className="w-4 h-4" />;
        }
    };

    const getActionBadgeColor = (action: string): string => {
        const colors: Record<string, string> = {
            'CLOSE_PERIOD': 'bg-red-100 text-red-700',
            'OPEN_PERIOD': 'bg-green-100 text-green-700',
            'CREATE_PERIOD': 'bg-blue-100 text-blue-700',
            'UPDATE_PERIOD': 'bg-yellow-100 text-yellow-700',
            'DELETE_PERIOD': 'bg-purple-100 text-purple-700',
            'VIEW_AUDIT_TRAIL': 'bg-gray-100 text-gray-700',
        };
        return colors[action] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString: string): string => {
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

    const formatDateTime = (dateString: string): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatPeriodType = (type: string): string => {
        if (!type) return 'N/A';
        return type.charAt(0) + type.slice(1).toLowerCase();
    };

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleViewPeriod = (period: FinancialPeriod) => {
        setSelectedPeriod(period);
        setIsViewModalOpen(true);
    };

    const handleEditPeriod = (period: FinancialPeriod) => {
        setEditData({
            id: period.id,
            name: period.name,
            startDate: period.startDate,
            endDate: period.endDate,
            periodType: period.periodType || 'MONTHLY',
            notes: period.notes || ''
        });
        setIsEditModalOpen(true);
    };

    const handleOpenCloseModal = (period: FinancialPeriod) => {
        setSelectedPeriod(period);
        setForceClose(false);
        setCloseNotes('');
        setIsCloseModalOpen(true);
    };

    const handleOpenOpenModal = (period: FinancialPeriod) => {
        setSelectedPeriod(period);
        setIsOpenModalOpen(true);
    };

    const handleOpenDeleteModal = (period: FinancialPeriod) => {
        setSelectedPeriod(period);
        setIsDeleteModalOpen(true);
    };

    const confirmClose = async () => {
        if (selectedPeriod) {
            const success = await handleClosePeriod(selectedPeriod.id, forceClose, closeNotes);
            if (success) {
                setIsCloseModalOpen(false);
                setCloseNotes('');
                setForceClose(false);
            }
        }
    };

    const confirmOpen = async () => {
        if (selectedPeriod) {
            const success = await handleOpenPeriod(selectedPeriod.id);
            if (success) {
                setIsOpenModalOpen(false);
            }
        }
    };

    const confirmDelete = async () => {
        if (selectedPeriod) {
            const success = await handleDeletePeriod(selectedPeriod.id);
            if (success) {
                setIsDeleteModalOpen(false);
                setSelectedPeriod(null);
            }
        }
    };

    const handleCreate = async () => {
        if (!newPeriodData.name || !newPeriodData.startDate || !newPeriodData.endDate) {
            showToast.error('Please fill in all required fields');
            return;
        }
        const result = await handleCreatePeriod(newPeriodData);
        if (result) {
            setIsCreateModalOpen(false);
            setNewPeriodData({ name: '', startDate: '', endDate: '', periodType: 'MONTHLY' });
        }
    };

    const handleUpdate = async () => {
        if (!editData.id || !editData.name || !editData.startDate || !editData.endDate) {
            showToast.error('Please fill in all required fields');
            return;
        }
        const result = await handleUpdatePeriod(editData.id, editData);
        if (result) {
            setIsEditModalOpen(false);
            setEditData({ id: '', name: '', startDate: '', endDate: '', periodType: 'MONTHLY', notes: '' });
        }
    };

    const handleViewAuditTrail = async (period: FinancialPeriod) => {
        setSelectedPeriod(period);
        setIsAuditModalOpen(true);
        setAuditLoading(true);
        try {
            const response = await getAuditTrail(period.id);
            const data = response?.data?.data || response?.data || [];
            setAuditTrailData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading audit trail:', error);
            showToast.error('Failed to load audit trail');
            setAuditTrailData([]);
        } finally {
            setAuditLoading(false);
        }
    };

    const handleExport = async (period: FinancialPeriod) => {
        setIsExporting(true);
        try {
            await exportPeriodData(period.id);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // ============================================================
    // ✅ CONDITIONAL RETURN - Only AFTER all hooks are called
    // ============================================================
    if (loading && periods.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading period data...</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // ✅ RENDER
    // ============================================================
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Period Closing</h1>
                        <p className="text-sm text-gray-500">
                            Manage financial periods, closing, and audit trail
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Period
                    </Button>
                    <Button
                        onClick={fetchData}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">{error}</span>
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        Retry
                    </Button>
                </div>
            )}

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stats cards... */}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search periods by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={filterClosed} onValueChange={setFilterClosed}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Periods</SelectItem>
                            <SelectItem value="Open">Open Only</SelectItem>
                            <SelectItem value="Closed">Closed Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={() => {
                        setSearchTerm('');
                        setFilterClosed('All');
                    }}>
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Periods Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period Name</TableHead>
                                <TableHead>Date Range</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Entries</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {periods.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12">
                                            <div className="text-gray-500">
                                                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>No periods found</p>
                                                <p className="text-sm mt-1">Create a new period to get started</p>
                                                <Button
                                                    variant="outline"
                                                    className="mt-3"
                                                    onClick={() => setIsCreateModalOpen(true)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create Period
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    periods.map((period) => (
                                        <motion.tr
                                            key={period.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell className="font-medium">
                                                {period.name}
                                                {period.isClosed && period.closedDate && (
                                                    <div className="text-xs text-gray-500">
                                                        Closed: {formatDate(period.closedDate)}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(period.startDate)} - {formatDate(period.endDate)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {formatPeriodType(period.periodType)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(period)} flex items-center gap-1 w-fit`}>
                                                    {getStatusIcon(period)}
                                                    {getStatusDisplay(period)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {period.isClosed ? '—' : stats?.totalJournalEntries || 0}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {formatDate(period.dateAdd)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewPeriod(period)}
                                                        className="hover:bg-blue-50"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewAuditTrail(period)}
                                                        className="hover:bg-purple-50"
                                                        title="Audit Trail"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {!period.isClosed && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleEditPeriod(period)}>
                                                                        <Edit2 className="w-4 h-4 mr-2" />
                                                                        Edit Period
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleOpenCloseModal(period)}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Lock className="w-4 h-4 mr-2" />
                                                                        Close Period
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleOpenDeleteModal(period)}
                                                                        className="text-red-600"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Delete Period
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {period.isClosed && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleOpenOpenModal(period)}
                                                                    className="text-green-600"
                                                                >
                                                                    <Unlock className="w-4 h-4 mr-2" />
                                                                    Reopen Period
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleExport(period)}
                                                                disabled={isExporting}
                                                            >
                                                                {isExporting ? (
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                ) : (
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                )}
                                                                Export Data
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, periods.length)} of {periods.length} periods
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>



            {/* ============================================================ */}
            {/* MODALS */}
            {/* ============================================================ */}

            {/* View Period Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Period Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about {selectedPeriod?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPeriod && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-lg font-semibold">{selectedPeriod.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <Badge className={`${getStatusColor(selectedPeriod)} ml-2`}>
                                        {getStatusDisplay(selectedPeriod)}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                                    <p>{formatDate(selectedPeriod.startDate)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">End Date</label>
                                    <p>{formatDate(selectedPeriod.endDate)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Period Type</label>
                                    <p>{formatPeriodType(selectedPeriod.periodType)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created</label>
                                    <p>{formatDateTime(selectedPeriod.dateAdd)}</p>
                                </div>
                                {selectedPeriod.closedDate && (
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Closed Date</label>
                                        <p>{formatDateTime(selectedPeriod.closedDate)}</p>
                                    </div>
                                )}
                                {selectedPeriod.notes && (
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Notes</label>
                                        <p className="text-gray-700">{selectedPeriod.notes}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Period Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-blue-600" />
                            Edit Financial Period
                        </DialogTitle>
                        <DialogDescription>
                            Update the financial period details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Period Name *</label>
                            <Input
                                placeholder="e.g., January 2026"
                                value={editData.name || ''}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">Start Date *</label>
                                <Input
                                    type="date"
                                    value={editData.startDate || ''}
                                    onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">End Date *</label>
                                <Input
                                    type="date"
                                    value={editData.endDate || ''}
                                    onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Period Type</label>
                            <Select
                                value={editData.periodType}
                                onValueChange={(value) => setEditData({
                                    ...editData,
                                    periodType: value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                    <SelectItem value="CUSTOM">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Notes</label>
                            <Input
                                placeholder="Add notes about this period..."
                                value={editData.notes || ''}
                                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? 'Updating...' : 'Update Period'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Close Period Modal */}
            <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Lock className="w-5 h-5" />
                            Close Financial Period
                        </DialogTitle>
                        <DialogDescription>
                            You are about to close <strong>{selectedPeriod?.name}</strong>. This action is irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-yellow-800 font-medium">Before closing, ensure:</p>
                                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                                        <li>All journal entries are posted</li>
                                        <li>No pending transactions</li>
                                        <li>All reconciliations are complete</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {stats && stats.unpostedEntries > 0 && !forceClose && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-red-800 font-medium">
                                            {stats.unpostedEntries} unposted journal entries found
                                        </p>
                                        <p className="text-sm text-red-700 mt-1">
                                            You must post all entries before closing, or force close with override.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes (Optional)</label>
                            <Input
                                placeholder="Add notes about this closing..."
                                value={closeNotes}
                                onChange={(e) => setCloseNotes(e.target.value)}
                            />
                        </div>

                        {(stats && stats.unpostedEntries > 0) && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="forceClose"
                                    checked={forceClose}
                                    onChange={(e) => setForceClose(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="forceClose" className="text-sm text-gray-700">
                                    Force close even with unposted entries
                                </label>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCloseModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmClose}
                                disabled={loading}
                            >
                                {loading ? 'Closing...' : 'Close Period'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Open Period Modal */}
            <Dialog open={isOpenModalOpen} onOpenChange={setIsOpenModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <Unlock className="w-5 h-5" />
                            Reopen Financial Period
                        </DialogTitle>
                        <DialogDescription>
                            You are about to reopen <strong>{selectedPeriod?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-yellow-800 font-medium">Warning</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Reopening a closed period allows modifications. This may affect
                                        financial reports and audits.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpenModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={confirmOpen}
                                disabled={loading}
                            >
                                {loading ? 'Opening...' : 'Reopen Period'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Period Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Delete Financial Period
                        </DialogTitle>
                        <DialogDescription>
                            You are about to delete <strong>{selectedPeriod?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-red-800 font-medium">Irreversible Action</p>
                                    <p className="text-sm text-red-700 mt-1">
                                        This will permanently delete the period and all associated data.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete Period'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Period Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-600" />
                            Create New Period
                        </DialogTitle>
                        <DialogDescription>
                            Create a new financial period
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Period Name *</label>
                            <Input
                                placeholder="e.g., January 2026"
                                value={newPeriodData.name}
                                onChange={(e) => setNewPeriodData({ ...newPeriodData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">Start Date *</label>
                                <Input
                                    type="date"
                                    value={newPeriodData.startDate}
                                    onChange={(e) => setNewPeriodData({ ...newPeriodData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">End Date *</label>
                                <Input
                                    type="date"
                                    value={newPeriodData.endDate}
                                    onChange={(e) => setNewPeriodData({ ...newPeriodData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Period Type</label>
                            <Select
                                value={newPeriodData.periodType}
                                onValueChange={(value) => setNewPeriodData({
                                    ...newPeriodData,
                                    periodType: value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                    <SelectItem value="CUSTOM">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Notes</label>
                            <Input
                                placeholder="Add notes about this period..."
                                value={newPeriodData.notes || ''}
                                onChange={(e) => setNewPeriodData({ ...newPeriodData, notes: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {loading ? 'Creating...' : 'Create Period'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Audit Trail Modal */}
            <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <History className="w-5 h-5 text-purple-600" />
                            Audit Trail
                            <Badge variant="outline">
                                {selectedPeriod?.name}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            Complete history of all actions performed on this period
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-4 space-y-3">
                        {auditLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
                            </div>
                        ) : auditTrailData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No audit logs found for this period</p>
                            </div>
                        ) : (
                            auditTrailData.map((log, index) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className={getActionBadgeColor(log.action)}>
                                                    {log.action?.replace('_', ' ') || 'Unknown Action'}
                                                </Badge>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {log.userEmail || 'System'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDateTime(log.createdAt)}
                                                </span>
                                            </div>

                                            {log.changes && Object.keys(log.changes).length > 0 && (
                                                <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                                    <div className="text-xs font-medium text-gray-600 mb-1">Changes:</div>
                                                    <div className="space-y-1">
                                                        {Object.entries(log.changes).map(([key, value]: [string, any]) => (
                                                            <div key={key} className="text-xs flex items-center gap-2 flex-wrap">
                                                                <span className="font-medium text-gray-700">{key}:</span>
                                                                <span className="text-red-600 line-through">
                                                                    {typeof value.old === 'object' ? JSON.stringify(value.old) : String(value.old)}
                                                                </span>
                                                                <span className="text-gray-400">→</span>
                                                                <span className="text-green-600">
                                                                    {typeof value.new === 'object' ? JSON.stringify(value.new) : String(value.new)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {log.errorMessage && (
                                                <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                                                    <span className="text-xs text-red-600">
                                                        ❌ {log.errorMessage}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'} className="shrink-0">
                                            {log.status || 'UNKNOWN'}
                                        </Badge>
                                    </div>

                                    <details className="mt-2">
                                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                                            View Technical Details
                                        </summary>
                                        <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs text-gray-600 overflow-x-auto">
                                            <pre className="whitespace-pre-wrap">
                                                {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    </details>
                                </motion.div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default PagePeriodClosing;