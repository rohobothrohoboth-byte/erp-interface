import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    GitBranch,
    Loader2,
    Calendar,
    Target,
    Flag,
    Zap,
    Sparkles,
    Trash2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { showToast } from '../../../layout/layout';
import { motion } from 'framer-motion';
import { getProjectById } from '../../../services/plandev/project.api';
import type { Project } from '../../../types/plandev/types';

// ============================================================
// CONFIGURATIONS
// ============================================================

const objectiveTypes = [
    { value: 'Strategic', label: 'Strategic Objective', icon: <Target className="w-4 h-4" /> },
    { value: 'Tactical', label: 'Tactical Objective', icon: <Flag className="w-4 h-4" /> },
    { value: 'Operational', label: 'Operational Objective', icon: <Zap className="w-4 h-4" /> },
    { value: 'Innovation', label: 'Innovation Objective', icon: <Sparkles className="w-4 h-4" /> },
];

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
    Achieved: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Active', label: 'Active' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Achieved', label: 'Achieved' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
];

// ============================================================
// DELETE MODAL COMPONENT
// ============================================================

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    loading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onConfirm,
                                                     itemName,
                                                     loading
                                                 }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Delete Objective
                    </h3>
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
            </div>
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const EditObjective = () => {
    const navigate = useNavigate();
    const { id, objectiveId } = useParams<{ id: string; objectiveId: string }>(); // id = Strategic Plan ID
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [strategicPlan, setStrategicPlan] = useState<Project | null>(null);
    const [objective, setObjective] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Strategic',
        status: 'Draft',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        isCritical: false
    });

    // Fetch strategic plan and objective data
    useEffect(() => {
        if (id && objectiveId) {
            fetchData();
        }
    }, [id, objectiveId]);

    const fetchData = async () => {
        try {
            setFetching(true);
            const data = await getProjectById(id!);
            setStrategicPlan(data);

            // Find the objective from the generated objectives
            const foundObjective = findObjectiveById(data, objectiveId!);

            if (foundObjective) {
                setObjective(foundObjective);
                setFormData({
                    name: foundObjective.title || '',
                    description: foundObjective.description || '',
                    type: foundObjective.type || 'Strategic',
                    status: foundObjective.status || 'Draft',
                    priority: foundObjective.priority || 'Medium',
                    startDate: foundObjective.startDate ? foundObjective.startDate.split('T')[0] : '',
                    endDate: foundObjective.endDate ? foundObjective.endDate.split('T')[0] : '',
                    isCritical: foundObjective.isCritical || false
                });
            } else {
                showToast.error('Objective not found');
                navigate(`/plandev/strategic-plans/${id}/objectives`);
            }
        } catch (error: any) {
            console.error('Error fetching objective:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load objective');
            navigate(`/plandev/strategic-plans/${id}/objectives`);
        } finally {
            setFetching(false);
        }
    };

    // Helper function to find objective by ID
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
                    isCritical: task.priority === 'Critical'
                };
            }
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name) {
            showToast.error('Name is required');
            return;
        }
        if (!formData.startDate) {
            showToast.error('Start date is required');
            return;
        }
        if (!formData.endDate) {
            showToast.error('End date is required');
            return;
        }

        setLoading(true);
        try {
            // Convert dates to UTC ISO strings
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
            const startDateUTC = startDate.toISOString();
            const endDateUTC = endDate.toISOString();

            // Prepare data for API
            const submitData = {
                id: objectiveId,
                strategicPlanId: id,
                name: formData.name,
                description: formData.description || '',
                type: formData.type,
                status: formData.status,
                priority: formData.priority,
                startDate: startDateUTC,
                endDate: endDateUTC,
                isCritical: formData.isCritical
            };

            console.log('📡 Updating objective:', submitData);

            // TODO: Replace with actual API call when Objectives API is created
            // await updateObjective(submitData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            showToast.success('Objective updated successfully!');
            navigate(`/plandev/strategic-plans/${id}/objectives`);
        } catch (error: any) {
            console.error('Error updating objective:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update objective');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setDeleting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.info('Objectives are generated from tasks and milestones. To delete this objective, delete the underlying task or milestone.');
            setShowDeleteModal(false);
            navigate(`/plandev/strategic-plans/${id}/objectives`);
        } catch (error: any) {
            console.error('Error deleting objective:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete objective');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                <span>{status}</span>
            </Badge>
        );
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading objective...</p>
                </div>
            </div>
        );
    }

    if (!objective) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Objective not found</p>
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

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 max-w-4xl mx-auto"
            >
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
                            <h1 className="text-2xl font-bold text-gray-900">Edit Objective</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-500">{strategicPlan?.name}</p>
                                {getStatusBadge(formData.status)}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-emerald-600" />
                            Objective Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <Input
                                    required
                                    placeholder="Enter objective name"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="Enter description"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            {/* Objective Type & Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Objective Type *
                                    </label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={formData.type || 'Strategic'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        {objectiveTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority *
                                    </label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={formData.priority || 'Medium'}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        {priorityOptions.map((priority) => (
                                            <option key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Status & Critical */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={formData.status || 'Draft'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Critical
                                    </label>
                                    <div className="flex items-center gap-3 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formData.isCritical === true}
                                                onChange={() => setFormData({ ...formData, isCritical: true })}
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-700">Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formData.isCritical === false}
                                                onChange={() => setFormData({ ...formData, isCritical: false })}
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-gray-700">No</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Start & End Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date *
                                    </label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.startDate || ''}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date *
                                    </label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.endDate || ''}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        min={formData.startDate}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives`)}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update Objective
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                itemName={objective.title}
                loading={deleting}
            />
        </>
    );
};

export default EditObjective;