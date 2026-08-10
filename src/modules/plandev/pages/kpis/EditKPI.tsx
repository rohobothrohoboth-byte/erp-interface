import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    TrendingUp,
    Loader2,
    Calendar,
    Users,
    DollarSign,
    Shield,
    Activity,
    Sparkles,
    Trash2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { showToast } from '@/shared/layout/layout';
import { motion } from 'framer-motion';
import { getProjectById } from '@/modules/plandev/services/project.api';

// ============================================================
// CONFIGURATIONS
// ============================================================

const kpiCategories = [
    { value: 'Financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'Customer', label: 'Customer', icon: <Users className="w-4 h-4" /> },
    { value: 'Process', label: 'Process', icon: <Activity className="w-4 h-4" /> },
    { value: 'People', label: 'People', icon: <Users className="w-4 h-4" /> },
    { value: 'Quality', label: 'Quality', icon: <Shield className="w-4 h-4" /> },
    { value: 'Innovation', label: 'Innovation', icon: <Sparkles className="w-4 h-4" /> },
];

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Achieved: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Achieved', label: 'Achieved' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const unitOptions = [
    { value: '%', label: 'Percentage (%)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'ETB', label: 'ETB (Br)' },
    { value: 'Count', label: 'Count' },
    { value: 'Hours', label: 'Hours' },
    { value: 'Days', label: 'Days' },
    { value: 'Score', label: 'Score' },
    { value: 'Rating', label: 'Rating' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const EditKPI = () => {
    const navigate = useNavigate();
    const { id, kpiId } = useParams<{ id: string; kpiId: string }>(); // id = Strategic Plan ID, kpiId = KPI ID
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [strategicPlanName, setStrategicPlanName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Process',
        status: 'Draft',
        targetValue: 100,
        currentValue: 0,
        unit: '%',
        startDate: '',
        endDate: '',
        frequency: 'Monthly',
        isActive: true
    });

    // Fetch strategic plan and KPI data
    useEffect(() => {
        if (id && kpiId) {
            fetchData();
        }
    }, [id, kpiId]);

    const fetchData = async () => {
        try {
            setFetching(true);
            const data = await getProjectById(id!);
            setStrategicPlanName(data.name);

            // Find the KPI from the project's generated KPIs
            // Since KPIs are generated dynamically, we need to find the matching one
            // For now, we'll simulate finding a KPI

            // TODO: When KPIs API is created, replace with:
            // const kpiData = await getKPIById(kpiId);

            // Simulate finding KPI data
            const simulatedKPI = {
                name: 'Sample KPI',
                description: 'This is a sample KPI description',
                category: 'Process',
                status: 'Active',
                targetValue: 90,
                currentValue: 45,
                unit: '%',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                frequency: 'Monthly',
                isActive: true
            };

            setFormData(simulatedKPI);
        } catch (error: any) {
            console.error('Error fetching KPI:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load KPI');
            navigate(`/plandev/strategic-plans/${id}/kpis`);
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
        if (!formData.targetValue) {
            showToast.error('Target value is required');
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
                id: kpiId,
                strategicPlanId: id,
                name: formData.name,
                description: formData.description || '',
                category: formData.category,
                status: formData.status,
                targetValue: Number(formData.targetValue),
                currentValue: Number(formData.currentValue || 0),
                unit: formData.unit,
                startDate: startDateUTC,
                endDate: endDateUTC,
                frequency: formData.frequency,
                isActive: formData.isActive
            };

            console.log('📡 Updating KPI:', submitData);

            // TODO: Replace with actual API call when KPIs API is created
            // await updateKPI(submitData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            showToast.success('KPI updated successfully!');
            navigate(`/plandev/strategic-plans/${id}/kpis`);
        } catch (error: any) {
            console.error('Error updating KPI:', error);
            showToast.error(error?.response?.data?.message || 'Failed to update KPI');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this KPI? This action cannot be undone.`)) return;

        try {
            // TODO: Replace with actual API call when KPIs API is created
            // await deleteKPI(kpiId);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            showToast.success('KPI deleted successfully!');
            navigate(`/plandev/strategic-plans/${id}/kpis`);
        } catch (error: any) {
            console.error('Error deleting KPI:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete KPI');
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
                    <p className="mt-4 text-gray-600">Loading KPI...</p>
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
            <div className="flex items-center justify-between mb-6">
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
                        <h1 className="text-2xl font-bold text-gray-900">Edit KPI</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500">{strategicPlanName}</p>
                            {getStatusBadge(formData.status)}
                        </div>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        KPI Details
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
                                placeholder="Enter KPI name"
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

                        {/* Category & Unit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.category || 'Process'}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {kpiCategories.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.unit || '%'}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    {unitOptions.map((unit) => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Target & Current Value */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Value *
                                </label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter target value"
                                    value={formData.targetValue || ''}
                                    onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Value
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter current value"
                                    value={formData.currentValue || ''}
                                    onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Status & Frequency */}
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
                                    Frequency
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.frequency || 'Monthly'}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
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

                        {/* Active Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Active
                            </label>
                            <div className="flex items-center gap-3 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={formData.isActive === true}
                                        onChange={() => setFormData({ ...formData, isActive: true })}
                                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={formData.isActive === false}
                                        onChange={() => setFormData({ ...formData, isActive: false })}
                                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">No</span>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis`)}
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
                                        Update KPI
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

export default EditKPI;