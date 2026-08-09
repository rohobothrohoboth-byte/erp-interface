import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Star,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertCircle,
    Clock,
    Users,
    DollarSign,
    FileText,
    Loader2,
    Calendar,
    Building2,
    User,
    Award,
    XCircle,
    Plus,
    Minus
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import {
    getVendorEvaluationById,
    deleteVendorEvaluation
     
} from '../../../services/procurement/vendorEvaluation.api';

import type{
     
    VendorEvaluation
} from '../../../services/procurement/vendorEvaluation.api';

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
    Excellent: <Award className="w-4 h-4" />,
    Good: <TrendingUp className="w-4 h-4" />,
    Average: <AlertCircle className="w-4 h-4" />,
    Poor: <XCircle className="w-4 h-4" />,
};

// ============================================================
// INFO ITEM COMPONENT
// ============================================================

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({
                                                                                                   label,
                                                                                                   value,
                                                                                                   icon
                                                                                               }) => (
    <div className="space-y-1">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
            {icon}
            {label}
        </p>
        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const EvaluationDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [evaluation, setEvaluation] = useState<VendorEvaluation | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Fetch evaluation
    const fetchEvaluation = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await getVendorEvaluationById(id);
            setEvaluation(data);
            console.log('✅ Evaluation loaded:', data);
        } catch (error: any) {
            console.error('Error fetching evaluation:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load evaluation');
            navigate('/procurement/vendors/evaluation');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchEvaluation();
    }, [fetchEvaluation]);

    // Handle delete
    const handleDelete = async () => {
        if (!evaluation) return;
        if (!confirm(`Are you sure you want to delete this evaluation for ${evaluation.vendorName}?`)) return;

        setProcessing(true);
        try {
            await deleteVendorEvaluation(evaluation.id);
            showToast.success('Evaluation deleted successfully');
            navigate('/procurement/vendors/evaluation');
        } catch (error: any) {
            console.error('Error deleting evaluation:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete evaluation');
        } finally {
            setProcessing(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading evaluation...</p>
                </div>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Evaluation not found</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/procurement/vendors/evaluation')}
                >
                    Back to Evaluations
                </Button>
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/procurement/vendor-evaluation')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {evaluation.vendorName}
                            <Badge className={`${statusColors[evaluation.status]} flex items-center gap-1`}>
                                {statusIcons[evaluation.status]}
                                {evaluation.status}
                            </Badge>
                        </h1>
                        <p className="text-sm text-gray-500">
                            {evaluation.vendorCode} • {evaluation.category || 'General'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-red-600"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Star className="w-3 h-3 text-yellow-500" />
                            Overall Score
                        </p>
                        <p className={`text-2xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                            {evaluation.overallScore}%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Users className="w-3 h-3" />
                            Evaluator
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {evaluation.evaluator || 'Not Assigned'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Evaluation Date
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {formatDate(evaluation.evaluationDate)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" />
                            Category
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                            {evaluation.category || 'General'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Criteria Scores */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Evaluation Criteria
                    </h3>
                    <div className="space-y-4">
                        {evaluation.criteria.map((criterion, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{criterion.name}</p>
                                        <p className="text-xs text-gray-500">Weight: {criterion.weight}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${getScoreColor((criterion.score / criterion.maxScore) * 100)}`}>
                                            {criterion.score} / {criterion.maxScore}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {Math.round((criterion.score / criterion.maxScore) * 100)}%
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${getProgressColor((criterion.score / criterion.maxScore) * 100)}`}
                                        style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Strengths
                        </h3>
                        {evaluation.strengths.length > 0 ? (
                            <ul className="space-y-2">
                                {evaluation.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No strengths recorded</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Weaknesses
                        </h3>
                        {evaluation.weaknesses.length > 0 ? (
                            <ul className="space-y-2">
                                {evaluation.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No weaknesses recorded</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        Recommendations
                    </h3>
                    {evaluation.recommendations.length > 0 ? (
                        <ul className="space-y-2">
                            {evaluation.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                                    <span className="text-sm text-gray-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No recommendations recorded</p>
                    )}
                </CardContent>
            </Card>

            {/* Notes */}
            {evaluation.notes && (
                <Card>
                    <CardContent className="p-6">
                        <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{evaluation.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Audit Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                    <span className="font-medium text-gray-500">Created:</span>
                    <span className="ml-2">{formatDate(evaluation.dateAdd)}</span>
                </div>
                {evaluation.dateMod && (
                    <div>
                        <span className="font-medium text-gray-500">Last Modified:</span>
                        <span className="ml-2">{formatDate(evaluation.dateMod)}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default EvaluationDetail;