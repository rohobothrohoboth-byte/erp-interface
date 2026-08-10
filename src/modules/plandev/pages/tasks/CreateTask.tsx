import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Loader2,
    Target,
    Calendar,
    User,
    AlertCircle,
    Clock
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { showToast } from '@/shared/layout/layout';
import { motion } from 'framer-motion';
import { getProjectById } from '@/modules/plandev/services/project.api';
import type { Project } from '@/modules/plandev/types/types';

const CreateTask = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState<Project | null>(null);

    // Determine the base path from the current URL
    const getBasePath = () => {
        const path = location.pathname;
        if (path.includes('/strategic-plans/')) {
            return 'strategic-plans';
        }
        if (path.includes('/initiatives/')) {
            return 'initiatives';
        }
        // Default to strategic-plans if can't determine
        return 'strategic-plans';
    };

    const baseType = getBasePath();

    const [formData, setFormData] = useState({
        projectId: id || '',
        title: '',
        description: '',
        assignedToUserId: '',
        assignedToUserName: '',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        estimatedHours: 0,
        parentTaskId: '',
        taskType: ''
    });

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            const data = await getProjectById(id!);
            setProject(data);
            setFormData(prev => ({ ...prev, projectId: id! }));
        } catch (error) {
            console.error('Error fetching project:', error);
            showToast.error('Failed to load project');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.success('Task created successfully!');
            // Navigate back to the correct tasks list
            navigate(`/plandev/${baseType}/${id}/tasks`);
        } catch (error) {
            showToast.error('Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(`/plandev/${baseType}/${id}/tasks`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Create Task</h1>
                {project && (
                    <span className="text-sm text-gray-500">{project.name}</span>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-600" />
                        Task Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title *
                            </label>
                            <Input
                                required
                                placeholder="Enter task title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <Textarea
                                placeholder="Enter task description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>

                            {/* Estimated Hours */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estimated Hours
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    placeholder="Enter estimated hours"
                                    value={formData.estimatedHours}
                                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Assigned To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assigned To
                            </label>
                            <Input
                                placeholder="Enter assignee name"
                                value={formData.assignedToUserName}
                                onChange={(e) => setFormData({ ...formData, assignedToUserName: e.target.value })}
                            />
                        </div>

                        {/* Task Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Task Type
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={formData.taskType}
                                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                            >
                                <option value="">Select task type</option>
                                <option value="Planning">Planning</option>
                                <option value="Design">Design</option>
                                <option value="Development">Development</option>
                                <option value="Testing">Testing</option>
                                <option value="Deployment">Deployment</option>
                                <option value="Support">Support</option>
                                <option value="Training">Training</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
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
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Create Task
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default CreateTask;