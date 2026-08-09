import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Target,
    Loader2,
    Calendar,
    User,
    Building2,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { showToast } from '../../../layout/layout';
import { motion } from 'framer-motion';
import { getProjectById, updateProject } from '../../../services/plandev/project.api';
import type { Project } from '../../../types/plandev/types';

// ============================================================
// STRATEGIC PLAN CONFIGURATIONS
// ============================================================

const statusOptions = [
    { value: 'Planning', label: 'Planning' },
    { value: 'Active', label: 'Active' },
    { value: 'OnHold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
];

const EditStrategicPlan = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [strategicPlan, setStrategicPlan] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        code: '',
        status: 'Planning',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        department: '',
        owner: '',
        budget: 0
    });

    useEffect(() => {
        if (id) {
            fetchStrategicPlan();
        }
    }, [id]);

    const fetchStrategicPlan = async () => {
        try {
            setFetchLoading(true);
            const data = await getProjectById(id!);
            setStrategicPlan(data);
            // Populate form with existing data
            setFormData({
                name: data.name || '',
                description: data.description || '',
                code: data.code || '',
                status: data.status || 'Planning',
                priority: data.priority || 'Medium',
                startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
                endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
                department: data.department || '',
                owner: data.owner || '',
                budget: data.budget || 0
            });
        } catch (error) {
            console.error('Error fetching strategic plan:', error);
            showToast.error('Failed to load strategic plan');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare update data
            const updateData = {
                ...formData,
                id: id,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            };

            // Call API to update
            await updateProject(id!, updateData);
            showToast.success('Strategic Plan updated successfully!');
            navigate(`/plandev/strategic-plans/${id}`);
        } catch (error) {
            console.error('Error updating strategic plan:', error);
            showToast.error('Failed to update Strategic Plan');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading strategic plan...</p>
                </div>
            </div>
        );
    }

    if (!strategicPlan) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Strategic Plan not found</p>
                <Button
                    variant="outline"
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/plandev/strategic-plans/${id}`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Strategic Plan</h1>
                    {strategicPlan && (
                        <p className="text-sm text-gray-500">
                            {strategicPlan.code} • {strategicPlan.name}
                        </p>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-600" />
                        Strategic Plan Details
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
                                placeholder="Enter Strategic Plan name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Code
                            </label>
                            <Input
                                placeholder="Enter Strategic Plan code (e.g., SP-2024-001)"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <Textarea
                                placeholder="Enter description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        {/* Status & Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.status}
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
                                    Priority
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.priority}
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

                        {/* Start Date & End Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="date"
                                        className="pl-9"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="date"
                                        className="pl-9"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Department & Owner */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Enter department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Owner
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Enter owner name"
                                        value={formData.owner}
                                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Budget
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    $
                                </span>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-7"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/plandev/strategic-plans/${id}`)}
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
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
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

export default EditStrategicPlan;