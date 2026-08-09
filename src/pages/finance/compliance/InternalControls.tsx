// src/pages/finance/compliance/InternalControls.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
    CheckCircle, AlertCircle, Clock, FileText, X, Calendar,
    Users, Target, Activity, ListChecks, Play, AlertTriangle
} from 'lucide-react';
import { useReportExport } from '../../../hooks/useReportExport';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import {
    getInternalControls,
    createInternalControl,
    updateInternalControl,
    deleteInternalControl,
    runControlTest,
} from '../../../services/finance/finance.api';

interface InternalControl {
    id: string;
    code: string;
    name: string;
    description: string;
    category: 'Financial' | 'Operational' | 'Compliance' | 'IT' | 'Strategic';
    type: 'Preventive' | 'Detective' | 'Corrective';
    frequency: 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
    status: 'Active' | 'Inactive' | 'Draft' | 'UnderReview' | 'Obsolete';
    owner: string;
    department: string;
    lastTestDate: string;
    nextTestDate: string;
    testResults: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    effectiveness: 'Effective' | 'PartiallyEffective' | 'Ineffective' | 'NotTested';
    documentation: string;
    createdAt: string;
    updatedAt: string;
    rowVersion?: string;
}

interface InternalControlStats {
    total: number;
    active: number;
    inactive: number;
    draft: number;
    underReview: number;
    obsolete: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    effective: number;
    partiallyEffective: number;
    ineffective: number;
    notTested: number;
    financial: number;
    operational: number;
    compliance: number;
    it: number;
    strategic: number;
}

const InternalControls: React.FC = () => {
    const [items, setItems] = useState<InternalControl[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterRisk, setFilterRisk] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<InternalControl | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<Partial<InternalControl>>({});
    const [testData, setTestData] = useState({ testDate: '', results: '', notes: '' });

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('internal-controls');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterCategory !== 'All') params.category = filterCategory;
            if (filterStatus !== 'All') params.status = filterStatus;
            if (filterRisk !== 'All') params.riskLevel = filterRisk;
            if (filterType !== 'All') params.type = filterType;

            const response = await getInternalControls(params);

            let data: InternalControl[] = [];
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
            console.error('Error fetching internal controls:', error);
            showToast.error('Failed to load internal controls');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterCategory, filterStatus, filterRisk, filterType]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): InternalControlStats => {
        const filtered = items;
        const active = filtered.filter(c => c.status === 'Active').length;
        const inactive = filtered.filter(c => c.status === 'Inactive').length;
        const draft = filtered.filter(c => c.status === 'Draft').length;
        const underReview = filtered.filter(c => c.status === 'UnderReview').length;
        const obsolete = filtered.filter(c => c.status === 'Obsolete').length;
        const highRisk = filtered.filter(c => c.riskLevel === 'High').length;
        const mediumRisk = filtered.filter(c => c.riskLevel === 'Medium').length;
        const lowRisk = filtered.filter(c => c.riskLevel === 'Low').length;
        const effective = filtered.filter(c => c.effectiveness === 'Effective').length;
        const partiallyEffective = filtered.filter(c => c.effectiveness === 'PartiallyEffective').length;
        const ineffective = filtered.filter(c => c.effectiveness === 'Ineffective').length;
        const notTested = filtered.filter(c => c.effectiveness === 'NotTested').length;
        const financial = filtered.filter(c => c.category === 'Financial').length;
        const operational = filtered.filter(c => c.category === 'Operational').length;
        const compliance = filtered.filter(c => c.category === 'Compliance').length;
        const it = filtered.filter(c => c.category === 'IT').length;
        const strategic = filtered.filter(c => c.category === 'Strategic').length;

        return {
            total: filtered.length,
            active,
            inactive,
            draft,
            underReview,
            obsolete,
            highRisk,
            mediumRisk,
            lowRisk,
            effective,
            partiallyEffective,
            ineffective,
            notTested,
            financial,
            operational,
            compliance,
            it,
            strategic,
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
            Draft: 'bg-gray-100 text-gray-700 border-gray-200',
            UnderReview: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Obsolete: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Financial: 'bg-blue-100 text-blue-700 border-blue-200',
            Operational: 'bg-orange-100 text-orange-700 border-orange-200',
            Compliance: 'bg-red-100 text-red-700 border-red-200',
            IT: 'bg-purple-100 text-purple-700 border-purple-200',
            Strategic: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    const getRiskColor = (risk: string) => {
        const colors: Record<string, string> = {
            High: 'bg-red-100 text-red-700 border-red-200',
            Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Low: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[risk] || 'bg-gray-100 text-gray-700';
    };

    const getEffectivenessColor = (effectiveness: string) => {
        const colors: Record<string, string> = {
            Effective: 'bg-green-100 text-green-700 border-green-200',
            PartiallyEffective: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Ineffective: 'bg-red-100 text-red-700 border-red-200',
            NotTested: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[effectiveness] || 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Preventive: 'bg-blue-100 text-blue-700 border-blue-200',
            Detective: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Corrective: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.owner || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesRisk = filterRisk === 'All' || item.riskLevel === filterRisk;
        const matchesType = filterType === 'All' || item.type === filterType;
        return matchesSearch && matchesCategory && matchesStatus && matchesRisk && matchesType;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleCreate = () => {
        setFormMode('create');
        setFormData({
            status: 'Draft',
            category: 'Financial',
            type: 'Preventive',
            riskLevel: 'Medium',
            effectiveness: 'NotTested',
            frequency: 'Monthly',
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item: InternalControl) => {
        setFormMode('edit');
        setFormData(item);
        setIsFormModalOpen(true);
    };

    const handleDelete = (item: InternalControl) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleView = (item: InternalControl) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleTest = (item: InternalControl) => {
        setSelectedItem(item);
        setTestData({
            testDate: new Date().toISOString().split('T')[0],
            results: '',
            notes: ''
        });
        setIsTestModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteInternalControl(selectedItem.id);
            showToast.success('Internal control deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting internal control:', error);
            showToast.error('Failed to delete internal control');
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            if (formMode === 'create') {
                await createInternalControl(formData);
                showToast.success('Internal control created successfully');
            } else {
                await updateInternalControl(formData);
                showToast.success('Internal control updated successfully');
            }
            await fetchData();
            setIsFormModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error('Error saving internal control:', error);
            showToast.error('Failed to save internal control');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRunTest = async () => {
        if (!selectedItem) return;
        try {
            setIsTesting(true);
            await runControlTest({
                controlId: selectedItem.id,
                testDate: testData.testDate,
                results: testData.results,
                testedBy: 'Current User', // This should come from auth context
            });
            showToast.success('Control test completed successfully');
            await fetchData();
            setIsTestModalOpen(false);
            setTestData({ testDate: '', results: '', notes: '' });
        } catch (error) {
            console.error('Error running control test:', error);
            showToast.error('Failed to run control test');
        } finally {
            setIsTesting(false);
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
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Internal Controls</h1>
                        <p className="text-sm text-gray-500">Manage internal controls and compliance requirements</p>
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
                        onClick={() => handlePrintReport({ controls: filteredItems, stats })}
                    >
                        <Printer size={16} /> Print
                    </Button>
                    <Button
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleCreate}
                    >
                        <Plus size={16} /> Add Control
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Controls</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                                <p className="text-xs text-blue-600 mt-1">{stats.active} active</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Shield className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">High Risk</p>
                                <p className="text-2xl font-bold text-red-900">{stats.highRisk}</p>
                                <p className="text-xs text-red-600 mt-1">Requires attention</p>
                            </div>
                            <div className="p-3 bg-red-200 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Effective</p>
                                <p className="text-2xl font-bold text-green-900">{stats.effective}</p>
                                <p className="text-xs text-green-600 mt-1">Working as designed</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Under Review</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.underReview}</p>
                                <p className="text-xs text-yellow-600 mt-1">In review</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <Clock className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Not Tested</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.notTested}</p>
                                <p className="text-xs text-purple-600 mt-1">Awaiting testing</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-purple-700" />
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
                        placeholder="Search controls..."
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
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Compliance">Compliance</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Strategic">Strategic</SelectItem>
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="UnderReview">Under Review</SelectItem>
                        <SelectItem value="Obsolete">Obsolete</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="md:w-36">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Risk" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Risks</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Preventive">Preventive</SelectItem>
                        <SelectItem value="Detective">Detective</SelectItem>
                        <SelectItem value="Corrective">Corrective</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('All');
                        setFilterStatus('All');
                        setFilterRisk('All');
                        setFilterType('All');
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectiveness</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Shield className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No internal controls found</p>
                                        <p className="text-sm text-gray-400">Create your first internal control</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getRiskColor(item.riskLevel)}>{item.riskLevel}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getEffectivenessColor(item.effectiveness)}>{item.effectiveness}</Badge>
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
                                                onClick={() => handleTest(item)}
                                                className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                                                title="Test"
                                            >
                                                <Play size={16} className="text-green-500" />
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} controls
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
                            <Shield className="h-5 w-5 text-blue-600" />
                            Internal Control Details
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
                                    <p className="text-sm text-gray-500">Category</p>
                                    <Badge className={getCategoryColor(selectedItem.category)}>{selectedItem.category}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Risk Level</p>
                                    <Badge className={getRiskColor(selectedItem.riskLevel)}>{selectedItem.riskLevel}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Effectiveness</p>
                                    <Badge className={getEffectivenessColor(selectedItem.effectiveness)}>{selectedItem.effectiveness}</Badge>
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
                                    <p className="text-sm text-gray-500">Frequency</p>
                                    <p className="font-medium">{selectedItem.frequency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Test Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.lastTestDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Next Test Date</p>
                                    <p className="font-medium">{formatDate(selectedItem.nextTestDate)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedItem.description}</p>
                                </div>
                                {selectedItem.testResults && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Test Results</p>
                                        <p className="font-medium">{selectedItem.testResults}</p>
                                    </div>
                                )}
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
                            <Shield className="h-5 w-5 text-blue-600" />
                            {formMode === 'create' ? 'Create Internal Control' : 'Edit Internal Control'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Code</Label>
                                <Input
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., IC-001"
                                />
                            </div>
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Control name"
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
                                        <SelectItem value="Operational">Operational</SelectItem>
                                        <SelectItem value="Compliance">Compliance</SelectItem>
                                        <SelectItem value="IT">IT</SelectItem>
                                        <SelectItem value="Strategic">Strategic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={formData.type || 'Preventive'}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Preventive">Preventive</SelectItem>
                                        <SelectItem value="Detective">Detective</SelectItem>
                                        <SelectItem value="Corrective">Corrective</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Risk Level</Label>
                                <Select
                                    value={formData.riskLevel || 'Medium'}
                                    onValueChange={(value) => setFormData({ ...formData, riskLevel: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select risk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status || 'Draft'}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="UnderReview">Under Review</SelectItem>
                                        <SelectItem value="Obsolete">Obsolete</SelectItem>
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
                                <Label>Frequency</Label>
                                <Select
                                    value={formData.frequency || 'Monthly'}
                                    onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Continuous">Continuous</SelectItem>
                                        <SelectItem value="Daily">Daily</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                                        <SelectItem value="Annually">Annually</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Effectiveness</Label>
                                <Select
                                    value={formData.effectiveness || 'NotTested'}
                                    onValueChange={(value) => setFormData({ ...formData, effectiveness: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select effectiveness" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Effective">Effective</SelectItem>
                                        <SelectItem value="PartiallyEffective">Partially Effective</SelectItem>
                                        <SelectItem value="Ineffective">Ineffective</SelectItem>
                                        <SelectItem value="NotTested">Not Tested</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (formMode === 'create' ? 'Create' : 'Update')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Test Modal */}
            <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-green-600" />
                            Run Control Test
                        </DialogTitle>
                        <DialogDescription>
                            Test the effectiveness of the internal control
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-900">{selectedItem.code}</p>
                                <p className="text-sm text-gray-600">{selectedItem.name}</p>
                            </div>
                            <div>
                                <Label>Test Date</Label>
                                <Input
                                    type="date"
                                    value={testData.testDate}
                                    onChange={(e) => setTestData({ ...testData, testDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Results</Label>
                                <Select
                                    value={testData.results}
                                    onValueChange={(value) => setTestData({ ...testData, results: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select result" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Passed">Passed</SelectItem>
                                        <SelectItem value="Failed">Failed</SelectItem>
                                        <SelectItem value="Partially Passed">Partially Passed</SelectItem>
                                        <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Notes</Label>
                                <Input
                                    value={testData.notes}
                                    onChange={(e) => setTestData({ ...testData, notes: e.target.value })}
                                    placeholder="Test notes"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleRunTest}
                            disabled={isTesting}
                        >
                            {isTesting ? 'Running...' : 'Submit Test'}
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
                            Are you sure you want to delete this internal control? This action cannot be undone.
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
                            <Download className="h-5 w-5 text-blue-600" />
                            Export Internal Controls
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
                                <p>High Risk: <strong>{stats.highRisk}</strong></p>
                                <p>Effective: <strong>{stats.effective}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleExport({ controls: filteredItems, stats })}
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

export default InternalControls;