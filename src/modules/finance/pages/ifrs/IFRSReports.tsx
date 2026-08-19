// src/pages/finance/ifrs/IFRSReports.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Calendar,
    DollarSign, TrendingUp, TrendingDown, PieChart,
    BarChart3, LineChart, Shield, BadgeCheck,
    AlertCircle, CheckCircle, Clock, FileCheck,
    BookOpen, Users, Building2, Landmark, Globe,
    Award, Target, Zap, Activity
} from 'lucide-react';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
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
    getIFRSReports,
    getIFRSReportById,
    downloadIFRSReport,
    generateIFRSReport,
    scheduleIFRSReport,
} from '@/modules/finance/services/finance.api';

interface IFRSReport {
    id: string;
    standard: 'IFRS 9' | 'IFRS 15' | 'IFRS 16' | 'IFRS 7' | 'IFRS 8';
    name: string;
    description: string;
    period: string;
    reportDate: string;
    status: 'Generated' | 'InProgress' | 'Scheduled' | 'Error';
    format: 'PDF' | 'Excel' | 'HTML';
    metrics: IFRSMetric[];
    summary: string;
    generatedBy: string;
    fileSize: string;
    downloadUrl: string;
    createdAt: string;
    updatedAt: string;
}

interface IFRSMetric {
    name: string;
    value: number;
    previousValue: number;
    change: number;
    changePercentage: number;
    status: 'Positive' | 'Negative' | 'Neutral';
    unit: string;
}

interface IFRSStats {
    totalReports: number;
    generatedReports: number;
    standards: number;
    totalMetrics: number;
    positiveMetrics: number;
    negativeMetrics: number;
    neutralMetrics: number;
    complianceScore: number;
}

const IFRSReports: React.FC = () => {
    const [activeStandard, setActiveStandard] = useState<'IFRS 9' | 'IFRS 15' | 'IFRS 16' | 'IFRS 7' | 'IFRS 8' | 'All'>('All');
    const [reports, setReports] = useState<IFRSReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState<IFRSReport | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [generateForm, setGenerateForm] = useState({
        standard: 'IFRS 9',
        period: '',
        format: 'PDF',
    });
    const [scheduleForm, setScheduleForm] = useState({
        standard: 'IFRS 9',
        period: '',
        frequency: 'monthly',
        recipients: '',
        format: 'PDF',
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
        title,
    } = useReportExport('ifrs-reports');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterPeriod && filterPeriod !== 'All') {
                params.period = filterPeriod;
            }
            if (filterStatus && filterStatus !== 'All') {
                params.status = filterStatus;
            }
            if (activeStandard && activeStandard !== 'All') {
                params.standard = activeStandard;
            }

            const response = await getIFRSReports(params);

            let data: IFRSReport[] = [];
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
            console.error('Error fetching IFRS reports:', error);
            showToast.error('Failed to load IFRS reports');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterPeriod, filterStatus, activeStandard]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): IFRSStats => {
        const filtered = activeStandard === 'All' ? reports : reports.filter(r => r.standard === activeStandard);
        const generated = filtered.filter(r => r.status === 'Generated').length;
        const allMetrics = filtered.flatMap(r => r.metrics || []);
        const positive = allMetrics.filter(m => m.status === 'Positive').length;
        const negative = allMetrics.filter(m => m.status === 'Negative').length;
        const neutral = allMetrics.filter(m => m.status === 'Neutral').length;

        return {
            totalReports: filtered.length,
            generatedReports: generated,
            standards: new Set(filtered.map(r => r.standard)).size,
            totalMetrics: allMetrics.length,
            positiveMetrics: positive,
            negativeMetrics: negative,
            neutralMetrics: neutral,
            complianceScore: allMetrics.length > 0 ? (positive / allMetrics.length) * 100 : 0,
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

    const getStandardColor = (standard: string) => {
        const colors: Record<string, string> = {
            'IFRS 9': 'bg-blue-100 text-blue-700 border-blue-200',
            'IFRS 15': 'bg-green-100 text-green-700 border-green-200',
            'IFRS 16': 'bg-purple-100 text-purple-700 border-purple-200',
            'IFRS 7': 'bg-orange-100 text-orange-700 border-orange-200',
            'IFRS 8': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
        return colors[standard] || 'bg-gray-100 text-gray-700';
    };

    const getChangeColor = (change: number) => {
        return change >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const filteredReports = reports.filter(r => {
        const matchesSearch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.standard || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
        const matchesPeriod = filterPeriod === 'All' || r.period === filterPeriod;
        const matchesStandard = activeStandard === 'All' || r.standard === activeStandard;
        return matchesSearch && matchesStatus && matchesPeriod && matchesStandard;
    });

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const periods = [...new Set(reports.map(r => r.period).filter(Boolean))];

    const handleViewReport = async (reportId: string) => {
        try {
            const response = await getIFRSReportById(reportId);
            if (response?.data) {
                setSelectedReport(response.data);
                setIsViewModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching report details:', error);
            showToast.error('Failed to load report details');
        }
    };

    const handleDownloadReport = async (reportId: string) => {
        try {
            setIsDownloading(true);
            const response = await downloadIFRSReport(reportId);

            // Create blob from response
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/pdf'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = response.headers['content-disposition']?.split('filename=')[1] || `IFRS-Report-${reportId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Error downloading report:', error);
            showToast.error('Failed to download report');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleGenerateReport = async () => {
        try {
            setIsGenerating(true);
            await generateIFRSReport({
                standard: generateForm.standard,
                period: generateForm.period,
                format: generateForm.format,
            });
            showToast.success(`IFRS ${generateForm.standard} report generated successfully`);
            await fetchData();
            setIsGenerateModalOpen(false);
            setGenerateForm({ standard: 'IFRS 9', period: '', format: 'PDF' });
        } catch (error) {
            console.error('Error generating IFRS report:', error);
            showToast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleScheduleReport = async () => {
        try {
            await scheduleIFRSReport({
                standard: scheduleForm.standard,
                period: scheduleForm.period,
                frequency: scheduleForm.frequency,
                recipients: scheduleForm.recipients.split(',').map(email => email.trim()),
                format: scheduleForm.format,
            });
            showToast.success('Report scheduled successfully');
            setIsScheduleModalOpen(false);
            await fetchData();
        } catch (error) {
            console.error('Error scheduling report:', error);
            showToast.error('Failed to schedule report');
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
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">IFRS Reports</h1>
                        <p className="text-sm text-gray-500">IFRS 9, 15, 16, 7, 8 Compliance Reports</p>
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
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport({ reports: filteredReports, stats, period: filterPeriod })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => setIsGenerateModalOpen(true)}
                    >
                        <FileCheck size={16} />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Reports</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.totalReports}</p>
                                <p className="text-xs text-blue-600 mt-1">{stats.generatedReports} generated</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <FileText className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Compliance Score</p>
                                <p className="text-2xl font-bold text-green-900">{stats.complianceScore.toFixed(1)}%</p>
                                <p className="text-xs text-green-600 mt-1">Overall rating</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <Shield className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Standards</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.standards}</p>
                                <p className="text-xs text-purple-600 mt-1">IFRS standards</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <BookOpen className="h-6 w-6 text-purple-700" />
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
            </div>

            {/* Standards Navigation */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeStandard === 'All' ? 'default' : 'outline'}
                    className={activeStandard === 'All' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    onClick={() => setActiveStandard('All')}
                >
                    All Standards
                </Button>
                {['IFRS 9', 'IFRS 15', 'IFRS 16', 'IFRS 7', 'IFRS 8'].map((standard) => (
                    <Button
                        key={standard}
                        variant={activeStandard === standard ? 'default' : 'outline'}
                        className={activeStandard === standard ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                        onClick={() => setActiveStandard(standard as any)}
                    >
                        {standard}
                    </Button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search IFRS reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

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

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
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

            {/* Reports Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated By</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedReports.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <BookOpen className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No IFRS reports found</p>
                                        <p className="text-sm text-gray-400">Generate reports to see them here</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <Badge className={getStandardColor(report.standard)}>{report.standard}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{report.name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">{report.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{report.period}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{report.format}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{report.generatedBy}</td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleViewReport(report.id)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadReport(report.id)}
                                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Download"
                                                disabled={isDownloading}
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredReports.length)} of {filteredReports.length} reports
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

            {/* View Report Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                            IFRS Report Details
                        </DialogTitle>
                        <DialogDescription>
                            View IFRS report metrics and summary
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReport && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge className={getStandardColor(selectedReport.standard)}>
                                        {selectedReport.standard}
                                    </Badge>
                                    <h3 className="text-xl font-bold text-gray-900 mt-2">{selectedReport.name}</h3>
                                    <p className="text-sm text-gray-500">{selectedReport.description}</p>
                                </div>
                                <Badge className={getStatusColor(selectedReport.status)}>
                                    {selectedReport.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
                                    <p className="text-sm text-gray-500">Report Date</p>
                                    <p className="font-medium">{formatDate(selectedReport.reportDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">File Size</p>
                                    <p className="font-medium">{selectedReport.fileSize}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
                                </div>
                            </div>

                            {/* Metrics */}
                            {selectedReport.metrics && selectedReport.metrics.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Metrics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {selectedReport.metrics.map((metric, idx) => (
                                            <Card key={idx} className="border">
                                                <CardContent className="p-4">
                                                    <p className="text-sm text-gray-500">{metric.name}</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {metric.unit === 'USD' || metric.unit === '$'
                                                            ? formatCurrency(metric.value)
                                                            : metric.value.toLocaleString()}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-sm ${getChangeColor(metric.change)}`}>
                                                            {metric.change >= 0 ? '+' : ''}{metric.change.toLocaleString()}
                                                        </span>
                                                        <span className={`text-xs ${getChangeColor(metric.change)}`}>
                                                            ({metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%)
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {metric.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-400">Previous: {formatCurrency(metric.previousValue)}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {selectedReport.summary && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">{selectedReport.summary}</p>
                                    </div>
                                </div>
                            )}

                            {/* Download */}
                            <div className="flex justify-end">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleDownloadReport(selectedReport.id)}
                                    disabled={isDownloading}
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
                            <FileCheck className="h-5 w-5 text-indigo-600" />
                            Generate IFRS Report
                        </DialogTitle>
                        <DialogDescription>
                            Configure and generate a new IFRS report
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Standard</Label>
                            <Select
                                value={generateForm.standard}
                                onValueChange={(value) => setGenerateForm({ ...generateForm, standard: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select standard" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IFRS 9">IFRS 9 - Financial Instruments</SelectItem>
                                    <SelectItem value="IFRS 15">IFRS 15 - Revenue Recognition</SelectItem>
                                    <SelectItem value="IFRS 16">IFRS 16 - Leases</SelectItem>
                                    <SelectItem value="IFRS 7">IFRS 7 - Disclosures</SelectItem>
                                    <SelectItem value="IFRS 8">IFRS 8 - Operating Segments</SelectItem>
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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Report'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export IFRS Reports'}
                        </DialogTitle>
                        <DialogDescription>
                            Export IFRS reports in your preferred format.
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
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Reports: <strong>{filteredReports.length}</strong></p>
                                <p>Standards: <strong>{stats.standards}</strong></p>
                                <p>Compliance Score: <strong>{stats.complianceScore.toFixed(1)}%</strong></p>
                                <p>Status: <strong>{filterStatus === 'All' ? 'All' : filterStatus}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => handleExport({ reports: filteredReports, stats, period: filterPeriod })}
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

export default IFRSReports;