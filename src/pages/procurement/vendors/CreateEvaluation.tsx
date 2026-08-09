import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Star,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertCircle,
    User,
    Calendar,
    Building2,
    Loader2,
    Plus,
    Trash2,
    X,
    FileText,
    Award,
    Users
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { showToast } from '../../../layout/layout';
import { useAuthStore } from '../../../stores/auth.store';
import { getVendors } from '../../../services/procurement/vendor.api';
import { createVendorEvaluation } from '../../../services/procurement/vendorEvaluation.api';

import type{ EvaluationCriteria } from '../../../services/procurement/vendorEvaluation.api';

// ============================================================
// CONSTANTS
// ============================================================

const CRITERIA_TEMPLATES = [
    { name: 'Quality', maxScore: 50, weight: 50 },
    { name: 'Delivery', maxScore: 30, weight: 30 },
    { name: 'Price', maxScore: 20, weight: 20 },
    { name: 'Customer Service', maxScore: 20, weight: 20 },
    { name: 'Technical Capability', maxScore: 30, weight: 30 },
    { name: 'Communication', maxScore: 15, weight: 15 },
    { name: 'Compliance', maxScore: 25, weight: 25 },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const CreateEvaluation = () => {
    const navigate = useNavigate();
    const { userId, userName } = useAuthStore();

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [formData, setFormData] = useState({
        vendorId: '',
        category: '',
        evaluationDate: new Date().toISOString().split('T')[0],
        evaluator: userName || '',
        notes: ''
    });
    const [criteria, setCriteria] = useState<EvaluationCriteria[]>([
        { name: 'Quality', score: 0, maxScore: 50, weight: 50 },
        { name: 'Delivery', score: 0, maxScore: 30, weight: 30 },
        { name: 'Price', score: 0, maxScore: 20, weight: 20 }
    ]);
    const [strengths, setStrengths] = useState<string[]>(['']);
    const [weaknesses, setWeaknesses] = useState<string[]>(['']);
    const [recommendations, setRecommendations] = useState<string[]>(['']);

    // Fetch vendors
    const fetchVendors = useCallback(async () => {
        setLoadingVendors(true);
        try {
            const data = await getVendors({ status: 'Active' });
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            showToast.error('Failed to load vendors');
        } finally {
            setLoadingVendors(false);
        }
    }, []);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    // Auto-calculate score
    const getScoreColor = (score: number, maxScore: number) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressColor = (score: number, maxScore: number) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-blue-500';
        if (percentage >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Add/Remove items
    const addItem = (type: 'strength' | 'weakness' | 'recommendation') => {
        const setters = {
            strength: setStrengths,
            weakness: setWeaknesses,
            recommendation: setRecommendations
        };
        setters[type](prev => [...prev, '']);
    };

    const removeItem = (type: 'strength' | 'weakness' | 'recommendation', index: number) => {
        const setters = {
            strength: setStrengths,
            weakness: setWeaknesses,
            recommendation: setRecommendations
        };
        const arrays = {
            strength: strengths,
            weakness: weaknesses,
            recommendation: recommendations
        };
        if (arrays[type].length > 1) {
            setters[type](prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateItem = (type: 'strength' | 'weakness' | 'recommendation', index: number, value: string) => {
        const setters = {
            strength: setStrengths,
            weakness: setWeaknesses,
            recommendation: setRecommendations
        };
        setters[type](prev => prev.map((item, i) => i === index ? value : item));
    };

    // Add criteria
    const addCriteria = () => {
        const template = CRITERIA_TEMPLATES.find(c =>
            !criteria.some(cc => cc.name === c.name)
        );
        if (template) {
            setCriteria([...criteria, { ...template, score: 0 }]);
        } else {
            setCriteria([...criteria, { name: '', score: 0, maxScore: 20, weight: 20 }]);
        }
    };

    const removeCriteria = (index: number) => {
        if (criteria.length > 1) {
            setCriteria(criteria.filter((_, i) => i !== index));
        }
    };

    const updateCriteria = (index: number, field: keyof EvaluationCriteria, value: any) => {
        setCriteria(prev => prev.map((c, i) =>
            i === index ? { ...c, [field]: value } : c
        ));
    };

    // Calculate overall score
    const calculateOverallScore = (): number => {
        const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
        if (totalWeight === 0) return 0;
        const weightedSum = criteria.reduce((sum, c) => sum + (c.score / c.maxScore) * c.weight * 100, 0);
        return Math.round(weightedSum / totalWeight);
    };

    // Get status
    const getStatus = (score: number): string => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Average';
        return 'Poor';
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.vendorId) {
            showToast.error('Please select a vendor');
            return;
        }

        // Validate criteria
        const invalidCriteria = criteria.filter(c => !c.name.trim() || c.score < 0 || c.score > c.maxScore);
        if (invalidCriteria.length > 0) {
            showToast.error('Please fill all criteria correctly');
            return;
        }

        const overallScore = calculateOverallScore();

        const payload = {
            vendorId: formData.vendorId,
            category: formData.category || undefined,
            evaluationDate: new Date(formData.evaluationDate).toISOString(),
            evaluator: formData.evaluator || undefined,
            criteria: criteria,
            strengths: strengths.filter(s => s.trim()),
            weaknesses: weaknesses.filter(w => w.trim()),
            recommendations: recommendations.filter(r => r.trim()),
            notes: formData.notes || undefined
        };

        setIsLoading(true);
        try {
            const response = await createVendorEvaluation(payload);
            console.log('✅ Evaluation created:', response);
            showToast.success(`Evaluation created: ${getStatus(overallScore)} (${overallScore}%)`);
            navigate('/procurement/vendors/evaluation');
        } catch (error: any) {
            console.error('Error creating evaluation:', error);
            showToast.error(error?.response?.data?.message || 'Failed to create evaluation');
        } finally {
            setIsLoading(false);
        }
    };

    const overallScore = calculateOverallScore();
    const status = getStatus(overallScore);
    const statusColors = {
        Excellent: 'text-green-600',
        Good: 'text-blue-600',
        Average: 'text-yellow-600',
        Poor: 'text-red-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/procurement/vendor-evaluation')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New Vendor Evaluation</h1>
                    <p className="text-sm text-gray-500">Evaluate vendor performance</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vendor & Basic Info */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    Basic Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Vendor *</Label>
                                        {loadingVendors ? (
                                            <div className="flex items-center gap-2 p-2 border rounded-lg">
                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                                <span className="text-sm text-gray-500">Loading vendors...</span>
                                            </div>
                                        ) : (
                                            <Select
                                                value={formData.vendorId}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select vendor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vendors.map((vendor) => (
                                                        <SelectItem key={vendor.id} value={vendor.id}>
                                                            {vendor.code} - {vendor.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Category</Label>
                                            <Input
                                                placeholder="e.g., IT Equipment, Logistics"
                                                value={formData.category}
                                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Evaluation Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.evaluationDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, evaluationDate: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Evaluator</Label>
                                        <Input
                                            placeholder="Name of evaluator"
                                            value={formData.evaluator}
                                            onChange={(e) => setFormData(prev => ({ ...prev, evaluator: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Criteria */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        Evaluation Criteria
                                    </h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addCriteria}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Criteria
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {criteria.map((criterion, index) => (
                                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-4 gap-3">
                                                <div className="col-span-2">
                                                    <Label className="text-xs text-gray-500">Name</Label>
                                                    <Input
                                                        value={criterion.name}
                                                        onChange={(e) => updateCriteria(index, 'name', e.target.value)}
                                                        placeholder="Criteria name"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Score</Label>
                                                    <Input
                                                        type="number"
                                                        value={criterion.score || ''}
                                                        onChange={(e) => updateCriteria(index, 'score', parseInt(e.target.value) || 0)}
                                                        min="0"
                                                        max={criterion.maxScore}
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Max Score</Label>
                                                    <Input
                                                        type="number"
                                                        value={criterion.maxScore || ''}
                                                        onChange={(e) => updateCriteria(index, 'maxScore', parseInt(e.target.value) || 0)}
                                                        min="1"
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="text-xs text-gray-500">Weight: {criterion.weight}%</span>
                                                    <div className="flex-1 max-w-xs">
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full ${getProgressColor(criterion.score, criterion.maxScore)}`}
                                                                style={{ width: `${(criterion.score / criterion.maxScore) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs font-medium ${getScoreColor(criterion.score, criterion.maxScore)}`}>
                                                        {Math.round((criterion.score / criterion.maxScore) * 100)}%
                                                    </span>
                                                </div>
                                                {criteria.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => removeCriteria(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Overall Score:</span>
                                        <span className={`text-2xl font-bold ${statusColors[status as keyof typeof statusColors] || 'text-gray-900'}`}>
                                            {overallScore}% ({status})
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Strengths, Weaknesses, Recommendations */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Analysis</h3>

                                {/* Strengths */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-sm font-medium text-green-700 flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            Strengths
                                        </Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => addItem('strength')}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {strengths.map((strength, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={strength}
                                                onChange={(e) => updateItem('strength', index, e.target.value)}
                                                placeholder={`Strength ${index + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => removeItem('strength', index)}
                                                disabled={strengths.length === 1}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Weaknesses */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-sm font-medium text-red-700 flex items-center gap-1">
                                            <TrendingDown className="w-4 h-4" />
                                            Weaknesses
                                        </Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => addItem('weakness')}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {weaknesses.map((weakness, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={weakness}
                                                onChange={(e) => updateItem('weakness', index, e.target.value)}
                                                placeholder={`Weakness ${index + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => removeItem('weakness', index)}
                                                disabled={weaknesses.length === 1}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                                            <FileText className="w-4 h-4" />
                                            Recommendations
                                        </Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => addItem('recommendation')}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={rec}
                                                onChange={(e) => updateItem('recommendation', index, e.target.value)}
                                                placeholder={`Recommendation ${index + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => removeItem('recommendation', index)}
                                                disabled={recommendations.length === 1}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardContent className="p-6">
                                <Label>Notes</Label>
                                <textarea
                                    rows={3}
                                    placeholder="Additional notes or comments..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mt-1"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Create Evaluation
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/procurement/vendors/evaluation')}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Vendor</span>
                                        <span className="font-medium">
                                            {vendors.find(v => v.id === formData.vendorId)?.name || 'Not selected'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Category</span>
                                        <span className="font-medium">{formData.category || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Evaluator</span>
                                        <span className="font-medium">{formData.evaluator || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="text-gray-500 font-medium">Overall Score</span>
                                        <span className={`font-bold ${statusColors[status as keyof typeof statusColors] || 'text-gray-900'}`}>
                                            {overallScore}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className={`font-medium ${statusColors[status as keyof typeof statusColors] || 'text-gray-900'}`}>
                                            {status}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default CreateEvaluation;