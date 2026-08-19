// src/pages/finance/costcontrolling/InternalOrders.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    GitBranch, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
    DollarSign, Users, Target, AlertCircle, CheckCircle,
    BarChart3, Activity, Shield, FileText, X, Clock,
    Calendar, User, Building2, TrendingUp, TrendingDown
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
    getInternalOrders,
    createInternalOrder,
    updateInternalOrder,
    deleteInternalOrder
} from '@/modules/finance/services/finance.api';

interface InternalOrder {
    id: string;
    code: string;
    name: string;
    type: 'Project' | 'Task' | 'Activity';
    priority: 'High' | 'Medium' | 'Low';
    responsiblePerson: string;
    department: string;
    budgetAmount: number;
    actualAmount: number;
    availableAmount: number;
    status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
    period: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

interface InternalOrderStats {
    total: number;
    planning: number;
    active: number;
    completed: number;
    cancelled: number;
    totalBudget: number;
    totalActual: number;
    totalAvailable: number;
    utilizationRate: number;
}

const InternalOrders: React.FC = () => {
    const [items, setItems] = useState<InternalOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<InternalOrder | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<Partial<InternalOrder>>({});

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('internal-orders');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);
            const response = await getInternalOrders();
            let data = [];
            if (response.data) {
                if (Array.isArray(response.data)) data = response.data;
                else if (response.data.data && Array.isArray(response.data.data)) data = response.data.data;
                else if (response.data.$values && Array.isArray(response.data.$values)) data = response.data.$values;
            }
            setItems(data);
        } catch (error) {
            console.error('Error fetching internal orders:', error);
            showToast.error('Failed to load internal orders');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): InternalOrderStats => {
        const filtered = items;
        const planning = filtered.filter(c => c.status === 'Planning').length;
        const active = filtered.filter(c => c.status === 'Active').length;
        const completed = filtered.filter(c => c.status === 'Completed').length;
        const cancelled = filtered.filter(c => c.status === 'Cancelled').length;
        const totalBudget = filtered.reduce((sum, c) => sum + (c.budgetAmount || 0), 0);
        const totalActual = filtered.reduce((sum, c) => sum + (c.actualAmount || 0), 0);
        const totalAvailable = filtered.reduce((sum, c) => sum + (c.availableAmount || 0), 0);

        return {
            total: filtered.length,
            planning,
            active,
            completed,
            cancelled,
            totalBudget,
            totalActual,
            totalAvailable,
            utilizationRate: totalBudget > 0 ? ((totalActual / totalBudget) * 100) : 0,
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
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Planning: 'bg-blue-100 text-blue-700 border-blue-200',
            Active: 'bg-green-100 text-green-700 border-green-200',
            Completed: 'bg-purple-100 text-purple-700 border-purple-200',
            Cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Project: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            Task: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Activity: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            High: 'bg-red-100 text-red-700 border-red-200',
            Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Low: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.responsiblePerson || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesPriority = filterPriority === 'All' || item.priority === filterPriority;
        const matchesPeriod = filterPeriod === 'All' || item.period === filterPeriod;
        return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesPeriod;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const periods = [...new Set(items.map(c => c.period).filter(Boolean))];

    const handleCreate = () => {
        setFormMode('create');
        setFormData({
            status: 'Planning',
            priority: 'Medium',
            type: 'Project',
            budgetAmount: 0,
            actualAmount: 0,
            availableAmount: 0,
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item: InternalOrder) => {
        setFormMode('edit');
        setFormData(item);
        setIsFormModalOpen(true);
    };

    const handleDelete = (item: InternalOrder) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleView = (item: InternalOrder) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteInternalOrder(selectedItem.id);
            showToast.success('Internal order deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting internal order:', error);
            showToast.error('Failed to delete internal order');
        }
    };

    const handleSubmit = async () => {
        try {
            // Calculate available amount
            const availableAmount = (formData.budgetAmount || 0) - (formData.actualAmount || 0);
            const submitData = { ...formData, availableAmount };

            if (formMode === 'create') {
                await createInternalOrder(submitData);
                showToast.success('Internal order created successfully');
            } else {
                await updateInternalOrder(submitData);
                showToast.success('Internal order updated successfully');
            }
            await fetchData();
            setIsFormModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error('Error saving internal order:', error);
            showToast.error('Failed to save internal order');
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
                        <GitBranch className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Internal Orders</h1>
                        <p className="text-sm text-gray-500">Manage and monitor internal orders, projects, and activities</p>
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
                        onClick={() => handlePrintReport({ internalOrders: filteredItems, stats, period: filterPeriod })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={handleCreate}
                    >
                        <Plus size={16} />
                        Add Internal Order
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
                                <p className="text-xs text-purple-600 mt-1">{stats.active} active</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <GitBranch className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Budget</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalBudget)}</p>
                                <p className="text-xs text-blue-600 mt-1">Allocated budget</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Actual</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalActual)}</p>
                                <p className="text-xs text-green-600 mt-1">Actual spend</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <Activity className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Available</p>
                                <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.totalAvailable)}</p>
                                <p className="text-xs text-orange-600 mt-1">Remaining budget</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-xl">
                                <Target className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-700 font-medium">Utilization</p>
                                <p className={`text-2xl font-bold ${stats.utilizationRate <= 80 ? 'text-green-900' : stats.utilizationRate <= 100 ? 'text-yellow-900' : 'text-red-900'}`}>
                                    {stats.utilizationRate.toFixed(1)}%
                                </p>
                                <p className="text-xs text-cyan-600 mt-1">Budget utilization</p>
                            </div>
                            <div className="p-3 bg-cyan-200 rounded-xl">
                                <BarChart3 className="h-6 w-6 text-cyan-700" />
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
                        placeholder="Search internal orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
                        <SelectItem value="Task">Task</SelectItem>
                        <SelectItem value="Activity">Activity</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Priority</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
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

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterType('All');
                        setFilterStatus('All');
                        setFilterPriority('All');
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <GitBranch className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No internal orders found</p>
                                        <p className="text-sm text-gray-400">Create your first internal order to get started</p>
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
                                    <td className="px-4 py-3">
                                        <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(item.budgetAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(item.actualAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-right">
                                            <span className={item.availableAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(item.availableAmount)}
                                            </span>
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} internal orders
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
                            <GitBranch className="h-5 w-5 text-purple-600" />
                            Internal Order Details
                        </DialogTitle>
                        <DialogDescription>
                            View internal order information and metrics
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Code</p>
                                    <p className="font-medium">{selectedItem.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedItem.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Priority</p>
                                    <Badge className={getPriorityColor(selectedItem.priority)}>{selectedItem.priority}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-medium">{selectedItem.period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Responsible Person</p>
                                    <p className="font-medium">{selectedItem.responsiblePerson}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium">{selectedItem.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.startDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">End Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.endDate)}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Metrics</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Budget</p>
                                            <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.budgetAmount)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Actual</p>
                                            <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedItem.actualAmount)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Available</p>
                                            <p className={`text-xl font-bold ${selectedItem.availableAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(selectedItem.availableAmount)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Started: {formatDate(selectedItem.startDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Ends: {formatDate(selectedItem.endDate)}</span>
                                    </div>
                                </div>
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-purple-600" />
                            {formMode === 'create' ? 'Create Internal Order' : 'Edit Internal Order'}
                        </DialogTitle>
                        <DialogDescription>
                            {formMode === 'create' ? 'Add a new internal order' : 'Update internal order information'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Code</Label>
                                <Input
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., IO-001"
                                />
                            </div>
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Internal order name"
                                />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={formData.type || 'Project'}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Project">Project</SelectItem>
                                        <SelectItem value="Task">Task</SelectItem>
                                        <SelectItem value="Activity">Activity</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority || 'Medium'}
                                    onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status || 'Planning'}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Planning">Planning</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
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
                                <Label>Responsible Person</Label>
                                <Input
                                    value={formData.responsiblePerson || ''}
                                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                                    placeholder="Person responsible"
                                />
                            </div>
                            <div>
                                <Label>Department</Label>
                                <Input
                                    value={formData.department || ''}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="Department"
                                />
                            </div>
                            <div>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={formData.startDate || ''}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={formData.endDate || ''}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Budget Amount</Label>
                                <Input
                                    type="number"
                                    value={formData.budgetAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, budgetAmount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label>Actual Amount</Label>
                                <Input
                                    type="number"
                                    value={formData.actualAmount || ''}
                                    onChange={(e) => setFormData({ ...formData, actualAmount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSubmit}>
                            {formMode === 'create' ? 'Create' : 'Update'}
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
                            Are you sure you want to delete this internal order? This action cannot be undone.
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
                            Export Internal Orders
                        </DialogTitle>
                        <DialogDescription>
                            Export internal orders in your preferred format.
                        </DialogDescription>
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
                                <p>Active: <strong>{stats.active}</strong></p>
                                <p>Total Budget: <strong>{formatCurrency(stats.totalBudget)}</strong></p>
                                <p>Utilization: <strong>{stats.utilizationRate.toFixed(1)}%</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => handleExport({ internalOrders: filteredItems, stats, period: filterPeriod })}
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

export default InternalOrders;