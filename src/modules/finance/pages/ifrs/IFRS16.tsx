// src/pages/finance/ifrs/IFRS16.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Building, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, FileText,
    TrendingUp, TrendingDown, PieChart, Activity,
    Shield, X, Calendar, Target, Zap, Award,
    BookOpen, BarChart3, LineChart, AlertTriangle,
    Home, Warehouse, Landmark, Calculator, Clock,
    Building2, HomeIcon, Factory, Store, Hotel
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
    getIFRSReports,
    getIFRSReportById,
    downloadIFRSReport,
    generateIFRSReport,
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

interface LeaseLiability {
    component: string;
    amount: number;
    percentage: number;
    color: string;
}

interface ROAsset {
    component: string;
    amount: number;
    description: string;
}

interface LeasePayment {
    component: string;
    amount: number;
    percentage: number;
}

interface IFRSStats {
    totalReports: number;
    generatedReports: number;
    totalMetrics: number;
    positiveMetrics: number;
    negativeMetrics: number;
    neutralMetrics: number;
}

const IFRS16: React.FC = () => {
    const [reports, setReports] = useState<IFRSReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState<IFRSReport | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [generateForm, setGenerateForm] = useState({
        period: '',
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
    } = useReportExport('ifrs16');

    const ITEMS_PER_PAGE = 10;

    // Mock data - These would come from API in production
    const leaseLiabilities: LeaseLiability[] = [
        { component: 'Current Portion', amount: 2500000, percentage: 20, color: 'bg-blue-500' },
        { component: 'Non-current Portion', amount: 10000000, percentage: 80, color: 'bg-purple-500' },
    ];

    const rouAssets: ROAsset[] = [
        { component: 'Total ROU Assets', amount: 11200000, description: 'Total right-of-use assets' },
        { component: 'Accumulated Depreciation', amount: 3200000, description: 'Depreciation to date' },
        { component: 'Net Book Value', amount: 8000000, description: 'Carrying amount' },
    ];

    const leasePayments: LeasePayment[] = [
        { component: 'Annual Lease Payments', amount: 1800000, percentage: 100 },
        { component: 'Interest Expense', amount: 450000, percentage: 25 },
        { component: 'Principal Repayments', amount: 1350000, percentage: 75 },
    ];

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {
                standard: 'IFRS 16'
            };
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterPeriod !== 'All') params.period = filterPeriod;

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
            console.error('Error fetching IFRS 16 reports:', error);
            showToast.error('Failed to load IFRS 16 reports');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterStatus, filterPeriod]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): IFRSStats => {
        const filtered = reports;
        const totalMetrics = filtered.flatMap(r => r.metrics || []);
        const positive = totalMetrics.filter(m => m.status === 'Positive').length;
        const negative = totalMetrics.filter(m => m.status === 'Negative').length;
        const neutral = totalMetrics.filter(m => m.status === 'Neutral').length;

        return {
            totalReports: filtered.length,
            generatedReports: filtered.filter(r => r.status === 'Generated').length,
            totalMetrics: totalMetrics.length,
            positiveMetrics: positive,
            negativeMetrics: negative,
            neutralMetrics: neutral,
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

    const getMetricStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Positive: 'text-green-600',
            Negative: 'text-red-600',
            Neutral: 'text-gray-600',
        };
        return colors[status] || 'text-gray-600';
    };

    const filteredItems = reports.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesPeriod = filterPeriod === 'All' || item.period === filterPeriod;
        return matchesSearch && matchesStatus && matchesPeriod;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const periods = [...new Set(reports.map(r => r.period).filter(Boolean))];

    const handleView = async (reportId: string) => {
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

    const handleDownload = async (reportId: string) => {
        try {
            setIsDownloading(true);
            await downloadIFRSReport(reportId);
            showToast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Error downloading report:', error);
            showToast.error('Failed to download report');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            await generateIFRSReport({
                standard: 'IFRS 16',
                period: generateForm.period,
                format: generateForm.format,
            });
            showToast.success('IFRS 16 report generated successfully');
            await fetchData();
            setIsGenerateModalOpen(false);
            setGenerateForm({ period: '', format: 'PDF' });
        } catch (error) {
            console.error('Error generating report:', error);
            showToast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                        <Building className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">IFRS 16 - Leases</h1>
                        <p className="text-sm text-gray-500">Lease accounting - right-of-use assets and lease liabilities</p>
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
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setIsGenerateModalOpen(true)}
                    >
                        <FileText size={16} /> Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Reports</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.totalReports}</p>
                                <p className="text-xs text-purple-600 mt-1">{stats.generatedReports} generated</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <FileText className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Positive Metrics</p>
                                <p className="text-2xl font-bold text-green-900">{stats.positiveMetrics}</p>
                                <p className="text-xs text-green-600 mt-1">Good performance</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-green-700" />
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

                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700 font-medium">Neutral Metrics</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.neutralMetrics}</p>
                                <p className="text-xs text-gray-600 mt-1">Stable performance</p>
                            </div>
                            <div className="p-3 bg-gray-200 rounded-xl">
                                <Activity className="h-6 w-6 text-gray-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Metrics</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.totalMetrics}</p>
                                <p className="text-xs text-blue-600 mt-1">Tracked metrics</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <PieChart className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* IFRS 16 Specific Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Lease Liabilities</h4>
                        <div className="space-y-3">
                            {leaseLiabilities.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{item.component}</span>
                                        <span className={`font-semibold ${idx === 0 ? 'text-blue-600' : 'text-purple-600'}`}>
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div className={`${item.color} rounded-full h-2`} style={{ width: `${item.percentage}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-400">{item.percentage}% of total</p>
                                </div>
                            ))}
                            <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Total Lease Liabilities</span>
                                    <span className="font-bold text-purple-600">
                                        {formatCurrency(leaseLiabilities.reduce((sum, item) => sum + item.amount, 0))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">ROU Assets</h4>
                        <div className="space-y-3">
                            {rouAssets.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-sm text-gray-600">{item.component}</span>
                                            <p className="text-xs text-gray-400">{item.description}</p>
                                        </div>
                                        <span className={`font-semibold ${idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                    {idx < rouAssets.length - 1 && <div className="border-t border-gray-100 my-2" />}
                                </div>
                            ))}
                            <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Net Book Value</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(rouAssets.find(a => a.component === 'Net Book Value')?.amount || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Lease Payments</h4>
                        <div className="space-y-3">
                            {leasePayments.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{item.component}</span>
                                        <span className={`font-semibold ${idx === 0 ? 'text-gray-900' : idx === 1 ? 'text-red-600' : 'text-blue-600'}`}>
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                    {idx === 0 && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div className="bg-blue-500 rounded-full h-2" style={{ width: '100%' }}></div>
                                        </div>
                                    )}
                                    {idx > 0 && (
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{item.percentage}% of total</span>
                                            <span className="text-gray-400">-</span>
                                        </div>
                                    )}
                                    {idx < leasePayments.length - 1 && <div className="border-t border-gray-100 my-2" />}
                                </div>
                            ))}
                            <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Annual Lease Cost</span>
                                    <span className="font-bold text-orange-600">
                                        {formatCurrency(leasePayments.reduce((sum, item) => sum + item.amount, 0))}
                                    </span>
                                </div>
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
                        placeholder="Search IFRS 16 reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated By</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Building className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No IFRS 16 reports found</p>
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
                                                onClick={() => handleView(report.id)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(report.id)}
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-purple-600" />
                            IFRS 16 Report Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed view of IFRS 16 - Leases report
                        </DialogDescription>
                    </DialogHeader>
                    {selectedReport && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedReport.name}</h3>
                                    <p className="text-sm text-gray-500">{selectedReport.description}</p>
                                </div>
                                <Badge className={getStatusColor(selectedReport.status)}>
                                    {selectedReport.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-semibold">{selectedReport.period}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Format</p>
                                    <p className="font-semibold">{selectedReport.format}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Generated By</p>
                                    <p className="font-semibold">{selectedReport.generatedBy}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">File Size</p>
                                    <p className="font-semibold">{selectedReport.fileSize}</p>
                                </div>
                            </div>

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
                                                            : metric.value.toLocaleString()}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-sm ${getMetricStatusColor(metric.status)}`}>
                                                            {metric.change >= 0 ? '+' : ''}{metric.change.toLocaleString()}
                                                        </span>
                                                        <span className={`text-xs ${getMetricStatusColor(metric.status)}`}>
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

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">{selectedReport.summary}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsViewModalOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => handleDownload(selectedReport.id)}
                                    disabled={isDownloading}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Report
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Generate Report Modal */}
            <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            Generate IFRS 16 Report
                        </DialogTitle>
                        <DialogDescription>
                            Configure and generate a new IFRS 16 - Leases report
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
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
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={handleGenerate}
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
                            <Download className="h-5 w-5 text-purple-600" />
                            Export IFRS 16 Reports
                        </DialogTitle>
                        <DialogDescription>
                            Export IFRS 16 reports in your preferred format.
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
                                <p>Positive Metrics: <strong>{stats.positiveMetrics}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
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

export default IFRS16;