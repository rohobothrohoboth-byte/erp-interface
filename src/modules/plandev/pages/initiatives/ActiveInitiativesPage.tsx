import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Calendar,
    DollarSign,
    Building2,
    User,
    Eye,
    Edit,
    Loader2,
    RefreshCw,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    FolderKanban,
    Users,
    Target,
    Rocket,
    Zap,
    Award,
    GitBranch, // ← ADD THIS
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
    Cancelled: <XCircle className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
};

const initiativeTypes = [
    { value: 'Strategic', label: 'Strategic Initiative', icon: <Target className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'Operational', label: 'Operational Initiative', icon: <Zap className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'Innovation', label: 'Innovation Initiative', icon: <Award className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-800' },
    { value: 'Improvement', label: 'Improvement Initiative', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const ActiveInitiativesPage = () => {
    const navigate = useNavigate();

    // State
    const [initiatives, setInitiatives] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [expandedInitiative, setExpandedInitiative] = useState<string | null>(null);

    // Fetch active initiatives (projects with status Active, Planning, OnHold)
    const fetchInitiatives = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.search = searchTerm;

            console.log('📡 Fetching active initiatives:', params);
            const data = await getProjects(params);

            // Filter to only show active initiatives
            const activeData = data.filter(p =>
                p.status === 'Active' || p.status === 'Planning' || p.status === 'OnHold'
            );

            setInitiatives(activeData);
            console.log(`✅ Fetched ${activeData.length} active initiatives`);
        } catch (error: any) {
            console.error('Error fetching initiatives:', error);
            showToast.error(error?.response?.data?.message || 'Failed to load initiatives');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchInitiatives();
    }, [fetchInitiatives]);

    // Filter initiatives
    const filteredInitiatives = initiatives.filter(initiative => {
        const matchesType = filterType === 'all' || initiative.projectType === filterType;
        const matchesPriority = filterPriority === 'all' || initiative.priority === filterPriority;
        return matchesType && matchesPriority;
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

    const getInitiativeTypeInfo = (type?: string) => {
        if (!type) return initiativeTypes[0];
        return initiativeTypes.find(t => t.value === type) || initiativeTypes[0];
    };

    const getDaysRemaining = (endDate: string) => {
        try {
            const end = new Date(endDate);
            const now = new Date();
            const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diff;
        } catch {
            return 0;
        }
    };

    // Handle navigation to objectives
    const handleViewObjectives = (initiativeId: string) => {
        console.log('🔍 Navigating to objectives for initiative:', initiativeId);
        navigate(`/plandev/initiatives/${initiativeId}/objectives`);
    };

    if (loading && !initiatives.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading active initiatives...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Rocket className="w-6 h-6 text-emerald-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Active Initiatives</h1>
                    </div>
                    <p className="text-sm text-gray-500">
                        {filteredInitiatives.length} active initiatives • Track and manage ongoing initiatives
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
                    <Button
                        onClick={() => navigate('/plandev/initiatives/create')}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Initiative
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Active</p>
                        <p className="text-2xl font-bold text-gray-900">{filteredInitiatives.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Active</p>
                        <p className="text-2xl font-bold text-green-700">
                            {filteredInitiatives.filter(p => p.status === 'Active').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Planning</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {filteredInitiatives.filter(p => p.status === 'Planning').length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">On Hold</p>
                        <p className="text-2xl font-bold text-yellow-700">
                            {filteredInitiatives.filter(p => p.status === 'OnHold').length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search initiatives by name, code, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
                >
                    <option value="all">All Types</option>
                    {initiativeTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[150px]"
                >
                    <option value="all">All Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>

            {/* Initiative Cards */}
            {filteredInitiatives.length === 0 ? (
                <div className="text-center py-12">
                    <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active initiatives found</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start a new initiative'}
                    </p>
                    <Button
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate('/plandev/initiatives/create')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Start Initiative
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredInitiatives.map((initiative) => {
                        const daysRemaining = getDaysRemaining(initiative.endDate);
                        const isOverdue = daysRemaining < 0 && initiative.status !== 'Completed';
                        const typeInfo = getInitiativeTypeInfo(initiative.projectType);

                        return (
                            <motion.div
                                key={initiative.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/plandev/initiatives/${initiative.id}`)}
                            >
                                <Card className={`hover:shadow-lg transition-shadow border-l-4 ${
                                    initiative.status === 'Active' ? 'border-l-green-500' :
                                        initiative.status === 'Planning' ? 'border-l-blue-500' :
                                            'border-l-yellow-500'
                                }`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                        <FolderKanban className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {initiative.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-500">{initiative.code}</span>
                                                            <Badge className={typeInfo.color}>
                                                                <span className="flex items-center gap-1">
                                                                    {typeInfo.icon}
                                                                    {typeInfo.label}
                                                                </span>
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {initiative.description || 'No description provided'}
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
                                                        {formatDate(initiative.startDate)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <DollarSign className="w-4 h-4" />
                                                        {formatCurrency(initiative.budget)}
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-500">Progress</span>
                                                        <span className="font-medium text-gray-900">
                                                            {initiative.progress}%
                                                            {isOverdue && (
                                                                <span className="text-red-600 text-xs ml-2">
                                                                    ({Math.abs(daysRemaining)} days overdue)
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <Progress value={initiative.progress} className="h-2" />
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                                    <Badge className={priorityColors[initiative.priority]}>
                                                        {initiative.priority} Priority
                                                    </Badge>
                                                    <Badge className={statusColors[initiative.status]}>
                                                        {statusIcons[initiative.status]}
                                                        <span className="ml-1">{initiative.status}</span>
                                                    </Badge>
                                                    {(initiative.taskCount ?? 0) > 0 && (
                                                        <span className="text-xs text-gray-400">
                                                            {initiative.completedTasks || 0}/{initiative.taskCount || 0} tasks
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                {/* ✅ ADDED: Objectives button */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewObjectives(initiative.id);
                                                    }}
                                                >
                                                    <GitBranch className="w-4 h-4 mr-2" />
                                                    Objectives
                                                </Button>
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
                                                    View
                                                </Button>
                                                {initiative.status !== 'Completed' && initiative.status !== 'Cancelled' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/plandev/initiatives/${initiative.id}/edit`);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                )}
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

export default ActiveInitiativesPage;