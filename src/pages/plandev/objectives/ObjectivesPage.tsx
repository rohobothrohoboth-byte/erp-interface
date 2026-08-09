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
    Loader2,
    RefreshCw,
    Target,
    Flag,
    Trophy,
    Rocket,
    Zap,
    Sparkles,
    FileText,
    Building2,
    DollarSign,
    GitBranch,
    TrendingUp,
    Download,
    FileSpreadsheet,
    File,
    X,
    ChevronDown,
    Printer,
    Filter,
    Crown,
    Layers,
    User
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { showToast } from '../../../layout/layout';
import { getProjectById, deleteProject } from '../../../services/plandev/project.api';
import type { Project, Task, Milestone } from '../../../types/plandev/types';

// Import PDF libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ============================================================
// OBJECTIVE CONFIGURATIONS
// ============================================================

const objectiveTypes = [
    { value: 'Strategic', label: 'Strategic Objective', icon: <Target className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'Tactical', label: 'Tactical Objective', icon: <Flag className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'Operational', label: 'Operational Objective', icon: <Zap className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
    { value: 'Innovation', label: 'Innovation Objective', icon: <Sparkles className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800' },
];

const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
    Achieved: 'bg-purple-100 text-purple-800 border-purple-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<string, React.ReactNode> = {
    Draft: <FileText className="w-4 h-4" />,
    Active: <Rocket className="w-4 h-4" />,
    InProgress: <Clock className="w-4 h-4" />,
    Achieved: <Trophy className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
};

const priorityColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
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
                            <h2 className="text-xl font-bold text-gray-900">Delete Objective</h2>
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

const ObjectivesPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // State
    const [project, setProject] = useState<Project | null>(null);
    const [objectives, setObjectives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [objectiveToDelete, setObjectiveToDelete] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Fetch project and generate objectives
    const fetchData = useCallback(async () => {
        console.log('🔍 fetchData called with id:', id);

        if (!id) {
            console.warn('⚠️ No project ID provided');
            setError('No project ID provided');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`📡 Fetching project with ID: ${id}`);
            const data = await getProjectById(id);
            console.log('✅ Project data received:', data);

            setProject(data);

            // Generate objectives from project data
            const generatedObjectives = generateObjectivesFromProject(data);
            setObjectives(generatedObjectives);
            console.log('✅ Objectives generated:', generatedObjectives.length);
        } catch (error: any) {
            console.error('❌ Error fetching objectives:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load objectives';
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    // Generate objectives from project data
    const generateObjectivesFromProject = (project: Project) => {
        console.log('🔧 Generating objectives from project:', project);
        const objectives: any[] = [];

        // 1. Create Strategic objective based on project
        objectives.push({
            id: `obj-strategic-${project.id}`,
            title: `Strategic: ${project.name}`,
            description: project.description || 'Strategic objective aligned with project goals',
            type: 'Strategic',
            status: project.status === 'Completed' ? 'Achieved' :
                project.status === 'Active' ? 'InProgress' :
                    project.status === 'Planning' ? 'Draft' : 'Active',
            priority: project.priority || 'Medium',
            startDate: project.startDate,
            endDate: project.endDate,
            progress: project.progress || 0,
            parentId: null,
            children: [],
            isCritical: project.priority === 'Critical',
            department: project.department || 'N/A',
            manager: project.managerName || 'Unassigned'
        });

        // 2. Create Tactical objectives from milestones
        const milestones = project.milestones || [];
        console.log(`📊 Found ${milestones.length} milestones`);

        if (milestones.length > 0) {
            milestones.forEach((milestone: Milestone, index: number) => {
                objectives.push({
                    id: `obj-tactical-${milestone.id}`,
                    title: milestone.name,
                    description: milestone.description || 'Tactical objective from milestone',
                    type: 'Tactical',
                    status: milestone.status === 'Achieved' ? 'Achieved' :
                        milestone.status === 'Pending' ? 'Active' : 'InProgress',
                    priority: milestone.isCritical ? 'High' : 'Medium',
                    startDate: project.startDate,
                    endDate: milestone.targetDate,
                    progress: milestone.completionPercentage || 0,
                    parentId: `obj-strategic-${project.id}`,
                    children: [],
                    isCritical: milestone.isCritical,
                    department: project.department || 'N/A',
                    manager: project.managerName || 'Unassigned'
                });
            });
        }

        // 3. Create Operational objectives from tasks
        const tasks = project.tasks || [];
        console.log(`📊 Found ${tasks.length} tasks`);

        if (tasks.length > 0) {
            tasks.forEach((task: Task) => {
                let parentId = `obj-strategic-${project.id}`;
                if (task.parentTaskId) {
                    const parentTask = tasks.find(t => t.id === task.parentTaskId);
                    if (parentTask) {
                        parentId = `obj-tactical-${parentTask.id}`;
                    }
                }

                objectives.push({
                    id: `obj-operational-${task.id}`,
                    title: task.title,
                    description: task.description || 'Operational objective from task',
                    type: 'Operational',
                    status: task.status === 'Completed' ? 'Achieved' :
                        task.status === 'InProgress' ? 'InProgress' : 'Active',
                    priority: task.priority || 'Medium',
                    startDate: task.startDate,
                    endDate: task.endDate || project.endDate,
                    progress: task.progress || 0,
                    parentId: parentId,
                    children: [],
                    isCritical: task.priority === 'Critical',
                    department: project.department || 'N/A',
                    manager: project.managerName || 'Unassigned'
                });
            });
        }

        console.log(`✅ Generated ${objectives.length} total objectives`);
        return objectives;
    };

    useEffect(() => {
        console.log('🔄 ObjectivesPage mounted, fetching data...');
        fetchData();
    }, [fetchData]);

    // Filter objectives
    const filteredObjectives = objectives.filter(obj => {
        const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (obj.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || obj.type === filterType;
        const matchesStatus = filterStatus === 'all' || obj.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || obj.priority === filterPriority;
        return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });

    // Handle delete
    const handleDeleteClick = (objective: any) => {
        setObjectiveToDelete(objective);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!objectiveToDelete) return;

        setIsDeleting(true);
        try {
            // Remove objective from list
            setObjectives(objectives.filter(o => o.id !== objectiveToDelete.id));
            showToast.success(`"${objectiveToDelete.title}" deleted successfully!`);
            setShowDeleteModal(false);
            setObjectiveToDelete(null);
        } catch (error: any) {
            console.error('❌ Error deleting objective:', error);
            showToast.error('Failed to delete objective');
        } finally {
            setIsDeleting(false);
        }
    };

    // Generate PDF
    const generatePDF = (data: any[]) => {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('Objectives Report', pageWidth / 2, 20, { align: 'center' });

        // Subtitle
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Project: ${project?.name || 'N/A'}`, 14, 40);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 46);
        doc.text(`Total Objectives: ${data.length}`, 14, 52);

        // Table
        const tableData = data.map(obj => [
            obj.title || 'N/A',
            obj.type || 'N/A',
            obj.status || 'N/A',
            obj.priority || 'N/A',
            `${obj.progress || 0}%`,
            obj.department || 'N/A',
            obj.manager || 'Unassigned'
        ]);

        autoTable(doc, {
            head: [['Objective', 'Type', 'Status', 'Priority', 'Progress', 'Department', 'Manager']],
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
                0: { cellWidth: 40 },
                1: { cellWidth: 25 },
                2: { cellWidth: 25 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 25 },
                6: { cellWidth: 25 },
            },
        });

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY || 200;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`© ${new Date().getFullYear()} Strategic Plans - Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth / 2, finalY + 10, { align: 'center' });

        // Save
        const filename = `objectives-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        showToast.success(`PDF exported successfully: ${filename}`);
    };

    // Generate Excel
    const generateExcel = (data: any[]) => {
        const excelData = data.map(obj => ({
            'Objective': obj.title || 'N/A',
            'Type': obj.type || 'N/A',
            'Status': obj.status || 'N/A',
            'Priority': obj.priority || 'N/A',
            'Progress': `${obj.progress || 0}%`,
            'Department': obj.department || 'N/A',
            'Manager': obj.manager || 'Unassigned',
            'Start Date': obj.startDate ? new Date(obj.startDate).toLocaleDateString() : 'N/A',
            'End Date': obj.endDate ? new Date(obj.endDate).toLocaleDateString() : 'N/A'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        ws['!cols'] = [
            { wch: 40 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Objectives');
        const filename = `objectives-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
        showToast.success(`Excel exported successfully: ${filename}`);
    };

    // Generate CSV
    const generateCSV = (data: any[]) => {
        const headers = ['Objective', 'Type', 'Status', 'Priority', 'Progress', 'Department', 'Manager'];
        const rows = data.map(obj => [
            obj.title || 'N/A',
            obj.type || 'N/A',
            obj.status || 'N/A',
            obj.priority || 'N/A',
            `${obj.progress || 0}%`,
            obj.department || 'N/A',
            obj.manager || 'Unassigned'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `objectives-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast.success('CSV exported successfully!');
    };

    // Handle export
    const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
        if (filteredObjectives.length === 0) {
            showToast.warning('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            switch (format) {
                case 'pdf':
                    generatePDF(filteredObjectives);
                    break;
                case 'excel':
                    generateExcel(filteredObjectives);
                    break;
                case 'csv':
                    generateCSV(filteredObjectives);
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

    const getObjectiveTypeBadge = (type: string) => {
        const found = objectiveTypes.find(t => t.value === type);
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
                {statusIcons[status] || <FileText className="w-4 h-4" />}
                <span>{status}</span>
            </Badge>
        );
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'text-green-600';
        if (progress >= 50) return 'text-blue-600';
        if (progress >= 25) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const objectivesStats = {
        total: objectives.length,
        strategic: objectives.filter(o => o.type === 'Strategic').length,
        tactical: objectives.filter(o => o.type === 'Tactical').length,
        operational: objectives.filter(o => o.type === 'Operational').length,
        achieved: objectives.filter(o => o.status === 'Achieved').length,
        inProgress: objectives.filter(o => o.status === 'InProgress').length,
        completionRate: objectives.length > 0
            ? Math.round((objectives.filter(o => o.status === 'Achieved').length / objectives.length) * 100)
            : 0
    };

    // Get unique departments for filter
    const departments = Array.from(new Set(objectives.map(o => o.department).filter(Boolean)));

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading objectives...</p>
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
                    <p className="text-gray-600">Failed to load objectives</p>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                    <div className="mt-4 flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => fetchData()}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/plandev/strategic-plans')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Project not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/plandev/strategic-plans')}>
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
                                <h1 className="text-2xl font-bold text-gray-900">Objectives</h1>
                                <Badge className="bg-emerald-100 text-emerald-700">
                                    {objectives.length}
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
                            onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives/create`)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Objective
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-3">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-xl font-bold text-gray-900">{objectivesStats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-purple-600">Strategic</p>
                            <p className="text-xl font-bold text-purple-700">{objectivesStats.strategic}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-blue-600">Tactical</p>
                            <p className="text-xl font-bold text-blue-700">{objectivesStats.tactical}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-green-600">Achieved</p>
                            <p className="text-xl font-bold text-green-700">{objectivesStats.achieved}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-3">
                            <p className="text-xs text-yellow-600">Completion</p>
                            <p className="text-xl font-bold text-yellow-700">{objectivesStats.completionRate}%</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Summary */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Overall Objective Completion</span>
                            <span className="text-sm font-medium text-gray-900">{objectivesStats.completionRate}%</span>
                        </div>
                        <Progress value={objectivesStats.completionRate} className="h-2" />
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search objectives by title or description..."
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
                        <option value="Strategic">Strategic</option>
                        <option value="Tactical">Tactical</option>
                        <option value="Operational">Operational</option>
                        <option value="Innovation">Innovation</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px] bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Achieved">Achieved</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px] bg-white"
                    >
                        <option value="all">All Priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                    {(filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || searchTerm) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterType('all');
                                setFilterStatus('all');
                                setFilterPriority('all');
                                setSearchTerm('');
                            }}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Objectives Display */}
                {filteredObjectives.length === 0 ? (
                    <div className="text-center py-12">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No objectives found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Create your first objective'}
                        </p>
                        <Button
                            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives/create`)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Objective
                        </Button>
                    </div>
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredObjectives.map((objective) => (
                            <motion.div
                                key={objective.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="cursor-pointer"
                                onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives/${objective.id}`)}
                            >
                                <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-emerald-500">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {objective.title}
                                                    </h3>
                                                    {objective.isCritical && (
                                                        <Badge className="bg-red-100 text-red-700 text-xs">Critical</Badge>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    {getObjectiveTypeBadge(objective.type)}
                                                    {getStatusBadge(objective.status)}
                                                    <Badge className={priorityColors[objective.priority] || 'bg-gray-100 text-gray-800'}>
                                                        {objective.priority}
                                                    </Badge>
                                                    {objective.department && objective.department !== 'N/A' && (
                                                        <Badge variant="outline" className="bg-gray-50">
                                                            <Building2 className="w-3 h-3 mr-1" />
                                                            {objective.department}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {objective.description && (
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                        {objective.description}
                                                    </p>
                                                )}

                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Target: {formatDate(objective.endDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <User className="w-4 h-4" />
                                                        <span>{objective.manager || 'Unassigned'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <GitBranch className="w-4 h-4" />
                                                        <span>{objective.children?.length || 0} sub-objectives</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-500">Progress</span>
                                                        <span className={`font-medium ${getProgressColor(objective.progress)}`}>
                                                            {objective.progress}%
                                                        </span>
                                                    </div>
                                                    <Progress value={objective.progress} className="h-2" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/plandev/strategic-plans/${id}/objectives/${objective.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                                {objective.status !== 'Achieved' && objective.status !== 'Cancelled' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/plandev/strategic-plans/${id}/objectives/${objective.id}/edit`);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-red-500 hover:text-red-600 hover:border-red-300"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(objective);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
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
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Objective</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Department</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Progress</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredObjectives.map((objective) => (
                                    <tr
                                        key={objective.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/plandev/strategic-plans/${id}/objectives/${objective.id}`)}
                                    >
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{objective.title}</p>
                                                {objective.description && (
                                                    <p className="text-xs text-gray-500 line-clamp-1">{objective.description}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getObjectiveTypeBadge(objective.type)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(objective.status)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge className={priorityColors[objective.priority] || 'bg-gray-100 text-gray-800'}>
                                                {objective.priority}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            {objective.department && objective.department !== 'N/A' ? (
                                                <Badge variant="outline" className="bg-gray-50">
                                                    {objective.department}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400 text-sm">N/A</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Progress value={objective.progress} className="w-24 h-1.5" />
                                                <span className="text-sm font-medium">{objective.progress}%</span>
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
                                                        navigate(`/plandev/strategic-plans/${id}/objectives/${objective.id}`);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {objective.status !== 'Achieved' && objective.status !== 'Cancelled' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/plandev/strategic-plans/${id}/objectives/${objective.id}/edit`);
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
                                                        handleDeleteClick(objective);
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
                    setObjectiveToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                itemName={objectiveToDelete?.title || ''}
                isLoading={isDeleting}
            />
        </>
    );
};

export default ObjectivesPage;