import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Rocket,
    Loader2,
    Calendar,
    Building2,
    User,
    DollarSign,
    Target
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { showToast } from '@/shared/layout/layout';
import { motion } from 'framer-motion';
import { createProject, getProjectById, updateProject } from '@/modules/plandev/services/project.api';
import type { CreateProjectDto, UpdateProjectDto } from '@/modules/plandev/types/types';

// ============================================================
// CONFIGURATIONS
// ============================================================

const initiativeTypes = [
    { value: 'Strategic', label: 'Strategic Initiative' },
    { value: 'Operational', label: 'Operational Initiative' },
    { value: 'Innovation', label: 'Innovation Initiative' },
    { value: 'Improvement', label: 'Improvement Initiative' },
    { value: 'Tactical', label: 'Tactical Initiative' },
];

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

const departments = [
    { value: 'IT', label: 'IT' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'R&D', label: 'R&D' },
    { value: 'Customer Experience', label: 'Customer Experience' },
    { value: 'Infrastructure', label: 'Infrastructure' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const CreateInitiative = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<CreateProjectDto>({
        code: '',
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        priority: 'Medium',
        budget: 0,
        projectType: 'Strategic',
        department: '',
        managerId: '',
        sponsorId: ''
    });

    // Fetch initiative data if in edit mode
    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            fetchInitiative();
        }
    }, [id]);

    const fetchInitiative = async () => {
        try {
            setFetching(true);
            const data = await getProjectById(id!);
            setFormData({
                code: data.code || '',
                name: data.name || '',
                description: data.description || '',
                startDate: data.startDate ? data.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
                endDate: data.endDate ? data.endDate.split('T')[0] : '',
                priority: data.priority || 'Medium',
                budget: data.budget || 0,
                projectType: data.projectType || 'Strategic',
                department: data.department || '',
                managerId: data.managerId || '',
                sponsorId: data.sponsorId || ''
            });
        } catch (error: any) {
            console.error('Error fetching initiative:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load initiative');
            navigate('/plandev/initiatives/active');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode && id) {
                // Update existing initiative
                const updateData: UpdateProjectDto = {
                    id: id,
                    name: formData.name,
                    description: formData.description,
                    endDate: formData.endDate,
                    status: formData.status as any,
                    priority: formData.priority,
                    budget: formData.budget,
                    projectType: formData.projectType,
                    department: formData.department,
                    managerId: formData.managerId,
                    sponsorId: formData.sponsorId
                };
                await updateProject(updateData);
                showToast.success('Initiative updated successfully!');
            } else {
                // Create new initiative
                await createProject(formData);
                showToast.success('Initiative created successfully!');
            }
            navigate('/plandev/initiatives/active');
        } catch (error: any) {
            console.error('Error saving initiative:', error);
            showToast.error(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} initiative`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading initiative...</p>
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
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit' : 'Create'} Initiative
                    </h1>
                    {isEditMode && (
                        <p className="text-sm text-gray-500">Update initiative details</p>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-emerald-600" />
                        {isEditMode ? 'Edit' : 'Create'} Initiative
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Code *
                            </label>
                            <Input
                                required
                                placeholder="e.g., PRJ-2026-0001"
                                value={formData.code || ''}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                disabled={isEditMode}
                            />
                            {isEditMode && (
                                <p className="text-xs text-gray-400 mt-1">Code cannot be changed</p>
                            )}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <Input
                                required
                                placeholder="Enter initiative name"
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

                        {/* Initiative Type & Department */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Initiative Type *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.projectType || 'Strategic'}
                                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                >
                                    {initiativeTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.department || ''}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Select department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.value} value={dept.value}>
                                            {dept.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Status & Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.status || 'Planning'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
                                    step="1000"
                                    placeholder="0"
                                    className="pl-7"
                                    value={formData.budget || 0}
                                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                                />
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

                        {/* Manager & Sponsor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Manager Name
                                </label>
                                <Input
                                    placeholder="Enter manager name"
                                    value={formData.managerId || ''}
                                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sponsor Name
                                </label>
                                <Input
                                    placeholder="Enter sponsor name"
                                    value={formData.sponsorId || ''}
                                    onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
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
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {isEditMode ? 'Update' : 'Create'}
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

export default CreateInitiative;