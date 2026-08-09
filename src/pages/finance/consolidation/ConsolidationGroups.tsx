// src/pages/finance/consolidation/ConsolidationGroups.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    GitMerge, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
    Users, Target, AlertCircle, CheckCircle, Clock,
    BarChart3, Activity, Shield, FileText, X, Calendar,
    Building2, Globe, TrendingUp, TrendingDown, Play
} from 'lucide-react';
import { useReportExport } from '../../../hooks/useReportExport';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
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
    getConsolidationGroups,
    createConsolidationGroup,
    updateConsolidationGroup,
    deleteConsolidationGroup,
    runConsolidation,
    getConsolidationResults,
} from '../../../services/finance/finance.api';

interface ConsolidationGroup {
    id: string;
    code: string;
    name: string;
    description: string;
    type: 'Full' | 'Partial' | 'Custom';
    period: string;
    status: 'Draft' | 'InProgress' | 'Completed' | 'Cancelled' | 'Error';
    entityIds: string[];
    entityCount: number;
    totalOwnership: number;
    totalRevenue: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    consolidatedRevenue: number;
    consolidatedAssets: number;
    consolidatedLiabilities: number;
    consolidatedEquity: number;
    eliminationEntries: number;
    adjustments: number;
    createdBy: string;
    createdAt: string;
    completedAt: string;
    startedAt: string;
    notes: string;
    rowVersion?: string;
}

interface ConsolidationGroupStats {
    total: number;
    draft: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    error: number;
    totalEntities: number;
    totalRevenue: number;
    totalAssets: number;
    avgOwnership: number;
}

const ConsolidationGroups: React.FC = () => {
    const [items, setItems] = useState<ConsolidationGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<ConsolidationGroup | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<Partial<ConsolidationGroup>>({});
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('consolidation-groups');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterType !== 'All') params.type = filterType;
            if (filterPeriod !== 'All') params.period = filterPeriod;

            const response = await getConsolidationGroups(params);

            let data: ConsolidationGroup[] = [];
            if (response?.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }
            setItems(data);
        } catch (error) {
            console.error('Error fetching consolidation groups:', error);
            showToast.error('Failed to load consolidation groups');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterStatus, filterType, filterPeriod]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): ConsolidationGroupStats => {
        const filtered = items;
        const draft = filtered.filter(c => c.status === 'Draft').length;
        const inProgress = filtered.filter(c => c.status === 'InProgress').length;
        const completed = filtered.filter(c => c.status === 'Completed').length;
        const cancelled = filtered.filter(c => c.status === 'Cancelled').length;
        const error = filtered.filter(c => c.status === 'Error').length;
        const totalEntities = filtered.reduce((sum, c) => sum + (c.entityCount || 0), 0);
        const totalRevenue = filtered.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
        const totalAssets = filtered.reduce((sum, c) => sum + (c.totalAssets || 0), 0);

        return {
            total: filtered.length,
            draft,
            inProgress,
            completed,
            cancelled,
            error,
            totalEntities,
            totalRevenue,
            totalAssets,
            avgOwnership: filtered.length > 0 ? filtered.reduce((sum, c) => sum + (c.totalOwnership || 0), 0) / filtered.length : 0,
        };
    };

    const stats = getStats();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            notation: 'compact',
            compactDisplay: 'short',
        }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
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
            Draft: 'bg-gray-100 text-gray-700 border-gray-200',
            InProgress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Completed: 'bg-green-100 text-green-700 border-green-200',
            Cancelled: 'bg-red-100 text-red-700 border-red-200',
            Error: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Full: 'bg-purple-100 text-purple-700 border-purple-200',
            Partial: 'bg-blue-100 text-blue-700 border-blue-200',
            Custom: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesPeriod = filterPeriod === 'All' || item.period === filterPeriod;
        return matchesSearch && matchesStatus && matchesType && matchesPeriod;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const periods = [...new Set(items.map(c => c.period).filter(Boolean))];

    const handleCreate = () => {
        setFormMode('create');
        setFormData({
            status: 'Draft',
            type: 'Full',
            entityCount: 0,
            entityIds: [],
            totalOwnership: 0,
            totalRevenue: 0,
            totalAssets: 0,
            totalLiabilities: 0,
            totalEquity: 0,
            consolidatedRevenue: 0,
            consolidatedAssets: 0,
            consolidatedLiabilities: 0,
            consolidatedEquity: 0,
            eliminationEntries: 0,
            adjustments: 0,
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item: ConsolidationGroup) => {
        setFormMode('edit');
        setFormData(item);
        setIsFormModalOpen(true);
    };

    const handleDelete = (item: ConsolidationGroup) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleView = (item: ConsolidationGroup) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleRunConsolidation = async (item: ConsolidationGroup) => {
        try {
            setIsRunning(true);
            await runConsolidation(item.id);
            showToast.success(`Consolidation ${item.code} started successfully`);
            await fetchData();

            // Fetch results after completion
            const results = await getConsolidationResults(item.id);
            if (results?.data) {
                // Update the item with results
                const updatedItem = { ...item, ...results.data };
                setSelectedItem(updatedItem);
            }
        } catch (error) {
            console.error('Error running consolidation:', error);
            showToast.error('Failed to run consolidation');
        } finally {
            setIsRunning(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteConsolidationGroup(selectedItem.id);
            showToast.success('Consolidation group deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting consolidation group:', error);
            showToast.error('Failed to delete consolidation group');
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            if (formMode === 'create') {
                await createConsolidationGroup(formData);
                showToast.success('Consolidation group created successfully');
            } else {
                await updateConsolidationGroup(formData);
                showToast.success('Consolidation group updated successfully');
            }
            await fetchData();
            setIsFormModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error('Error saving consolidation group:', error);
            showToast.error('Failed to save consolidation group');
        } finally {
            setIsSubmitting(false);
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
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <GitMerge className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Consolidation Groups</h1>
                        <p className="text-sm text-gray-500">Create and manage consolidation groups for financial reporting</p>
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
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport({ groups: filteredItems, stats })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={handleCreate}
                    >
                        <Plus size={16} />
                        Create Group
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Groups</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
                                <p className="text-xs text-purple-600 mt-1">{stats.completed} completed</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <GitMerge className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Entities</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.totalEntities}</p>
                                <p className="text-xs text-blue-600 mt-1">Across all groups</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Building2 className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalRevenue)}</p>
                                <p className="text-xs text-emerald-600 mt-1">Combined revenue</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-700 font-medium">Total Assets</p>
                                <p className="text-2xl font-bold text-cyan-900">{formatCurrency(stats.totalAssets)}</p>
                                <p className="text-xs text-cyan-600 mt-1">Combined assets</p>
                            </div>
                            <div className="p-3 bg-cyan-200 rounded-xl">
                                <Globe className="h-6 w-6 text-cyan-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Avg Ownership</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.avgOwnership.toFixed(1)}%</p>
                                <p className="text-xs text-orange-600 mt-1">Average ownership</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-xl">
                                <Users className="h-6 w-6 text-orange-700" />
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
                        placeholder="Search consolidation groups..."
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Error">Error</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Full">Full</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="md:w-40">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Periods</SelectItem>
                        {periods.map((period) => (
                            <SelectItem key={period} value={period}>{period}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('All');
                        setFilterType('All');
                        setFilterPeriod('All');
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    <X size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Entities</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Assets</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <GitMerge className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No consolidation groups found</p>
                                        <p className="text-sm text-gray-400">Create your first consolidation group to get started</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700">{item.entityCount}</td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(item.totalRevenue)}</td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(item.totalAssets)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            {(item.status === 'Draft' || item.status === 'InProgress') && (
                                                <button
                                                    onClick={() => handleRunConsolidation(item)}
                                                    className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                    title="Run Consolidation"
                                                    disabled={isRunning}
                                                >
                                                    <Play size={16} className="text-green-500" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} className="text-yellow-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} groups
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

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GitMerge className="h-5 w-5 text-purple-600" />
                            Consolidation Group Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Code</p>
                                    <p className="font-medium">{selectedItem.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedItem.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-medium">{selectedItem.period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Entities</p>
                                    <p className="font-medium">{selectedItem.entityCount}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Consolidation Results</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Revenue</p><p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.consolidatedRevenue)}</p></CardContent></Card>
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Assets</p><p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.consolidatedAssets)}</p></CardContent></Card>
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Liabilities</p><p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.consolidatedLiabilities)}</p></CardContent></Card>
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Equity</p><p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.consolidatedEquity)}</p></CardContent></Card>
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Eliminations</p><p className="text-xl font-bold text-gray-900">{selectedItem.eliminationEntries}</p></CardContent></Card>
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Adjustments</p><p className="text-xl font-bold text-gray-900">{selectedItem.adjustments}</p></CardContent></Card>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div>Created: {formatDate(selectedItem.createdAt)}</div>
                                    <div>Started: {formatDate(selectedItem.startedAt)}</div>
                                    <div>Completed: {formatDate(selectedItem.completedAt)}</div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                                <p className="text-sm text-gray-600">{selectedItem.notes || 'No notes'}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Form Modal */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GitMerge className="h-5 w-5 text-purple-600" />
                            {formMode === 'create' ? 'Create Consolidation Group' : 'Edit Consolidation Group'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Code</Label>
                                <Input
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., CG-001"
                                />
                            </div>
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Group name"
                                />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={formData.type || 'Full'}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full">Full Consolidation</SelectItem>
                                        <SelectItem value="Partial">Partial Consolidation</SelectItem>
                                        <SelectItem value="Custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status || 'Draft'}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="InProgress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Period</Label>
                                <Input
                                    value={formData.period || ''}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    placeholder="e.g., Q1 2025"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Notes</Label>
                                <Input
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (formMode === 'create' ? 'Create' : 'Update')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Confirm Delete
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this consolidation group? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="py-4">
                            <p className="text-sm text-gray-600">
                                <strong>{selectedItem.code}</strong> - {selectedItem.name}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-purple-600" />
                            Export Consolidation Groups
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF - Document</SelectItem>
                                    <SelectItem value="excel">Excel - Spreadsheet</SelectItem>
                                    <SelectItem value="csv">CSV - Comma separated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Total: <strong>{filteredItems.length}</strong></p>
                                <p>Completed: <strong>{stats.completed}</strong></p>
                                <p>In Progress: <strong>{stats.inProgress}</strong></p>
                                <p>Total Entities: <strong>{stats.totalEntities}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => handleExport({ groups: filteredItems, stats })}
                            disabled={exporting}
                        >
                            {exporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ConsolidationGroups;