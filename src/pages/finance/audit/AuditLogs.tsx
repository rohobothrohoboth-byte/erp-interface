// src/pages/finance/audit/AuditLogs.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    History, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, FileText, X,
    Calendar, Users, Shield, AlertCircle, CheckCircle,
    Clock, Activity, User, Globe, Server, Database,
    TrendingUp, TrendingDown, BarChart3, PieChart
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
    getAuditLogs,
    getAuditSummary,
    getAuditTrail,
} from '../../../services/finance/finance.api';

// ✅ FIX: Updated interface to match API response
interface AuditLog {
    id: string;
    actionDate: string;          // ✅ Changed from 'timestamp'
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    entityName?: string;         // ✅ Optional - derived from entityType
    details?: string;            // ✅ Optional - derived from action
    ipAddress: string;
    userAgent?: string;
    status: string;
    changes?: AuditChange[];
    module?: string;             // ✅ Optional - not in API
    companyId?: string;
    companyName?: string;
    branchId?: string;
    branchName?: string;
    departmentId?: string;
    departmentName?: string;
    createdAt?: string;
    durationMs?: number;
    errorMessage?: string;
}

interface AuditChange {
    field: string;
    oldValue: string;
    newValue: string;
}

interface AuditStats {
    totalLogs: number;
    successLogs: number;
    failureLogs: number;
    warningLogs: number;
    uniqueUsers: number;
    createActions: number;
    updateActions: number;
    deleteActions: number;
    viewActions: number;
    exportActions: number;
    approveActions: number;
    rejectActions: number;
    loginActions: number;
    logoutActions: number;
    topEntities: Array<{ entityType: string; count: number }>;
    topUsers: Array<{ userName: string; count: number }>;
    activityByModule: Array<{ module: string; count: number }>;
}

const AuditLogs: React.FC = () => {
    const [items, setItems] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterModule, setFilterModule] = useState('All');
    const [filterEntity, setFilterEntity] = useState('All');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<AuditLog | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [summary, setSummary] = useState<AuditStats | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('audit-logs');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
            };
            if (dateRange.from) params.fromDate = dateRange.from;
            if (dateRange.to) params.toDate = dateRange.to;
            if (filterAction !== 'All') params.action = filterAction;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterModule !== 'All') params.module = filterModule;
            if (filterEntity !== 'All') params.entityType = filterEntity;
            if (searchTerm) params.search = searchTerm;

            console.log('📊 Fetching audit logs with params:', params);

            const logsResponse = await getAuditLogs(params);
            console.log('📊 Audit logs response:', logsResponse);

            let data: AuditLog[] = [];
            let total = 0;

            // ✅ Handle response format: { items, totalCount, page, pageSize, totalPages }
            if (logsResponse?.items && Array.isArray(logsResponse.items)) {
                data = logsResponse.items;
                total = logsResponse.totalCount || data.length;
                console.log('✅ Found logs in response.items:', data.length);
            }
            // Handle { data: { items, totalCount } }
            else if (logsResponse?.data?.items && Array.isArray(logsResponse.data.items)) {
                data = logsResponse.data.items;
                total = logsResponse.data.totalCount || data.length;
                console.log('✅ Found logs in response.data.items:', data.length);
            }
            // Handle direct array
            else if (Array.isArray(logsResponse)) {
                data = logsResponse;
                total = data.length;
                console.log('✅ Response is direct array:', data.length);
            }
            // Handle response.data as array
            else if (logsResponse?.data && Array.isArray(logsResponse.data)) {
                data = logsResponse.data;
                total = data.length;
                console.log('✅ Found logs in response.data:', data.length);
            }

            // ✅ Map API data to UI format
            const mappedData = data.map((item: any) => ({
                ...item,
                // ✅ FIX: Use actionDate as timestamp
                timestamp: item.actionDate || item.createdAt || item.dateAdd,
                // ✅ FIX: Use entityType as entityName if entityName not available
                entityName: item.entityName || item.entityType || 'Unknown',
                // ✅ FIX: Use action as details if details not available
                details: item.details || item.action || 'No details',
                // ✅ FIX: Default status to Success if not set
                status: item.status || 'Success',
            }));

            setItems(mappedData);
            setTotalCount(total);

            // Fetch summary
            try {
                const summaryResponse = await getAuditSummary({});
                console.log('📊 Audit summary response:', summaryResponse);

                let summaryData = summaryResponse?.data || summaryResponse;
                if (summaryData) {
                    setSummary({
                        totalLogs: summaryData.totalLogs || total,
                        successLogs: summaryData.successLogs || 0,
                        failureLogs: summaryData.failureLogs || 0,
                        warningLogs: summaryData.warningLogs || 0,
                        uniqueUsers: summaryData.uniqueUsers || 0,
                        createActions: 0,
                        updateActions: 0,
                        deleteActions: 0,
                        viewActions: 0,
                        exportActions: 0,
                        approveActions: 0,
                        rejectActions: 0,
                        loginActions: 0,
                        logoutActions: 0,
                        topEntities: summaryData.topEntities || [],
                        topUsers: summaryData.topUsers || [],
                        activityByModule: summaryData.activityByModule || []
                    });
                }
            } catch (summaryError) {
                console.warn('Could not fetch audit summary:', summaryError);
            }
        } catch (error) {
            console.error('❌ Error fetching audit logs:', error);
            showToast.error('Failed to load audit logs');
            setItems([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [dateRange, filterAction, filterStatus, filterModule, filterEntity, searchTerm, currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ FIX: Format date properly
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return 'N/A';
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Success: 'bg-green-100 text-green-700 border-green-200',
            SUCCESS: 'bg-green-100 text-green-700 border-green-200',
            Failure: 'bg-red-100 text-red-700 border-red-200',
            FAILED: 'bg-red-100 text-red-700 border-red-200',
            Warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getActionColor = (action: string) => {
        const colors: Record<string, string> = {
            Create: 'bg-blue-100 text-blue-700 border-blue-200',
            Update: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Delete: 'bg-red-100 text-red-700 border-red-200',
            View: 'bg-gray-100 text-gray-700 border-gray-200',
            Export: 'bg-green-100 text-green-700 border-green-200',
            Print: 'bg-purple-100 text-purple-700 border-purple-200',
            Login: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            Logout: 'bg-gray-100 text-gray-700 border-gray-200',
            Approve: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            Reject: 'bg-rose-100 text-rose-700 border-rose-200',
        };
        return colors[action] || 'bg-gray-100 text-gray-700';
    };

    // ✅ FIX: Extract unique values for filters
    const actions = [...new Set(items.map(c => c.action).filter(Boolean))];
    const entities = [...new Set(items.map(c => c.entityType).filter(Boolean))];
    const modules = ['All']; // ✅ No module data from API

    const filteredItems = items.filter(item => {
        const matchesSearch =
            (item.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.entityName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.entityType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.action || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = filterAction === 'All' || item.action === filterAction;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesModule = filterModule === 'All'; // ✅ No module filtering
        const matchesEntity = filterEntity === 'All' || item.entityType === filterEntity;

        return matchesSearch && matchesAction && matchesStatus && matchesModule && matchesEntity;
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(0, ITEMS_PER_PAGE);

    const handleView = (item: AuditLog) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleViewAuditTrail = async (entityType: string, entityId: string) => {
        try {
            const response = await getAuditTrail(entityType, entityId);
            if (response?.data) {
                showToast.info(`Retrieved audit trail for ${entityType} #${entityId}`);
            }
        } catch (error) {
            console.error('Error fetching audit trail:', error);
            showToast.error('Failed to fetch audit trail');
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
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <History className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                        <p className="text-sm text-gray-500">Track all system activities and changes</p>
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
                        onClick={() => handlePrintReport({ logs: filteredItems, summary })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-700 font-medium">Total Logs</p>
                                    <p className="text-2xl font-bold text-slate-900">{summary.totalLogs}</p>
                                    <p className="text-xs text-slate-600 mt-1">{summary.successLogs} successful</p>
                                </div>
                                <div className="p-3 bg-slate-200 rounded-xl">
                                    <History className="h-6 w-6 text-slate-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Success</p>
                                    <p className="text-2xl font-bold text-green-900">{summary.successLogs}</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        {summary.totalLogs > 0 ? (summary.successLogs / summary.totalLogs * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                                <div className="p-3 bg-green-200 rounded-xl">
                                    <CheckCircle className="h-6 w-6 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-700 font-medium">Failures</p>
                                    <p className="text-2xl font-bold text-red-900">{summary.failureLogs}</p>
                                    <p className="text-xs text-red-600 mt-1">Requires attention</p>
                                </div>
                                <div className="p-3 bg-red-200 rounded-xl">
                                    <AlertCircle className="h-6 w-6 text-red-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-yellow-700 font-medium">Warnings</p>
                                    <p className="text-2xl font-bold text-yellow-900">{summary.warningLogs}</p>
                                    <p className="text-xs text-yellow-600 mt-1">Review needed</p>
                                </div>
                                <div className="p-3 bg-yellow-200 rounded-xl">
                                    <AlertCircle className="h-6 w-6 text-yellow-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Unique Users</p>
                                    <p className="text-2xl font-bold text-blue-900">{summary.uniqueUsers}</p>
                                    <p className="text-xs text-blue-600 mt-1">Active users</p>
                                </div>
                                <div className="p-3 bg-blue-200 rounded-xl">
                                    <Users className="h-6 w-6 text-blue-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search audit logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Actions</SelectItem>
                        {actions.map((action) => (
                            <SelectItem key={action} value={action}>{action}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Success">Success</SelectItem>
                        <SelectItem value="Failure">Failure</SelectItem>
                        <SelectItem value="Warning">Warning</SelectItem>
                    </SelectContent>
                </Select>

                {/* ✅ Module filter - hidden since no module data */}
                <Select value={filterModule} onValueChange={setFilterModule} disabled>
                    <SelectTrigger className="md:w-40 opacity-50">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Module (N/A)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Modules</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterEntity} onValueChange={setFilterEntity}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Entity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Entities</SelectItem>
                        {entities.map((entity) => (
                            <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-40"
                        placeholder="From"
                    />
                    <span className="text-gray-400">to</span>
                    <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-40"
                        placeholder="To"
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterAction('All');
                        setFilterStatus('All');
                        setFilterModule('All');
                        setFilterEntity('All');
                        setDateRange({ from: '', to: '' });
                        setCurrentPage(1);
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <History className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No audit logs found</p>
                                        <p className="text-sm text-gray-400">No activities recorded yet</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} className="text-gray-400" />
                                            {formatDate(item.timestamp)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.userName}</p>
                                            <p className="text-xs text-gray-500">{item.userEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getActionColor(item.action)}>{item.action}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm text-gray-700">{item.entityName}</p>
                                            <p className="text-xs text-gray-500">{item.entityType}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{item.details}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            {item.entityType && item.entityId && (
                                                <button
                                                    onClick={() => handleViewAuditTrail(item.entityType, item.entityId)}
                                                    className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
                                                    title="View Audit Trail"
                                                >
                                                    <History size={16} className="text-purple-500" />
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, totalCount)} of {totalCount} logs
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
                            <History className="h-5 w-5 text-slate-600" />
                            Audit Log Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed view of audit log entry
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Timestamp</p>
                                    <p className="font-medium">{formatDate(selectedItem.timestamp)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">User</p>
                                    <p className="font-medium">{selectedItem.userName}</p>
                                    <p className="text-xs text-gray-500">{selectedItem.userEmail}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Action</p>
                                    <Badge className={getActionColor(selectedItem.action)}>{selectedItem.action}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Entity</p>
                                    <p className="font-medium">{selectedItem.entityName}</p>
                                    <p className="text-xs text-gray-500">Type: {selectedItem.entityType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">IP Address</p>
                                    <p className="font-medium">{selectedItem.ipAddress || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Details</p>
                                    <p className="font-medium">{selectedItem.details}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium">{selectedItem.durationMs ? `${selectedItem.durationMs}ms` : 'N/A'}</p>
                                </div>
                                {selectedItem.errorMessage && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-red-500">Error</p>
                                        <p className="font-medium text-red-600">{selectedItem.errorMessage}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                {selectedItem.entityType && selectedItem.entityId && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleViewAuditTrail(selectedItem.entityType!, selectedItem.entityId!)}
                                        className="flex items-center gap-2"
                                    >
                                        <History size={16} />
                                        View Full Audit Trail
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
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
                            <Download className="h-5 w-5 text-slate-600" />
                            Export Audit Logs
                        </DialogTitle>
                        <DialogDescription>
                            Export audit logs in your preferred format.
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
                                <p>Total Logs: <strong>{filteredItems.length}</strong></p>
                                <p>Success: <strong>{summary?.successLogs || 0}</strong></p>
                                <p>Failures: <strong>{summary?.failureLogs || 0}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-slate-600 hover:bg-slate-700 text-white"
                            onClick={() => handleExport({ logs: filteredItems, summary })}
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

export default AuditLogs;