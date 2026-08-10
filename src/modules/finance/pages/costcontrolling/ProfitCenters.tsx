// src/pages/finance/costcontrolling/ProfitCenters.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
    DollarSign, Users, Target, AlertCircle, CheckCircle,
    BarChart3, Activity, Shield, FileText, X, Building2
} from 'lucide-react';
import { useReportExport } from '@/shared/hooks/useReportExport';
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
import {
    getProfitCenters,
    createProfitCenter,
    updateProfitCenter,
    deleteProfitCenter
} from '@/modules/finance/services/finance.api';

interface ProfitCenter {
    id: string;
    code: string;
    name: string;
    type: 'Revenue' | 'Cost' | 'Investment';
    manager: string;
    department: string;
    revenueAmount: number;
    costAmount: number;
    profitAmount: number;
    profitMargin: number;
    status: 'Active' | 'Inactive' | 'Pending';
    period: string;
    createdAt: string;
    updatedAt: string;
}

interface ProfitCenterStats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    avgProfitMargin: number;
}

const ProfitCenters: React.FC = () => {
    const [items, setItems] = useState<ProfitCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<ProfitCenter | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<Partial<ProfitCenter>>({});

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('profit-centers');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);
            const response = await getProfitCenters();
            let data = [];
            if (response.data) {
                if (Array.isArray(response.data)) data = response.data;
                else if (response.data.data && Array.isArray(response.data.data)) data = response.data.data;
                else if (response.data.$values && Array.isArray(response.data.$values)) data = response.data.$values;
            }
            setItems(data);
        } catch (error) {
            console.error('Error fetching profit centers:', error);
            showToast.error('Failed to load profit centers');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): ProfitCenterStats => {
        const totalRevenue = items.reduce((sum, c) => sum + (c.revenueAmount || 0), 0);
        const totalCost = items.reduce((sum, c) => sum + (c.costAmount || 0), 0);
        const totalProfit = items.reduce((sum, c) => sum + (c.profitAmount || 0), 0);
        const active = items.filter(c => c.status === 'Active').length;
        const inactive = items.filter(c => c.status === 'Inactive').length;
        const pending = items.filter(c => c.status === 'Pending').length;

        return {
            total: items.length,
            active,
            inactive,
            pending,
            totalRevenue,
            totalCost,
            totalProfit,
            avgProfitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
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

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Active: 'bg-green-100 text-green-700 border-green-200',
            Inactive: 'bg-red-100 text-red-700 border-red-200',
            Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Revenue: 'bg-green-100 text-green-700 border-green-200',
            Cost: 'bg-red-100 text-red-700 border-red-200',
            Investment: 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getProfitColor = (profit: number) => {
        return profit >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.manager || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesPeriod = filterPeriod === 'All' || item.period === filterPeriod;
        return matchesSearch && matchesType && matchesStatus && matchesPeriod;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const periods = [...new Set(items.map(c => c.period).filter(Boolean))];

    // Handler functions (same pattern as CostCenters)
    const handleCreate = () => { setFormMode('create'); setFormData({}); setIsFormModalOpen(true); };
    const handleEdit = (item: ProfitCenter) => { setFormMode('edit'); setFormData(item); setIsFormModalOpen(true); };
    const handleDelete = (item: ProfitCenter) => { setSelectedItem(item); setIsDeleteModalOpen(true); };
    const handleView = (item: ProfitCenter) => { setSelectedItem(item); setIsViewModalOpen(true); };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteProfitCenter(selectedItem.id);
            showToast.success('Profit center deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            showToast.error('Failed to delete profit center');
        }
    };

    const handleSubmit = async () => {
        try {
            if (formMode === 'create') {
                await createProfitCenter(formData);
                showToast.success('Profit center created successfully');
            } else {
                await updateProfitCenter(formData);
                showToast.success('Profit center updated successfully');
            }
            await fetchData();
            setIsFormModalOpen(false);
            setFormData({});
        } catch (error) {
            showToast.error('Failed to save profit center');
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profit Centers</h1>
                        <p className="text-sm text-gray-500">Manage and monitor profit centers across the organization</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => handleRefresh(fetchData)} variant="outline" className="flex items-center gap-2" disabled={isRefreshing}>
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsExportModalOpen(true)} disabled={exporting}>
                        <Download size={16} /> Export
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => handlePrintReport({ profitCenters: filteredItems, stats, period: filterPeriod })}>
                        <Printer size={16} /> Print
                    </Button>
                    <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreate}>
                        <Plus size={16} /> Add Profit Center
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats.total}</p>
                                <p className="text-xs text-emerald-600 mt-1">{stats.active} active</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <Building2 className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Total Cost</p>
                                <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.totalCost)}</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-xl">
                                <Activity className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Profit</p>
                                <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-purple-900' : 'text-red-900'}`}>
                                    {formatCurrency(stats.totalProfit)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-700 font-medium">Avg Profit Margin</p>
                                <p className={`text-2xl font-bold ${stats.avgProfitMargin >= 0 ? 'text-cyan-900' : 'text-red-900'}`}>
                                    {stats.avgProfitMargin.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-cyan-200 rounded-xl">
                                <Target className="h-6 w-6 text-cyan-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input placeholder="Search profit centers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Revenue">Revenue</SelectItem>
                        <SelectItem value="Cost">Cost</SelectItem>
                        <SelectItem value="Investment">Investment</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Periods</SelectItem>
                        {periods.map((period) => (
                            <SelectItem key={period} value={period}>{period}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterType('All'); setFilterStatus('All'); setFilterPeriod('All'); fetchData(); }} className="flex items-center gap-2">
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Profit</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <TrendingUp className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No profit centers found</p>
                                        <p className="text-sm text-gray-400">Create your first profit center to get started</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                                    <td className="px-4 py-3"><Badge className={getTypeColor(item.type)}>{item.type}</Badge></td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.manager}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(item.revenueAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(item.costAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        <span className={getProfitColor(item.profitAmount)}>{formatCurrency(item.profitAmount)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center"><Badge className={getStatusColor(item.status)}>{item.status}</Badge></td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleView(item)} className="p-1 hover:bg-blue-100 rounded-lg"><Eye size={16} className="text-blue-500" /></button>
                                            <button onClick={() => handleEdit(item)} className="p-1 hover:bg-yellow-100 rounded-lg"><Edit size={16} className="text-yellow-500" /></button>
                                            <button onClick={() => handleDelete(item)} className="p-1 hover:bg-red-100 rounded-lg"><Trash2 size={16} className="text-red-500" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} profit centers</p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals (same pattern as CostCenters) */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Profit Center Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-sm text-gray-500">Code</p><p className="font-medium">{selectedItem.code}</p></div>
                                <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{selectedItem.name}</p></div>
                                <div><p className="text-sm text-gray-500">Type</p><Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge></div>
                                <div><p className="text-sm text-gray-500">Status</p><Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge></div>
                                <div><p className="text-sm text-gray-500">Manager</p><p className="font-medium">{selectedItem.manager}</p></div>
                                <div><p className="text-sm text-gray-500">Period</p><p className="font-medium">{selectedItem.period}</p></div>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Metrics</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Revenue</p><p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.revenueAmount)}</p></CardContent></Card>
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Cost</p><p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.costAmount)}</p></CardContent></Card>
                                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Profit</p><p className={`text-xl font-bold ${getProfitColor(selectedItem.profitAmount)}`}>{formatCurrency(selectedItem.profitAmount)}</p></CardContent></Card>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter><Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Form Modal */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            {formMode === 'create' ? 'Create Profit Center' : 'Edit Profit Center'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Code</Label><Input value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., PC-001" /></div>
                            <div><Label>Name</Label><Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Profit center name" /></div>
                            <div><Label>Type</Label>
                                <Select value={formData.type || 'Revenue'} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Revenue">Revenue</SelectItem>
                                        <SelectItem value="Cost">Cost</SelectItem>
                                        <SelectItem value="Investment">Investment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Status</Label>
                                <Select value={formData.status || 'Active'} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Manager</Label><Input value={formData.manager || ''} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} placeholder="Manager name" /></div>
                            <div><Label>Period</Label><Input value={formData.period || ''} onChange={(e) => setFormData({ ...formData, period: e.target.value })} placeholder="e.g., Q1 2025" /></div>
                            <div><Label>Revenue Amount</Label><Input type="number" value={formData.revenueAmount || ''} onChange={(e) => setFormData({ ...formData, revenueAmount: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
                            <div><Label>Cost Amount</Label><Input type="number" value={formData.costAmount || ''} onChange={(e) => setFormData({ ...formData, costAmount: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit}>
                            {formMode === 'create' ? 'Create' : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600"><AlertCircle className="h-5 w-5" /> Confirm Delete</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this profit center? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="py-4"><p className="text-sm text-gray-600"><strong>{selectedItem.code}</strong> - {selectedItem.name}</p></div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-emerald-600" /> Export Profit Centers</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div><Label>Export Format</Label>
                            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF - Document</SelectItem>
                                    <SelectItem value="excel">Excel - Spreadsheet</SelectItem>
                                    <SelectItem value="csv">CSV - Comma separated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div><Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Total: <strong>{filteredItems.length}</strong></p>
                                <p>Active: <strong>{stats.active}</strong></p>
                                <p>Total Profit: <strong>{formatCurrency(stats.totalProfit)}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleExport({ profitCenters: filteredItems, stats, period: filterPeriod })} disabled={exporting}>
                            {exporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ProfitCenters;