import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    TrendingUp,
    Loader2,
    Calendar,
    User,
    Tag,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Users,
    Shield,
    Activity,
    Sparkles,
    Target,
    X,
    FileText,
    Download,
    Printer,
    Building2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { showToast } from '../../../layout/layout';
import { getProjectById } from '../../../services/plandev/project.api';
import type { Project } from '../../../types/plandev/types';

// ============================================================
// KPI CONFIGURATIONS
// ============================================================

const kpiCategoryColors: Record<string, string> = {
    Financial: 'bg-green-100 text-green-800 border-green-200',
    Customer: 'bg-blue-100 text-blue-800 border-blue-200',
    Process: 'bg-orange-100 text-orange-800 border-orange-200',
    People: 'bg-purple-100 text-purple-800 border-purple-200',
    Quality: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    Innovation: 'bg-pink-100 text-pink-800 border-pink-200',
};

const kpiCategoryIcons: Record<string, React.ReactNode> = {
    Financial: <DollarSign className="w-4 h-4" />,
    Customer: <Users className="w-4 h-4" />,
    Process: <Activity className="w-4 h-4" />,
    People: <Users className="w-4 h-4" />,
    Quality: <Shield className="w-4 h-4" />,
    Innovation: <Sparkles className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Achieved: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <Clock className="w-4 h-4" />,
    Active: <CheckCircle className="w-4 h-4" />,
    Pending: <Clock className="w-4 h-4" />,
    Achieved: <CheckCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
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
                            <h2 className="text-xl font-bold text-gray-900">Delete KPI</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={isLoading}
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

const KPIDetail = () => {
    const navigate = useNavigate();
    const { id, kpiId } = useParams<{ id: string; kpiId: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [kpi, setKpi] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch project and find the KPI
    const fetchData = useCallback(async () => {
        if (!id || !kpiId) {
            setError('Missing required parameters');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log(`📡 Fetching project with ID: ${id}`);
            const result = await getProjectById(id);
            setProject(result);

            // Find the KPI from the generated KPIs
            const foundKPI = findKPIById(result, kpiId);

            if (foundKPI) {
                setKpi(foundKPI);
                console.log('✅ KPI found:', foundKPI);
            } else {
                setError('KPI not found');
            }
        } catch (error: any) {
            console.error('❌ Error fetching KPI:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load KPI';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id, kpiId]);

    // Helper function to find a KPI by ID from generated KPIs
    const findKPIById = (project: Project, kpiId: string): any => {
        // Check if it's the Budget Utilization KPI
        if (kpiId === `kpi-budget-${project.id}` && project.budget > 0) {
            const budgetUtilization = project.actualCost > 0
                ? Math.round((project.actualCost / project.budget) * 100)
                : 0;
            return {
                id: kpiId,
                name: 'Budget Utilization',
                category: 'Financial',
                description: `Budget utilization for ${project.name}`,
                currentValue: budgetUtilization,
                targetValue: 100,
                unit: '%',
                status: budgetUtilization <= 80 ? 'Active' : budgetUtilization <= 100 ? 'Pending' : 'Cancelled',
                trend: budgetUtilization <= 80 ? 'good' : budgetUtilization <= 100 ? 'warning' : 'danger',
                progress: Math.min(budgetUtilization, 100),
                startDate: project.startDate,
                endDate: project.endDate,
                department: project.department || 'N/A',
                manager: project.managerName || 'Unassigned'
            };
        }

        // Check if it's the Milestone Achievement KPI
        if (kpiId === `kpi-milestones-${project.id}`) {
            const milestones = project.milestones || [];
            if (milestones.length > 0) {
                const achieved = milestones.filter(m => m.status === 'Achieved').length;
                const completionRate = Math.round((achieved / milestones.length) * 100);
                return {
                    id: kpiId,
                    name: 'Milestone Achievement',
                    category: 'Quality',
                    description: `Percentage of milestones achieved (${achieved}/${milestones.length})`,
                    currentValue: completionRate,
                    targetValue: 80,
                    unit: '%',
                    status: completionRate >= 80 ? 'Achieved' : completionRate >= 50 ? 'Active' : 'Pending',
                    trend: completionRate >= 80 ? 'good' : completionRate >= 50 ? 'warning' : 'danger',
                    progress: completionRate,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    department: project.department || 'N/A',
                    manager: project.managerName || 'Unassigned'
                };
            }
        }

        // Check if it's the Task Completion KPI
        if (kpiId === `kpi-tasks-${project.id}`) {
            const tasks = project.tasks || [];
            if (tasks.length > 0) {
                const completed = tasks.filter(t => t.status === 'Completed').length;
                const completionRate = Math.round((completed / tasks.length) * 100);
                return {
                    id: kpiId,
                    name: 'Task Completion',
                    category: 'Process',
                    description: `Percentage of tasks completed (${completed}/${tasks.length})`,
                    currentValue: completionRate,
                    targetValue: 90,
                    unit: '%',
                    status: completionRate >= 90 ? 'Achieved' : completionRate >= 50 ? 'Active' : 'Pending',
                    trend: completionRate >= 90 ? 'good' : completionRate >= 50 ? 'warning' : 'danger',
                    progress: completionRate,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    department: project.department || 'N/A',
                    manager: project.managerName || 'Unassigned'
                };
            }
        }

        // Check if it's the Project Progress KPI
        if (kpiId === `kpi-progress-${project.id}`) {
            return {
                id: kpiId,
                name: 'Project Progress',
                category: 'Process',
                description: `Overall project progress for ${project.name}`,
                currentValue: project.progress,
                targetValue: 100,
                unit: '%',
                status: project.progress >= 100 ? 'Achieved' :
                    project.progress >= 50 ? 'Active' : 'Pending',
                trend: project.progress >= 75 ? 'good' :
                    project.progress >= 50 ? 'warning' : 'danger',
                progress: project.progress,
                startDate: project.startDate,
                endDate: project.endDate,
                department: project.department || 'N/A',
                manager: project.managerName || 'Unassigned'
            };
        }

        // Check if it's the Innovation Impact KPI
        if (kpiId === `kpi-innovation-${project.id}` &&
            (project.priority === 'High' || project.priority === 'Critical')) {
            const innovationScore = Math.min(100, 60 + (project.progress * 0.4));
            return {
                id: kpiId,
                name: 'Innovation Impact',
                category: 'Innovation',
                description: 'Innovation impact score based on project complexity and progress',
                currentValue: Math.round(innovationScore),
                targetValue: 80,
                unit: '%',
                status: innovationScore >= 80 ? 'Achieved' : innovationScore >= 50 ? 'Active' : 'Pending',
                trend: innovationScore >= 80 ? 'good' : innovationScore >= 50 ? 'warning' : 'danger',
                progress: Math.round(innovationScore),
                startDate: project.startDate,
                endDate: project.endDate,
                department: project.department || 'N/A',
                manager: project.managerName || 'Unassigned'
            };
        }

        return null;
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!kpi) return;

        setIsDeleting(true);
        try {
            // In a real app, you would call deleteKPI API here
            // await deleteKPI(kpi.id);
            showToast.success(`"${kpi.name}" deleted successfully!`);
            setShowDeleteModal(false);
            navigate(`/plandev/strategic-plans/${id}/kpis`);
        } catch (error: any) {
            console.error('❌ Error deleting KPI:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete KPI');
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

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <AlertCircle className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    const getCategoryBadge = (category: string) => {
        return (
            <Badge className={`${kpiCategoryColors[category] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {kpiCategoryIcons[category] || <TrendingUp className="w-4 h-4" />}
                <span>{category}</span>
            </Badge>
        );
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'text-green-600';
        if (progress >= 50) return 'text-blue-600';
        if (progress >= 25) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'good') return <CheckCircle className="w-4 h-4 text-green-500" />;
        if (trend === 'warning') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        if (trend === 'danger') return <AlertCircle className="w-4 h-4 text-red-500" />;
        return <CheckCircle className="w-4 h-4 text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading KPI...</p>
                </div>
            </div>
        );
    }

    if (error || !kpi) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'KPI not found'}</p>
                <Button
                    className="mt-4"
                    onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to KPIs
                </Button>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis`)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{kpi.name}</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-sm text-gray-500">{project?.name}</span>
                                {getCategoryBadge(kpi.category)}
                                {getStatusBadge(kpi.status)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis/${kpi.id}/edit`)}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteClick}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* KPI Value Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Target className="w-4 h-4" />
                                Current Value
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {kpi.currentValue}{kpi.unit}
                            </p>
                            {kpi.department && kpi.department !== 'N/A' && (
                                <p className="text-xs text-gray-400 mt-1">
                                    <Building2 className="w-3 h-3 inline mr-1" />
                                    {kpi.department}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <CheckCircle className="w-4 h-4" />
                                Target Value
                            </div>
                            <p className="text-3xl font-bold text-purple-700">
                                {kpi.targetValue}{kpi.unit}
                            </p>
                            {kpi.manager && kpi.manager !== 'Unassigned' && (
                                <p className="text-xs text-gray-400 mt-1">
                                    <User className="w-3 h-3 inline mr-1" />
                                    {kpi.manager}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <TrendingUp className="w-4 h-4" />
                                Progress
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-bold text-blue-700">
                                    {kpi.progress}%
                                </p>
                                {getTrendIcon(kpi.trend)}
                            </div>
                            <Progress value={kpi.progress} className="h-1.5 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Tag className="w-4 h-4" />
                                Category
                            </div>
                            {getCategoryBadge(kpi.category)}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Calendar className="w-4 h-4" />
                                Start Date
                            </div>
                            <p className="font-medium">{formatDate(kpi.startDate)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Calendar className="w-4 h-4" />
                                End Date
                            </div>
                            <p className="font-medium">{formatDate(kpi.endDate)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{kpi.description || 'No description provided'}</p>
                    </CardContent>
                </Card>

                {/* Status Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Tag className="w-4 h-4 text-gray-500" />
                                Status Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Status</span>
                                {getStatusBadge(kpi.status)}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-500">Unit</span>
                                <span className="font-medium">{kpi.unit}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-500">Department</span>
                                <span className="font-medium">{kpi.department || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-500">Manager</span>
                                <span className="font-medium">{kpi.manager || 'Unassigned'}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-gray-500" />
                                Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Progress</span>
                                <span className={`font-medium ${getProgressColor(kpi.progress)}`}>
                                    {kpi.progress}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-500">Status</span>
                                <span className="font-medium">{kpi.status}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-500">Target Value</span>
                                <span className="font-medium">{kpi.targetValue}{kpi.unit}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-500">Current Value</span>
                                <span className="font-medium">{kpi.currentValue}{kpi.unit}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to KPIs
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}`)}
                    >
                        <Target className="w-4 h-4 mr-2" />
                        View Strategic Plan
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            showToast.info('Export functionality coming soon');
                        }}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                }}
                onConfirm={handleConfirmDelete}
                itemName={kpi?.name || ''}
                isLoading={isDeleting}
            />
        </>
    );
};

export default KPIDetail;