import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Award,
    Loader2,
    Calendar,
    Flag,
    Target,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { showToast } from '../../../layout/layout';
import { motion } from 'framer-motion';
import { getProjectById, createMilestone } from '../../../services/plandev/project.api';
import type { CreateMilestoneDto } from '../../../types/plandev/types';

// ============================================================
// CONFIGURATIONS
// ============================================================

const milestoneTypes = [
    { value: 'Phase', label: 'Phase' },
    { value: 'Deliverable', label: 'Deliverable' },
    { value: 'Review', label: 'Review' },
    { value: 'Approval', label: 'Approval' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const CreateMilestone = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Only get id from params
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [formData, setFormData] = useState<CreateMilestoneDto>({
        projectId: id || '',
        name: '',
        description: '',
        targetDate: new Date().toISOString().split('T')[0],
        milestoneType: 'Phase',
        deliverable: '',
        isCritical: false
    });

    // Fetch project name
    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            setFetching(true);
            const data = await getProjectById(id!);
            setProjectName(data.name);
        } catch (error: any) {
            console.error('Error fetching project:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name) {
            showToast.error('Name is required');
            return;
        }
        if (!formData.targetDate) {
            showToast.error('Target date is required');
            return;
        }
        if (!id) {
            showToast.error('No project ID provided');
            return;
        }

        setLoading(true);
        try {
            // Convert date to UTC ISO string
            const targetDate = new Date(formData.targetDate);
            const targetDateUTC = targetDate.toISOString();

            const submitData = {
                projectId: id,
                name: formData.name,
                description: formData.description || '',
                targetDate: targetDateUTC,
                milestoneType: formData.milestoneType,
                deliverable: formData.deliverable || '',
                isCritical: formData.isCritical || false
            };

            console.log('📡 Creating milestone:', submitData);
            await createMilestone(submitData);
            showToast.success('Milestone created successfully!');
            navigate(`/plandev/initiatives/${id}/milestones`);
        } catch (error: any) {
            console.error('Error creating milestone:', error);
            console.error('Error response:', error?.response?.data);

            let errorMessage = 'Failed to create milestone';
            if (error?.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.title) {
                    errorMessage = error.response.data.title;
                } else if (error.response.data.errors) {
                    const errors = error.response.data.errors;
                    const firstError = Object.values(errors)[0];
                    if (Array.isArray(firstError)) {
                        errorMessage = firstError[0];
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading project...</p>
                </div>
            </div>
        );
    }

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
                    onClick={() => navigate(`/plandev/initiatives/${id}/milestones`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Milestone</h1>
                    {projectName && (
                        <p className="text-sm text-gray-500">{projectName}</p>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Create Milestone
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
                                placeholder="Enter milestone name"
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

                        {/* Target Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Date *
                            </label>
                            <Input
                                type="date"
                                required
                                value={formData.targetDate || ''}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                            />
                        </div>

                        {/* Milestone Type & Critical */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Milestone Type *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.milestoneType || 'Phase'}
                                    onChange={(e) => setFormData({ ...formData, milestoneType: e.target.value })}
                                >
                                    {milestoneTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
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

                        {/* Deliverable */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deliverable
                            </label>
                            <Input
                                placeholder="Enter deliverable"
                                value={formData.deliverable || ''}
                                onChange={(e) => setFormData({ ...formData, deliverable: e.target.value })}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/plandev/initiatives/${id}/milestones`)}
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
                                        Create Milestone
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

export default CreateMilestone;