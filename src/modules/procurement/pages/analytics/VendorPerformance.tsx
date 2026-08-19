// src/pages/procurement/analytics/VendorPerformance.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Star,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Clock,
    AlertCircle,
    DollarSign,
    Package,
    Truck,
    Download,
    ChevronDown,
    ChevronUp,
    Building2,
    Loader2,
    RefreshCw,
    XCircle
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { getVendorPerformance } from '@/modules/procurement/services/reports.api';
import type {  VendorPerformance as VendorPerformanceType } from '@/modules/procurement/services/reports.api';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    excellent: 'bg-green-100 text-green-800 border-green-200',
    good: 'bg-blue-100 text-blue-800 border-blue-200',
    average: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    poor: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    excellent: <Star className="w-4 h-4 fill-current" />,
    good: <CheckCircle className="w-4 h-4" />,
    average: <AlertCircle className="w-4 h-4" />,
    poor: <XCircle className="w-4 h-4" />,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const VendorPerformance = () => {
    const navigate = useNavigate();

    // State
    const [vendors, setVendors] = useState<VendorPerformanceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

    // Fetch vendor performance
    const fetchVendors = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getVendorPerformance(10);
            setVendors(data);
            console.log('✅ Vendor performance loaded:', data.length);
        } catch (error: any) {
            console.error('Error fetching vendor performance:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load vendor performance');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchVendors();
    };

    // Filter vendors
    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <TrendingUp className="w-4 h-4 text-gray-400" />;
    };

    const renderStars = (score: number) => {
        const stars = Math.round(score / 20);
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
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

    // Calculate stats
    const totalVendors = vendors.length;
    const excellentCount = vendors.filter(v => v.status === 'excellent').length;
    const averageScore = vendors.length > 0
        ? Math.round(vendors.reduce((acc, v) => acc + v.overallScore, 0) / vendors.length)
        : 0;
    const averageDelivery = vendors.length > 0
        ? Math.round(vendors.reduce((acc, v) => acc + v.onTimeDelivery, 0) / vendors.length)
        : 0;

    if (loading && !vendors.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading vendor performance...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Performance</h1>
                    <p className="text-sm text-gray-500">
                        {vendors.length} vendors • Monitor and analyze vendor performance metrics
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
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/vendors/evaluation/create')}
                    >
                        <Star className="w-4 h-4 mr-2" />
                        Run Evaluation
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Vendors</p>
                        <p className="text-2xl font-bold text-gray-900">{totalVendors}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Excellent</p>
                        <p className="text-2xl font-bold text-green-700">{excellentCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Average Score</p>
                        <p className="text-2xl font-bold text-blue-700">{averageScore}%</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">On-Time Delivery</p>
                        <p className="text-2xl font-bold text-yellow-700">{averageDelivery}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by vendor name, code, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
                >
                    <option value="all">All Status</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="average">Average</option>
                    <option value="poor">Poor</option>
                </select>
            </div>

            {/* Vendor Cards */}
            {filteredVendors.length === 0 ? (
                <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No vendors found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'No vendor performance data available'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredVendors.map((vendor) => (
                        <motion.div
                            key={vendor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="cursor-pointer"
                            onClick={() => navigate(`/procurement/analytics/vendor/${vendor.id}`)}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        {/* Left Side */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Building2 className="w-5 h-5 text-emerald-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {vendor.vendorName}
                                                </h3>
                                                <span className="text-sm text-gray-500">{vendor.vendorCode}</span>
                                                <Badge className={`${statusColors[vendor.status]} flex items-center gap-1`}>
                                                    {statusIcons[vendor.status]}
                                                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">
                                                Category: {vendor.category}
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Total Orders</p>
                                                    <p className="font-medium text-gray-900">{vendor.totalOrders}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">On-Time Delivery</p>
                                                    <p className="font-medium text-gray-900">{vendor.onTimeDelivery}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Quality Rate</p>
                                                    <p className="font-medium text-gray-900">{vendor.qualityRate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Response Time</p>
                                                    <p className="font-medium text-gray-900">
                                                        {vendor.averageResponseTime.toFixed(1)}h
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm text-gray-500">Overall Score:</span>
                                                    <span className={`text-lg font-bold ${getScoreColor(vendor.overallScore)}`}>
                                                        {vendor.overallScore}%
                                                    </span>
                                                </div>
                                                {renderStars(vendor.overallScore)}
                                                <span className="text-sm text-gray-500">
                                                    Last: {formatDate(vendor.lastEvaluation)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Side - Metrics */}
                                        <div className="lg:w-80">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Delivery</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">
                                                            {vendor.performanceMetrics.delivery}%
                                                        </span>
                                                        {getTrendIcon(vendor.trends.delivery)}
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-blue-500"
                                                        style={{ width: `${vendor.performanceMetrics.delivery}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Quality</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">
                                                            {vendor.performanceMetrics.quality}%
                                                        </span>
                                                        {getTrendIcon(vendor.trends.quality)}
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-emerald-500"
                                                        style={{ width: `${vendor.performanceMetrics.quality}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Price</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">
                                                            {vendor.performanceMetrics.price}%
                                                        </span>
                                                        {getTrendIcon(vendor.trends.price)}
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-yellow-500"
                                                        style={{ width: `${vendor.performanceMetrics.price}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Communication</span>
                                                    <span className="font-medium text-gray-900">
                                                        {vendor.performanceMetrics.communication}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-purple-500"
                                                        style={{ width: `${vendor.performanceMetrics.communication}%` }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Compliance</span>
                                                    <span className="font-medium text-gray-900">
                                                        {vendor.performanceMetrics.compliance}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-indigo-500"
                                                        style={{ width: `${vendor.performanceMetrics.compliance}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
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

export default VendorPerformance;