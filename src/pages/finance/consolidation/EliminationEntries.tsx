// src/pages/finance/consolidation/EliminationEntries.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Unlink, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
    DollarSign, Users, Target, AlertCircle, CheckCircle,
    BarChart3, Activity, Shield, FileText, X, Calendar,
    Building2, Globe, TrendingUp, TrendingDown, ArrowLeftRight
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
    getEliminationEntries,
    createEliminationEntry,
    updateEliminationEntry,
    deleteEliminationEntry,
} from '../../../services/finance/finance.api';

interface EliminationEntry {
    id: string;
    code: string;
    description: string;
    type: 'Intercompany' | 'Investment' | 'Dividend' | 'Other';
    fromEntityId: string;
    fromEntityName: string;
    toEntityId: string;
    toEntityName: string;
    amount: number;
    currency: string;
    exchangeRate: number;
    amountInReportingCurrency: number;
    accountCode: string;
    accountName: string;
    status: 'Draft' | 'Posted' | 'Reversed' | 'Cancelled';
    consolidationGroupId: string;
    consolidationGroupName: string;
    period: string;
    createdBy: string;
    createdAt: string;
    postedAt: string;
    reversedAt: string;
    notes: string;
    rowVersion?: string;
}

interface EliminationEntryStats {
    total: number;
    draft: number;
    posted: number;
    reversed: number;
    cancelled: number;
    totalAmount: number;
    totalAmountInReportingCurrency: number;
    intercompanyCount: number;
    investmentCount: number;
    dividendCount: number;
    otherCount: number;
}

const EliminationEntries: React.FC = () => {
    const [items, setItems] = useState<EliminationEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterGroup, setFilterGroup] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<EliminationEntry | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<Partial<EliminationEntry>>({});

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('elimination-entries');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterType !== 'All') params.type = filterType;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterGroup !== 'All') params.consolidationGroupName = filterGroup;
            if (filterPeriod !== 'All') params.period = filterPeriod;

            const response = await getEliminationEntries(params);

            let data: EliminationEntry[] = [];
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
            console.error('Error fetching elimination entries:', error);
            showToast.error('Failed to load elimination entries');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterType, filterStatus, filterGroup, filterPeriod]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): EliminationEntryStats => {
        const filtered = items;
        const draft = filtered.filter(c => c.status === 'Draft').length;
        const posted = filtered.filter(c => c.status === 'Posted').length;
        const reversed = filtered.filter(c => c.status === 'Reversed').length;
        const cancelled = filtered.filter(c => c.status === 'Cancelled').length;
        const totalAmount = filtered.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalAmountReporting = filtered.reduce((sum, c) => sum + (c.amountInReportingCurrency || 0), 0);
        const intercompanyCount = filtered.filter(c => c.type === 'Intercompany').length;
        const investmentCount = filtered.filter(c => c.type === 'Investment').length;
        const dividendCount = filtered.filter(c => c.type === 'Dividend').length;
        const otherCount = filtered.filter(c => c.type === 'Other').length;

        return {
            total: filtered.length,
            draft,
            posted,
            reversed,
            cancelled,
            totalAmount,
            totalAmountInReportingCurrency: totalAmountReporting,
            intercompanyCount,
            investmentCount,
            dividendCount,
            otherCount,
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
            Posted: 'bg-green-100 text-green-700 border-green-200',
            Reversed: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Intercompany: 'bg-blue-100 text-blue-700 border-blue-200',
            Investment: 'bg-purple-100 text-purple-700 border-purple-200',
            Dividend: 'bg-green-100 text-green-700 border-green-200',
            Other: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.fromEntityName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.toEntityName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesGroup = filterGroup === 'All' || item.consolidationGroupName === filterGroup;
        const matchesPeriod = filterPeriod === 'All' || item.period === filterPeriod;
        return matchesSearch && matchesType && matchesStatus && matchesGroup && matchesPeriod;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const groups = [...new Set(items.map(c => c.consolidationGroupName).filter(Boolean))];
    const periods = [...new Set(items.map(c => c.period).filter(Boolean))];

    const handleCreate = () => {
        setFormMode('create');
        setFormData({
            status: 'Draft',
            type: 'Intercompany',
            currency: 'USD',
            exchangeRate: 1,
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item: EliminationEntry) => {
        setFormMode('edit');
        setFormData(item);
        setIsFormModalOpen(true);
    };

    const handleDelete = (item: EliminationEntry) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleView = (item: EliminationEntry) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteEliminationEntry(selectedItem.id);
            showToast.success('Elimination entry deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting elimination entry:', error);
            showToast.error('Failed to delete elimination entry');
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            if (formMode === 'create') {
                await createEliminationEntry(formData);
                showToast.success('Elimination entry created successfully');
            } else {
                await updateEliminationEntry(formData);
                showToast.success('Elimination entry updated successfully');
            }
            await fetchData();
            setIsFormModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error('Error saving elimination entry:', error);
            showToast.error('Failed to save elimination entry');
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
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Unlink className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Elimination Entries</h1>
                        <p className="text-sm text-gray-500">Manage intercompany elimination entries for consolidation</p>
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
                        <Download size={16} /> Export
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport({ entries: filteredItems, stats })}
                    >
                        <Printer size={16} /> Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={handleCreate}
                    >
                        <Plus size={16} /> Add Entry
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Total Entries</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.total}</p>
                                <p className="text-xs text-orange-600 mt-1">{stats.posted} posted</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-xl">
                                <Unlink className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Intercompany</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.intercompanyCount}</p>
                                <p className="text-xs text-blue-600 mt-1">Cross-entity transactions</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <ArrowLeftRight className="h-6 w-6 text-blue-700" />
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
                                <p className="text-xs text-purple-600 mt-1">Original currency</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Reporting Currency</p>
                                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalAmountInReportingCurrency)}</p>
                                <p className="text-xs text-emerald-600 mt-1">USD equivalent</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <Globe className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Draft</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.draft}</p>
                                <p className="text-xs text-yellow-600 mt-1">Awaiting posting</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-yellow-700" />
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
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Intercompany">Intercompany</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                        <SelectItem value="Dividend">Dividend</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Posted">Posted</SelectItem>
                        <SelectItem value="Reversed">Reversed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterGroup} onValueChange={setFilterGroup}>
                    <SelectTrigger className="md:w-44">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Groups</SelectItem>
                        {groups.map((group) => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
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
                        setFilterType('All');
                        setFilterStatus('All');
                        setFilterGroup('All');
                        setFilterPeriod('All');
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    <X size={16} /> Clear Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From → To</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Unlink className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No elimination entries found</p>
                                        <p className="text-sm text-gray-400">Create your first elimination entry to get started</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">{item.description}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{item.fromEntityName}</span>
                                            <ArrowLeftRight size={14} className="text-gray-400" />
                                            <span className="font-medium">{item.toEntityName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                                        {formatCurrency(item.amountInReportingCurrency)}
                                    </td>
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} entries
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Unlink className="h-5 w-5 text-orange-600" />
                            Elimination Entry Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Code</p>
                                    <p className="font-medium">{selectedItem.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedItem.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">From Entity</p>
                                    <p className="font-medium">{selectedItem.fromEntityName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">To Entity</p>
                                    <p className="font-medium">{selectedItem.toEntityName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="font-medium">{formatCurrency(selectedItem.amount)} {selectedItem.currency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Reporting Currency</p>
                                    <p className="font-medium">{formatCurrency(selectedItem.amountInReportingCurrency)} USD</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account</p>
                                    <p className="font-medium">{selectedItem.accountCode} - {selectedItem.accountName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Consolidation Group</p>
                                    <p className="font-medium">{selectedItem.consolidationGroupName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-medium">{selectedItem.period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created By</p>
                                    <p className="font-medium">{selectedItem.createdBy}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created At</p>
                                    <p className="font-medium">{formatDate(selectedItem.createdAt)}</p>
                                </div>
                                {selectedItem.postedAt && (
                                    <div>
                                        <p className="text-sm text-gray-500">Posted At</p>
                                        <p className="font-medium">{formatDate(selectedItem.postedAt)}</p>
                                    </div>
                                )}
                            </div>
                            {selectedItem.notes && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                                    <p className="text-sm text-gray-600">{selectedItem.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Form Modal */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Unlink className="h-5 w-5 text-orange-600" />
                            {formMode === 'create' ? 'Create Elimination Entry' : 'Edit Elimination Entry'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Code</Label>
                                <Input
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., EE-001"
                                />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={formData.type || 'Intercompany'}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Intercompany">Intercompany</SelectItem>
                                        <SelectItem value="Investment">Investment</SelectItem>
                                        <SelectItem value="Dividend">Dividend</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Input
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description"
                                />
                            </div>
                            <div>
                                <Label>From Entity</Label>
                                <Input
                                    value={formData.fromEntityName || ''}
                                    onChange={(e) => setFormData({ ...formData, fromEntityName: e.target.value })}
                                    placeholder="From entity name"
                                />
                            </div>
                            <div>
                                <Label>To Entity</Label>
                                <Input
                                    value={formData.toEntityName || ''}
                                    onChange={(e) => setFormData({ ...formData, toEntityName: e.target.value })}
                                    placeholder="To entity name"
                                />
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={formData.amount || ''}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label>Currency</Label>
                                <Select
                                    value={formData.currency || 'USD'}
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="SGD">SGD</SelectItem>
                                        <SelectItem value="BRL">BRL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Exchange Rate</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.exchangeRate || 1}
                                    onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1 })}
                                    placeholder="1.00"
                                />
                            </div>
                            <div>
                                <Label>Account Code</Label>
                                <Input
                                    value={formData.accountCode || ''}
                                    onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                                    placeholder="Account code"
                                />
                            </div>
                            <div>
                                <Label>Account Name</Label>
                                <Input
                                    value={formData.accountName || ''}
                                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                    placeholder="Account name"
                                />
                            </div>
                            <div>
                                <Label>Consolidation Group</Label>
                                <Input
                                    value={formData.consolidationGroupName || ''}
                                    onChange={(e) => setFormData({ ...formData, consolidationGroupName: e.target.value })}
                                    placeholder="Group name"
                                />
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
                                <Label>Status</Label>
                                <Select
                                    value={formData.status || 'Draft'}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Posted">Posted</SelectItem>
                                        <SelectItem value="Reversed">Reversed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            className="bg-orange-600 hover:bg-orange-700 text-white"
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
                            Are you sure you want to delete this elimination entry? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="py-4">
                            <p className="text-sm text-gray-600">
                                <strong>{selectedItem.code}</strong> - {selectedItem.description}
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
                            <Download className="h-5 w-5 text-orange-600" />
                            Export Elimination Entries
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
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
                                <p>Posted: <strong>{stats.posted}</strong></p>
                                <p>Total Amount: <strong>{formatCurrency(stats.totalAmountInReportingCurrency)}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => handleExport({ entries: filteredItems, stats })}
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

export default EliminationEntries;