// src/pages/finance/consolidation/ConsolidationReports.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
    DollarSign, Users, Target, AlertCircle, CheckCircle,
    BarChart3, Activity, Shield, X, Calendar, Globe,
    TrendingUp, TrendingDown, PieChart, GitMerge
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
    getConsolidationReports,
    generateConsolidationReport,
    downloadConsolidationReport,
} from '../../../services/finance/finance.api';

interface ConsolidationReport {
    id: string;
    code: string;
    name: string;
    type: 'Financial' | 'Management' | 'Custom' | 'Compliance';
    period: string;
    consolidationGroupId: string;
    consolidationGroupName: string;
    format: 'PDF' | 'Excel' | 'HTML';
    status: 'Generated' | 'InProgress' | 'Scheduled' | 'Error';
    generatedDate: string;
    generatedBy: string;
    fileSize: string;
    downloadUrl: string;
    metrics: ConsolidationMetric[];
    summary: string;
    entities: string[];
    entityCount: number;
    totalRevenue: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netIncome: number;
    adjustments: number;
    eliminations: number;
    createdAt?: string;
    updatedAt?: string;
}

interface ConsolidationMetric {
    name: string;
    value: number;
    previousValue: number;
    change: number;
    changePercentage: number;
    status: 'Positive' | 'Negative' | 'Neutral';
    unit: string;
}

interface ConsolidationReportStats {
    totalReports: number;
    generatedReports: number;
    scheduledReports: number;
    inProgressReports: number;
    errorReports: number;
    totalEntities: number;
    totalRevenue: number;
    totalAssets: number;
    totalEquity: number;
    totalNetIncome: number;
}

const ConsolidationReports: React.FC = () => {
    const [items, setItems] = useState<ConsolidationReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterGroup, setFilterGroup] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<ConsolidationReport | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [groups, setGroups] = useState<string[]>([]);
    const [periods, setPeriods] = useState<string[]>([]);
    const [generateForm, setGenerateForm] = useState({
        type: 'Financial',
        period: '',
        groupId: '',  // This should be empty string, not 'none'
        format: 'PDF',
        fromDate: '',
        toDate: '',
        includeEliminations: true,
        includeAdjustments: true,
    });


    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('consolidation-reports');

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

            const response = await getConsolidationReports(params);

            let data: ConsolidationReport[] = [];
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

            // Extract unique groups and periods for filters
            const uniqueGroups = [...new Set(data.map(c => c.consolidationGroupName).filter(Boolean))];
            const uniquePeriods = [...new Set(data.map(c => c.period).filter(Boolean))];
            setGroups(uniqueGroups as string[]);
            setPeriods(uniquePeriods as string[]);
        } catch (error) {
            console.error('Error fetching consolidation reports:', error);
            showToast.error('Failed to load consolidation reports');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterType, filterStatus, filterGroup, filterPeriod]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): ConsolidationReportStats => {
        const filtered = items;
        const generated = filtered.filter(c => c.status === 'Generated').length;
        const scheduled = filtered.filter(c => c.status === 'Scheduled').length;
        const inProgress = filtered.filter(c => c.status === 'InProgress').length;
        const error = filtered.filter(c => c.status === 'Error').length;
        const totalEntities = filtered.reduce((sum, c) => sum + (c.entityCount || 0), 0);
        const totalRevenue = filtered.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
        const totalAssets = filtered.reduce((sum, c) => sum + (c.totalAssets || 0), 0);
        const totalEquity = filtered.reduce((sum, c) => sum + (c.totalEquity || 0), 0);
        const totalNetIncome = filtered.reduce((sum, c) => sum + (c.netIncome || 0), 0);

        return {
            totalReports: filtered.length,
            generatedReports: generated,
            scheduledReports: scheduled,
            inProgressReports: inProgress,
            errorReports: error,
            totalEntities,
            totalRevenue,
            totalAssets,
            totalEquity,
            totalNetIncome,
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
            Generated: 'bg-green-100 text-green-700 border-green-200',
            InProgress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
            Error: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Financial: 'bg-blue-100 text-blue-700 border-blue-200',
            Management: 'bg-purple-100 text-purple-700 border-purple-200',
            Custom: 'bg-orange-100 text-orange-700 border-orange-200',
            Compliance: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesGroup = filterGroup === 'All' || item.consolidationGroupName === filterGroup;
        const matchesPeriod = filterPeriod === 'All' || item.period === filterPeriod;
        return matchesSearch && matchesType && matchesStatus && matchesGroup && matchesPeriod;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // In the component, update the generateForm state

// Update the handleGenerate function
    const handleGenerate = async () => {
        try {
            setGenerating(true);

            // ✅ Build the request body correctly
            const requestData: any = {
                period: generateForm.period || "Q1 2025",
                format: generateForm.format || "PDF",
                includeEliminations: generateForm.includeEliminations ?? true,
                includeAdjustments: generateForm.includeAdjustments ?? true,
            };

            // ✅ Handle consolidationGroupId properly - must be GUID or null
            if (generateForm.groupId && generateForm.groupId !== '') {
                // Try to parse as GUID - if valid, send it
                try {
                    const guid = generateForm.groupId;
                    // Simple GUID validation
                    if (guid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                        requestData.consolidationGroupId = guid;
                    } else {
                        // If it's not a valid GUID, don't send it
                        console.warn('Invalid GUID format for consolidationGroupId:', guid);
                    }
                } catch {
                    // If parsing fails, don't send it
                }
            }

            // ✅ Only add dates if they are provided
            if (generateForm.fromDate) {
                requestData.fromDate = generateForm.fromDate;
            }
            if (generateForm.toDate) {
                requestData.toDate = generateForm.toDate;
            }

            console.log('Generating report with data:', requestData);

            const response = await generateConsolidationReport(requestData);

            console.log('Generate response:', response);

            showToast.success('Consolidation report generated successfully');
            await fetchData();
            setIsGenerateModalOpen(false);
            setGenerateForm({
                type: 'Financial',
                period: '',
                groupId: '',
                format: 'PDF',
                fromDate: '',
                toDate: '',
                includeEliminations: true,
                includeAdjustments: true,
            });
        } catch (error: any) {
            console.error('Error generating consolidation report:', error);

            // Handle errors properly
            let errorMsg = 'Failed to generate consolidation report';

            if (error.response?.data) {
                const data = error.response.data;
                if (data.message) {
                    errorMsg = data.message;
                } else if (data.errors) {
                    if (Array.isArray(data.errors)) {
                        errorMsg = data.errors.join(', ');
                    } else if (typeof data.errors === 'object') {
                        const errorMessages = Object.values(data.errors).flat();
                        if (errorMessages.length > 0) {
                            errorMsg = errorMessages.join(', ');
                        }
                    } else if (typeof data.errors === 'string') {
                        errorMsg = data.errors;
                    }
                } else if (data.title) {
                    errorMsg = data.title;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }

            showToast.error(errorMsg);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (reportId: string, format: string = 'pdf') => {
        try {
            setDownloading(true);
            const result = await downloadConsolidationReport(reportId, format);
            showToast.success(`Report downloaded successfully: ${result.filename}`);
        } catch (error: any) {
            console.error('Error downloading report:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to download report';
            showToast.error(errorMsg);
        } finally {
            setDownloading(false);
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
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Consolidation Reports</h1>
                        <p className="text-sm text-gray-500">Generate and manage consolidated financial reports</p>
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
                        onClick={() => handlePrintReport({ reports: filteredItems, stats })}
                    >
                        <Printer size={16} /> Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => setIsGenerateModalOpen(true)}
                    >
                        <Plus size={16} /> Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-teal-700 font-medium">Total Reports</p>
                                <p className="text-2xl font-bold text-teal-900">{stats.totalReports}</p>
                                <p className="text-xs text-teal-600 mt-1">{stats.generatedReports} generated</p>
                            </div>
                            <div className="p-3 bg-teal-200 rounded-xl">
                                <FileText className="h-6 w-6 text-teal-700" />
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
                                <TrendingUp className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Assets</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalAssets)}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <Globe className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Net Income</p>
                                <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalNetIncome)}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-700 font-medium">Total Entities</p>
                                <p className="text-2xl font-bold text-cyan-900">{stats.totalEntities}</p>
                            </div>
                            <div className="p-3 bg-cyan-200 rounded-xl">
                                <Users className="h-6 w-6 text-cyan-700" />
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
                        placeholder="Search reports..."
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
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                        <SelectItem value="Compliance">Compliance</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Generated">Generated</SelectItem>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Error">Error</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterGroup} onValueChange={setFilterGroup}>
                    <SelectTrigger className="md:w-44">
                        <GitMerge className="h-4 w-4 mr-2" />
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems && paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{item.consolidationGroupName}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                                        {formatCurrency(item.totalRevenue)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(item.id)}
                                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Download"
                                                disabled={downloading}
                                            >
                                                <Download size={16} className="text-green-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No consolidation reports found</p>
                                        <p className="text-sm text-gray-400">Generate your first consolidation report</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} reports
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
                            <FileText className="h-5 w-5 text-teal-600" />
                            Report Details
                        </DialogTitle>
                        <DialogDescription>
                            View consolidation report details and metrics
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
                                    <p className="text-sm text-gray-500">Group</p>
                                    <p className="font-medium">{selectedItem.consolidationGroupName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-medium">{selectedItem.period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Format</p>
                                    <p className="font-medium">{selectedItem.format}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Generated By</p>
                                    <p className="font-medium">{selectedItem.generatedBy}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Generated Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.generatedDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">File Size</p>
                                    <p className="font-medium">{selectedItem.fileSize}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Revenue</p>
                                            <p className="text-xl font-bold">{formatCurrency(selectedItem.totalRevenue)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Assets</p>
                                            <p className="text-xl font-bold">{formatCurrency(selectedItem.totalAssets)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Net Income</p>
                                            <p className="text-xl font-bold">{formatCurrency(selectedItem.netIncome)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Equity</p>
                                            <p className="text-xl font-bold">{formatCurrency(selectedItem.totalEquity)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Adjustments</p>
                                            <p className="text-xl font-bold">{selectedItem.adjustments}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Eliminations</p>
                                            <p className="text-xl font-bold">{selectedItem.eliminations}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                                <p className="text-sm text-gray-600">{selectedItem.summary}</p>
                            </div>

                            {selectedItem.entities && selectedItem.entities.length > 0 && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Entities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.entities.map((entity, idx) => (
                                            <Badge key={idx} variant="outline">{entity}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                    onClick={() => handleDownload(selectedItem.id)}
                                    disabled={downloading}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Report
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generate Modal */}
            <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-teal-600" />
                            Generate Consolidation Report
                        </DialogTitle>
                        <DialogDescription>
                            Configure and generate a new consolidation report
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Period *</Label>
                            <Input
                                placeholder="e.g., Q1 2025"
                                value={generateForm.period}
                                onChange={(e) => setGenerateForm({ ...generateForm, period: e.target.value })}
                            />
                            <p className="text-xs text-gray-400 mt-1">Required</p>
                        </div>
                        <div>
                            <Label>Consolidation Group (Optional)</Label>
                            <Select
                                value={generateForm.groupId}
                                onValueChange={(value) => setGenerateForm({ ...generateForm, groupId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select group (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {groups.map((group) => {
                                        // If group is a string, use it directly
                                        const groupValue = typeof group === 'string' ? group : '';
                                        return (
                                            <SelectItem key={groupValue} value={groupValue}>
                                                {groupValue}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-400 mt-1">Leave empty for no group</p>
                        </div>
                        <div>
                            <Label>Format</Label>
                            <Select
                                value={generateForm.format}
                                onValueChange={(value) => setGenerateForm({ ...generateForm, format: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PDF">PDF</SelectItem>
                                    <SelectItem value="Excel">Excel</SelectItem>
                                    <SelectItem value="HTML">HTML</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>From Date (Optional)</Label>
                            <Input
                                type="date"
                                value={generateForm.fromDate}
                                onChange={(e) => setGenerateForm({ ...generateForm, fromDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>To Date (Optional)</Label>
                            <Input
                                type="date"
                                value={generateForm.toDate}
                                onChange={(e) => setGenerateForm({ ...generateForm, toDate: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="includeEliminations"
                                    checked={generateForm.includeEliminations}
                                    onChange={(e) => setGenerateForm({ ...generateForm, includeEliminations: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <Label htmlFor="includeEliminations" className="cursor-pointer text-sm">
                                    Include Eliminations
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="includeAdjustments"
                                    checked={generateForm.includeAdjustments}
                                    onChange={(e) => setGenerateForm({ ...generateForm, includeAdjustments: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <Label htmlFor="includeAdjustments" className="cursor-pointer text-sm">
                                    Include Adjustments
                                </Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={handleGenerate}
                            disabled={generating || !generateForm.period}
                        >
                            {generating ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-teal-600" />
                            Export Reports
                        </DialogTitle>
                        <DialogDescription>
                            Export consolidation reports in your preferred format
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
                                <p>Reports: <strong>{filteredItems.length}</strong></p>
                                <p>Generated: <strong>{stats.generatedReports}</strong></p>
                                <p>Revenue: <strong>{formatCurrency(stats.totalRevenue)}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => handleExport({ reports: filteredItems, stats })}
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

export default ConsolidationReports;