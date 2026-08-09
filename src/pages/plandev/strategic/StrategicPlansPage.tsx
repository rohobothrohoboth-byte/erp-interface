import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Calendar,
    Clock,
    AlertCircle,
    XCircle,
    Eye,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    Target,
    Flag,
    Trophy,
    Rocket,
    Zap,
    Sparkles,
    Crown,
    Layers,
    User,
    Building2,
    DollarSign,
    Download,
    FileText,
    FileSpreadsheet,
    File,
    X,
    ChevronDown,
    ChevronRight,
    Printer,
    Filter,
    FolderTree
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { showToast } from '../../../layout/layout';
import { getProjects, deleteProject } from '../../../services/plandev/project.api';
import type { Project } from '../../../types/plandev/types';

// ============================================================
// STRATEGIC PLAN CONFIGURATIONS
// ============================================================

const planTypeColors: Record<string, string> = {
    'Corporate': 'bg-purple-100 text-purple-800 border-purple-200',
    'Business': 'bg-blue-100 text-blue-800 border-blue-200',
    'Functional': 'bg-green-100 text-green-800 border-green-200',
    'Operational': 'bg-orange-100 text-orange-800 border-orange-200',
    'Innovation': 'bg-pink-100 text-pink-800 border-pink-200',
    'Strategic': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Tactical': 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const planTypeIcons: Record<string, React.ReactNode> = {
    'Corporate': <Crown className="w-4 h-4" />,
    'Business': <Building2 className="w-4 h-4" />,
    'Functional': <Layers className="w-4 h-4" />,
    'Operational': <Zap className="w-4 h-4" />,
    'Innovation': <Sparkles className="w-4 h-4" />,
    'Strategic': <Target className="w-4 h-4" />,
    'Tactical': <Flag className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
    'Planning': 'bg-blue-100 text-blue-800 border-blue-200',
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'OnHold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Completed': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    'Planning': <Clock className="w-4 h-4" />,
    'Active': <Rocket className="w-4 h-4" />,
    'OnHold': <AlertCircle className="w-4 h-4" />,
    'Completed': <Trophy className="w-4 h-4" />,
    'Cancelled': <XCircle className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-blue-100 text-blue-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
    'Planning': 'Planning',
    'Active': 'Active',
    'OnHold': 'On Hold',
    'Completed': 'Completed',
    'Cancelled': 'Cancelled',
};
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

const getPlanStatusBadge = (status: string) => {
    const displayStatus = statusLabels[status] || status;
    return (
        <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
            {statusIcons[status] || <Flag className="w-4 h-4" />}
            <span>{displayStatus}</span>
        </Badge>
    );
};

const getPlanTypeBadge = (type?: string) => {
    if (!type) return null;
    const colors = planTypeColors[type] || 'bg-gray-100 text-gray-800';
    const icon = planTypeIcons[type] || <Flag className="w-3 h-3" />;
    return (
        <Badge className={`${colors} flex items-center gap-1`}>
            {icon}
            <span>{type}</span>
        </Badge>
    );
};

// ============================================================
// TREE NODE COMPONENT
// ============================================================

// Helper to filter children - ONLY show Operational/Tactical/Functional children
const filterChildren = (children: Project[], parentId: string): Project[] => {
    return children.filter(c =>
        c.id !== parentId &&
        c.projectType !== 'Strategic' &&   // Exclude Strategic plans
        c.projectType !== 'Corporate' &&    // Exclude Corporate plans
        c.projectType !== 'Business'        // Exclude Business plans
    );
};

// ============================================================
// TREE NODE COMPONENT
// ============================================================

interface TreeNodeProps {
    plan: Project;
    level: number;
    children: Project[];
    expanded: boolean;
    onToggle: () => void;
    onNavigate: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (plan: Project) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
                                               plan,
                                               level,
                                               children,
                                               expanded,
                                               onToggle,
                                               onNavigate,
                                               onEdit,
                                               onDelete
                                           }) => {
    // ✅ Determine if this is a strategic plan (parent)
    const isStrategic = plan.projectType === 'Strategic' ||
        plan.projectType === 'Corporate' ||
        plan.projectType === 'Business';

    // ✅ Only show children if this is a strategic plan AND it has children
    const hasChildren = isStrategic && children.length > 0;

    return (
        <div>
            <div
                className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer
                    hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                    ${isStrategic ? 'border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10' : ''}
                `}
                style={{ paddingLeft: `${level * 24 + 12}px` }}
                onClick={() => onNavigate(plan.id)}
            >
                {/* Expand/Collapse Button - Only show for Strategic plans with children */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) onToggle();
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                    disabled={!hasChildren}
                >
                    {hasChildren ? (
                        expanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        )
                    ) : (
                        <div className="w-4 h-4" />
                    )}
                </button>

                {/* Plan Icon */}
                <div className="flex-shrink-0">
                    {isStrategic ? (
                        <Target className="w-5 h-5 text-emerald-600" />
                    ) : (
                        <FolderTree className="w-5 h-5 text-blue-500" />
                    )}
                </div>

                {/* Plan Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${isStrategic ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {plan.name}
                        </span>
                        {isStrategic && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Strategic
                            </Badge>
                        )}
                        {getPlanTypeBadge(plan.projectType)}
                        {getPlanStatusBadge(plan.status)}
                        {plan.department && (
                            <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800">
                                <Building2 className="w-3 h-3 mr-1" />
                                {plan.department}
                            </Badge>
                        )}
                    </div>
                    {plan.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {plan.description}
                        </p>
                    )}
                </div>

                {/* Progress & Budget - Only show for non-strategic plans or summary for strategic */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-20">
                        <Progress value={plan.progress || 0} className="h-2" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                        {plan.progress || 0}%
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-20 text-right">
                        {formatCurrency(plan.budget || 0)}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(plan.id);
                        }}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    {plan.status !== 'Completed' && plan.status !== 'Cancelled' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(plan.id);
                            }}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(plan);
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Children - Only render if expanded AND has children */}
            <AnimatePresence>
                {expanded && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {children.map((child) => (
                            <TreeNode
                                key={child.id}
                                plan={child}
                                level={level + 1}
                                children={[]} // ← Children don't have further children
                                expanded={false}
                                onToggle={() => {}}
                                onNavigate={onNavigate}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



// ============================================================
// MAIN COMPONENT
// ============================================================

const StrategicPlansPage = () => {
    const navigate = useNavigate();

    // State
    const [plans, setPlans] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'tree' | 'cards' | 'table'>('tree');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Fetch strategic plans
    const fetchPlans = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📡 Fetching strategic plans...');

            const params: any = {};
            if (searchTerm) params.search = searchTerm;

            const data = await getProjects(params);
            const projectsArray = Array.isArray(data) ? data : [];

            if (projectsArray.length === 0) {
                setPlans([]);
                setLoading(false);
                return;
            }

            const strategicTypes = ['Strategic', 'Corporate', 'Business', 'Functional', 'Operational', 'Innovation', 'Tactical'];

            const strategicData = projectsArray.filter(p => {
                const isStrategicType = p.projectType && strategicTypes.includes(p.projectType);
                const isHighPriorityActive = (p.priority === 'High' || p.priority === 'Critical') &&
                    (p.status === 'Active' || p.status === 'Planning');
                return isStrategicType || isHighPriorityActive;
            });

            console.log(`✅ Found ${strategicData.length} strategic plans`);
            setPlans(strategicData);
        } catch (error: any) {
            console.error('❌ Error fetching strategic plans:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load strategic plans';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm]);

    // Initial load
    useEffect(() => {
        fetchPlans();
    }, []);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                fetchPlans();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Filter plans
    const filteredPlans = plans.filter(plan => {
        const matchesType = filterType === 'all' || plan.projectType === filterType;
        const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
        const matchesDepartment = filterDepartment === 'all' ||
            (plan.department && plan.department.toLowerCase() === filterDepartment.toLowerCase());
        return matchesType && matchesStatus && matchesDepartment;
    });

    // Group plans by strategic plan
    const strategicPlans = filteredPlans.filter(p => p.projectType === 'Strategic');
    const operationalPlans = filteredPlans.filter(p => p.projectType !== 'Strategic');

    // Handle delete
    const handleDeleteClick = (plan: Project) => {
        setPlanToDelete(plan);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!planToDelete) return;

        setIsDeleting(true);
        try {
            await deleteProject(planToDelete.id);
            showToast.success(`"${planToDelete.name}" deleted successfully!`);
            setShowDeleteModal(false);
            setPlanToDelete(null);
            await fetchPlans();
        } catch (error: any) {
            console.error('❌ Error deleting strategic plan:', error);
            showToast.error(error?.response?.data?.message || 'Failed to delete strategic plan');
        } finally {
            setIsDeleting(false);
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

    const getPlanStatusBadge = (status: string) => {
        const displayStatus = statusLabels[status] || status;
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <Flag className="w-4 h-4" />}
                <span>{displayStatus}</span>
            </Badge>
        );
    };

    const getPlanTypeBadge = (type?: string) => {
        if (!type) return null;
        const colors = planTypeColors[type] || 'bg-gray-100 text-gray-800';
        const icon = planTypeIcons[type] || <Flag className="w-3 h-3" />;
        return (
            <Badge className={`${colors} flex items-center gap-1`}>
                {icon}
                <span>{type}</span>
            </Badge>
        );
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'text-green-600';
        if (progress >= 50) return 'text-blue-600';
        if (progress >= 25) return 'text-yellow-600';
        return 'text-gray-600';
    };

    // Get unique departments for filter dropdown
    const departments = Array.from(new Set(plans.map(p => p.department).filter(Boolean)));

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading strategic plans...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Failed to load strategic plans</p>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                    <Button
                        className="mt-4"
                        onClick={() => fetchPlans()}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 p-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-6 h-6 text-emerald-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Strategic Plans</h1>
                            <Badge className="bg-emerald-100 text-emerald-700 ml-2">
                                {strategicPlans.length}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                            {strategicPlans.length} strategic plans • {operationalPlans.length} initiatives
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => {
                                setRefreshing(true);
                                fetchPlans();
                            }}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setViewMode(viewMode === 'tree' ? 'cards' : viewMode === 'cards' ? 'table' : 'tree')}
                        >
                            {viewMode === 'tree' ? 'Cards' : viewMode === 'cards' ? 'Table' : 'Tree'}
                        </Button>
                        <Button
                            onClick={() => navigate('/plandev/strategic-plans/create')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Strategic Plan
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-purple-600 font-medium">Active Plans</p>
                            <p className="text-xl font-bold text-purple-700">
                                {strategicPlans.filter(p => p.status === 'Active').length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-blue-600 font-medium">In Progress</p>
                            <p className="text-xl font-bold text-blue-700">
                                {operationalPlans.filter(p => p.progress > 0 && p.progress < 100).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-green-600 font-medium">Completed</p>
                            <p className="text-xl font-bold text-green-700">
                                {filteredPlans.filter(p => p.status === 'Completed' || p.progress === 100).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-yellow-600 font-medium">Total Budget</p>
                            <p className="text-xl font-bold text-yellow-700">
                                {formatCurrency(filteredPlans.reduce((acc, p) => acc + (p.budget || 0), 0))}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search strategic plans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px] bg-white"
                    >
                        <option value="all">All Types</option>
                        {Array.from(new Set(plans.map(p => p.projectType).filter(Boolean))).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px] bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="OnHold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px] bg-white"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    {(filterType !== 'all' || filterStatus !== 'all' || filterDepartment !== 'all' || searchTerm) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterType('all');
                                setFilterStatus('all');
                                setFilterDepartment('all');
                                setSearchTerm('');
                            }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Plans Display - Tree View */}
                {viewMode === 'tree' ? (
                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                {strategicPlans.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No strategic plans found</p>
                                        <Button
                                            className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={() => navigate('/plandev/strategic-plans/create')}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Strategic Plan
                                        </Button>
                                    </div>
                                ) : (
                                    strategicPlans.map((plan) => {
                                        // Find children for this strategic plan
                                        const children = operationalPlans.filter(p =>
                                            p.projectType === 'Operational' ||
                                            p.projectType === 'Tactical' ||
                                            p.projectType === 'Functional'
                                        );

                                        // Get the code from the strategic plan to match with children
                                        const strategicCode = plan.code;
                                        const matchingChildren = children.filter(c =>
                                            c.code && c.code.startsWith(strategicCode?.split('-')[0] || '')
                                        );

                                        return (
                                            <TreeNode
                                                key={plan.id}
                                                plan={plan}
                                                level={0}
                                                children={matchingChildren}
                                                expanded={expandedNodes.has(plan.id)}
                                                onToggle={() => {
                                                    const newSet = new Set(expandedNodes);
                                                    if (newSet.has(plan.id)) {
                                                        newSet.delete(plan.id);
                                                    } else {
                                                        newSet.add(plan.id);
                                                    }
                                                    setExpandedNodes(newSet);
                                                }}
                                                onNavigate={(id) => navigate(`/plandev/strategic-plans/${id}`)}
                                                onEdit={(id) => navigate(`/plandev/strategic-plans/${id}/edit`)}
                                                onDelete={handleDeleteClick}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredPlans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/plandev/strategic-plans/${plan.id}`)}
                            >
                                <Card className="h-full hover:shadow-xl transition-all duration-300 border-t-4 border-t-emerald-500">
                                    <CardContent className="p-6">
                                        {/* Card content same as before */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {plan.name}
                                                    </h3>
                                                    {getPlanTypeBadge(plan.projectType)}
                                                    {getPlanStatusBadge(plan.status)}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {plan.description || 'No description provided'}
                                                </p>
                                                {/* ... rest of card content ... */}
                                            </div>
                                            {/* ... actions ... */}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // Table View
                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Plan</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Department</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Progress</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Budget</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredPlans.map((plan) => (
                                    <tr
                                        key={plan.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/plandev/strategic-plans/${plan.id}`)}
                                    >
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{plan.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{plan.description || 'No description'}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getPlanTypeBadge(plan.projectType)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getPlanStatusBadge(plan.status)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {plan.department || 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Progress value={plan.progress || 0} className="w-24 h-1.5" />
                                                <span className="text-sm font-medium">{plan.progress || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {formatCurrency(plan.budget || 0)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plandev/strategic-plans/${plan.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plandev/strategic-plans/${plan.id}/edit`);
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
                                                        handleDeleteClick(plan);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            {/* Delete Modal */}
            {showDeleteModal && planToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Delete Plan</h2>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete <strong>"{planToDelete.name}"</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setPlanToDelete(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StrategicPlansPage;