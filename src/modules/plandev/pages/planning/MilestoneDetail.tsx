import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Award,
    Loader2,
    Calendar,
    User,
    XCircle,
    Tag,
    AlertCircle,
    CheckCircle,
    Clock,
    Flag,
    Target
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { showToast } from '@/shared/layout/layout';
import { motion } from 'framer-motion';
import { getProjectById } from '@/modules/plandev/services/project.api';
import type { Project, Milestone } from '@/modules/plandev/types/types';

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Achieved: 'bg-green-100 text-green-800 border-green-200',
    Missed: 'bg-red-100 text-red-800 border-red-200',
    Cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Pending: <Clock className="w-4 h-4" />,
    Achieved: <CheckCircle className="w-4 h-4" />,
    Missed: <AlertCircle className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
};

const milestoneTypeColors: Record<string, string> = {
    Phase: 'bg-purple-100 text-purple-800',
    Deliverable: 'bg-blue-100 text-blue-800',
    Review: 'bg-orange-100 text-orange-800',
    Approval: 'bg-emerald-100 text-emerald-800',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const MilestoneDetail = () => {
    const navigate = useNavigate();
    const { id, milestoneId } = useParams<{ id: string; milestoneId: string }>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [milestone, setMilestone] = useState<Milestone | null>(null);

    // Fetch project and find the milestone
    const fetchData = useCallback(async () => {
        if (!id || !milestoneId) {
            setError('Missing required parameters');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log(`📡 Fetching project with ID: ${id}`);
            const result = await getProjectById(id);
            setProject(result);

            // Find the milestone from the project's milestones
            const foundMilestone = result.milestones?.find(m => m.id === milestoneId);

            if (foundMilestone) {
                setMilestone(foundMilestone);
                console.log('✅ Milestone found:', foundMilestone);
            } else {
                setError('Milestone not found');
            }
        } catch (error: any) {
            console.error('❌ Error fetching milestone:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load milestone';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id, milestoneId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (!milestone) return;
        if (!confirm(`Are you sure you want to delete milestone "${milestone.name}"? This action cannot be undone.`)) return;

        try {
            // Since milestones are managed via the MilestoneController, you would call deleteMilestone API
            // For now, we'll show a toast and navigate back
            showToast.info('Delete functionality: Call deleteMilestone API');
            navigate(`/plandev/initiatives/${id}/milestones`);
        } catch (error: any) {
            console.error('❌ Error deleting milestone:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete milestone');
        }
    };

    const handleAchieve = async () => {
        if (!milestone) return;
        if (milestone.status === 'Achieved') {
            showToast.info('This milestone is already achieved');
            return;
        }

        try {
            // Call achieveMilestone API
            showToast.info('Achieve functionality: Call achieveMilestone API');
            // Refresh data after achievement
            fetchData();
        } catch (error: any) {
            console.error('❌ Error achieving milestone:', error);
            showToast.error(error?.response?.data?.message || 'Failed to achieve milestone');
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

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <AlertCircle className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    const getDaysUntilTarget = (targetDate: string) => {
        if (!targetDate) return 0;
        try {
            const target = new Date(targetDate);
            const now = new Date();
            const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diff;
        } catch {
            return 0;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading milestone...</p>
                </div>
            </div>
        );
    }

    if (error || !milestone) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'Milestone not found'}</p>
                <Button
                    className="mt-4"
                    onClick={() => navigate(`/plandev/initiatives/${id}/milestones`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Milestones
                </Button>
            </div>
        );
    }

    const daysUntil = getDaysUntilTarget(milestone.targetDate);
    const isOverdue = daysUntil < 0 && milestone.status === 'Pending';
    const canAchieve = milestone.status === 'Pending' && !isOverdue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/plandev/initiatives/${id}/milestones`)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{milestone.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">Project: {project?.name}</span>
                            {getStatusBadge(milestone.status)}
                            {milestone.isCritical && (
                                <Badge className="bg-purple-100 text-purple-700">
                                    ⭐ Critical
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canAchieve && (
                        <Button
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={handleAchieve}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Achieved
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/plandev/initiatives/${id}/milestones/${milestone.id}/edit`)}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Tag className="w-4 h-4" />
                            Status
                        </div>
                        {getStatusBadge(milestone.status)}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            Target Date
                        </div>
                        <p className="font-medium">{formatDate(milestone.targetDate)}</p>
                        {milestone.status === 'Pending' && (
                            <p className={`text-xs ${isOverdue ? 'text-red-600' : daysUntil < 7 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days remaining`}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Award className="w-4 h-4" />
                            Type
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={milestoneTypeColors[milestone.milestoneType || ''] || 'bg-gray-100'}>
                                {milestone.milestoneType || 'General'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Target className="w-4 h-4" />
                            Progress
                        </div>
                        <p className="font-medium">{milestone.completionPercentage}%</p>
                        <Progress value={milestone.completionPercentage} className="h-1.5 mt-1" />
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Description
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">{milestone.description || 'No description provided'}</p>
                </CardContent>
            </Card>

            {/* Deliverable */}
            {milestone.deliverable && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Flag className="w-4 h-4 text-gray-500" />
                            Deliverable
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">{milestone.deliverable}</p>
                    </CardContent>
                </Card>
            )}

            {/* Achieved Date */}
            {milestone.achievedDate && (
                <Card className="mt-4 border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            Achievement Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-600 font-medium">{formatDate(milestone.achievedDate)}</p>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/plandev/initiatives/${id}/milestones`)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Milestones
                </Button>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => navigate(`/plandev/initiatives/${id}`)}
                >
                    <Flag className="w-4 h-4 mr-2" />
                    View Initiative
                </Button>
            </div>
        </motion.div>
    );
};

export default MilestoneDetail;