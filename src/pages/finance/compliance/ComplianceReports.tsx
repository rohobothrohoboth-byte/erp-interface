// src/pages/finance/compliance/ComplianceReports.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FileCheck, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, FileText,
    Shield, AlertCircle, CheckCircle, Clock, X, Calendar,
    TrendingUp, TrendingDown, BarChart3, PieChart, Activity,
    Award, Target, Zap, BookOpen, Users, Building2
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
    getComplianceReports,
    generateComplianceReport,
    downloadComplianceReport,
} from '../../../services/finance/finance.api';

interface ComplianceReport {
    id: string;
    code: string;
    name: string;
    type: 'Internal' | 'External' | 'Audit' | 'Regulatory' | 'Management';
    category: 'Financial' | 'DataPrivacy' | 'Labor' | 'Environmental' | 'Industry' | 'Corporate' | 'Tax';
    period: string;
    format: 'PDF' | 'Excel' | 'HTML';
    status: 'Generated' | 'InProgress' | 'Scheduled' | 'Error';
    generatedDate: string;
    generatedBy: string;
    fileSize: string;
    downloadUrl: string;
    summary: string;
    findings: number;
    passed: number;
    failed: number;
    partiallyPassed: number;
    complianceScore: number;
    regulations: string[];
    departments: string[];
    entities: string[];
}

interface ComplianceReportStats {
    totalReports: number;
    generatedReports: number;
    scheduledReports: number;
    inProgressReports: number;
    errorReports: number;
    totalFindings: number;
    totalPassed: number;
    totalFailed: number;
    avgComplianceScore: number;
}

const ComplianceReports: React.FC = () => {
    const [items, setItems] = useState<ComplianceReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPeriod, setFilterPeriod] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<ComplianceReport | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [periods, setPeriods] = useState<string[]>([]);
    const [generateForm, setGenerateForm] = useState({
        type: 'Regulatory',
        category: 'Financial',
        period: '',
        format: 'PDF',
        departments: [] as string[],
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
    } = useReportExport('compliance-reports');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterType !== 'All') params.type = filterType;
            if (filterCategory !== 'All') params.category = filterCategory;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterPeriod !== 'All') params.period = filterPeriod;

            const response = await getComplianceReports(params);

            let data: ComplianceReport[] = [];
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

            // Extract unique periods for filter
            const uniquePeriods = [...new Set(data.map(c => c.period).filter(Boolean))];
            setPeriods(uniquePeriods as string[]);
        } catch (error) {
            console.error('Error fetching compliance reports:', error);
            showToast.error('Failed to load compliance reports');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterType, filterCategory, filterStatus, filterPeriod]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): ComplianceReportStats => {
        const filtered = items;
        const generated = filtered.filter(c => c.status === 'Generated').length;
        const scheduled = filtered.filter(c => c.status === 'Scheduled').length;
        const inProgress = filtered.filter(c => c.status === 'InProgress').length;
        const error = filtered.filter(c => c.status === 'Error').length;
        const totalFindings = filtered.reduce((sum, c) => sum + (c.findings || 0), 0);
        const totalPassed = filtered.reduce((sum, c) => sum + (c.passed || 0), 0);
        const totalFailed = filtered.reduce((sum, c) => sum + (c.failed || 0), 0);
        const avgScore = filtered.length > 0 ? filtered.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / filtered.length : 0;

        return {
            totalReports: filtered.length,
            generatedReports: generated,
            scheduledReports: scheduled,
            inProgressReports: inProgress,
            errorReports: error,
            totalFindings,
            totalPassed,
            totalFailed,
            avgComplianceScore: avgScore,
        };
    };

    const stats = getStats();

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
            Internal: 'bg-blue-100 text-blue-700 border-blue-200',
            External: 'bg-purple-100 text-purple-700 border-purple-200',
            Audit: 'bg-red-100 text-red-700 border-red-200',
            Regulatory: 'bg-orange-100 text-orange-700 border-orange-200',
            Management: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Financial: 'bg-blue-100 text-blue-700 border-blue-200',
            DataPrivacy: 'bg-purple-100 text-purple-700 border-purple-200',
            Labor: 'bg-orange-100 text-orange-700 border-orange-200',
            Environmental: 'bg-green-100 text-green-700 border-green-200',
            Industry: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            Corporate: 'bg-gray-100 text-gray-700 border-gray-200',
            Tax: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesPeriod = filterPeriod === 'All' || item.period === filterPeriod;
        return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesPeriod;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleGenerate = async () => {
        try {
            setGenerating(true);

            const requestData: any = {
                type: generateForm.type,
                category: generateForm.category,
                period: generateForm.period,
                format: generateForm.format,
            };

            // Only send departments if there are any
            if (generateForm.departments && generateForm.departments.length > 0) {
                requestData.departments = generateForm.departments;
            }

            console.log('Generating compliance report with data:', requestData);

            const response = await generateComplianceReport(requestData);

            showToast.success('Compliance report generated successfully');
            await fetchData();
            setIsGenerateModalOpen(false);
            setGenerateForm({
                type: 'Regulatory',
                category: 'Financial',
                period: '',
                format: 'PDF',
                departments: [],
            });
        } catch (error: any) {
            console.error('Error generating compliance report:', error);

            let errorMsg = 'Failed to generate compliance report';
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = error.message;
            }
            showToast.error(errorMsg);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (reportId: string) => {
        try {
            setDownloading(true);
            await downloadComplianceReport(reportId);
            showToast.success('Report downloaded successfully');
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
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <FileCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compliance Reports</h1>
                        <p className="text-sm text-gray-500">Generate and manage compliance reports</p>
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
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setIsGenerateModalOpen(true)}
                    >
                        <Plus size={16} /> Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Total Reports</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats.totalReports}</p>
                                <p className="text-xs text-emerald-600 mt-1">{stats.generatedReports} generated</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <FileCheck className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Avg Compliance Score</p>
                                <p className={`text-2xl font-bold ${getScoreColor(stats.avgComplianceScore)}`}>
                                    {stats.avgComplianceScore.toFixed(1)}%
                                </p>
                                <p className="text-xs text-blue-600 mt-1">Overall rating</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Award className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Passed Findings</p>
                                <p className="text-2xl font-bold text-green-900">{stats.totalPassed}</p>
                                <p className="text-xs text-green-600 mt-1">Of {stats.totalFindings} total</p>
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
                                <p className="text-sm text-red-700 font-medium">Failed Findings</p>
                                <p className="text-2xl font-bold text-red-900">{stats.totalFailed}</p>
                                <p className="text-xs text-red-600 mt-1">Requires action</p>
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
                                <p className="text-sm text-yellow-700 font-medium">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.inProgressReports}</p>
                                <p className="text-xs text-yellow-600 mt-1">Reports running</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <Clock className="h-6 w-6 text-yellow-700" />
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
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Internal">Internal</SelectItem>
                        <SelectItem value="External">External</SelectItem>
                        <SelectItem value="Audit">Audit</SelectItem>
                        <SelectItem value="Regulatory">Regulatory</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="DataPrivacy">Data Privacy</SelectItem>
                        <SelectItem value="Labor">Labor</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                        <SelectItem value="Industry">Industry</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Tax">Tax</SelectItem>
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
                        setFilterCategory('All');
                        setFilterStatus('All');
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Findings</th>
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
                                    <td className="px-4 py-3">
                                        <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                            <span className={`text-lg font-bold ${getScoreColor(item.complianceScore)}`}>
                                                {item.complianceScore}%
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-green-600 text-sm font-medium">{item.passed}</span>
                                            <span className="text-yellow-600 text-sm font-medium">{item.partiallyPassed}</span>
                                            <span className="text-red-600 text-sm font-medium">{item.failed}</span>
                                        </div>
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
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileCheck className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No compliance reports found</p>
                                        <p className="text-sm text-gray-400">Generate your first compliance report</p>
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
                            <FileCheck className="h-5 w-5 text-emerald-600" />
                            Report Details
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
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedItem.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <Badge className={getCategoryColor(selectedItem.category)}>{selectedItem.category}</Badge>
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
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Compliance Summary</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Compliance Score</p>
                                            <p className={`text-2xl font-bold ${getScoreColor(selectedItem.complianceScore)}`}>
                                                {selectedItem.complianceScore}%
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Total Findings</p>
                                            <p className="text-2xl font-bold text-gray-900">{selectedItem.findings}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Passed</p>
                                            <p className="text-2xl font-bold text-green-600">{selectedItem.passed}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                                <p className="text-sm text-gray-600">{selectedItem.summary}</p>
                            </div>

                            {selectedItem.regulations && selectedItem.regulations.length > 0 && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Regulations</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.regulations.map((reg, idx) => (
                                            <Badge key={idx} variant="outline">{reg}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedItem.departments && selectedItem.departments.length > 0 && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Departments</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.departments.map((dept, idx) => (
                                            <Badge key={idx} variant="outline">{dept}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                            <FileCheck className="h-5 w-5 text-emerald-600" />
                            Generate Compliance Report
                        </DialogTitle>
                        <DialogDescription>
                            Configure and generate a new compliance report
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
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Internal">Internal</SelectItem>
                                    <SelectItem value="External">External</SelectItem>
                                    <SelectItem value="Audit">Audit</SelectItem>
                                    <SelectItem value="Regulatory">Regulatory</SelectItem>
                                    <SelectItem value="Management">Management</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Category</Label>
                            <Select
                                value={generateForm.category}
                                onValueChange={(value) => setGenerateForm({ ...generateForm, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Financial">Financial</SelectItem>
                                    <SelectItem value="DataPrivacy">Data Privacy</SelectItem>
                                    <SelectItem value="Labor">Labor</SelectItem>
                                    <SelectItem value="Environmental">Environmental</SelectItem>
                                    <SelectItem value="Industry">Industry</SelectItem>
                                    <SelectItem value="Corporate">Corporate</SelectItem>
                                    <SelectItem value="Tax">Tax</SelectItem>
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
                            <p className="text-xs text-gray-400 mt-1">Required</p>
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                            <Download className="h-5 w-5 text-emerald-600" />
                            Export Compliance Reports
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
                                <p>Generated: <strong>{stats.generatedReports}</strong></p>
                                <p>Avg Score: <strong>{stats.avgComplianceScore.toFixed(1)}%</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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

export default ComplianceReports;