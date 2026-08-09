import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Eye,
    Share2,
    Printer,
    Loader2,
    BarChart3,
    PieChart,
    TrendingUp,
    DollarSign,
    Building2,
    Package,
    Users,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    X
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import {
    getReportById,
    downloadReport

} from '../../../services/procurement/reports.api';

import type{

    Report
} from '../../../services/procurement/reports.api';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    ready: 'bg-green-100 text-green-800 border-green-200',
    generating: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    ready: <CheckCircle className="w-4 h-4" />,
    generating: <Clock className="w-4 h-4" />,
    scheduled: <Calendar className="w-4 h-4" />,
};

const formatColors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-800 border-red-200',
    excel: 'bg-green-100 text-green-800 border-green-200',
    csv: 'bg-blue-100 text-blue-800 border-blue-200',
};

const categoryColors: Record<string, string> = {
    spend: 'bg-blue-100 text-blue-800 border-blue-200',
    vendor: 'bg-purple-100 text-purple-800 border-purple-200',
    performance: 'bg-green-100 text-green-800 border-green-200',
    inventory: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    compliance: 'bg-red-100 text-red-800 border-red-200',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ReportDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        overview: true,
        details: true,
        charts: true
    });

    // ✅ Fetch report by ID using real API
    const fetchReport = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await getReportById(id);
            setReport(data);
            console.log('✅ Report loaded:', data);
        } catch (error: any) {
            console.error('Error fetching report:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load report');
            navigate('/procurement/reports');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // ✅ Real download handler
    const handleDownload = async () => {
        if (!report) return;
        setDownloading(true);
        try {
            const blob = await downloadReport(report.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${report.name.replace(/\s+/g, '_')}.${report.format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast.success(`Downloaded "${report.name}"`);
        } catch (error: any) {
            console.error('Error downloading report:', error);
            showToast.error(error?.response?.data?.message || 'Failed to download report');
        } finally {
            setDownloading(false);
        }
    };

    // ✅ Share handler
    const handleShare = async () => {
        if (!report) return;
        setSharing(true);
        try {
            // Generate shareable link
            const shareUrl = `${window.location.origin}/procurement/reports/${report.id}`;
            await navigator.clipboard.writeText(shareUrl);
            showToast.success(`Share link copied to clipboard!`);
        } catch (error) {
            showToast.error('Failed to generate share link');
        } finally {
            setSharing(false);
        }
    };

    // ✅ Print handler
    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // ✅ Render report data dynamically
    const renderReportData = () => {
        if (!report?.data) return null;

        const data = report.data as any;

        if (report.category === 'spend') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Total Spend</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${data.totalSpend?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Total Invoices</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.totalInvoices || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Average Invoice</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${data.averageInvoice?.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>
                    {data.categories && data.categories.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
                            <div className="space-y-2">
                                {data.categories.map((cat: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600 w-32">{cat.category}</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full"
                                                style={{ width: `${cat.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 w-20 text-right">
                                            ${cat.amount.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-500 w-12 text-right">
                                            {cat.percentage}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (report.category === 'vendor') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Total Vendors</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.totalVendors || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Average Score</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.averageScore || 0}%
                            </p>
                        </div>
                    </div>
                    {data.vendors && data.vendors.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">Vendor Performance</h4>
                            <div className="space-y-2">
                                {data.vendors.map((v: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900">{v.vendor}</span>
                                                <span className={`text-sm font-medium ${
                                                    v.score >= 80 ? 'text-green-600' :
                                                        v.score >= 60 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                }`}>
                                                    {v.score}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Code: {v.code}</span>
                                                <span>•</span>
                                                <span>Spent: ${v.totalSpent?.toLocaleString() || '0'}</span>
                                                <span>•</span>
                                                <Badge className={
                                                    v.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                                                        v.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                                                            v.status === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                }>
                                                    {v.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (report.category === 'performance') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Requisitions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.totalRequisitions || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Purchase Orders</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.totalPurchaseOrders || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">GRNs</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.totalGRNs || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Avg Approval Time</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.averageRequisitionApprovalTime || 0} days
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No data available for this report type</p>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Report not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/procurement/reports')}
                >
                    Back to Reports
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 print:space-y-2"
        >
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 print:flex-col print:gap-2">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/procurement/reports')}
                        className="flex items-center gap-2 print:hidden"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {report.name}
                            <Badge className={statusColors[report.status]}>
                                {statusIcons[report.status]}
                                <span className="ml-1">
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </span>
                            </Badge>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{report.period}</span>
                            <span className="text-gray-300">•</span>
                            <Badge className={categoryColors[report.category]}>
                                {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                            </Badge>
                            <Badge className={formatColors[report.format]}>
                                {report.format.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                    {report.status === 'ready' && (
                        <Button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {downloading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        disabled={sharing}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        {sharing ? 'Sharing...' : 'Share'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Report Info */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-gray-500">Description</p>
                            <p className="text-sm text-gray-700 mt-1">{report.description}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Generated</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatDate(report.generatedDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">File Size</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{report.size}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Downloads</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                                {report.downloads} times
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tags */}
            {report.tags && report.tags.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {report.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="bg-gray-50">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Report Content Preview */}
            <div className="space-y-4">
                {/* Overview Section */}
                <Card>
                    <CardContent className="p-0">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSection('overview')}
                        >
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-emerald-600" />
                                Report Overview
                            </h3>
                            <Button variant="ghost" size="sm">
                                {expandedSections.overview ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        {expandedSections.overview && (
                            <div className="p-4 pt-0 border-t border-gray-100">
                                {renderReportData()}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Details Section */}
                <Card>
                    <CardContent className="p-0">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSection('details')}
                        >
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" />
                                Report Details
                            </h3>
                            <Button variant="ghost" size="sm">
                                {expandedSections.details ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        {expandedSections.details && (
                            <div className="p-4 pt-0 border-t border-gray-100 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Report Type</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Format</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            {report.format.toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last Viewed</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            {report.lastViewed ? formatDate(report.lastViewed) : 'Never'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Charts Section */}
                <Card>
                    <CardContent className="p-0">
                        <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSection('charts')}
                        >
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-emerald-600" />
                                Data Visualization
                            </h3>
                            <Button variant="ghost" size="sm">
                                {expandedSections.charts ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        {expandedSections.charts && (
                            <div className="p-4 pt-0 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <div className="flex justify-center items-center h-32">
                                            <div className="relative w-32 h-32">
                                                <svg className="w-32 h-32" viewBox="0 0 100 100">
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke="#e5e7eb"
                                                        strokeWidth="15"
                                                    />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="none"
                                                        stroke="#10b981"
                                                        strokeWidth="15"
                                                        strokeDasharray="251.2"
                                                        strokeDashoffset="50"
                                                        strokeLinecap="round"
                                                        transform="rotate(-90 50 50)"
                                                    />
                                                    <text x="50" y="45" textAnchor="middle" fontSize="12" fill="#374151">
                                                        80%
                                                    </text>
                                                    <text x="50" y="60" textAnchor="middle" fontSize="8" fill="#6b7280">
                                                        Complete
                                                    </text>
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">Report Generation Status</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                                        <div className="flex justify-center items-center h-32">
                                            <div className="space-y-2 w-full max-w-xs">
                                                <div className="flex justify-between text-xs">
                                                    <span>Data Quality</span>
                                                    <span>95%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }} />
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span>Accuracy</span>
                                                    <span>92%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span>Completeness</span>
                                                    <span>88%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '88%' }} />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">Data Quality Metrics</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 print:hidden">
                {report.status === 'ready' && (
                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {downloading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        {downloading ? 'Downloading...' : 'Download Report'}
                    </Button>
                )}
                <Button
                    variant="outline"
                    onClick={() => navigate('/procurement/reports')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Reports
                </Button>
                {report.status === 'ready' && (
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        disabled={sharing}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        {sharing ? 'Sharing...' : 'Share'}
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default ReportDetail;