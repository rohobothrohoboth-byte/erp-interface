// src/pages/finance/costcontrolling/Coreports.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, FileText,
    DollarSign, TrendingUp, TrendingDown, PieChart,
    Activity, Shield, X, Calendar, Target, Zap
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
    getCOReports,
    generateCOReport,
    downloadCOReport,
    getCOReportSummary,
    getCOReportTrend,
    getCostCenterAllocations,
    getCostCenterReport,
    getProfitCenterReport,
    getInternalOrderReport,
    getCOBudgetVsActual,
    getCOVarianceAnalysis,
    exportCOReport,
    getCOPerformanceMetrics,
    getCOKPIs,
    getAllocationRules,
    getCostDistribution,
    allocateCosts,
    getCostDrivers,
} from '../../../services/finance/finance.api';

interface COReport {
    id: string;
    name: string;
    type: 'CostCenter' | 'ProfitCenter' | 'InternalOrder' | 'Variance' | 'Summary';
    period: string;
    generatedDate: string;
    format: 'PDF' | 'Excel' | 'HTML';
    status: 'Generated' | 'InProgress' | 'Scheduled' | 'Error';
    metrics: COMetric[];
    summary: string;
    generatedBy: string;
    downloadUrl: string;
}

interface COMetric {
    name: string;
    value: number;
    previousValue: number;
    change: number;
    changePercentage: number;
    status: 'Positive' | 'Negative' | 'Neutral';
    unit: string;
}

interface COReportStats {
    totalReports: number;
    generatedReports: number;
    types: number;
    totalMetrics: number;
    positiveMetrics: number;
    negativeMetrics: number;
}

const COReports: React.FC = () => {
    const [reports, setReports] = useState<COReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState<COReport | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generateForm, setGenerateForm] = useState({
        type: 'Summary',
        period: '',
        format: 'PDF',
        includeDetails: true,
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
    } = useReportExport('co-reports');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            // Build params
            const params: any = {};
            if (filterType !== 'All') params.type = filterType;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterPeriod !== 'All') params.period = filterPeriod;

            const response = await getCOReports(params);

            let data: COReport[] = [];
            if (response?.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }
            setReports(data);
        } catch (error) {
            console.error('Error fetching CO reports:', error);
            showToast.error('Failed to load CO reports');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterType, filterStatus, filterPeriod]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): COReportStats => {
        const filtered = reports;
        const generated = filtered.filter(r => r.status === 'Generated').length;
        const allMetrics = filtered.flatMap(r => r.metrics || []);
        const positive = allMetrics.filter(m => m.status === 'Positive').length;
        const negative = allMetrics.filter(m => m.status === 'Negative').length;

        return {
            totalReports: filtered.length,
            generatedReports: generated,
            types: new Set(filtered.map(r => r.type)).size,
            totalMetrics: allMetrics.length,
            positiveMetrics: positive,
            negativeMetrics: negative,
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
            CostCenter: 'bg-blue-100 text-blue-700 border-blue-200',
            ProfitCenter: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            InternalOrder: 'bg-purple-100 text-purple-700 border-purple-200',
            Variance: 'bg-orange-100 text-orange-700 border-orange-200',
            Summary: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = reports.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.type || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesPeriod = filterPeriod === 'All' || item.period === filterPeriod;
        return matchesSearch && matchesType && matchesStatus && matchesPeriod;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const periods = [...new Set(reports.map(r => r.period).filter(Boolean))];

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            await generateCOReport({
                type: generateForm.type as any,
                periodId: generateForm.period,
                fromDate: '',
                toDate: '',
                format: generateForm.format as any,
                includeDetails: generateForm.includeDetails,
            });
            showToast.success('CO report generated successfully');
            await fetchData();
            setIsGenerateModalOpen(false);
        } catch (error) {
            console.error('Error generating CO report:', error);
            showToast.error('Failed to generate CO report');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (reportId: string) => {
        try {
            await downloadCOReport(reportId);
            showToast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Error downloading report:', error);
            showToast.error('Failed to download report');
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
                        <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">CO Reports</h1>
                        <p className="text-sm text-gray-500">Cost Controlling reports and analytics</p>
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
                        onClick={() => handlePrintReport({ reports: filteredItems, stats, period: filterPeriod })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => setIsGenerateModalOpen(true)}
                    >
                        <FileText size={16} />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Total Reports</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.totalReports}</p>
                                <p className="text-xs text-orange-600 mt-1">{stats.generatedReports} generated</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-xl">
                                <FileText className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Report Types</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.types}</p>
                                <p className="text-xs text-blue-600 mt-1">Different report types</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <PieChart className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Positive Metrics</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats.positiveMetrics}</p>
                                <p className="text-xs text-emerald-600 mt-1">Of {stats.totalMetrics} total</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Negative Metrics</p>
                                <p className="text-2xl font-bold text-red-900">{stats.negativeMetrics}</p>
                                <p className="text-xs text-red-600 mt-1">Requires attention</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-xl">
                                <TrendingDown className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Metrics</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.totalMetrics}</p>
                                <p className="text-xs text-purple-600 mt-1">Tracked metrics</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <Activity className="h-6 w-6 text-purple-700" />
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
                        placeholder="Search CO reports..."
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
                        <SelectItem value="CostCenter">Cost Center</SelectItem>
                        <SelectItem value="ProfitCenter">Profit Center</SelectItem>
                        <SelectItem value="InternalOrder">Internal Order</SelectItem>
                        <SelectItem value="Variance">Variance</SelectItem>
                        <SelectItem value="Summary">Summary</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-40">
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <BarChart3 className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No CO reports found</p>
                                        <p className="text-sm text-gray-400">Generate reports to see them here</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{report.name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">{report.summary}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{report.period}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{report.format}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(report.id)}
                                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download size={16} className="text-green-500" />
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
                            <BarChart3 className="h-5 w-5 text-orange-600" />
                            CO Report Details
                        </DialogTitle>
                        <DialogDescription>
                            View CO report metrics and summary
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReport && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge className={getTypeColor(selectedReport.type)}>
                                        {selectedReport.type}
                                    </Badge>
                                    <h3 className="text-xl font-bold text-gray-900 mt-2">{selectedReport.name}</h3>
                                    <p className="text-sm text-gray-500">{selectedReport.summary}</p>
                                </div>
                                <Badge className={getStatusColor(selectedReport.status)}>
                                    {selectedReport.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-medium">{selectedReport.period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Format</p>
                                    <p className="font-medium">{selectedReport.format}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Generated By</p>
                                    <p className="font-medium">{selectedReport.generatedBy}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Generated Date</p>
                                    <p className="font-medium">{formatDate(selectedReport.generatedDate)}</p>
                                </div>
                            </div>

                            {/* Metrics */}
                            {selectedReport.metrics && selectedReport.metrics.length > 0 && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Metrics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {selectedReport.metrics.map((metric, idx) => (
                                            <Card key={idx} className="border">
                                                <CardContent className="p-4">
                                                    <p className="text-sm text-gray-500">{metric.name}</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {metric.unit === 'USD' || metric.unit === '$'
                                                            ? formatCurrency(metric.value)
                                                            : metric.value}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {metric.change >= 0 ? '+' : ''}{metric.change}
                                                        </span>
                                                        <span className={`text-xs ${metric.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            ({metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%)
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {metric.status}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleDownload(selectedReport.id)}
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

            {/* Generate Report Modal */}
            <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-600" />
                            Generate CO Report
                        </DialogTitle>
                        <DialogDescription>
                            Configure and generate a new CO report
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Report Type</Label>
                            <Select
                                value={generateForm.type}
                                onValueChange={(value) => setGenerateForm({ ...generateForm, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CostCenter">Cost Center</SelectItem>
                                    <SelectItem value="ProfitCenter">Profit Center</SelectItem>
                                    <SelectItem value="InternalOrder">Internal Order</SelectItem>
                                    <SelectItem value="Variance">Variance</SelectItem>
                                    <SelectItem value="Summary">Summary</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Period</Label>
                            <Input
                                placeholder="e.g., Q1 2025"
                                value={generateForm.period}
                                onChange={(e) => setGenerateForm({ ...generateForm, period: e.target.value })}
                            />
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? 'Generating...' : 'Generate'}
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
                            Export CO Reports
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
                                <p>Reports: <strong>{filteredItems.length}</strong></p>
                                <p>Types: <strong>{stats.types}</strong></p>
                                <p>Status: <strong>{filterStatus === 'All' ? 'All' : filterStatus}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => handleExport({ reports: filteredItems, stats, period: filterPeriod })}
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

export default COReports;