import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Search,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Target,
    Flag,
    Award,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Download,
    FileText
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { showToast } from '../../../layout/layout';
import { getProjectById } from '../../../services/plandev/project.api';
import type { Project, Milestone } from '../../../types/plandev/types';

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
    Missed: <XCircle className="w-4 h-4" />,
    Cancelled: <AlertCircle className="w-4 h-4" />,
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

const MilestonesPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [project, setProject] = useState<Project | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Fetch project and milestones
    const fetchData = useCallback(async () => {
        if (!id) {
            setError('No project ID provided');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log(`📡 Fetching project with ID: ${id}`);
            const data = await getProjectById(id);
            setProject(data);
            setMilestones(data.milestones || []);
            console.log('✅ Milestones loaded:', data.milestones?.length || 0);
        } catch (error: any) {
            console.error('Error fetching milestones:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load milestones';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter milestones
    const filteredMilestones = milestones.filter(milestone => {
        const matchesSearch = milestone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (milestone.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || milestone.status === filterStatus;
        const matchesType = filterType === 'all' || milestone.milestoneType === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
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

    const getMilestoneTypeIcon = (type?: string) => {
        switch(type) {
            case 'Phase': return <Flag className="w-4 h-4" />;
            case 'Deliverable': return <FileText className="w-4 h-4" />;
            case 'Review': return <Eye className="w-4 h-4" />;
            case 'Approval': return <CheckCircle className="w-4 h-4" />;
            default: return <Target className="w-4 h-4" />;
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

    const getMilestoneStatus = (milestone: Milestone) => {
        if (milestone.status === 'Achieved') {
            return { label: 'Achieved', color: 'text-green-600' };
        }
        if (milestone.status === 'Missed') {
            return { label: 'Missed', color: 'text-red-600' };
        }
        if (milestone.status === 'Cancelled') {
            return { label: 'Cancelled', color: 'text-gray-600' };
        }

        const daysUntil = getDaysUntilTarget(milestone.targetDate);
        if (daysUntil < 0) {
            return { label: 'Overdue', color: 'text-red-600' };
        }
        if (daysUntil < 7) {
            return { label: 'Due Soon', color: 'text-yellow-600' };
        }
        return { label: 'On Track', color: 'text-blue-600' };
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading milestones...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !project) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{error || 'Project not found'}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/plandev/initiatives/active')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Initiatives
                </Button>
            </div>
        );
    }

    const stats = {
        total: milestones.length,
        achieved: milestones.filter(m => m.status === 'Achieved').length,
        pending: milestones.filter(m => m.status === 'Pending').length,
        missed: milestones.filter(m => m.status === 'Missed').length,
        critical: milestones.filter(m => m.isCritical).length,
        completionRate: milestones.length > 0
            ? Math.round((milestones.filter(m => m.status === 'Achieved').length / milestones.length) * 100)
            : 0
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/plandev/initiatives/${id}`)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
                        <p className="text-sm text-gray-500">
                            {project.name} • {milestones.length} milestones
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setRefreshing(true);
                            fetchData();
                        }}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                    >
                        {viewMode === 'list' ? 'Grid View' : 'List View'}
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate(`/plandev/initiatives/${id}/milestones/create`)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Milestone
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-3">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-green-600">Achieved</p>
                        <p className="text-xl font-bold text-green-700">{stats.achieved}</p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-yellow-600">Pending</p>
                        <p className="text-xl font-bold text-yellow-700">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-red-600">Missed</p>
                        <p className="text-xl font-bold text-red-700">{stats.missed}</p>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-purple-600">Completion</p>
                        <p className="text-xl font-bold text-purple-700">{stats.completionRate}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline Progress */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Milestone Progress</span>
                        <span className="text-sm font-medium text-gray-900">{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search milestones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px]"
                >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Achieved">Achieved</option>
                    <option value="Missed">Missed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px]"
                >
                    <option value="all">All Types</option>
                    <option value="Phase">Phase</option>
                    <option value="Deliverable">Deliverable</option>
                    <option value="Review">Review</option>
                    <option value="Approval">Approval</option>
                </select>
            </div>

            {/* Milestones List */}
            {filteredMilestones.length === 0 ? (
                <div className="text-center py-12">
                    <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No milestones found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first milestone'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate(`/plandev/initiatives/${id}/milestones/create`)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Milestone
                    </Button>
                </div>
            ) : viewMode === 'list' ? (
                <div className="space-y-3">
                    {filteredMilestones.map((milestone) => {
                        const status = getMilestoneStatus(milestone);
                        const daysUntil = getDaysUntilTarget(milestone.targetDate);
                        const isOverdue = daysUntil < 0 && milestone.status === 'Pending';

                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/plandev/initiatives/${id}/milestones/${milestone.id}`)}
                            >
                                <Card className={`hover:shadow-md transition-shadow border-l-4 ${
                                    milestone.status === 'Achieved' ? 'border-l-green-500' :
                                        milestone.status === 'Missed' ? 'border-l-red-500' :
                                            milestone.isCritical ? 'border-l-purple-500' :
                                                'border-l-blue-500'
                                }`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {milestone.name}
                                                    </h4>
                                                    {milestone.isCritical && (
                                                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                                                            Critical
                                                        </Badge>
                                                    )}
                                                    {getStatusBadge(milestone.status)}
                                                </div>

                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Target: {formatDate(milestone.targetDate)}
                                                        {milestone.status === 'Pending' && (
                                                            <span className={`ml-1 text-xs ${
                                                                isOverdue ? 'text-red-600' :
                                                                    daysUntil < 7 ? 'text-yellow-600' :
                                                                        'text-gray-500'
                                                            }`}>
                                                                ({isOverdue ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d remaining`})
                                                            </span>
                                                        )}
                                                    </span>
                                                    {milestone.milestoneType && (
                                                        <Badge className={milestoneTypeColors[milestone.milestoneType] || 'bg-gray-100'}>
                                                            {getMilestoneTypeIcon(milestone.milestoneType)}
                                                            <span className="ml-1">{milestone.milestoneType}</span>
                                                        </Badge>
                                                    )}
                                                </div>

                                                {milestone.description && (
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                        {milestone.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className={`text-xs font-medium ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        Progress: {milestone.completionPercentage}%
                                                    </span>
                                                    {milestone.achievedDate && (
                                                        <span className="text-xs text-green-600">
                                                            Achieved: {formatDate(milestone.achievedDate)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-1 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plandev/initiatives/${id}/milestones/${milestone.id}/edit`);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete milestone "${milestone.name}"?`)) {
                                                            showToast.info('Delete functionality coming soon');
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMilestones.map((milestone) => {
                        const status = getMilestoneStatus(milestone);
                        const daysUntil = getDaysUntilTarget(milestone.targetDate);
                        const isOverdue = daysUntil < 0 && milestone.status === 'Pending';

                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/plandev/initiatives/${id}/milestones/${milestone.id}`)}
                            >
                                <Card className={`h-full hover:shadow-md transition-shadow border-t-4 ${
                                    milestone.status === 'Achieved' ? 'border-t-green-500' :
                                        milestone.status === 'Missed' ? 'border-t-red-500' :
                                            milestone.isCritical ? 'border-t-purple-500' :
                                                'border-t-blue-500'
                                }`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getMilestoneTypeIcon(milestone.milestoneType)}
                                                <span className="text-xs text-gray-500">
                                                    {milestone.milestoneType || 'General'}
                                                </span>
                                            </div>
                                            {getStatusBadge(milestone.status)}
                                        </div>

                                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                            {milestone.name}
                                        </h4>

                                        {milestone.isCritical && (
                                            <Badge className="bg-purple-100 text-purple-700 text-xs mb-2">
                                                ⭐ Critical Milestone
                                            </Badge>
                                        )}

                                        {milestone.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {milestone.description}
                                            </p>
                                        )}

                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Target Date</span>
                                                <span className="font-medium">{formatDate(milestone.targetDate)}</span>
                                            </div>
                                            {milestone.status === 'Pending' && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Status</span>
                                                    <span className={`font-medium ${
                                                        isOverdue ? 'text-red-600' :
                                                            daysUntil < 7 ? 'text-yellow-600' :
                                                                'text-green-600'
                                                    }`}>
                                                        {isOverdue ? `${Math.abs(daysUntil)}d overdue` : `${daysUntil}d remaining`}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Progress</span>
                                                <span className="font-medium">{milestone.completionPercentage}%</span>
                                            </div>
                                            {milestone.achievedDate && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Achieved</span>
                                                    <span className="font-medium text-green-600">
                                                        {formatDate(milestone.achievedDate)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <Progress value={milestone.completionPercentage} className="h-1.5" />
                                        </div>

                                        <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                                            <span className={`text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default MilestonesPage;