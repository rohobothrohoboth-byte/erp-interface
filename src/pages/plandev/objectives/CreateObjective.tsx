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
    Sparkles
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { showToast } from '../../../layout/layout';
import { motion } from 'framer-motion';
import { getProjectById } from '../../../services/plandev/project.api';

// ============================================================
// CONFIGURATIONS
// ============================================================

const objectiveTypes = [
    { value: 'Strategic', label: 'Strategic Objective', icon: <Target className="w-4 h-4" /> },
    { value: 'Tactical', label: 'Tactical Objective', icon: <Flag className="w-4 h-4" /> },
    { value: 'Operational', label: 'Operational Objective', icon: <Zap className="w-4 h-4" /> },
    { value: 'Innovation', label: 'Innovation Objective', icon: <Sparkles className="w-4 h-4" /> },
];

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
// MAIN COMPONENT
// ============================================================

const CreateObjective = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Strategic Plan ID
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [strategicPlanName, setStrategicPlanName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Strategic',
        status: 'Draft',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isCritical: false
    });

    // Fetch strategic plan name
    useEffect(() => {
        if (id) {
            fetchStrategicPlan();
        }
    }, [id]);

    const fetchStrategicPlan = async () => {
        try {
            setFetching(true);
            const data = await getProjectById(id!);
            setStrategicPlanName(data.name);
        } catch (error: any) {
            console.error('Error fetching strategic plan:', error);
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

            console.log('📡 Creating objective:', submitData);

            // TODO: Replace with actual API call when Objectives API is created
            // await createObjective(submitData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            showToast.success('Objective created successfully!');
            navigate(`/plandev/strategic-plans/${id}/objectives`);
        } catch (error: any) {
            console.error('Error creating objective:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create objective');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading strategic plan...</p>
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
                    onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Objective</h1>
                    {strategicPlanName && (
                        <p className="text-sm text-gray-500">{strategicPlanName}</p>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-emerald-600" />
                        Create Objective
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
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Create Objective
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

export default CreateObjective;