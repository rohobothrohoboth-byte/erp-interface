import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    X,
    Loader2,
    DollarSign,
    Calendar,
    Building2,
    User,
    AlertCircle,
    FileText,
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
import type { Project, Budget } from '../../../types/plandev/types';

// ============================================================
// BUDGET CONFIGURATIONS
// ============================================================

const budgetTypes = [
    { value: 'Personnel', label: 'Personnel' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Materials', label: 'Materials' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Training', label: 'Training' },
    { value: 'Software', label: 'Software' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operations', label: 'Operations' },
];

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
    Completed: 'bg-purple-100 text-purple-800 border-purple-200',
};

const EditBudgetItem = () => {
    const navigate = useNavigate();
    const { id, budgetId } = useParams<{ id: string; budgetId: string }>();
    const [loading, setLoading] = useState(false);
    const [strategicPlan, setStrategicPlan] = useState<Project | null>(null);
    const [budgetItem, setBudgetItem] = useState<Budget | null>(null);
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        plannedAmount: 0,
        actualAmount: 0,
        plannedQuantity: 0,
        actualQuantity: 0,
        unit: '',
        status: 'Draft',
        budgetType: ''
    });

    useEffect(() => {
        if (id && budgetId) {
            fetchData();
        }
    }, [id, budgetId]);

    const fetchData = async () => {
        try {
            const data = await getProjectById(id!);
            setStrategicPlan(data);

            // Find the budget item from the project's budgets
            const foundBudget = data.budgets?.find(b => b.id === budgetId);
            if (foundBudget) {
                setBudgetItem(foundBudget);
                setFormData({
                    category: foundBudget.category || '',
                    description: foundBudget.description || '',
                    plannedAmount: foundBudget.plannedAmount || 0,
                    actualAmount: foundBudget.actualAmount || 0,
                    plannedQuantity: foundBudget.plannedQuantity || 0,
                    actualQuantity: foundBudget.actualQuantity || 0,
                    unit: foundBudget.unit || '',
                    status: foundBudget.status || 'Draft',
                    budgetType: foundBudget.budgetType || ''
                });
            } else {
                showToast.error('Budget item not found');
                navigate(`/plandev/strategic-plans/${id}/budget`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast.error('Failed to load budget item');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.success('Budget item updated successfully!');
            navigate(`/plandev/strategic-plans/${id}/budget`);
        } catch (error) {
            showToast.error('Failed to update budget item');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!budgetItem) return;
        if (!confirm(`Are you sure you want to delete budget item "${budgetItem.category}"?`)) return;

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast.success('Budget item deleted successfully!');
            navigate(`/plandev/strategic-plans/${id}/budget`);
        } catch (error) {
            showToast.error('Failed to delete budget item');
        }
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                <span>{status}</span>
            </Badge>
        );
    };

    if (!budgetItem) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
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
                        onClick={() => navigate(`/plandev/strategic-plans/${id}/budget`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Budget Item</h1>
                        {strategicPlan && (
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-gray-500">{strategicPlan.name}</p>
                                {getStatusBadge(budgetItem.status)}
                            </div>
                        )}
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
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        Budget Item Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <Input
                                required
                                placeholder="Enter budget category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <Textarea
                                placeholder="Enter budget description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Budget Type & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Budget Type
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.budgetType}
                                    onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                                >
                                    <option value="">Select budget type</option>
                                    {budgetTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Approved">Approved</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Planned & Actual Amounts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Planned Amount *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="pl-7"
                                        value={formData.plannedAmount}
                                        onChange={(e) => setFormData({ ...formData, plannedAmount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Actual Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="pl-7"
                                        value={formData.actualAmount}
                                        onChange={(e) => setFormData({ ...formData, actualAmount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Planned & Actual Quantities */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Planned Quantity
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.plannedQuantity}
                                    onChange={(e) => setFormData({ ...formData, plannedQuantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Actual Quantity
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.actualQuantity}
                                    onChange={(e) => setFormData({ ...formData, actualQuantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit
                                </label>
                                <Input
                                    placeholder="e.g., Hours, Units, Days"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(`/plandev/strategic-plans/${id}/budget`)}
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
                                        Update Budget Item
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

export default EditBudgetItem;