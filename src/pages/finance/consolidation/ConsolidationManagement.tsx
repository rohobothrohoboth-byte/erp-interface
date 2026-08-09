// src/pages/finance/consolidation/ConsolidationManagement.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Layers, Plus, Search, RefreshCw, Eye, Edit, Trash2,
    DollarSign, Calendar, Building2, Users, X, Save,
    AlertCircle, CheckCircle, TrendingUp, TrendingDown,
    ChevronLeft, ChevronRight, Filter, PieChart,
    FileText, Clock, Download, Printer, Loader2,
    GitMerge, Globe, Banknote, Landmark, Shield,
    BadgeCheck, Link2, Unlink, ArrowRight, ArrowLeft,
    Minus, Plus as PlusIcon, Equal
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
    getEntities,
    getConsolidationGroups,
    createConsolidationGroup,
    updateConsolidationGroup,
    deleteConsolidationGroup,
    runConsolidation,
    getConsolidationResults,
    getEliminationEntries,
    getFinancialPeriods,
} from '../../../services/finance/finance.api';

interface Entity {
    id: string;
    code: string;
    name: string;
    legalName: string;
    type: 'Parent' | 'Subsidiary' | 'Associate' | 'JointVenture';
    country: string;
    currency: string;
    fiscalYearStart: string;
    fiscalYearEnd: string;
    ownershipPercentage: number;
    consolidationMethod: 'Full' | 'Equity' | 'Proportionate' | 'None';
    status: 'Active' | 'Inactive';
    periodId?: string;
    periodName?: string;
    revenue: number;
    expenses: number;
    profit: number;
    assets: number;
    liabilities: number;
    equity: number;
    createdAt: string;
    updatedAt?: string;
}

interface ConsolidationGroup {
    id: string;
    name: string;
    description?: string;
    parentEntityId: string;
    parentEntityName?: string;
    entityIds: string[];
    entities?: Entity[];
    periodId?: string;
    periodName?: string;
    status: 'Draft' | 'InProgress' | 'Completed' | 'Approved';
    consolidationDate: string;
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    eliminationEntries: EliminationEntry[];
    createdAt: string;
    updatedAt?: string;
}

interface EliminationEntry {
    id: string;
    description: string;
    entityId: string;
    entityName?: string;
    accountId: string;
    accountName?: string;
    debitAmount: number;
    creditAmount: number;
    type: 'Intercompany' | 'Investment' | 'Dividend' | 'Other';
    status: 'Pending' | 'Posted' | 'Reversed';
    createdAt: string;
}

interface ConsolidationStats {
    totalEntities: number;
    totalGroups: number;
    activeEntities: number;
    completedGroups: number;
    totalRevenue: number;
    totalProfit: number;
    totalAssets: number;
    totalEquity: number;
    eliminationCount: number;
    eliminationAmount: number;
}

const ConsolidationManagement: React.FC = () => {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [groups, setGroups] = useState<ConsolidationGroup[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriodId, setFilterPeriodId] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGroup, setSelectedGroup] = useState<ConsolidationGroup | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const [isEliminationModalOpen, setIsEliminationModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

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
    } = useReportExport('consolidation');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentEntityId: '',
        entityIds: [] as string[],
        periodId: '',
        consolidationDate: new Date().toISOString().split('T')[0],
    });

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        fetchData();
    }, [filterPeriodId]);

    const fetchPeriods = async () => {
        try {
            const res = await getFinancialPeriods({ status: 'All' });
            let data = [];
            if (res.data) {
                if (Array.isArray(res.data)) data = res.data;
                else if (res.data.data && Array.isArray(res.data.data)) data = res.data.data;
                else if (res.data.$values && Array.isArray(res.data.$values)) data = res.data.$values;
            }
            setPeriods(data);
            const active = data.find((p: any) => !p.isClosed);
            if (active) {
                setFormData(prev => ({ ...prev, periodId: active.id }));
            }
        } catch (error) {
            console.error('Error fetching periods:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterPeriodId && filterPeriodId !== 'all') {
                params.periodId = filterPeriodId;
            }
            if (filterStatus && filterStatus !== 'All') {
                params.status = filterStatus;
            }

            // ✅ Real API calls
            const [entitiesRes, groupsRes, eliminationsRes] = await Promise.all([
                getEntities(params),
                getConsolidationGroups(params),
                getEliminationEntries(params),
            ]);

            // Parse Entities
            let entitiesData = [];
            if (entitiesRes.data) {
                if (Array.isArray(entitiesRes.data)) entitiesData = entitiesRes.data;
                else if (entitiesRes.data.data && Array.isArray(entitiesRes.data.data)) entitiesData = entitiesRes.data.data;
                else if (entitiesRes.data.$values && Array.isArray(entitiesRes.data.$values)) entitiesData = entitiesRes.data.$values;
            }
            setEntities(entitiesData);

            // Parse Groups
            let groupsData = [];
            if (groupsRes.data) {
                if (Array.isArray(groupsRes.data)) groupsData = groupsRes.data;
                else if (groupsRes.data.data && Array.isArray(groupsRes.data.data)) groupsData = groupsRes.data.data;
                else if (groupsRes.data.$values && Array.isArray(groupsRes.data.$values)) groupsData = groupsRes.data.$values;
            }
            setGroups(groupsData);

            // Parse Eliminations
            let eliminationsData = [];
            if (eliminationsRes.data) {
                if (Array.isArray(eliminationsRes.data)) eliminationsData = eliminationsRes.data;
                else if (eliminationsRes.data.data && Array.isArray(eliminationsRes.data.data)) eliminationsData = eliminationsRes.data.data;
                else if (eliminationsRes.data.$values && Array.isArray(eliminationsRes.data.$values)) eliminationsData = eliminationsRes.data.$values;
            }
            setEliminations(eliminationsData);

        } catch (error) {
            console.error('Error fetching consolidation data:', error);
            showToast.error('Failed to load data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // ✅ Updated handleCreateConsolidationGroup
    const handleCreateConsolidationGroup = async () => {
        // ... (validation remains the same)

        try {
            const payload = {
                name: formData.name,
                description: formData.description || '',
                parentEntityId: formData.parentEntityId,
                entityIds: formData.entityIds,
                periodId: formData.periodId,
                consolidationDate: new Date(formData.consolidationDate).toISOString(),
                status: 'Draft',
            };

            await createConsolidationGroup(payload);
            showToast.success('Consolidation group created successfully');
            setIsAddModalOpen(false);
            resetForm();
            await fetchData();
        } catch (error: any) {
            console.error('Error creating consolidation group:', error);
            showToast.error(error.response?.data?.message || 'Failed to create consolidation group');
        }
    };

    // ✅ Updated handleRunConsolidation
    const handleRunConsolidation = async () => {
        if (!selectedGroup) return;

        try {
            setIsRunning(true);
            const result = await runConsolidation(selectedGroup.id);
            showToast.success('Consolidation completed successfully');

            // Fetch updated results
            const results = await getConsolidationResults(selectedGroup.id);
            setConsolidationResults(results.data);

            setIsRunModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error running consolidation:', error);
            showToast.error(error.response?.data?.message || 'Failed to run consolidation');
        } finally {
            setIsRunning(false);
        }
    };

    // ✅ Updated handleDeleteConsolidationGroup
    const handleDeleteConsolidationGroup = async () => {
        if (!selectedGroup) return;
        try {
            await deleteConsolidationGroup(selectedGroup.id);
            showToast.success('Consolidation group deleted successfully');
            setIsDeleteModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting consolidation group:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete group');
        }
    };

    const getStats = (): ConsolidationStats => {
        const activeEntities = entities.filter(e => e.status === 'Active').length;
        const completedGroups = groups.filter(g => g.status === 'Completed' || g.status === 'Approved').length;
        const totalEliminations = groups.reduce((sum, g) => sum + (g.eliminationEntries?.length || 0), 0);
        const totalEliminationAmount = groups.reduce((sum, g) =>
            sum + (g.eliminationEntries?.reduce((s, e) => s + e.debitAmount + e.creditAmount, 0) || 0), 0
        );

        return {
            totalEntities: entities.length,
            totalGroups: groups.length,
            activeEntities,
            completedGroups,
            totalRevenue: groups.reduce((sum, g) => sum + g.totalRevenue, 0),
            totalProfit: groups.reduce((sum, g) => sum + g.totalProfit, 0),
            totalAssets: groups.reduce((sum, g) => sum + g.totalAssets, 0),
            totalEquity: groups.reduce((sum, g) => sum + g.totalEquity, 0),
            eliminationCount: totalEliminations,
            eliminationAmount: totalEliminationAmount,
        };
    };

    const stats = getStats();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Active: 'bg-green-100 text-green-700 border-green-200',
            Inactive: 'bg-gray-100 text-gray-700 border-gray-200',
            Draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            InProgress: 'bg-blue-100 text-blue-700 border-blue-200',
            Completed: 'bg-green-100 text-green-700 border-green-200',
            Approved: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getEntityTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Parent: 'bg-purple-100 text-purple-700 border-purple-200',
            Subsidiary: 'bg-blue-100 text-blue-700 border-blue-200',
            Associate: 'bg-green-100 text-green-700 border-green-200',
            JointVenture: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getConsolidationMethodColor = (method: string) => {
        const colors: Record<string, string> = {
            Full: 'bg-green-100 text-green-700',
            Equity: 'bg-blue-100 text-blue-700',
            Proportionate: 'bg-orange-100 text-orange-700',
            None: 'bg-gray-100 text-gray-700',
        };
        return colors[method] || 'bg-gray-100 text-gray-700';
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <GitMerge className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Consolidation Management</h1>
                        <p className="text-sm text-gray-500">Multi-entity consolidation with elimination entries</p>
                    </div>
                </div>
                <div className="flex gap-2">
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
                        onClick={() => handlePrintReport({
                            entities,
                            groups,
                            stats,
                            periodName: periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'
                        })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        New Consolidation Group
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Entities</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.totalEntities}</p>
                                <p className="text-xs text-blue-600 mt-1">{stats.activeEntities} active</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Building2 className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Groups</p>
                                <p className="text-2xl font-bold text-green-900">{stats.totalGroups}</p>
                                <p className="text-xs text-green-600 mt-1">{stats.completedGroups} completed</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <Layers className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
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
                                <p className="text-sm text-emerald-700 font-medium">Total Profit</p>
                                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalProfit)}</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total Assets</p>
                                <p className="text-2xl font-bold text-indigo-900">{formatCurrency(stats.totalAssets)}</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-xl">
                                <Banknote className="h-6 w-6 text-indigo-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Eliminations</p>
                                <p className="text-2xl font-bold text-red-900">{stats.eliminationCount}</p>
                                <p className="text-xs text-red-600 mt-1">{formatCurrency(stats.eliminationAmount)}</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-xl">
                                <Unlink className="h-6 w-6 text-red-700" />
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
                        placeholder="Search entities or groups..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterPeriodId} onValueChange={setFilterPeriodId}>
                    <SelectTrigger className="md:w-48">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Periods</SelectItem>
                        {periods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                                {period.name} {period.isClosed ? '🔒' : '🔓'}
                            </SelectItem>
                        ))}
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('All');
                        setFilterPeriodId('all');
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Entities and Groups Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600">
                        <Building2 className="h-4 w-4 inline mr-2" />
                        Entities
                    </button>
                    <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                        <Layers className="h-4 w-4 inline mr-2" />
                        Consolidation Groups
                    </button>
                </nav>
            </div>

            {/* Entities Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ownership</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {entities.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Building2 className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No entities found</p>
                                        <p className="text-sm text-gray-400">Add entities to start consolidation</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            entities.slice(0, 10).map((entity) => (
                                <tr key={entity.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{entity.code}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{entity.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getEntityTypeColor(entity.type)}>{entity.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{entity.country}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{entity.currency}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getConsolidationMethodColor(entity.consolidationMethod)}>
                                            {entity.consolidationMethod}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                        {entity.ownershipPercentage}%
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(entity.status)}>{entity.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button className="p-1 hover:bg-blue-100 rounded-lg" title="View">
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button className="p-1 hover:bg-yellow-100 rounded-lg" title="Edit">
                                                <Edit size={16} className="text-yellow-600" />
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
                    <p className="text-sm text-gray-500">Showing {Math.min(10, entities.length)} of {entities.length} entities</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">Page 1 of 1</span>
                        <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export Consolidation Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the consolidation report in your preferred format.
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
                            <Label>Period</Label>
                            <div className="text-sm text-gray-600">
                                {periods.find(p => p.id === filterPeriodId)?.name || 'All Periods'}
                            </div>
                        </div>

                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Entities: <strong>{stats.totalEntities}</strong></p>
                                <p>Groups: <strong>{stats.totalGroups}</strong></p>
                                <p>Total Revenue: <strong>{formatCurrency(stats.totalRevenue)}</strong></p>
                                <p>Total Profit: <strong>{formatCurrency(stats.totalProfit)}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => handleExport({ entities, groups, stats, periodName: periods.find(p => p.id === filterPeriodId)?.name || 'All Periods' })}
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

export default ConsolidationManagement;