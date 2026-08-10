// src/pages/procurement/reports/ProcurementReports.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Download,
    Filter,
    Calendar,
    BarChart3,
    PieChart,
    TrendingUp,
    DollarSign,
    Package,
    Building2,
    Users,
    Eye,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
    ChevronDown,
    ChevronUp,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { getReportsDashboard } from '@/modules/procurement/services/reports.api';
import type {  Report, ReportStats } from '@/modules/procurement/services/reports.api';
// ============================================================
// CONSTANTS
// ============================================================

const categoryColors: Record<string, string> = {
    spend: 'bg-blue-100 text-blue-800 border-blue-200',
    vendor: 'bg-purple-100 text-purple-800 border-purple-200',
    performance: 'bg-green-100 text-green-800 border-green-200',
    inventory: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    compliance: 'bg-red-100 text-red-800 border-red-200',
};

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

// ============================================================
// MAIN COMPONENT
// ============================================================

const ProcurementReports = () => {
    const navigate = useNavigate();

    // State
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Fetch reports
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getReportsDashboard({
                recentReportsCount: 10
            });
            setReports(data.reports || []);
            setStats(data.stats);
            console.log('✅ Reports loaded:', data.reports.length);
        } catch (error: any) {
            console.error('Error fetching reports:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load reports');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    // Filter reports
    const filteredReports = reports.filter(report => {
        const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'spend': return <DollarSign className="w-4 h-4" />;
            case 'vendor': return <Building2 className="w-4 h-4" />;
            case 'performance': return <TrendingUp className="w-4 h-4" />;
            case 'inventory': return <Package className="w-4 h-4" />;
            case 'compliance': return <AlertCircle className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    if (loading && !reports.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Procurement Reports</h1>
                    <p className="text-sm text-gray-500">
                        {reports.length} reports • Access and manage procurement reports
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/reports/generate')}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalReports || 0}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Ready</p>
                        <p className="text-2xl font-bold text-green-700">
                            {stats?.readyReports || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Total Downloads</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {stats?.totalDownloads || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-600">Categories</p>
                        <p className="text-2xl font-bold text-purple-700">
                            {stats?.categoriesCount || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search reports by name, description, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
                >
                    <option value="all">All Categories</option>
                    <option value="spend">Spend</option>
                    <option value="vendor">Vendor</option>
                    <option value="performance">Performance</option>
                    <option value="inventory">Inventory</option>
                    <option value="compliance">Compliance</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
                >
                    <option value="all">All Status</option>
                    <option value="ready">Ready</option>
                    <option value="generating">Generating</option>
                    <option value="scheduled">Scheduled</option>
                </select>
            </div>

            {/* Report Cards */}
            {filteredReports.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reports found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Generate your first report'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/reports/generate')}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredReports.map((report) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="cursor-pointer"
                            onClick={() => navigate(`/procurement/reports/${report.id}`)}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                {getCategoryIcon(report.category)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{report.name}</h3>
                                                <p className="text-sm text-gray-500">{report.period}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={categoryColors[report.category]}>
                                                {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                                            </Badge>
                                            <Badge className={statusColors[report.status]}>
                                                {statusIcons[report.status]}
                                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>

                                    {report.tags && report.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {report.tags.slice(0, 3).map((tag, index) => (
                                                <Badge key={index} variant="outline" className="bg-gray-50 text-xs">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                            {report.tags.length > 3 && (
                                                <span className="text-xs text-gray-400">+{report.tags.length - 3} more</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-gray-100">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Format</p>
                                            <Badge className={formatColors[report.format]}>
                                                {report.format.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Size</p>
                                            <p className="text-sm font-semibold text-gray-900">{report.size || 'N/A'}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Downloads</p>
                                            <p className="text-sm font-semibold text-gray-900">{report.downloads || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Generated</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatDate(report.generatedDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/procurement/reports/${report.id}`);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        {report.status === 'ready' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-emerald-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle download
                                                    showToast.info('Download functionality coming soon');
                                                }}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        )}
                                        {report.status === 'scheduled' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-blue-600"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/procurement/reports/${report.id}/schedule`);
                                                }}
                                            >
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Schedule
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ProcurementReports;