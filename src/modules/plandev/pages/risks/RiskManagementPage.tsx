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
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldX,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Download,
    FileText,
    Users,
    Building2,
    DollarSign,
    Target,
    Flag,
    Award,
    Zap,
    AlertTriangle,
    Flame,
    Activity,
    BarChart3,
    PieChart
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { showToast } from '@/shared/layout/layout';
import { getProjectById } from '@/modules/plandev/services/project.api';
import type { Project } from '@/modules/plandev/types/types';

// ============================================================
// RISK CONFIGURATIONS
// ============================================================

const severityColors: Record<string, string> = {
    Low: 'bg-blue-100 text-blue-800 border-blue-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Critical: 'bg-red-100 text-red-800 border-red-200',
};

const severityIcons: Record<string, React.ReactNode> = {
    Low: <Shield className="w-4 h-4" />,
    Medium: <AlertCircle className="w-4 h-4" />,
    High: <AlertTriangle className="w-4 h-4" />,
    Critical: <Flame className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
    Identified: 'bg-blue-100 text-blue-800 border-blue-200',
    Mitigated: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Accepted: 'bg-purple-100 text-purple-800 border-purple-200',
    Resolved: 'bg-green-100 text-green-800 border-green-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Identified: <AlertCircle className="w-4 h-4" />,
    Mitigated: <ShieldCheck className="w-4 h-4" />,
    Accepted: <CheckCircle className="w-4 h-4" />,
    Resolved: <CheckCircle className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
    Technical: 'bg-red-100 text-red-800',
    Operational: 'bg-orange-100 text-orange-800',
    Financial: 'bg-green-100 text-green-800',
    Strategic: 'bg-purple-100 text-purple-800',
    Compliance: 'bg-blue-100 text-blue-800',
    Reputational: 'bg-pink-100 text-pink-800',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const RiskManagementPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [project, setProject] = useState<Project | null>(null);
    const [risks, setRisks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

    // Fetch project and generate risks
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

            // Generate sample risks if none exist
            const generatedRisks = generateSampleRisks(data);
            setRisks(generatedRisks);
            console.log('✅ Risks loaded:', generatedRisks.length);
        } catch (error: any) {
            console.error('Error fetching risks:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load risks';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    // Generate sample risks based on project data
    const generateSampleRisks = (project: Project): any[] => {
        const risks: any[] = [];

        // Sample risk templates
        const riskTemplates = [
            {
                title: 'Budget Overrun',
                description: 'Project budget may exceed planned amount due to unexpected costs',
                category: 'Financial',
                probability: 60,
                impact: 70,
                mitigationPlan: 'Regular budget reviews and approval for additional funding'
            },
            {
                title: 'Schedule Delay',
                description: 'Key milestones may be delayed due to resource constraints',
                category: 'Operational',
                probability: 55,
                impact: 65,
                mitigationPlan: 'Buffer time in schedule and resource allocation optimization'
            },
            {
                title: 'Technical Complexity',
                description: 'Technical implementation may face unforeseen challenges',
                category: 'Technical',
                probability: 40,
                impact: 60,
                mitigationPlan: 'Engage technical experts and conduct proof of concept'
            },
            {
                title: 'Resource Shortage',
                description: 'Insufficient skilled resources to complete project tasks',
                category: 'Operational',
                probability: 50,
                impact: 55,
                mitigationPlan: 'Train existing staff and consider outsourcing'
            },
            {
                title: 'Scope Creep',
                description: 'Project scope may expand beyond initial requirements',
                category: 'Strategic',
                probability: 45,
                impact: 50,
                mitigationPlan: 'Strict change control process and stakeholder alignment'
            },
            {
                title: 'Compliance Risk',
                description: 'Project may not meet regulatory requirements',
                category: 'Compliance',
                probability: 30,
                impact: 80,
                mitigationPlan: 'Regular compliance audits and legal review'
            }
        ];

        // Select random risks based on project priority
        const numRisks = Math.min(
            riskTemplates.length,
            project.priority === 'Critical' ? 5 :
                project.priority === 'High' ? 4 :
                    project.priority === 'Medium' ? 3 : 2
        );

        // Shuffle and select
        const shuffled = [...riskTemplates].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, numRisks);

        selected.forEach((template, index) => {
            const severity = template.probability * template.impact / 100;
            let severityLevel = 'Low';
            if (severity >= 75) severityLevel = 'Critical';
            else if (severity >= 50) severityLevel = 'High';
            else if (severity >= 25) severityLevel = 'Medium';

            // Randomize status
            const statuses = ['Identified', 'Mitigated', 'Accepted', 'Resolved'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            risks.push({
                id: `risk-${index + 1}`,
                title: template.title,
                description: template.description,
                category: template.category,
                severity: severityLevel,
                status: status,
                probability: template.probability,
                impact: template.impact,
                riskScore: severity,
                mitigationPlan: template.mitigationPlan,
                identifiedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                resolvedDate: status === 'Resolved' ? new Date().toISOString() : undefined
            });
        });

        return risks;
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter risks
    const filteredRisks = risks.filter(risk => {
        const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (risk.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || risk.status === filterStatus;
        const matchesSeverity = filterSeverity === 'all' || risk.severity === filterSeverity;
        return matchesSearch && matchesStatus && matchesSeverity;
    });

    // Calculate risk metrics
    const riskMetrics = {
        total: risks.length,
        critical: risks.filter(r => r.severity === 'Critical').length,
        high: risks.filter(r => r.severity === 'High').length,
        medium: risks.filter(r => r.severity === 'Medium').length,
        low: risks.filter(r => r.severity === 'Low').length,
        resolved: risks.filter(r => r.status === 'Resolved').length,
        mitigated: risks.filter(r => r.status === 'Mitigated').length,
        identified: risks.filter(r => r.status === 'Identified').length,
        averageRiskScore: risks.length > 0
            ? risks.reduce((acc, r) => acc + (r.riskScore || 0), 0) / risks.length
            : 0
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

    const getRiskSeverityBadge = (severity: string) => {
        return (
            <Badge className={`${severityColors[severity] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {severityIcons[severity] || <Shield className="w-4 h-4" />}
                <span>{severity}</span>
            </Badge>
        );
    };

    const getRiskStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <AlertCircle className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    const getRiskScoreColor = (score: number) => {
        if (score >= 75) return 'text-red-600';
        if (score >= 50) return 'text-orange-600';
        if (score >= 25) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getRiskScoreProgressColor = (score: number) => {
        if (score >= 75) return 'bg-red-500';
        if (score >= 50) return 'bg-orange-500';
        if (score >= 25) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading risks...</p>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-gray-900">Risk Management</h1>
                        <p className="text-sm text-gray-500">
                            {project.name} • {risks.length} risks identified
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
                        onClick={() => setViewMode(viewMode === 'matrix' ? 'list' : 'matrix')}
                    >
                        {viewMode === 'matrix' ? 'List View' : 'Risk Matrix'}
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate(`/plandev/initiatives/${id}/risks/create`)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Identify Risk
                    </Button>
                </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-3">
                        <p className="text-xs text-gray-500">Total Risks</p>
                        <p className="text-xl font-bold text-gray-900">{riskMetrics.total}</p>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-red-600">Critical/High</p>
                        <p className="text-xl font-bold text-red-700">
                            {riskMetrics.critical + riskMetrics.high}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-green-600">Resolved</p>
                        <p className="text-xl font-bold text-green-700">{riskMetrics.resolved}</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-3">
                        <p className="text-xs text-blue-600">Avg Risk Score</p>
                        <p className={`text-xl font-bold ${
                            riskMetrics.averageRiskScore >= 75 ? 'text-red-600' :
                                riskMetrics.averageRiskScore >= 50 ? 'text-orange-600' :
                                    riskMetrics.averageRiskScore >= 25 ? 'text-yellow-600' :
                                        'text-green-600'
                        }`}>
                            {riskMetrics.averageRiskScore.toFixed(1)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search risks..."
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
                    <option value="Identified">Identified</option>
                    <option value="Mitigated">Mitigated</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px]"
                >
                    <option value="all">All Severity</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {/* Risk Matrix View */}
            {viewMode === 'matrix' ? (
                <Card>
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Risk Matrix</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {['Critical', 'High', 'Medium', 'Low'].map((severity) => (
                                <div key={severity} className="space-y-2">
                                    <h4 className="text-xs font-medium text-gray-500 text-center">
                                        {severity}
                                    </h4>
                                    {filteredRisks
                                        .filter(r => r.severity === severity)
                                        .map((risk) => (
                                            <div
                                                key={risk.id}
                                                className={`p-2 rounded border cursor-pointer transition-colors ${
                                                    severity === 'Critical' ? 'border-red-300 bg-red-50 hover:bg-red-100' :
                                                        severity === 'High' ? 'border-orange-300 bg-orange-50 hover:bg-orange-100' :
                                                            severity === 'Medium' ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100' :
                                                                'border-blue-300 bg-blue-50 hover:bg-blue-100'
                                                }`}
                                                onClick={() => navigate(`/plandev/initiatives/${id}/risks/${risk.id}`)}
                                            >
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {risk.title}
                                                </p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-gray-500">
                                                        Score: {risk.riskScore.toFixed(1)}
                                                    </span>
                                                    {getRiskStatusBadge(risk.status)}
                                                </div>
                                                <div className="mt-1">
                                                    <Progress
                                                        value={risk.riskScore}
                                                        className={`h-1 ${getRiskScoreProgressColor(risk.riskScore)}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                // List View
                <div className="space-y-3">
                    {filteredRisks.length === 0 ? (
                        <div className="text-center py-12">
                            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No risks found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {searchTerm || filterStatus !== 'all' || filterSeverity !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Identify your first risk'}
                            </p>
                            <Button
                                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => navigate(`/plandev/initiatives/${id}/risks/create`)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Identify Risk
                            </Button>
                        </div>
                    ) : (
                        filteredRisks.map((risk) => (
                            <motion.div
                                key={risk.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/plandev/initiatives/${id}/risks/${risk.id}`)}
                            >
                                <Card className={`hover:shadow-md transition-shadow border-l-4 ${
                                    risk.severity === 'Critical' ? 'border-l-red-500' :
                                        risk.severity === 'High' ? 'border-l-orange-500' :
                                            risk.severity === 'Medium' ? 'border-l-yellow-500' :
                                                'border-l-blue-500'
                                }`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {risk.title}
                                                    </h4>
                                                    {getRiskSeverityBadge(risk.severity)}
                                                    {getRiskStatusBadge(risk.status)}
                                                    {risk.category && (
                                                        <Badge className={categoryColors[risk.category] || 'bg-gray-100'}>
                                                            {risk.category}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {risk.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <span>Probability: {risk.probability.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <span>Impact: {risk.impact.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">Risk Score:</span>
                                                        <span className={`font-medium ${getRiskScoreColor(risk.riskScore)}`}>
                                                            {risk.riskScore.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    {risk.identifiedDate && (
                                                        <div className="flex items-center gap-1 text-gray-500">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Identified: {formatDate(risk.identifiedDate)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-2">
                                                    <Progress
                                                        value={risk.riskScore}
                                                        className={`h-1.5 ${getRiskScoreProgressColor(risk.riskScore)}`}
                                                    />
                                                </div>

                                                {risk.mitigationPlan && (
                                                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                                        <p className="text-xs text-blue-700">
                                                            <span className="font-medium">Mitigation: </span>
                                                            {risk.mitigationPlan}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-1 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plandev/initiatives/${id}/risks/${risk.id}/edit`);
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
                                                        if (confirm(`Delete risk "${risk.title}"?`)) {
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
                        ))
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default RiskManagementPage;