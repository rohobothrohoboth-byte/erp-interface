// src/pages/procurement/vendors/VendorEvaluation.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Star,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertCircle,
    Clock,
    Users,
    DollarSign,
    Package,
    Truck,
    FileText,
    BarChart3,
    Filter,
    Download,
    Loader2,
    RefreshCw,
    Plus,
    Eye,
    Trash2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import {
    getVendorEvaluations,
    deleteVendorEvaluation

} from '@/modules/procurement/services/vendorEvaluation.api';


import type {

    VendorEvaluation
} from '@/modules/procurement/services/vendorEvaluation.api';
// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Excellent: 'bg-green-100 text-green-800 border-green-200',
    Good: 'bg-blue-100 text-blue-800 border-blue-200',
    Average: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Poor: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Excellent: <CheckCircle className="w-4 h-4" />,
    Good: <TrendingUp className="w-4 h-4" />,
    Average: <AlertCircle className="w-4 h-4" />,
    Poor: <AlertCircle className="w-4 h-4" />,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const VendorEvaluation = () => {
    const navigate = useNavigate();

    // State
    const [evaluations, setEvaluations] = useState<VendorEvaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch evaluations
    const fetchEvaluations = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            console.log('📡 Fetching evaluations:', params);
            const data = await getVendorEvaluations(params);
            setEvaluations(data);
            console.log(`✅ Fetched ${data.length} evaluations`);
        } catch (error: any) {
            console.error('Error fetching evaluations:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load evaluations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filterStatus]);

    // Initial load and filter changes
    useEffect(() => {
        fetchEvaluations();
    }, [searchTerm, filterStatus]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchEvaluations();
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this evaluation?')) return;

        setProcessingId(id);
        try {
            await deleteVendorEvaluation(id);
            showToast.success('Evaluation deleted successfully');
            fetchEvaluations();
        } catch (error: any) {
            console.error('Error deleting evaluation:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete evaluation');
        } finally {
            setProcessingId(null);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-blue-500';
        if (score >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
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

    if (loading && !evaluations.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading evaluations...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Evaluation</h1>
                    <p className="text-sm text-gray-500">
                        {evaluations.length} evaluations • Monitor vendor performance
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
                        onClick={() => navigate('/procurement/vendors/evaluation/create')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Evaluation
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Evaluations</p>
                        <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Excellent</p>
                        <p className="text-2xl font-bold text-green-700">
                            {evaluations.filter(e => e.status === 'Excellent').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Good</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {evaluations.filter(e => e.status === 'Good').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Needs Improvement</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {evaluations.filter(e => e.status === 'Average' || e.status === 'Poor').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by vendor name or code..."
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
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                </select>
            </div>

            {/* Evaluation Cards */}
            {evaluations.length === 0 ? (
                <div className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No evaluations found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first vendor evaluation'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/procurement/vendors/evaluation/create')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Evaluation
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {evaluations.map((evaluation) => (
                        <motion.div
                            key={evaluation.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="cursor-pointer"
                            onClick={() => navigate(`/procurement/vendors/evaluation/${evaluation.id}`)}
                        >
                            <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
                                evaluation.status === 'Excellent' ? 'border-l-green-500' :
                                    evaluation.status === 'Good' ? 'border-l-blue-500' :
                                        evaluation.status === 'Average' ? 'border-l-yellow-500' :
                                            'border-l-red-500'
                            }`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        {/* Left Side */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {evaluation.vendorName}
                                                </h3>
                                                <span className="text-sm text-gray-500">{evaluation.vendorCode}</span>
                                                <Badge className={`${statusColors[evaluation.status]} flex items-center gap-1`}>
                                                    {statusIcons[evaluation.status]}
                                                    {evaluation.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">
                                                Category: {evaluation.category || 'General'}
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Evaluator</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {evaluation.evaluator || 'Not Assigned'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Evaluation Date</p>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(evaluation.evaluationDate)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Overall Score</p>
                                                    <p className={`text-2xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                                                        {evaluation.overallScore}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Criteria Scores */}
                                            {evaluation.criteria && evaluation.criteria.length > 0 && (
                                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {evaluation.criteria.slice(0, 3).map((criterion, index) => (
                                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-gray-600">{criterion.name}</span>
                                                                <span className="font-medium text-gray-900">
                                                                    {criterion.score}/{criterion.maxScore}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                <div
                                                                    className={`h-1.5 rounded-full ${getProgressColor((criterion.score / criterion.maxScore) * 100)}`}
                                                                    style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {evaluation.criteria.length > 3 && (
                                                        <div className="flex items-center justify-center text-sm text-gray-400">
                                                            +{evaluation.criteria.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side */}
                                        <div className="flex flex-col gap-2 min-w-[120px]">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/procurement/vendors/evaluation/${evaluation.id}`);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-red-600 hover:text-red-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(evaluation.id);
                                                }}
                                                disabled={processingId === evaluation.id}
                                            >
                                                {processingId === evaluation.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                )}
                                                Delete
                                            </Button>
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

export default VendorEvaluation;