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

const kpiCategories = [
    { value: 'Financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'Customer', label: 'Customer', icon: <Users className="w-4 h-4" /> },
    { value: 'Process', label: 'Process', icon: <Activity className="w-4 h-4" /> },
    { value: 'People', label: 'People', icon: <Users className="w-4 h-4" /> },
    { value: 'Quality', label: 'Quality', icon: <Shield className="w-4 h-4" /> },
    { value: 'Innovation', label: 'Innovation', icon: <Sparkles className="w-4 h-4" /> },
];

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

const CreateKPI = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Strategic Plan ID
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [strategicPlanName, setStrategicPlanName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Process',
        status: 'Draft',
        targetValue: 100,
        currentValue: 0,
        unit: '%',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        frequency: 'Monthly',
        isActive: true
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

            console.log('📡 Creating KPI:', submitData);

            // TODO: Replace with actual API call when KPIs API is created
            // await createKPI(submitData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            showToast.success('KPI created successfully!');
            navigate(`/plandev/strategic-plans/${id}/kpis`);
        } catch (error: any) {
            console.error('Error creating KPI:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create KPI');
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
                    onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create KPI</h1>
                    {strategicPlanName && (
                        <p className="text-sm text-gray-500">{strategicPlanName}</p>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Create KPI
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
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Create KPI
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

export default CreateKPI;