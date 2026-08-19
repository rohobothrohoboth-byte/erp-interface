// src/pages/finance/compliance/ComplianceRequirements.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    ClipboardCheck, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
    CheckCircle, AlertCircle, Clock, FileText, X, Calendar,
    Users, Target, Activity, ListChecks, Shield, AlertTriangle,
    BookOpen, Award, Globe, FileCheck
} from 'lucide-react';
import { useReportExport } from '@/shared/hooks/useReportExport';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
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
import {
    getComplianceRequirements,
    createComplianceRequirement,
    updateComplianceRequirement,
    deleteComplianceRequirement,
} from '@/modules/finance/services/finance.api';

interface ComplianceRequirement {
    id: string;
    code: string;
    name: string;
    description: string;
    regulation: string;
    category: 'Financial' | 'DataPrivacy' | 'Labor' | 'Environmental' | 'Industry' | 'Corporate' | 'Tax';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Active' | 'Inactive' | 'Pending' | 'UnderReview' | 'Implemented' | 'Expired';
    owner: string;
    department: string;
    effectiveDate: string;
    expiryDate: string;
    lastReviewDate: string;
    nextReviewDate: string;
    complianceLevel: 'Compliant' | 'PartiallyCompliant' | 'NonCompliant' | 'NotAssessed';
    evidence: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
    rowVersion?: string;
}

interface ComplianceRequirementStats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    underReview: number;
    implemented: number;
    expired: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    compliant: number;
    partiallyCompliant: number;
    nonCompliant: number;
    notAssessed: number;
    financial: number;
    dataPrivacy: number;
    labor: number;
    environmental: number;
    industry: number;
    corporate: number;
    tax: number;
}

const ComplianceRequirements: React.FC = () => {
    const [items, setItems] = useState<ComplianceRequirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [filterCompliance, setFilterCompliance] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<ComplianceRequirement | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<Partial<ComplianceRequirement>>({});

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('compliance-requirements');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterCategory !== 'All') params.category = filterCategory;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterPriority !== 'All') params.priority = filterPriority;
            if (filterCompliance !== 'All') params.complianceLevel = filterCompliance;

            const response = await getComplianceRequirements(params);

            let data: ComplianceRequirement[] = [];
            if (response?.data) {
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                } else if (response.data.$values && Array.isArray(response.data.$values)) {
                    data = response.data.$values;
                }
            }
            setItems(data);
        } catch (error) {
            console.error('Error fetching compliance requirements:', error);
            showToast.error('Failed to load compliance requirements');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterCategory, filterStatus, filterPriority, filterCompliance]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): ComplianceRequirementStats => {
        const filtered = items;
        const active = filtered.filter(c => c.status === 'Active').length;
        const inactive = filtered.filter(c => c.status === 'Inactive').length;
        const pending = filtered.filter(c => c.status === 'Pending').length;
        const underReview = filtered.filter(c => c.status === 'UnderReview').length;
        const implemented = filtered.filter(c => c.status === 'Implemented').length;
        const expired = filtered.filter(c => c.status === 'Expired').length;
        const critical = filtered.filter(c => c.priority === 'Critical').length;
        const high = filtered.filter(c => c.priority === 'High').length;
        const medium = filtered.filter(c => c.priority === 'Medium').length;
        const low = filtered.filter(c => c.priority === 'Low').length;
        const compliant = filtered.filter(c => c.complianceLevel === 'Compliant').length;
        const partiallyCompliant = filtered.filter(c => c.complianceLevel === 'PartiallyCompliant').length;
        const nonCompliant = filtered.filter(c => c.complianceLevel === 'NonCompliant').length;
        const notAssessed = filtered.filter(c => c.complianceLevel === 'NotAssessed').length;
        const financial = filtered.filter(c => c.category === 'Financial').length;
        const dataPrivacy = filtered.filter(c => c.category === 'DataPrivacy').length;
        const labor = filtered.filter(c => c.category === 'Labor').length;
        const environmental = filtered.filter(c => c.category === 'Environmental').length;
        const industry = filtered.filter(c => c.category === 'Industry').length;
        const corporate = filtered.filter(c => c.category === 'Corporate').length;
        const tax = filtered.filter(c => c.category === 'Tax').length;

        return {
            total: filtered.length,
            active,
            inactive,
            pending,
            underReview,
            implemented,
            expired,
            critical,
            high,
            medium,
            low,
            compliant,
            partiallyCompliant,
            nonCompliant,
            notAssessed,
            financial,
            dataPrivacy,
            labor,
            environmental,
            industry,
            corporate,
            tax,
        };
    };

    const stats = getStats();

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Active: 'bg-green-100 text-green-700 border-green-200',
            Inactive: 'bg-red-100 text-red-700 border-red-200',
            Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            UnderReview: 'bg-blue-100 text-blue-700 border-blue-200',
            Implemented: 'bg-purple-100 text-purple-700 border-purple-200',
            Expired: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Financial: 'bg-blue-100 text-blue-700 border-blue-200',
            DataPrivacy: 'bg-purple-100 text-purple-700 border-purple-200',
            Labor: 'bg-orange-100 text-orange-700 border-orange-200',
            Environmental: 'bg-green-100 text-green-700 border-green-200',
            Industry: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            Corporate: 'bg-gray-100 text-gray-700 border-gray-200',
            Tax: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            Critical: 'bg-red-100 text-red-700 border-red-200',
            High: 'bg-orange-100 text-orange-700 border-orange-200',
            Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Low: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700';
    };

    const getComplianceColor = (level: string) => {
        const colors: Record<string, string> = {
            Compliant: 'bg-green-100 text-green-700 border-green-200',
            PartiallyCompliant: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            NonCompliant: 'bg-red-100 text-red-700 border-red-200',
            NotAssessed: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[level] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.regulation || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesPriority = filterPriority === 'All' || item.priority === filterPriority;
        const matchesCompliance = filterCompliance === 'All' || item.complianceLevel === filterCompliance;
        return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesCompliance;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleCreate = () => {
        setFormMode('create');
        setFormData({
            status: 'Pending',
            priority: 'Medium',
            complianceLevel: 'NotAssessed',
            category: 'Financial',
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item: ComplianceRequirement) => {
        setFormMode('edit');
        setFormData(item);
        setIsFormModalOpen(true);
    };

    const handleDelete = (item: ComplianceRequirement) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleView = (item: ComplianceRequirement) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteComplianceRequirement(selectedItem.id);
            showToast.success('Compliance requirement deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting compliance requirement:', error);
            showToast.error('Failed to delete compliance requirement');
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            if (formMode === 'create') {
                await createComplianceRequirement(formData);
                showToast.success('Compliance requirement created successfully');
            } else {
                await updateComplianceRequirement(formData);
                showToast.success('Compliance requirement updated successfully');
            }
            await fetchData();
            setIsFormModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error('Error saving compliance requirement:', error);
            showToast.error('Failed to save compliance requirement');
        } finally {
            setIsSubmitting(false);
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
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <ClipboardCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compliance Requirements</h1>
                        <p className="text-sm text-gray-500">Manage regulatory and compliance requirements</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
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
                        <Download size={16} /> Export
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handlePrintReport({ requirements: filteredItems, stats })}
                    >
                        <Printer size={16} /> Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleCreate}
                    >
                        <Plus size={16} /> Add Requirement
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Requirements</p>
                                <p className="text-2xl font-bold text-green-900">{stats.total}</p>
                                <p className="text-xs text-green-600 mt-1">{stats.active} active</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <ClipboardCheck className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Critical</p>
                                <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
                                <p className="text-xs text-red-600 mt-1">Highest priority</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Not Assessed</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.notAssessed}</p>
                                <p className="text-xs text-yellow-600 mt-1">Awaiting assessment</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Under Review</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.underReview}</p>
                                <p className="text-xs text-blue-600 mt-1">In review</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Clock className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Compliant</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.compliant}</p>
                                <p className="text-xs text-purple-600 mt-1">Fully compliant</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search requirements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="DataPrivacy">Data Privacy</SelectItem>
                        <SelectItem value="Labor">Labor</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                        <SelectItem value="Industry">Industry</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Tax">Tax</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="UnderReview">Under Review</SelectItem>
                        <SelectItem value="Implemented">Implemented</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="md:w-36">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Priorities</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterCompliance} onValueChange={setFilterCompliance}>
                    <SelectTrigger className="md:w-44">
                        <Shield className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Compliance" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Levels</SelectItem>
                        <SelectItem value="Compliant">Compliant</SelectItem>
                        <SelectItem value="PartiallyCompliant">Partially Compliant</SelectItem>
                        <SelectItem value="NonCompliant">Non-Compliant</SelectItem>
                        <SelectItem value="NotAssessed">Not Assessed</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('All');
                        setFilterStatus('All');
                        setFilterPriority('All');
                        setFilterCompliance('All');
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    <X size={16} /> Clear Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regulation</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <ClipboardCheck className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No compliance requirements found</p>
                                        <p className="text-sm text-gray-400">Create your first compliance requirement</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 font-medium">{item.regulation}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getComplianceColor(item.complianceLevel)}>{item.complianceLevel}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} className="text-yellow-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} requirements
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">Page {currentPage} of {totalPages || 1}</span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-green-600" />
                            Compliance Requirement Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Code</p>
                                    <p className="font-medium">{selectedItem.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedItem.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Regulation</p>
                                    <p className="font-medium">{selectedItem.regulation}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Category</p>
                                    <Badge className={getCategoryColor(selectedItem.category)}>{selectedItem.category}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Priority</p>
                                    <Badge className={getPriorityColor(selectedItem.priority)}>{selectedItem.priority}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Compliance Level</p>
                                    <Badge className={getComplianceColor(selectedItem.complianceLevel)}>{selectedItem.complianceLevel}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Owner</p>
                                    <p className="font-medium">{selectedItem.owner}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium">{selectedItem.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Effective Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.effectiveDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Expiry Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.expiryDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Review</p>
                                    <p className="font-medium">{formatDate(selectedItem.lastReviewDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Next Review</p>
                                    <p className="font-medium">{formatDate(selectedItem.nextReviewDate)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedItem.description}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="font-medium">{selectedItem.notes || 'No notes'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Form Modal */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-green-600" />
                            {formMode === 'create' ? 'Create Compliance Requirement' : 'Edit Compliance Requirement'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Code</Label>
                                <Input
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., CR-001"
                                />
                            </div>
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Requirement name"
                                />
                            </div>
                            <div>
                                <Label>Regulation</Label>
                                <Input
                                    value={formData.regulation || ''}
                                    onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                                    placeholder="e.g., SOX 404"
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={formData.category || 'Financial'}
                                    onValueChange={(value) => setFormData({ ...formData, category: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Financial">Financial</SelectItem>
                                        <SelectItem value="DataPrivacy">Data Privacy</SelectItem>
                                        <SelectItem value="Labor">Labor</SelectItem>
                                        <SelectItem value="Environmental">Environmental</SelectItem>
                                        <SelectItem value="Industry">Industry</SelectItem>
                                        <SelectItem value="Corporate">Corporate</SelectItem>
                                        <SelectItem value="Tax">Tax</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority || 'Medium'}
                                    onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Critical">Critical</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status || 'Pending'}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="UnderReview">Under Review</SelectItem>
                                        <SelectItem value="Implemented">Implemented</SelectItem>
                                        <SelectItem value="Expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Compliance Level</Label>
                                <Select
                                    value={formData.complianceLevel || 'NotAssessed'}
                                    onValueChange={(value) => setFormData({ ...formData, complianceLevel: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Compliant">Compliant</SelectItem>
                                        <SelectItem value="PartiallyCompliant">Partially Compliant</SelectItem>
                                        <SelectItem value="NonCompliant">Non-Compliant</SelectItem>
                                        <SelectItem value="NotAssessed">Not Assessed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Owner</Label>
                                <Input
                                    value={formData.owner || ''}
                                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                    placeholder="Owner name"
                                />
                            </div>
                            <div>
                                <Label>Department</Label>
                                <Input
                                    value={formData.department || ''}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="Department"
                                />
                            </div>
                            <div>
                                <Label>Effective Date</Label>
                                <Input
                                    type="date"
                                    value={formData.effectiveDate || ''}
                                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Expiry Date</Label>
                                <Input
                                    type="date"
                                    value={formData.expiryDate || ''}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Last Review Date</Label>
                                <Input
                                    type="date"
                                    value={formData.lastReviewDate || ''}
                                    onChange={(e) => setFormData({ ...formData, lastReviewDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Next Review Date</Label>
                                <Input
                                    type="date"
                                    value={formData.nextReviewDate || ''}
                                    onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Input
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Notes</Label>
                                <Input
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional notes"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (formMode === 'create' ? 'Create' : 'Update')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Confirm Delete
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this compliance requirement? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="py-4">
                            <p className="text-sm text-gray-600">
                                <strong>{selectedItem.code}</strong> - {selectedItem.name}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Modal */}
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-green-600" />
                            Export Compliance Requirements
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Export Format</Label>
                            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF - Document</SelectItem>
                                    <SelectItem value="excel">Excel - Spreadsheet</SelectItem>
                                    <SelectItem value="csv">CSV - Comma separated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Summary</Label>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Total: <strong>{filteredItems.length}</strong></p>
                                <p>Active: <strong>{stats.active}</strong></p>
                                <p>Critical: <strong>{stats.critical}</strong></p>
                                <p>Compliant: <strong>{stats.compliant}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleExport({ requirements: filteredItems, stats })}
                            disabled={exporting}
                        >
                            {exporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ComplianceRequirements;