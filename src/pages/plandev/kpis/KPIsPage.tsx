import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Trophy,
    Loader2,
    RefreshCw,
    Target,
    Flag,
    Award,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    ChevronUp,
    Download,
    FileText,
    FileSpreadsheet,
    File,
    Users,
    Building2,
    DollarSign,
    Rocket,
    Zap,
    Shield,
    Sparkles,
    Gauge,
    Activity,
    X,
    Printer,
    type LucideIcon
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { showToast } from '../../../layout/layout';
import { getProjectById } from '../../../services/plandev/project.api';
import type { Project, Task, Milestone } from '../../../types/plandev/types';

// Import PDF libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ============================================================
// KPI CONFIGURATIONS
// ============================================================

const kpiCategories = [
    { value: 'Financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
    { value: 'Customer', label: 'Customer', icon: <Users className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'Process', label: 'Process', icon: <Activity className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' },
    { value: 'People', label: 'People', icon: <Users className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'Quality', label: 'Quality', icon: <Shield className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-800' },
    { value: 'Innovation', label: 'Innovation', icon: <Sparkles className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800' },
];

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Achieved: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <FileText className="w-4 h-4" />,
    Active: <Rocket className="w-4 h-4" />,
    Pending: <Clock className="w-4 h-4" />,
    Achieved: <Trophy className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
};

// ============================================================
// DELETE CONFIRMATION MODAL
// ============================================================

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    isLoading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onConfirm,
                                                     itemName,
                                                     isLoading
                                                 }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Delete KPI</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={isLoading}
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-700">
                            Are you sure you want to delete <strong className="text-gray-900">"{itemName}"</strong>?
                        </p>
                        <p className="text-sm text-red-600 mt-2 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>This action cannot be undone. All associated data will be permanently removed.</span>
                        </p>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isLoading ? (
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ============================================================
// EXPORT DROPDOWN MENU
// ============================================================

interface ExportDropdownProps {
    onExport: (format: 'pdf' | 'excel' | 'csv') => void;
    isExporting: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExport, isExporting }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
        setIsOpen(false);
        onExport(format);
    };

    return (
        <div className="relative">
            <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
            >
                {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                Export
                <ChevronDown className="w-4 h-4" />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                        <button
                            onClick={() => handleExport('pdf')}
                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                            <FileText className="w-4 h-4 text-red-500" />
                            <span>Export as PDF</span>
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            <span>Export as Excel</span>
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                            <File className="w-4 h-4 text-blue-600" />
                            <span>Export as CSV</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const KPIsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [project, setProject] = useState<Project | null>(null);
    const [kpis, setKpis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [kpiToDelete, setKpiToDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Fetch project and KPIs
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

            // Generate KPIs from project data
            const generatedKPIs = generateKPIsFromProject(data);
            setKpis(generatedKPIs);
            console.log('✅ KPIs loaded:', generatedKPIs.length);
        } catch (error: any) {
            console.error('Error fetching KPIs:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load KPIs';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    // Generate KPIs from project data
    const generateKPIsFromProject = (project: Project) => {
        const kpis: any[] = [];

        // 1. Financial KPI - Budget Utilization
        if (project.budget > 0) {
            const budgetUtilization = project.actualCost > 0
                ? Math.round((project.actualCost / project.budget) * 100)
                : 0;
            kpis.push({
                id: `kpi-budget-${project.id}`,
                name: 'Budget Utilization',
                category: 'Financial',
                description: `Budget utilization for ${project.name}`,
                currentValue: budgetUtilization,
                targetValue: 100,
                unit: '%',
                status: budgetUtilization <= 80 ? 'Active' : budgetUtilization <= 100 ? 'Pending' : 'Cancelled',
                trend: budgetUtilization <= 80 ? 'good' : budgetUtilization <= 100 ? 'warning' : 'danger',
                progress: Math.min(budgetUtilization, 100),
                department: project.department || 'N/A',
                manager: project.managerName || 'Unassigned'
            });
        }

        // 2. Quality KPI - Milestone Achievement
        const milestones = project.milestones || [];
        if (milestones.length > 0) {
            const achieved = milestones.filter(m => m.status === 'Achieved').length;
            const completionRate = Math.round((achieved / milestones.length) * 100);
            kpis.push({
                id: `kpi-milestones-${project.id}`,
                name: 'Milestone Achievement',
                category: 'Quality',
                description: `Percentage of milestones achieved (${achieved}/${milestones.length})`,
                currentValue: completionRate,
                targetValue: 80,
                unit: '%',
                status: completionRate >= 80 ? 'Achieved' : completionRate >= 50 ? 'Active' : 'Pending',
                trend: completionRate >= 80 ? 'good' : completionRate >= 50 ? 'warning' : 'danger',
                progress: completionRate,
                department: project.department || 'N/A',
                manager: project.managerName || 'Unassigned'
            });
        }

        // 3. Process KPI - Task Completion
        const tasks = project.tasks || [];
        if (tasks.length > 0) {
            const completed = tasks.filter(t => t.status === 'Completed').length;
            const completionRate = Math.round((completed / tasks.length) * 100);
            kpis.push({
                id: `kpi-tasks-${project.id}`,
                name: 'Task Completion',
                category: 'Process',
                description: `Percentage of tasks completed (${completed}/${tasks.length})`,
                currentValue: completionRate,
                targetValue: 90,
                unit: '%',
                status: completionRate >= 90 ? 'Achieved' : completionRate >= 50 ? 'Active' : 'Pending',
                trend: completionRate >= 90 ? 'good' : completionRate >= 50 ? 'warning' : 'danger',
                progress: completionRate,
                department: project.department || 'N/A',
                manager: project.managerName || 'Unassigned'
            });
        }

        // 4. Process KPI - Project Progress
        kpis.push({
            id: `kpi-progress-${project.id}`,
            name: 'Project Progress',
            category: 'Process',
            description: `Overall project progress for ${project.name}`,
            currentValue: project.progress,
            targetValue: 100,
            unit: '%',
            status: project.progress >= 100 ? 'Achieved' :
                project.progress >= 50 ? 'Active' : 'Pending',
            trend: project.progress >= 75 ? 'good' :
                project.progress >= 50 ? 'warning' : 'danger',
            progress: project.progress,
            department: project.department || 'N/A',
            manager: project.managerName || 'Unassigned'
        });

        // 5. Innovation KPI - If project has high priority
        if (project.priority === 'High' || project.priority === 'Critical') {
            const innovationScore = Math.min(100, 60 + (project.progress * 0.4));
            kpis.push({
                id: `kpi-innovation-${project.id}`,
                name: 'Innovation Impact',
                category: 'Innovation',
                description: 'Innovation impact score based on project complexity and progress',
                currentValue: Math.round(innovationScore),
                targetValue: 80,
                unit: '%',
                status: innovationScore >= 80 ? 'Achieved' : innovationScore >= 50 ? 'Active' : 'Pending',
                trend: innovationScore >= 80 ? 'good' : innovationScore >= 50 ? 'warning' : 'danger',
                progress: Math.round(innovationScore),
                department: project.department || 'N/A',
                manager: project.managerName || 'Unassigned'
            });
        }

        return kpis;
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter KPIs
    const filteredKPIs = kpis.filter(kpi => {
        const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (kpi.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || kpi.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || kpi.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Handle delete
    const handleDeleteClick = (kpi: any) => {
        setKpiToDelete(kpi);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!kpiToDelete) return;

        setIsDeleting(true);
        try {
            setKpis(kpis.filter(k => k.id !== kpiToDelete.id));
            showToast.success(`"${kpiToDelete.name}" deleted successfully!`);
            setShowDeleteModal(false);
            setKpiToDelete(null);
        } catch (error: any) {
            console.error('❌ Error deleting KPI:', error);
            showToast.error('Failed to delete KPI');
        } finally {
            setIsDeleting(false);
        }
    };

    // Generate PDF
    const generatePDF = (data: any[]) => {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('KPIs Report', pageWidth / 2, 20, { align: 'center' });

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Project: ${project?.name || 'N/A'}`, 14, 40);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 46);
        doc.text(`Total KPIs: ${data.length}`, 14, 52);

        const tableData = data.map(kpi => [
            kpi.name || 'N/A',
            kpi.category || 'N/A',
            kpi.status || 'N/A',
            `${kpi.currentValue || 0}${kpi.unit || ''}`,
            `${kpi.targetValue || 0}${kpi.unit || ''}`,
            `${kpi.progress || 0}%`,
            kpi.department || 'N/A',
            kpi.manager || 'Unassigned'
        ]);

        autoTable(doc, {
            head: [['KPI', 'Category', 'Status', 'Current', 'Target', 'Progress', 'Department', 'Manager']],
            body: tableData,
            startY: 58,
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [52, 211, 153],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 22 },
                2: { cellWidth: 22 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 25 },
                7: { cellWidth: 25 },
            },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 200;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`© ${new Date().getFullYear()} Strategic Plans - Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth / 2, finalY + 10, { align: 'center' });

        const filename = `kpis-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        showToast.success(`PDF exported successfully: ${filename}`);
    };

    // Generate Excel
    const generateExcel = (data: any[]) => {
        const excelData = data.map(kpi => ({
            'KPI': kpi.name || 'N/A',
            'Category': kpi.category || 'N/A',
            'Status': kpi.status || 'N/A',
            'Current Value': `${kpi.currentValue || 0}${kpi.unit || ''}`,
            'Target Value': `${kpi.targetValue || 0}${kpi.unit || ''}`,
            'Progress': `${kpi.progress || 0}%`,
            'Department': kpi.department || 'N/A',
            'Manager': kpi.manager || 'Unassigned'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        ws['!cols'] = [
            { wch: 30 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 20 },
            { wch: 20 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'KPIs');
        const filename = `kpis-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
        showToast.success(`Excel exported successfully: ${filename}`);
    };

    // Generate CSV
    const generateCSV = (data: any[]) => {
        const headers = ['KPI', 'Category', 'Status', 'Current Value', 'Target Value', 'Progress', 'Department', 'Manager'];
        const rows = data.map(kpi => [
            kpi.name || 'N/A',
            kpi.category || 'N/A',
            kpi.status || 'N/A',
            `${kpi.currentValue || 0}${kpi.unit || ''}`,
            `${kpi.targetValue || 0}${kpi.unit || ''}`,
            `${kpi.progress || 0}%`,
            kpi.department || 'N/A',
            kpi.manager || 'Unassigned'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `kpis-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast.success('CSV exported successfully!');
    };

    // Handle export
    const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
        if (filteredKPIs.length === 0) {
            showToast.warning('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            switch (format) {
                case 'pdf':
                    generatePDF(filteredKPIs);
                    break;
                case 'excel':
                    generateExcel(filteredKPIs);
                    break;
                case 'csv':
                    generateCSV(filteredKPIs);
                    break;
                default:
                    showToast.error('Unsupported format');
            }
        } catch (error) {
            console.error('❌ Export failed:', error);
            showToast.error(`Failed to export ${format.toUpperCase()}`);
        } finally {
            setIsExporting(false);
        }
    };

    const getCategoryBadge = (category: string) => {
        const found = kpiCategories.find(c => c.value === category);
        if (!found) return null;
        return (
            <Badge className={`${found.color} flex items-center gap-1`}>
                {found.icon}
                <span>{found.label}</span>
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
                {statusIcons[status] || <AlertCircle className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'good') return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend === 'warning') return <TrendingDown className="w-4 h-4 text-yellow-500" />;
        if (trend === 'danger') return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <TrendingUp className="w-4 h-4 text-gray-400" />;
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const kpiStats = {
        total: kpis.length,
        achieved: kpis.filter(k => k.status === 'Achieved').length,
        active: kpis.filter(k => k.status === 'Active').length,
        pending: kpis.filter(k => k.status === 'Pending').length,
        categories: new Set(kpis.map(k => k.category)).size,
        averageProgress: kpis.length > 0
            ? Math.round(kpis.reduce((acc, k) => acc + (k.progress || 0), 0) / kpis.length)
            : 0
    };

    // Get unique departments for filter
    const departments = Array.from(new Set(kpis.map(k => k.department).filter(Boolean)));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading KPIs...</p>
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
                    onClick={() => navigate('/plandev/strategic-plans')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Strategic Plans
                </Button>
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
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/plandev/strategic-plans/${id}`)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">Key Performance Indicators</h1>
                                <Badge className="bg-emerald-100 text-emerald-700">
                                    {kpis.length}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{project.name}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                        >
                            {viewMode === 'cards' ? 'Table View' : 'Card View'}
                        </Button>
                        <ExportDropdown onExport={handleExport} isExporting={isExporting} />
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis/create`)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add KPI
                        </Button>
                    </div>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-3">
                            <p className="text-xs text-gray-500">Total KPIs</p>
                            <p className="text-xl font-bold text-gray-900">{kpiStats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-purple-600">Achieved</p>
                            <p className="text-xl font-bold text-purple-700">{kpiStats.achieved}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-green-600">Active</p>
                            <p className="text-xl font-bold text-green-700">{kpiStats.active}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-yellow-600">Pending</p>
                            <p className="text-xl font-bold text-yellow-700">{kpiStats.pending}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-blue-600">Avg Progress</p>
                            <p className="text-xl font-bold text-blue-700">{kpiStats.averageProgress}%</p>
                        </CardContent>
                    </Card>
                </div>

                {/* KPI Dashboard Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {kpiCategories.map((category) => {
                        const count = kpis.filter(k => k.category === category.value).length;
                        const avgProgress = count > 0
                            ? Math.round(kpis.filter(k => k.category === category.value).reduce((acc, k) => acc + (k.progress || 0), 0) / count)
                            : 0;
                        return (
                            <Card key={category.value} className={`${category.color.replace('text', 'bg').replace('800', '50')} border`}>
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {category.icon}
                                            <span className="text-sm font-medium">{category.label}</span>
                                        </div>
                                        <Badge variant="outline">{count}</Badge>
                                    </div>
                                    {count > 0 && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Progress</span>
                                                <span className="font-medium">{avgProgress}%</span>
                                            </div>
                                            <Progress value={avgProgress} className="h-1 mt-1" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search KPIs by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px] bg-white"
                    >
                        <option value="all">All Categories</option>
                        {kpiCategories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px] bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Achieved">Achieved</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    {(filterCategory !== 'all' || filterStatus !== 'all' || searchTerm) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterCategory('all');
                                setFilterStatus('all');
                                setSearchTerm('');
                            }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* KPIs Display */}
                {filteredKPIs.length === 0 ? (
                    <div className="text-center py-12">
                        <Gauge className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No KPIs found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first KPI'}
                        </p>
                        <Button
                            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis/create`)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add KPI
                        </Button>
                    </div>
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredKPIs.map((kpi) => (
                            <motion.div
                                key={kpi.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis/${kpi.id}`)}
                            >
                                <Card className="h-full hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {getCategoryBadge(kpi.category)}
                                                {getStatusBadge(kpi.status)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {getTrendIcon(kpi.trend)}
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-1">{kpi.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{kpi.description}</p>

                                        <div className="flex items-end justify-between mb-2">
                                            <div>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {kpi.currentValue}{kpi.unit}
                                                </p>
                                                <p className="text-xs text-gray-500">Current Value</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-600">
                                                    Target: {kpi.targetValue}{kpi.unit}
                                                </p>
                                                {kpi.department && kpi.department !== 'N/A' && (
                                                    <p className="text-xs text-gray-400">
                                                        <Building2 className="w-3 h-3 inline mr-1" />
                                                        {kpi.department}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-500">Progress</span>
                                                <span className={`font-medium ${kpi.progress >= 80 ? 'text-green-600' : kpi.progress >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {kpi.progress}%
                                                </span>
                                            </div>
                                            <Progress value={kpi.progress} className={`h-2 ${getProgressColor(kpi.progress)}`} />
                                        </div>

                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/plandev/strategic-plans/${id}/kpis/${kpi.id}`);
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                            {kpi.status !== 'Achieved' && kpi.status !== 'Cancelled' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plandev/strategic-plans/${id}/kpis/${kpi.id}/edit`);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:border-red-300"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(kpi);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">KPI</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Department</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Current</th>
                                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Target</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Progress</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredKPIs.map((kpi) => (
                                    <tr
                                        key={kpi.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/plandev/strategic-plans/${id}/kpis/${kpi.id}`)}
                                    >
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{kpi.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{kpi.description}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getCategoryBadge(kpi.category)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(kpi.status)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {kpi.department && kpi.department !== 'N/A' ? (
                                                <Badge variant="outline" className="bg-gray-50">
                                                    {kpi.department}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400 text-sm">N/A</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {kpi.currentValue}{kpi.unit}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-600">
                                            {kpi.targetValue}{kpi.unit}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Progress value={kpi.progress} className="w-24 h-1.5" />
                                                <span className="text-sm font-medium">{kpi.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plandev/strategic-plans/${id}/kpis/${kpi.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {kpi.status !== 'Achieved' && kpi.status !== 'Cancelled' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/plandev/strategic-plans/${id}/kpis/${kpi.id}/edit`);
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
                                                        handleDeleteClick(kpi);
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

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setKpiToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                itemName={kpiToDelete?.name || ''}
                isLoading={isDeleting}
            />
        </>
    );
};

export default KPIsPage;