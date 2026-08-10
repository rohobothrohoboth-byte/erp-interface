import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    GitBranch,
    Loader2,
    Calendar,
    User,
    Tag,
    AlertCircle,
    CheckCircle,
    Clock,
    Target,
    Flag,
    Rocket,
    X
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { showToast } from '@/shared/layout/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjectById } from '@/modules/plandev/services/project.api';
import type { Project } from '@/modules/plandev/types/types';

// ============================================================
// OBJECTIVE CONFIGURATIONS
// ============================================================

const objectiveTypes: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    Strategic: {
        label: 'Strategic Objective',
        icon: <Target className="w-4 h-4" />,
        color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    Tactical: {
        label: 'Tactical Objective',
        icon: <Flag className="w-4 h-4" />,
        color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    Operational: {
        label: 'Operational Objective',
        icon: <Rocket className="w-4 h-4" />,
        color: 'bg-green-100 text-green-800 border-green-200'
    },
    Innovation: {
        label: 'Innovation Objective',
        icon: <GitBranch className="w-4 h-4" />,
        color: 'bg-pink-100 text-pink-800 border-pink-200'
    }
};

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
    Achieved: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <GitBranch className="w-4 h-4" />,
    Active: <Rocket className="w-4 h-4" />,
    InProgress: <Clock className="w-4 h-4" />,
    Achieved: <CheckCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
};

// ============================================================
// DELETE MODAL COMPONENT
// ============================================================

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    itemName: string;
    loading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onConfirm,
                                                     title,
                                                     itemName,
                                                     loading
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
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">"{itemName}"</span>?
                        This action cannot be undone.
                    </p>

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
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

const ObjectiveDetail = () => {
    const navigate = useNavigate();
    const { id, objectiveId } = useParams<{ id: string; objectiveId: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [objective, setObjective] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch project and find the objective
    const fetchData = useCallback(async () => {
        if (!id || !objectiveId) {
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

            // Find the objective from the generated objectives
            const foundObjective = findObjectiveById(result, objectiveId);

            if (foundObjective) {
                setObjective(foundObjective);
                console.log('✅ Objective found:', foundObjective);
            } else {
                setError('Objective not found');
            }
        } catch (error: any) {
            console.error('❌ Error fetching objective:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load objective';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id, objectiveId]);

    // Helper function to find an objective by ID from generated objectives
    const findObjectiveById = (project: Project, objectiveId: string): any => {
        // Check if it's a strategic objective
        if (objectiveId === `obj-strategic-${project.id}`) {
            return {
                id: objectiveId,
                title: `Strategic: ${project.name}`,
                description: project.description || 'Strategic objective aligned with project goals',
                type: 'Strategic',
                status: project.status === 'Completed' ? 'Achieved' :
                    project.status === 'Active' ? 'InProgress' :
                        project.status === 'Planning' ? 'Draft' : 'Active',
                priority: project.priority || 'Medium',
                startDate: project.startDate,
                endDate: project.endDate,
                progress: project.progress || 0,
                parentId: null,
                children: [],
                isCritical: project.priority === 'Critical'
            };
        }

        // Check if it's a tactical objective (from milestones)
        const milestones = project.milestones || [];
        for (const milestone of milestones) {
            if (objectiveId === `obj-tactical-${milestone.id}`) {
                return {
                    id: objectiveId,
                    title: milestone.name,
                    description: milestone.description || 'Tactical objective from milestone',
                    type: 'Tactical',
                    status: milestone.status === 'Achieved' ? 'Achieved' :
                        milestone.status === 'Pending' ? 'Active' : 'InProgress',
                    priority: milestone.isCritical ? 'High' : 'Medium',
                    startDate: project.startDate,
                    endDate: milestone.targetDate,
                    progress: milestone.completionPercentage || 0,
                    parentId: `obj-strategic-${project.id}`,
                    children: [],
                    isCritical: milestone.isCritical
                };
            }
        }

        // Check if it's an operational objective (from tasks)
        const tasks = project.tasks || [];
        for (const task of tasks) {
            if (objectiveId === `obj-operational-${task.id}`) {
                return {
                    id: objectiveId,
                    title: task.title,
                    description: task.description || 'Operational objective from task',
                    type: 'Operational',
                    status: task.status === 'Completed' ? 'Achieved' :
                        task.status === 'InProgress' ? 'InProgress' : 'Active',
                    priority: task.priority || 'Medium',
                    startDate: task.startDate,
                    endDate: task.endDate || project.endDate,
                    progress: task.progress || 0,
                    parentId: task.parentTaskId ? `obj-tactical-${task.parentTaskId}` : `obj-strategic-${project.id}`,
                    children: [],
                    isCritical: task.priority === 'Critical'
                };
            }
        }

        return null;
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteConfirm = async () => {
        if (!objective) return;

        setDeleting(true);
        try {
            // Show info that objectives are generated from tasks/milestones
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.info('Objectives are generated from tasks and milestones. To delete this objective, delete the underlying task or milestone.');
            setShowDeleteModal(false);
            // Navigate back to objectives list
            navigate(`/plandev/strategic-plans/${id}/objectives`);
        } catch (error: any) {
            console.error('❌ Error deleting objective:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete objective');
        } finally {
            setDeleting(false);
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

    const getObjectiveTypeInfo = (type: string) => {
        return objectiveTypes[type] || objectiveTypes.Strategic;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading objective...</p>
                </div>
            </div>
        );
    }

    if (error || !objective) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'Objective not found'}</p>
                <Button
                    className="mt-4"
                    onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Objectives
                </Button>
            </div>
        );
    }

    const typeInfo = getObjectiveTypeInfo(objective.type);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives`)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{objective.title}</h1>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-sm text-gray-500">Strategic Plan: {project?.name}</span>
                                <Badge className={typeInfo.color}>
                                    <span className="flex items-center gap-1">
                                        {typeInfo.icon}
                                        {typeInfo.label}
                                    </span>
                                </Badge>
                                {objective.isCritical && (
                                    <Badge className="bg-red-100 text-red-700 border-red-200">
                                        Critical
                                    </Badge>
                                )}
                                {getStatusBadge(objective.status)}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives/${objective.id}/edit`)}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Tag className="w-4 h-4" />
                                Priority
                            </div>
                            <Badge className={priorityColors[objective.priority] || 'bg-gray-100 text-gray-800'}>
                                {objective.priority}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Calendar className="w-4 h-4" />
                                Target Date
                            </div>
                            <p className="font-medium">{formatDate(objective.endDate)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <User className="w-4 h-4" />
                                Created By
                            </div>
                            <p className="font-medium">{project?.managerName || 'System Generated'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <Target className="w-4 h-4" />
                                Progress
                            </div>
                            <p className="font-medium">{objective.progress}%</p>
                            <Progress value={objective.progress} className="h-1.5 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-emerald-600" />
                            Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700">{objective.description || 'No description provided'}</p>
                    </CardContent>
                </Card>

                {/* Parent Info */}
                {objective.parentId && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <GitBranch className="w-4 h-4 text-gray-500" />
                                Parent Objective
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">{objective.parentId}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                This objective is a sub-objective of the parent objective above.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Sub-Objectives */}
                {objective.children && objective.children.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <GitBranch className="w-4 h-4 text-gray-500" />
                                Sub-Objectives ({objective.children.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {objective.children.map((child: any, index: number) => (
                                    <li key={index} className="text-sm text-gray-600">
                                        • {child.title || `Sub-objective ${index + 1}`}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Objectives
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate(`/plandev/strategic-plans/${id}`)}
                    >
                        <Target className="w-4 h-4 mr-2" />
                        View Strategic Plan
                    </Button>
                </div>
            </motion.div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Objective"
                itemName={objective.title}
                loading={deleting}
            />
        </>
    );
};

export default ObjectiveDetail;