import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Target,
    Loader2,
    Calendar,
    User,
    Tag,
    AlertCircle,
    CheckCircle,
    Clock,
    Building2,
    Rocket,
    DollarSign,
    TrendingUp,
    Flag,
    GitBranch,
    BarChart3,
    X
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { showToast } from '../../../layout/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjectById, deleteProject } from '../../../services/plandev/project.api';
import type { Project } from '../../../types/plandev/types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Planning: 'bg-blue-100 text-blue-800 border-blue-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    OnHold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Completed: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Planning: <Clock className="w-4 h-4" />,
    Active: <Rocket className="w-4 h-4" />,
    OnHold: <AlertCircle className="w-4 h-4" />,
    Completed: <CheckCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
};

const planTypeColors: Record<string, string> = {
    Strategic: 'bg-purple-100 text-purple-800 border-purple-200',
    Corporate: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Business: 'bg-blue-100 text-blue-800 border-blue-200',
    Functional: 'bg-green-100 text-green-800 border-green-200',
    Operational: 'bg-orange-100 text-orange-800 border-orange-200',
    Innovation: 'bg-pink-100 text-pink-800 border-pink-200',
};

// ============================================================
// DELETE CONFIRMATION MODAL
// ============================================================

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    isLoading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onConfirm,
                                                     itemName,
                                                     isLoading
                                                 }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Delete Strategic Plan</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-700">
                            Are you sure you want to delete <strong className="text-gray-900">"{itemName}"</strong>?
                        </p>
                        <p className="text-sm text-red-600 mt-2 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>This action cannot be undone. All associated data will be permanently removed.</span>
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const StrategicPlanDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Project | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch strategic plan data
    const fetchData = useCallback(async () => {
        if (!id) {
            setError('No strategic plan ID provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log(`📡 Fetching strategic plan with ID: ${id}`);
            const result = await getProjectById(id);
            setData(result);
            console.log('✅ Strategic plan data loaded:', result);
        } catch (error: any) {
            console.error('❌ Error fetching strategic plan:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load strategic plan';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (!data) return;

        setIsDeleting(true);
        try {
            await deleteProject(data.id);
            showToast.success('Strategic plan deleted successfully!');
            navigate('/plandev/strategic-plans');
        } catch (error: any) {
            console.error('❌ Error deleting strategic plan:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete strategic plan');
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <AlertCircle className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    const getPlanTypeBadge = (type?: string) => {
        if (!type) return null;
        return (
            <Badge className={`${planTypeColors[type] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                <Flag className="w-4 h-4" />
                <span>{type}</span>
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading strategic plan...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'Strategic plan not found'}</p>
                <Button
                    className="mt-4"
                    onClick={() => navigate('/plandev/strategic-plans')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Strategic Plans
                </Button>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 max-w-5xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/plandev/strategic-plans')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-sm text-gray-500">{data.code}</span>
                                {getPlanTypeBadge(data.projectType)}
                                {getStatusBadge(data.status)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/plandev/strategic-plans/${data.id}/edit`)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-500">Progress</p>
                            <p className="text-2xl font-bold text-gray-900">{data.progress}%</p>
                            <Progress value={data.progress} className="h-1.5 mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-500">Budget</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.budget)}</p>
                            <p className="text-xs text-gray-400">Actual: {formatCurrency(data.actualCost)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-500">Initiatives</p>
                            <p className="text-2xl font-bold text-gray-900">{data.taskCount || 0}</p>
                            <p className="text-xs text-gray-400">Active initiatives</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-500">Objectives</p>
                            <p className="text-2xl font-bold text-gray-900">{data.milestoneCount || 0}</p>
                            <p className="text-xs text-gray-400">Defined objectives</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Tag className="w-4 h-4" />
                                Priority
                            </div>
                            <Badge className={priorityColors[data.priority] || 'bg-gray-100 text-gray-800'}>
                                {data.priority}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Building2 className="w-4 h-4" />
                                Department
                            </div>
                            <p className="font-medium">{data.department || 'N/A'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <User className="w-4 h-4" />
                                Manager
                            </div>
                            <p className="font-medium">{data.managerName || 'Unassigned'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Calendar className="w-4 h-4" />
                                Start Date
                            </div>
                            <p className="font-medium">{formatDate(data.startDate)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Calendar className="w-4 h-4" />
                                End Date
                            </div>
                            <p className="font-medium">{formatDate(data.endDate)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <User className="w-4 h-4" />
                                Sponsor
                            </div>
                            <p className="font-medium">{data.sponsorName || 'N/A'}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-600" />
                            Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{data.description || 'No description provided'}</p>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate(`/plandev/strategic-plans/${data.id}/objectives`)}
                    >
                        <GitBranch className="w-4 h-4 mr-2" />
                        View Objectives
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/plandev/strategic-plans/${data.id}/kpis`)}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View KPIs
                    </Button>
                </div>

                {/* Info section about Initiatives */}
                <Card className="mt-6 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Target className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-800">Strategic Plan Overview</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    This strategic plan defines high-level <strong>Objectives</strong> and <strong>KPIs</strong>.
                                    To track execution, create <strong>Initiatives</strong> that will implement this strategy
                                    with specific milestones, tasks, budgets, and resources.
                                </p>
                                <Button
                                    variant="link"
                                    className="text-blue-700 p-0 mt-2"
                                    onClick={() => navigate('/plandev/initiatives/active')}
                                >
                                    View Initiatives →
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                itemName={data?.name || ''}
                isLoading={isDeleting}
            />
        </>
    );
};

export default StrategicPlanDetail;