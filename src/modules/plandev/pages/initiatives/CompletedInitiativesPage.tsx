import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Calendar,
    DollarSign,
    Building2,
    User,
    Eye,
    Loader2,
    RefreshCw,
    CheckCircle,
    Award,
    TrendingUp,
    Clock,
    BarChart3,
    FolderKanban,
    Star,
    Trophy,
    Users,
    Target,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { showToast } from '@/shared/layout/layout';
import { getProjects } from '@/modules/plandev/services/project.api';
import type { Project } from '@/modules/plandev/services/project.api';
// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusColors: Record<string, string> = {
    Completed: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Completed: <Trophy className="w-4 h-4" />,
    Cancelled: <Clock className="w-4 h-4" />,
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const CompletedInitiativesPage = () => {
    const navigate = useNavigate();

    // State
    const [initiatives, setInitiatives] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('completionDate');
    const [expandedInitiative, setExpandedInitiative] = useState<string | null>(null);

    // Fetch completed initiatives
    const fetchInitiatives = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {
                status: 'Completed'
            };
            if (searchTerm) params.searchTerm = searchTerm;

            console.log('📡 Fetching completed initiatives:', params);
            const data = await getProjects(params);

            // Filter to only show completed initiatives
            const completedData = data.filter(p => p.status === 'Completed' || p.status === 'Cancelled');

            setInitiatives(completedData);
            console.log(`✅ Fetched ${completedData.length} completed initiatives`);
        } catch (error: any) {
            console.error('Error fetching initiatives:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load completed initiatives');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchInitiatives();
    }, [searchTerm]);

    // Sort initiatives
    const sortedInitiatives = [...initiatives].sort((a, b) => {
        if (sortBy === 'completionDate') {
            return new Date(b.completionDate || b.dateAdd).getTime() - new Date(a.completionDate || a.dateAdd).getTime();
        }
        if (sortBy === 'budget') {
            return b.budget - a.budget;
        }
        if (sortBy === 'progress') {
            return b.progress - a.progress;
        }
        return 0;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

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

    const getCompletionStatus = (initiative: Project) => {
        if (initiative.status === 'Completed') {
            return {
                label: 'Completed Successfully',
                color: 'text-purple-600',
                bgColor: 'bg-purple-100',
                icon: <Trophy className="w-5 h-5 text-purple-600" />
            };
        }
        return {
            label: 'Cancelled',
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            icon: <Clock className="w-5 h-5 text-red-600" />
        };
    };

    if (loading && !initiatives.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading completed initiatives...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-6 h-6 text-purple-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Completed Initiatives</h1>
                    </div>
                    <p className="text-sm text-gray-500">
                        {initiatives.length} completed initiatives • Review and analyze completed projects
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setRefreshing(true);
                            fetchInitiatives();
                        }}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-600">Completed</p>
                        <p className="text-2xl font-bold text-purple-700">
                            {initiatives.filter(p => p.status === 'Completed').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-600">Cancelled</p>
                        <p className="text-2xl font-bold text-red-700">
                            {initiatives.filter(p => p.status === 'Cancelled').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Total Budget</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(initiatives.reduce((acc, p) => acc + p.budget, 0))}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-emerald-600">Avg Duration</p>
                        <p className="text-2xl font-bold text-emerald-700">
                            {initiatives.length > 0
                                ? Math.round(initiatives.reduce((acc, p) => {
                                    const start = new Date(p.startDate);
                                    const end = new Date(p.completionDate || p.endDate);
                                    return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                                }, 0) / initiatives.length)
                                : 0} days
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search completed initiatives..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
                >
                    <option value="completionDate">Sort by Completion Date</option>
                    <option value="budget">Sort by Budget</option>
                    <option value="progress">Sort by Progress</option>
                </select>
            </div>

            {/* Completed Initiative Cards */}
            {sortedInitiatives.length === 0 ? (
                <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed initiatives found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Completed initiatives will appear here once projects are finished
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedInitiatives.map((initiative) => {
                        const completionInfo = getCompletionStatus(initiative);
                        const isExpanded = expandedInitiative === initiative.id;

                        return (
                            <motion.div
                                key={initiative.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/plandev/initiatives/${initiative.id}`)}
                            >
                                <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
                                    initiative.status === 'Completed' ? 'border-l-purple-500' : 'border-l-red-500'
                                }`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${completionInfo.bgColor}`}>
                                                        {completionInfo.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {initiative.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-500">{initiative.code}</span>
                                                            <Badge className={initiative.status === 'Completed'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }>
                                                                {initiative.status}
                                                            </Badge>
                                                            <span className={`text-sm font-medium ${completionInfo.color}`}>
                                                                {completionInfo.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {initiative.description}
                                                </p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <Building2 className="w-4 h-4" />
                                                        {initiative.department || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <User className="w-4 h-4" />
                                                        {initiative.managerName || 'Unassigned'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <Calendar className="w-4 h-4" />
                                                        Completed: {formatDate(initiative.completionDate || initiative.endDate)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <DollarSign className="w-4 h-4" />
                                                        {formatCurrency(initiative.budget)}
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-500">Final Progress</span>
                                                        <span className="font-medium text-gray-900">{initiative.progress}%</span>
                                                    </div>
                                                    <Progress value={initiative.progress} className="h-2" />
                                                </div>

                                                <div className="flex items-center gap-4 mt-3">
                                                    {initiative.taskCount > 0 && (
                                                        <span className="text-xs text-gray-400">
                                                            {initiative.completedTasks}/{initiative.taskCount} tasks completed
                                                        </span>
                                                    )}
                                                    {initiative.milestoneCount > 0 && (
                                                        <span className="text-xs text-gray-400">
                                                            {initiative.achievedMilestones}/{initiative.milestoneCount} milestones achieved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plandev/initiatives/${initiative.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-emerald-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Export report
                                                        showToast.info('Export functionality coming soon');
                                                    }}
                                                >
                                                    <BarChart3 className="w-4 h-4 mr-2" />
                                                    Export Report
                                                </Button>
                                            </div>
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

export default CompletedInitiativesPage;