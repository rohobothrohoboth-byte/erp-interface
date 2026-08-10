// src/pages/finance/compliance/ComplianceManagement.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Plus, Search, RefreshCw, Eye, Edit, Trash2,
    CheckCircle, X, AlertCircle, Clock, Download, Printer,
    Filter, ChevronLeft, ChevronRight, FileText,
    ListChecks, BadgeCheck, Lock, Key, Users,
    Calendar, Building2, FileCheck, AlertTriangle,
    Activity, Zap, Award, Target, BookOpen,
    ClipboardCheck, UserCheck, Server, Database
} from 'lucide-react';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';

interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: 'Create' | 'Update' | 'Delete' | 'View' | 'Approve' | 'Reject' | 'Login' | 'Logout';
    module: string;
    entityId: string;
    entityType: string;
    changes: string;
    ipAddress: string;
    userAgent: string;
    status: 'Success' | 'Failure' | 'Warning';
}

interface InternalControl {
    id: string;
    code: string;
    name: string;
    description: string;
    type: 'Preventive' | 'Detective' | 'Corrective';
    category: 'Financial' | 'Operational' | 'Compliance' | 'IT' | 'Fraud';
    frequency: 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
    owner: string;
    department: string;
    status: 'Active' | 'Inactive' | 'UnderReview' | 'RequiresUpdate';
    effectiveness: 'High' | 'Medium' | 'Low' | 'NotTested';
    lastTestedDate: string;
    nextTestDate: string;
    findings: string[];
    remediationPlan?: string;
    createdAt: string;
    updatedAt?: string;
}

interface ComplianceRequirement {
    id: string;
    code: string;
    name: string;
    description: string;
    regulation: 'SOX' | 'GDPR' | 'PCI-DSS' | 'HIPAA' | 'IFRS' | 'Local' | 'Internal';
    section: string;
    complianceStatus: 'Compliant' | 'NonCompliant' | 'PartiallyCompliant' | 'NotAssessed' | 'InProgress';
    deadline: string;
    owner: string;
    controls: string[];
    evidence: string[];
    riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
    notes: string;
    createdAt: string;
    updatedAt?: string;
}

interface ComplianceStats {
    totalControls: number;
    activeControls: number;
    totalRequirements: number;
    compliantRequirements: number;
    nonCompliantRequirements: number;
    auditLogsCount: number;
    criticalFindings: number;
    overallComplianceScore: number;
    controlsEffectiveness: number;
}

const ComplianceManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'audit-logs' | 'controls' | 'requirements'>('audit-logs');
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [controls, setControls] = useState<InternalControl[]>([]);
    const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
        title,
    } = useReportExport('compliance');

    const ITEMS_PER_PAGE = 10;

    // Mock data for demonstration
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterStatus && filterStatus !== 'All') {
                params.status = filterStatus;
            }

            // ✅ Real API calls based on active tab
            if (activeTab === 'audit-logs') {
                const auditRes = await getAuditLogs(params);
                let auditData = [];
                if (auditRes.data) {
                    if (Array.isArray(auditRes.data)) auditData = auditRes.data;
                    else if (auditRes.data.data && Array.isArray(auditRes.data.data)) auditData = auditRes.data.data;
                    else if (auditRes.data.$values && Array.isArray(auditRes.data.$values)) auditData = auditRes.data.$values;
                }
                setAuditLogs(auditData);
            }

            if (activeTab === 'controls') {
                const controlsRes = await getInternalControls(params);
                let controlsData = [];
                if (controlsRes.data) {
                    if (Array.isArray(controlsRes.data)) controlsData = controlsRes.data;
                    else if (controlsRes.data.data && Array.isArray(controlsRes.data.data)) controlsData = controlsRes.data.data;
                    else if (controlsRes.data.$values && Array.isArray(controlsRes.data.$values)) controlsData = controlsRes.data.$values;
                }
                setControls(controlsData);
            }

            if (activeTab === 'requirements') {
                const reqRes = await getComplianceRequirements(params);
                let reqData = [];
                if (reqRes.data) {
                    if (Array.isArray(reqRes.data)) reqData = reqRes.data;
                    else if (reqRes.data.data && Array.isArray(reqRes.data.data)) reqData = reqRes.data.data;
                    else if (reqRes.data.$values && Array.isArray(reqRes.data.$values)) reqData = reqRes.data.$values;
                }
                setRequirements(reqData);
            }

        } catch (error) {
            console.error('Error fetching compliance data:', error);
            showToast.error('Failed to load compliance data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // ✅ Updated handleAddControl
    const handleAddControl = async () => {
        // ... (validation remains the same)

        try {
            const payload = {
                code: controlForm.code,
                name: controlForm.name,
                description: controlForm.description,
                type: controlForm.type,
                category: controlForm.category,
                frequency: controlForm.frequency,
                owner: controlForm.owner,
                department: controlForm.department,
                status: controlForm.status,
                effectiveness: controlForm.effectiveness,
                lastTestedDate: controlForm.lastTestedDate ? new Date(controlForm.lastTestedDate).toISOString() : null,
                nextTestDate: controlForm.nextTestDate ? new Date(controlForm.nextTestDate).toISOString() : null,
            };

            await createInternalControl(payload);
            showToast.success('Internal control created successfully');
            setIsAddModalOpen(false);
            resetForms();
            await fetchData();
        } catch (error: any) {
            console.error('Error creating control:', error);
            showToast.error(error.response?.data?.message || 'Failed to create control');
        }
    };

    // ✅ Updated handleAddRequirement
    const handleAddRequirement = async () => {
        // ... (validation remains the same)

        try {
            const payload = {
                code: requirementForm.code,
                name: requirementForm.name,
                description: requirementForm.description,
                regulation: requirementForm.regulation,
                section: requirementForm.section,
                complianceStatus: requirementForm.complianceStatus,
                deadline: requirementForm.deadline ? new Date(requirementForm.deadline).toISOString() : null,
                owner: requirementForm.owner,
                controls: requirementForm.controls,
                evidence: requirementForm.evidence,
                riskLevel: requirementForm.riskLevel,
                notes: requirementForm.notes,
            };

            await createComplianceRequirement(payload);
            showToast.success('Compliance requirement created successfully');
            setIsAddModalOpen(false);
            resetForms();
            await fetchData();
        } catch (error: any) {
            console.error('Error creating requirement:', error);
            showToast.error(error.response?.data?.message || 'Failed to create requirement');
        }
    };

    const getStats = (): ComplianceStats => {
        const activeControls = controls.filter(c => c.status === 'Active').length;
        const compliantReqs = requirements.filter(r => r.complianceStatus === 'Compliant').length;
        const nonCompliantReqs = requirements.filter(r => r.complianceStatus === 'NonCompliant').length;
        const highEffectiveness = controls.filter(c => c.effectiveness === 'High' || c.effectiveness === 'Medium').length;

        return {
            totalControls: controls.length,
            activeControls,
            totalRequirements: requirements.length,
            compliantRequirements: compliantReqs,
            nonCompliantRequirements: nonCompliantReqs,
            auditLogsCount: auditLogs.length,
            criticalFindings: controls.reduce((sum, c) => sum + c.findings.length, 0),
            overallComplianceScore: requirements.length > 0 ? (compliantReqs / requirements.length) * 100 : 0,
            controlsEffectiveness: controls.length > 0 ? (highEffectiveness / controls.length) * 100 : 0,
        };
    };

    const stats = getStats();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Active: 'bg-green-100 text-green-700 border-green-200',
            Inactive: 'bg-gray-100 text-gray-700 border-gray-200',
            Success: 'bg-green-100 text-green-700 border-green-200',
            Failure: 'bg-red-100 text-red-700 border-red-200',
            Warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Compliant: 'bg-green-100 text-green-700 border-green-200',
            NonCompliant: 'bg-red-100 text-red-700 border-red-200',
            PartiallyCompliant: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            NotAssessed: 'bg-gray-100 text-gray-700 border-gray-200',
            InProgress: 'bg-blue-100 text-blue-700 border-blue-200',
            UnderReview: 'bg-purple-100 text-purple-700 border-purple-200',
            RequiresUpdate: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getRiskColor = (risk: string) => {
        const colors: Record<string, string> = {
            Critical: 'bg-red-100 text-red-700',
            High: 'bg-orange-100 text-orange-700',
            Medium: 'bg-yellow-100 text-yellow-700',
            Low: 'bg-green-100 text-green-700',
        };
        return colors[risk] || 'bg-gray-100 text-gray-700';
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'Create': return <Plus className="h-4 w-4 text-green-500" />;
            case 'Update': return <Edit className="h-4 w-4 text-blue-500" />;
            case 'Delete': return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'Approve': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'Reject': return <X className="h-4 w-4 text-red-500" />;
            case 'Login': return <Key className="h-4 w-4 text-purple-500" />;
            default: return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compliance Management</h1>
                        <p className="text-sm text-gray-500">Audit trails, internal controls, and compliance requirements</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleRefresh(fetchData)}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={exporting}
                    >
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport({ auditLogs, controls, requirements, stats })}
                    >
                        <Printer size={16} />
                        Print
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus size={16} />
                        New {activeTab === 'controls' ? 'Control' : activeTab === 'requirements' ? 'Requirement' : 'Audit Log'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Controls</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.totalControls}</p>
                                <p className="text-xs text-blue-600 mt-1">{stats.activeControls} active</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <ListChecks className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Compliant</p>
                                <p className="text-2xl font-bold text-green-900">{stats.compliantRequirements}</p>
                                <p className="text-xs text-green-600 mt-1">Of {stats.totalRequirements}</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <BadgeCheck className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Non-Compliant</p>
                                <p className="text-2xl font-bold text-red-900">{stats.nonCompliantRequirements}</p>
                                <p className="text-xs text-red-600 mt-1">Requires action</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Audit Logs</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.auditLogsCount}</p>
                                <p className="text-xs text-purple-600 mt-1">Total events</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <Activity className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Compliance Score</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.overallComplianceScore.toFixed(1)}%</p>
                                <p className="text-xs text-orange-600 mt-1">Overall rating</p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-xl">
                                <Target className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Control Effectiveness</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.controlsEffectiveness.toFixed(1)}%</p>
                                <p className="text-xs text-indigo-600 mt-1">High/Medium rating</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-xl">
                                <Shield className="h-6 w-6 text-indigo-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('audit-logs')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'audit-logs'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Activity className="h-4 w-4 inline mr-2" />
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('controls')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'controls'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ListChecks className="h-4 w-4 inline mr-2" />
                        Internal Controls
                    </button>
                    <button
                        onClick={() => setActiveTab('requirements')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'requirements'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ClipboardCheck className="h-4 w-4 inline mr-2" />
                        Compliance Requirements
                    </button>
                </nav>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder={`Search ${activeTab.replace('-', ' ')}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        {activeTab === 'audit-logs' && (
                            <>
                                <SelectItem value="Success">Success</SelectItem>
                                <SelectItem value="Failure">Failure</SelectItem>
                                <SelectItem value="Warning">Warning</SelectItem>
                            </>
                        )}
                        {activeTab === 'controls' && (
                            <>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="UnderReview">Under Review</SelectItem>
                                <SelectItem value="RequiresUpdate">Requires Update</SelectItem>
                            </>
                        )}
                        {activeTab === 'requirements' && (
                            <>
                                <SelectItem value="Compliant">Compliant</SelectItem>
                                <SelectItem value="NonCompliant">Non-Compliant</SelectItem>
                                <SelectItem value="PartiallyCompliant">Partially Compliant</SelectItem>
                                <SelectItem value="InProgress">In Progress</SelectItem>
                                <SelectItem value="NotAssessed">Not Assessed</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('All');
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'audit-logs' && (
                <AuditLogsTable
                    auditLogs={auditLogs}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    formatDateTime={formatDateTime}
                    getStatusColor={getStatusColor}
                    getActionIcon={getActionIcon}
                />
            )}

            {activeTab === 'controls' && (
                <ControlsTable
                    controls={controls}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    onView={(item) => { setSelectedItem(item); setIsViewModalOpen(true); }}
                    onEdit={(item) => { setSelectedItem(item); setIsEditModalOpen(true); }}
                    onDelete={(item) => { setSelectedItem(item); setIsDeleteModalOpen(true); }}
                />
            )}

            {activeTab === 'requirements' && (
                <RequirementsTable
                    requirements={requirements}
                    searchTerm={searchTerm}
                    filterStatus={filterStatus}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getRiskColor={getRiskColor}
                    onView={(item) => { setSelectedItem(item); setIsViewModalOpen(true); }}
                    onEdit={(item) => { setSelectedItem(item); setIsEditModalOpen(true); }}
                    onDelete={(item) => { setSelectedItem(item); setIsDeleteModalOpen(true); }}
                />
            )}

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-indigo-600" />
                            {title || 'Export Compliance Report'}
                        </DialogTitle>
                        <DialogDescription>
                            Export the compliance report in your preferred format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select
                                value={exportFormat}
                                onValueChange={(value: any) => setExportFormat(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-red-500" />
                                            PDF - Printable Document
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="excel">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-600" />
                                            Excel - Spreadsheet
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="csv">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            CSV - Comma separated values
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Controls: <strong>{stats.totalControls}</strong></p>
                                <p>Requirements: <strong>{stats.totalRequirements}</strong></p>
                                <p>Compliance Score: <strong>{stats.overallComplianceScore.toFixed(1)}%</strong></p>
                                <p>Audit Logs: <strong>{stats.auditLogsCount}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => handleExport({ auditLogs, controls, requirements, stats })}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export {exportFormat.toUpperCase()}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

// Table Components
const AuditLogsTable: React.FC<any> = ({
                                           auditLogs, searchTerm, filterStatus, currentPage, setCurrentPage,
                                           ITEMS_PER_PAGE, formatDateTime, getStatusColor, getActionIcon
                                       }) => {
    const filtered = auditLogs.filter(log => {
        const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.module.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changes</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No audit logs found</td>
                        </tr>
                    ) : (
                        paginated.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(log.timestamp)}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.userName}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {getActionIcon(log.action)}
                                        <span className="text-sm">{log.action}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{log.module}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{log.entityType}: {log.entityId}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{log.changes}</td>
                                <td className="px-4 py-3">
                                    <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <p className="text-sm text-gray-500">Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Similar ControlsTable and RequirementsTable components would follow...

export default ComplianceManagement;