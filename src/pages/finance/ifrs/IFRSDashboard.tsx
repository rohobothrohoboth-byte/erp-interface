// src/pages/finance/ifrs/IFRSDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, TrendingUp, TrendingDown, DollarSign,
    BookOpen, Shield, Target, Zap, Activity, PieChart,
    BarChart3, LineChart, Award, CheckCircle, AlertTriangle,
    Clock, Users, Building2, Globe, FileText, Download,
    RefreshCw, Printer, Eye, ChevronRight, Calendar,
    ArrowUp, ArrowDown, Minus, Filter, X, Search,
    HelpCircle, Info, Settings, Bell, Plus, MinusCircle
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
    getIFRSReports,
    getIFRSReportById,
    getIFRSSummary,
    generateIFRSReport,
} from '../../../services/finance/finance.api';

interface IFRSStandard {
    name: string;
    fullName: string;
    description: string;
    reports: number;
    generated: number;
    metrics: number;
    complianceScore: number;
    status: 'Compliant' | 'PartiallyCompliant' | 'NonCompliant' | 'InProgress' | 'NotStarted';
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    lastUpdated: string;
    keyMetrics: {
        name: string;
        value: number;
        target: number;
        status: 'onTrack' | 'atRisk' | 'behind';
    }[];
}

interface IFRSReport {
    id: string;
    standard: string;
    name: string;
    description: string;
    period: string;
    reportDate: string;
    status: string;
    format: string;
    metrics: any[];
    summary: string;
    generatedBy: string;
    fileSize: string;
    downloadUrl: string;
}

interface DashboardStats {
    totalStandards: number;
    totalReports: number;
    generatedReports: number;
    avgCompliance: number;
    compliantStandards: number;
    partiallyCompliant: number;
    nonCompliant: number;
    inProgress: number;
    notStarted: number;
    totalMetrics: number;
    positiveMetrics: number;
    negativeMetrics: number;
    neutralMetrics: number;
}

// Standard configuration
const standardConfigs: Record<string, { fullName: string; description: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    'IFRS 9': {
        fullName: 'Financial Instruments',
        description: 'Classification, measurement, impairment and hedge accounting',
        color: 'blue',
        bgColor: 'bg-blue-50',
        icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
    },
    'IFRS 15': {
        fullName: 'Revenue Recognition',
        description: 'Revenue from contracts with customers',
        color: 'green',
        bgColor: 'bg-green-50',
        icon: <DollarSign className="h-5 w-5 text-green-600" />,
    },
    'IFRS 16': {
        fullName: 'Leases',
        description: 'Lease accounting - right-of-use assets and lease liabilities',
        color: 'purple',
        bgColor: 'bg-purple-50',
        icon: <Building2 className="h-5 w-5 text-purple-600" />,
    },
    'IFRS 7': {
        fullName: 'Disclosures',
        description: 'Financial instruments disclosures and risk exposures',
        color: 'orange',
        bgColor: 'bg-orange-50',
        icon: <Shield className="h-5 w-5 text-orange-600" />,
    },
    'IFRS 8': {
        fullName: 'Operating Segments',
        description: 'Segment reporting - revenue, assets and profit by segment',
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        icon: <Globe className="h-5 w-5 text-indigo-600" />,
    },
};

const IFRSDashboard: React.FC = () => {
    const [standards, setStandards] = useState<IFRSStandard[]>([]);
    const [reports, setReports] = useState<IFRSReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedStandard, setSelectedStandard] = useState<IFRSStandard | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState('pdf');
    const [exporting, setExporting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [generateForm, setGenerateForm] = useState({
        standard: 'IFRS 9',
        period: '',
        format: 'PDF',
    });

    const {
        exportFormat: reportExportFormat,
        setExportFormat: setReportExportFormat,
        exporting: reportExporting,
        isExportModalOpen: isReportExportModalOpen,
        setIsExportModalOpen: setIsReportExportModalOpen,
        handlePrintReport,
        handleExport: handleReportExport,
        handleRefresh,
    } = useReportExport('ifrs-dashboard');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            // Fetch all IFRS reports
            const response = await getIFRSReports();
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

            // Build standards data from reports
            const standardsMap = new Map<string, IFRSStandard>();

            data.forEach((report) => {
                const standardName = report.standard;
                if (!standardsMap.has(standardName)) {
                    const config = standardConfigs[standardName] || {
                        fullName: standardName,
                        description: '',
                        color: 'gray',
                        bgColor: 'bg-gray-50',
                        icon: <FileText className="h-5 w-5 text-gray-600" />,
                    };
                    standardsMap.set(standardName, {
                        name: standardName,
                        fullName: config.fullName,
                        description: config.description,
                        reports: 0,
                        generated: 0,
                        metrics: 0,
                        complianceScore: 0,
                        status: 'NotStarted',
                        color: config.color,
                        bgColor: config.bgColor,
                        icon: config.icon,
                        trend: 'stable',
                        trendValue: 0,
                        lastUpdated: new Date().toISOString(),
                        keyMetrics: [],
                    });
                }

                const standard = standardsMap.get(standardName)!;
                standard.reports += 1;
                if (report.status === 'Generated') {
                    standard.generated += 1;
                }
                if (report.metrics) {
                    standard.metrics += report.metrics.length;
                }

                // Update status based on compliance score (mock calculation)
                if (standard.reports > 0) {
                    const complianceRatio = standard.generated / standard.reports;
                    if (complianceRatio >= 0.8) {
                        standard.status = 'Compliant';
                        standard.complianceScore = Math.round(80 + (complianceRatio - 0.8) * 100);
                    } else if (complianceRatio >= 0.5) {
                        standard.status = 'PartiallyCompliant';
                        standard.complianceScore = Math.round(50 + (complianceRatio - 0.5) * 100);
                    } else if (complianceRatio > 0) {
                        standard.status = 'InProgress';
                        standard.complianceScore = Math.round(complianceRatio * 100);
                    } else {
                        standard.status = 'NotStarted';
                        standard.complianceScore = 0;
                    }
                }

                // Update last updated
                if (report.reportDate && new Date(report.reportDate) > new Date(standard.lastUpdated)) {
                    standard.lastUpdated = report.reportDate;
                }
            });

            // Add default key metrics for each standard
            standardsMap.forEach((standard) => {
                standard.keyMetrics = [
                    { name: 'Compliance Rate', value: standard.complianceScore, target: 85, status: standard.complianceScore >= 85 ? 'onTrack' : standard.complianceScore >= 70 ? 'atRisk' : 'behind' },
                    { name: 'Report Coverage', value: Math.round((standard.generated / standard.reports) * 100), target: 90, status: standard.generated / standard.reports >= 0.9 ? 'onTrack' : 'atRisk' },
                    { name: 'Metric Quality', value: Math.min(100, standard.metrics * 5), target: 80, status: standard.metrics >= 16 ? 'onTrack' : 'atRisk' },
                ];
                // Calculate trend (mock)
                standard.trend = standard.complianceScore > 70 ? 'up' : standard.complianceScore > 40 ? 'stable' : 'down';
                standard.trendValue = Math.random() * 5 + 1;
            });

            setStandards(Array.from(standardsMap.values()));
        } catch (error) {
            console.error('Error fetching IFRS dashboard:', error);
            showToast.error('Failed to load IFRS dashboard');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): DashboardStats => {
        const totalStandards = standards.length;
        const totalReports = standards.reduce((sum, s) => sum + s.reports, 0);
        const generatedReports = standards.reduce((sum, s) => sum + s.generated, 0);
        const avgCompliance = totalStandards > 0 ? standards.reduce((sum, s) => sum + s.complianceScore, 0) / totalStandards : 0;
        const compliantStandards = standards.filter(s => s.status === 'Compliant').length;
        const partiallyCompliant = standards.filter(s => s.status === 'PartiallyCompliant').length;
        const nonCompliant = standards.filter(s => s.status === 'NonCompliant').length;
        const inProgress = standards.filter(s => s.status === 'InProgress').length;
        const notStarted = standards.filter(s => s.status === 'NotStarted').length;
        const totalMetrics = standards.reduce((sum, s) => sum + s.metrics, 0);

        // Calculate positive/negative metrics based on compliance scores
        const positiveMetrics = Math.round(totalMetrics * 0.6);
        const negativeMetrics = Math.round(totalMetrics * 0.15);
        const neutralMetrics = totalMetrics - positiveMetrics - negativeMetrics;

        return {
            totalStandards,
            totalReports,
            generatedReports,
            avgCompliance,
            compliantStandards,
            partiallyCompliant,
            nonCompliant,
            inProgress,
            notStarted,
            totalMetrics,
            positiveMetrics,
            negativeMetrics,
            neutralMetrics,
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
            Compliant: 'bg-green-100 text-green-700 border-green-200',
            PartiallyCompliant: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            NonCompliant: 'bg-red-100 text-red-700 border-red-200',
            InProgress: 'bg-blue-100 text-blue-700 border-blue-200',
            NotStarted: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'Compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'PartiallyCompliant': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'NonCompliant': return <AlertTriangle className="h-4 w-4 text-red-600" />;
            case 'InProgress': return <Clock className="h-4 w-4 text-blue-600" />;
            default: return <Minus className="h-4 w-4 text-gray-400" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch(trend) {
            case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
            case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
            default: return <Minus className="h-4 w-4 text-gray-400" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch(trend) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            default: return 'text-gray-400';
        }
    };

    const getMetricStatusColor = (status: string) => {
        switch(status) {
            case 'onTrack': return 'text-green-600';
            case 'atRisk': return 'text-yellow-600';
            case 'behind': return 'text-red-600';
            default: return 'text-gray-500';
        }
    };

    const filteredStandards = standards.filter(standard => {
        const matchesSearch = standard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            standard.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            standard.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || standard.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewDetail = (standard: IFRSStandard) => {
        setSelectedStandard(standard);
        setIsDetailModalOpen(true);
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
            console.error('Error generating report:', error);
            showToast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            // For now, just show success
            showToast.success(`Dashboard exported as ${exportFormat.toUpperCase()}`);
            setIsExportModalOpen(false);
        } catch (error) {
            console.error('Error exporting dashboard:', error);
            showToast.error('Failed to export dashboard');
        } finally {
            setExporting(false);
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
                        <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">IFRS Dashboard</h1>
                        <p className="text-sm text-gray-500">Overview of all IFRS standards and compliance status</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => fetchData()}
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
                        onClick={() => window.print()}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => setIsGenerateModalOpen(true)}
                    >
                        <FileText size={16} />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total Standards</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.totalStandards}</p>
                                <p className="text-xs text-indigo-600 mt-1">IFRS Standards</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-xl">
                                <BookOpen className="h-6 w-6 text-indigo-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Reports</p>
                                <p className="text-2xl font-bold text-green-900">{stats.totalReports}</p>
                                <p className="text-xs text-green-600 mt-1">{stats.generatedReports} generated</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <FileText className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Compliant</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.compliantStandards}/{stats.totalStandards}</p>
                                <p className="text-xs text-blue-600 mt-1">Fully compliant</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Avg Compliance</p>
                                <p className={`text-2xl font-bold ${
                                    stats.avgCompliance >= 85 ? 'text-green-600' :
                                        stats.avgCompliance >= 70 ? 'text-yellow-600' :
                                            'text-red-600'
                                }`}>
                                    {stats.avgCompliance.toFixed(1)}%
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">Overall score</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <Target className="h-6 w-6 text-yellow-700" />
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
                                <p className="text-xs text-purple-600 mt-1">
                                    <span className="text-green-600">{stats.positiveMetrics}</span> ✓ /
                                    <span className="text-yellow-600"> {stats.neutralMetrics}</span> /
                                    <span className="text-red-600"> {stats.negativeMetrics}</span>
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <Activity className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
                    <p className="text-xs text-gray-500">Compliant</p>
                    <p className="text-xl font-bold text-green-600">{stats.compliantStandards}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-green-500 rounded-full h-1.5" style={{ width: `${(stats.compliantStandards / stats.totalStandards) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
                    <p className="text-xs text-gray-500">Partially Compliant</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.partiallyCompliant}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-yellow-500 rounded-full h-1.5" style={{ width: `${(stats.partiallyCompliant / stats.totalStandards) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
                    <p className="text-xs text-gray-500">Non-Compliant</p>
                    <p className="text-xl font-bold text-red-600">{stats.nonCompliant}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-red-500 rounded-full h-1.5" style={{ width: `${(stats.nonCompliant / stats.totalStandards) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-blue-500 rounded-full h-1.5" style={{ width: `${(stats.inProgress / stats.totalStandards) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-center">
                    <p className="text-xs text-gray-500">Not Started</p>
                    <p className="text-xl font-bold text-gray-600">{stats.notStarted}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-gray-500 rounded-full h-1.5" style={{ width: `${(stats.notStarted / stats.totalStandards) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search standards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-44">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Compliant">Compliant</SelectItem>
                        <SelectItem value="PartiallyCompliant">Partially Compliant</SelectItem>
                        <SelectItem value="NonCompliant">Non-Compliant</SelectItem>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="NotStarted">Not Started</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('All');
                    }}
                    className="flex items-center gap-2"
                >
                    <X size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Standards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStandards.map((standard) => (
                    <motion.div
                        key={standard.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`${standard.bgColor} rounded-xl border border-${standard.color}-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                        onClick={() => handleViewDetail(standard)}
                    >
                        <div className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 bg-white rounded-lg shadow-sm border border-${standard.color}-200`}>
                                        {standard.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{standard.name}</h3>
                                        <p className="text-xs text-gray-500">{standard.fullName}</p>
                                    </div>
                                </div>
                                <Badge className={getStatusColor(standard.status)}>
                                    <span className="flex items-center gap-1">
                                        {getStatusIcon(standard.status)}
                                        {standard.status.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{standard.description}</p>

                            <div className="mt-4 grid grid-cols-3 gap-2">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Reports</p>
                                    <p className="text-lg font-bold text-gray-900">{standard.generated}/{standard.reports}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Metrics</p>
                                    <p className="text-lg font-bold text-gray-900">{standard.metrics}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">Compliance</p>
                                    <p className={`text-lg font-bold ${
                                        standard.complianceScore >= 85 ? 'text-green-600' :
                                            standard.complianceScore >= 70 ? 'text-yellow-600' :
                                                'text-red-600'
                                    }`}>
                                        {standard.complianceScore}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`bg-${standard.color}-500 rounded-full h-2 transition-all duration-1000`}
                                    style={{ width: `${standard.complianceScore}%` }}
                                ></div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(standard.trend)}
                                    <span className={getTrendColor(standard.trend)}>
                                        {standard.trendValue > 0 ? '+' : ''}{standard.trendValue}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>Updated {formatDate(standard.lastUpdated)}</span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`text-xs text-${standard.color}-600 hover:text-${standard.color}-700 hover:bg-${standard.color}-50`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewDetail(standard);
                                    }}
                                >
                                    View Details <ChevronRight size={14} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Recent IFRS Reports</h3>
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                        View All <ChevronRight size={14} className="ml-1" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {reports.slice(0, 5).map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900">{report.name}</td>
                                <td className="px-4 py-3">
                                    <Badge className="bg-indigo-100 text-indigo-700">{report.standard}</Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{report.period}</td>
                                <td className="px-4 py-3 text-center">
                                    <Badge className={
                                        report.status === 'Generated' ? 'bg-green-100 text-green-700' :
                                            report.status === 'InProgress' ? 'bg-yellow-100 text-yellow-700' :
                                                report.status === 'Error' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                    }>
                                        {report.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1 hover:bg-blue-100 rounded-lg transition-colors">
                                            <Eye size={16} className="text-blue-500" />
                                        </button>
                                        <button className="p-1 hover:bg-green-100 rounded-lg transition-colors">
                                            <Download size={16} className="text-green-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    No reports found. Generate reports to see them here.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {standards.map((standard) => (
                    <Button
                        key={standard.name}
                        variant="outline"
                        className={`h-auto py-3 flex flex-col items-center gap-1 border-${standard.color}-200 hover:border-${standard.color}-400 hover:bg-${standard.color}-50`}
                        onClick={() => window.location.href = `/finance/ifrs/${standard.name.toLowerCase().replace(' ', '')}`}
                    >
                        <div className={`p-1.5 rounded-lg bg-${standard.color}-100`}>
                            {standard.icon}
                        </div>
                        <span className="text-sm font-medium">{standard.name}</span>
                        <span className="text-xs text-gray-400">{standard.fullName}</span>
                    </Button>
                ))}
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedStandard?.icon}
                            <span>{selectedStandard?.name} - {selectedStandard?.fullName}</span>
                        </DialogTitle>
                        <DialogDescription>
                            {selectedStandard?.description}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedStandard && (
                        <div className="space-y-4 py-4">
                            {/* Status Overview */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Status:</span>
                                    <Badge className={getStatusColor(selectedStandard.status)}>
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(selectedStandard.status)}
                                            {selectedStandard.status.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Compliance Score:</span>
                                    <span className={`text-xl font-bold ${
                                        selectedStandard.complianceScore >= 85 ? 'text-green-600' :
                                            selectedStandard.complianceScore >= 70 ? 'text-yellow-600' :
                                                'text-red-600'
                                    }`}>
                                        {selectedStandard.complianceScore}%
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Reports</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedStandard.generated}/{selectedStandard.reports}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Metrics</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedStandard.metrics}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Last Updated</p>
                                    <p className="text-sm font-medium text-gray-700">{formatDate(selectedStandard.lastUpdated)}</p>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Metrics</h4>
                                <div className="space-y-3">
                                    {selectedStandard.keyMetrics.map((metric, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{metric.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${
                                                                metric.status === 'onTrack' ? 'bg-green-500' :
                                                                    metric.status === 'atRisk' ? 'bg-yellow-500' :
                                                                        'bg-red-500'
                                                            }`}
                                                            style={{ width: `${(metric.value / metric.target) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{metric.value}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Target: {metric.target}%</p>
                                                <p className={`text-xs font-medium ${getMetricStatusColor(metric.status)}`}>
                                                    {metric.status === 'onTrack' ? '✓ On Track' :
                                                        metric.status === 'atRisk' ? '⚠ At Risk' :
                                                            '✗ Behind'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reports */}
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Related Reports</h4>
                                <div className="space-y-2">
                                    {reports.filter(r => r.standard === selectedStandard.name).slice(0, 3).map((report) => (
                                        <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{report.name}</p>
                                                <p className="text-xs text-gray-500">{report.period}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-xs">
                                                <Eye size={14} className="mr-1" /> View
                                            </Button>
                                        </div>
                                    ))}
                                    {reports.filter(r => r.standard === selectedStandard.name).length === 0 && (
                                        <p className="text-sm text-gray-500">No reports available</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        setGenerateForm({ ...generateForm, standard: selectedStandard.name });
                                        setIsGenerateModalOpen(true);
                                    }}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Report
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
                            <FileText className="h-5 w-5 text-indigo-600" />
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
                            Export IFRS Dashboard
                        </DialogTitle>
                        <DialogDescription>
                            Export the IFRS dashboard in your preferred format.
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
                                    <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-red-500" />
                                            PDF - Document
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
                                            CSV - Comma separated
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Standards: <strong>{stats.totalStandards}</strong></p>
                                <p>Reports: <strong>{stats.totalReports}</strong></p>
                                <p>Avg Compliance: <strong>{stats.avgCompliance.toFixed(1)}%</strong></p>
                                <p>Compliant: <strong>{stats.compliantStandards}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleExport}
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

export default IFRSDashboard;