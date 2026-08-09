import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Rocket,
    Loader2,
    Calendar,
    User,
    Tag,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Building2,
    Shield,
    Award,
    Flag,
    Target
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { showToast } from '../../../layout/layout';
import { motion } from 'framer-motion';
import { getProjectById, deleteProject } from '../../../services/plandev/project.api';
import type { Project } from '../../../types/plandev/types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Planning: 'bg-blue-100 text-blue-800 border-blue-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    OnHold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Completed: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Planning: <Clock className="w-4 h-4" />,
    Active: <Rocket className="w-4 h-4" />,
    OnHold: <AlertCircle className="w-4 h-4" />,
    Completed: <CheckCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const InitiativeDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Project | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) {
            setError('No initiative ID provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log(`📡 Fetching initiative with ID: ${id}`);
            const result = await getProjectById(id);
            setData(result);
            console.log('✅ Initiative data loaded:', result);
        } catch (error: any) {
            console.error('❌ Error fetching initiative:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load initiative';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (!data) return;
        if (!confirm(`Are you sure you want to delete "${data.name}"? This action cannot be undone.`)) return;

        try {
            setLoading(true);
            await deleteProject(data.id);
            showToast.success('Initiative deleted successfully!');
            navigate('/plandev/initiatives/active');
        } catch (error: any) {
            console.error('❌ Error deleting initiative:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete initiative');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <AlertCircle className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading initiative...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'Initiative not found'}</p>
                <Button
                    className="mt-4"
                    onClick={() => navigate('/plandev/initiatives/active')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Initiatives
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-5xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/plandev/initiatives/active')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{data.code}</span>
                            {getStatusBadge(data.status)}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/plandev/initiatives/${data.id}/edit`)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{data.progress}%</p>
                        <Progress value={data.progress} className="h-1.5 mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.budget)}</p>
                        <p className="text-xs text-gray-400">Actual: {formatCurrency(data.actualCost)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{data.taskCount}</p>
                        <p className="text-xs text-gray-400">{data.completedTasks} completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Milestones</p>
                        <p className="text-2xl font-bold text-gray-900">{data.milestoneCount}</p>
                        <p className="text-xs text-gray-400">{data.achievedMilestones} achieved</p>
                    </CardContent>
                </Card>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Tag className="w-4 h-4" />
                            Priority
                        </div>
                        <Badge className={priorityColors[data.priority] || 'bg-gray-100 text-gray-800'}>
                            {data.priority}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Building2 className="w-4 h-4" />
                            Department
                        </div>
                        <p className="font-medium">{data.department || 'N/A'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <User className="w-4 h-4" />
                            Manager
                        </div>
                        <p className="font-medium">{data.managerName || 'Unassigned'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            Start Date
                        </div>
                        <p className="font-medium">{formatDate(data.startDate)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            End Date
                        </div>
                        <p className="font-medium">{formatDate(data.endDate)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <User className="w-4 h-4" />
                            Sponsor
                        </div>
                        <p className="font-medium">{data.sponsorName || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-emerald-600" />
                        Description
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">{data.description || 'No description provided'}</p>
                </CardContent>
            </Card>

            {/* ✅ CORRECTED Action Buttons - Only Initiative-specific items */}
            <div className="flex flex-wrap gap-3 mt-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/plandev/initiatives/${data.id}/milestones`)}
                >
                    <Award className="w-4 h-4 mr-2" />
                    View Milestones
                </Button>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/plandev/initiatives/${data.id}/tasks`)}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    View Tasks
                </Button>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/plandev/initiatives/${data.id}/budget`)}
                >
                    <DollarSign className="w-4 h-4 mr-2" />
                    View Budget
                </Button>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/plandev/initiatives/${data.id}/risks`)}
                >
                    <Shield className="w-4 h-4 mr-2" />
                    View Risks
                </Button>
            </div>

            {/* ℹ️ Info section about Strategic Plan */}
            <Card className="mt-6 border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Target className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-purple-800">Initiative Execution</h4>
                            <p className="text-sm text-purple-700 mt-1">
                                This initiative is executing a <strong>Strategic Plan</strong>.
                                Track progress through <strong>Milestones</strong>, <strong>Tasks</strong>,
                                <strong>Budget</strong>, and <strong>Risks</strong>.
                            </p>
                            <Button
                                variant="link"
                                className="text-purple-700 p-0 mt-2"
                                onClick={() => navigate('/plandev/strategic-plans')}
                            >
                                View Strategic Plans →
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default InitiativeDetail;