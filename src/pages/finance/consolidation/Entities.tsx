// src/pages/finance/consolidation/Entities.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, Search, RefreshCw, Eye, Download, Printer,
    Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2,
    Globe, Users, Target, AlertCircle, CheckCircle,
    BarChart3, Activity, Shield, FileText, X, MapPin,
    Award, TrendingUp, TrendingDown, DollarSign, Calendar
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
    getEntities,
    createEntity,
    updateEntity,
    deleteEntity,
} from '../../../services/finance/finance.api';

// ✅ Updated interface to match backend
interface Entity {
    id: string;
    code: string;
    name: string;
    legalName: string; // ✅ Added
    type: 'Parent' | 'Subsidiary' | 'Associate' | 'JointVenture'; // ✅ Updated types
    country: string;
    currency: string;
    registrationNumber: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    isActive: boolean;
    isConsolidated: boolean;
    consolidationMethod: 'Full' | 'Equity' | 'Proportional' | 'Cost';
    ownershipPercentage: number;
    parentEntityId: string | null;
    parentEntityName: string | null; // ✅ Added
    fiscalYearStart: string | null; // ✅ Added
    fiscalYearEnd: string | null;
    dateAdd: string; // ✅ Changed from createdAt
    dateMod: string | null; // ✅ Changed from updatedAt
    isDeleted?: boolean;
}

interface EntityStats {
    total: number;
    active: number;
    inactive: number;
    parent: number; // ✅ Changed from legal
    subsidiary: number;
    associate: number; // ✅ Added
    jointVenture: number;
    consolidated: number;
    totalOwnership: number;
}

const Entities: React.FC = () => {
    const [items, setItems] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCountry, setFilterCountry] = useState('All');
    const [filterConsolidation, setFilterConsolidation] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<Entity | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState<Partial<Entity>>({});

    const {
        exportFormat,
        setExportFormat,
        exporting,
        isExportModalOpen,
        setIsExportModalOpen,
        handlePrintReport,
        handleExport,
        handleRefresh,
    } = useReportExport('entities');

    const ITEMS_PER_PAGE = 10;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setIsRefreshing(true);

            const params: any = {};
            if (filterType !== 'All') params.type = filterType;
            if (filterStatus !== 'All') params.isActive = filterStatus === 'Active';
            if (filterCountry !== 'All') params.country = filterCountry;
            if (filterConsolidation !== 'All') params.isConsolidated = filterConsolidation === 'Consolidated';

            const response = await getEntities(params);

            let data: Entity[] = [];
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
            console.error('Error fetching entities:', error);
            showToast.error('Failed to load entities');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [filterType, filterStatus, filterCountry, filterConsolidation]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStats = (): EntityStats => {
        const filtered = items;
        const active = filtered.filter(c => c.isActive).length;
        const inactive = filtered.filter(c => !c.isActive).length;
        const parent = filtered.filter(c => c.type === 'Parent').length;
        const subsidiary = filtered.filter(c => c.type === 'Subsidiary').length;
        const associate = filtered.filter(c => c.type === 'Associate').length;
        const jointVenture = filtered.filter(c => c.type === 'JointVenture').length;
        const consolidated = filtered.filter(c => c.isConsolidated).length;
        const totalOwnership = filtered.reduce((sum, c) => sum + (c.ownershipPercentage || 0), 0);

        return {
            total: filtered.length,
            active,
            inactive,
            parent,
            subsidiary,
            associate,
            jointVenture,
            consolidated,
            totalOwnership,
        };
    };

    const stats = getStats();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateString: string | null) => {
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

    const getStatusColor = (status: boolean) => {
        return status ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Parent: 'bg-purple-100 text-purple-700 border-purple-200',
            Subsidiary: 'bg-blue-100 text-blue-700 border-blue-200',
            JointVenture: 'bg-orange-100 text-orange-700 border-orange-200',
            Associate: 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getConsolidationMethodColor = (method: string) => {
        const colors: Record<string, string> = {
            Full: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            Equity: 'bg-blue-100 text-blue-700 border-blue-200',
            Proportional: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Cost: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[method] || 'bg-gray-100 text-gray-700';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.country || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || item.type === filterType;
        const matchesStatus = filterStatus === 'All' || (filterStatus === 'Active' ? item.isActive : !item.isActive);
        const matchesCountry = filterCountry === 'All' || item.country === filterCountry;
        const matchesConsolidation = filterConsolidation === 'All' || (filterConsolidation === 'Consolidated' ? item.isConsolidated : !item.isConsolidated);
        return matchesSearch && matchesType && matchesStatus && matchesCountry && matchesConsolidation;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const countries = [...new Set(items.map(c => c.country).filter(Boolean))];
    const types = [...new Set(items.map(c => c.type).filter(Boolean))];

    const handleCreate = () => {
        setFormMode('create');
        setFormData({
            isActive: true,
            isConsolidated: false,
            consolidationMethod: 'Full',
            ownershipPercentage: 100,
            type: 'Subsidiary',
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (item: Entity) => {
        setFormMode('edit');
        setFormData(item);
        setIsFormModalOpen(true);
    };

    const handleDelete = (item: Entity) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleView = (item: Entity) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteEntity(selectedItem.id);
            showToast.success('Entity deleted successfully');
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting entity:', error);
            showToast.error('Failed to delete entity');
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            // Prepare DTO for backend
            const dto = {
                code: formData.code || '',
                name: formData.name || '',
                legalName: formData.legalName || formData.name || '',
                type: formData.type || 'Subsidiary',
                country: formData.country || '',
                currency: formData.currency || '',
                registrationNumber: formData.registrationNumber || '',
                taxId: formData.taxId || '',
                address: formData.address || '',
                phone: formData.phone || '',
                email: formData.email || '',
                website: formData.website || '',
                isActive: formData.isActive ?? true,
                isConsolidated: formData.isConsolidated ?? false,
                consolidationMethod: formData.consolidationMethod || 'Full',
                ownershipPercentage: formData.ownershipPercentage || 100,
                parentEntityId: formData.parentEntityId || null,
                fiscalYearStart: formData.fiscalYearStart || null,
                fiscalYearEnd: formData.fiscalYearEnd || null,
            };

            if (formMode === 'create') {
                await createEntity(dto);
                showToast.success('Entity created successfully');
            } else {
                await updateEntity({ ...dto, id: formData.id! });
                showToast.success('Entity updated successfully');
            }
            await fetchData();
            setIsFormModalOpen(false);
            setFormData({});
        } catch (error) {
            console.error('Error saving entity:', error);
            showToast.error('Failed to save entity');
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
            {/* Header - Same as before */}

            {/* Stats Cards - Updated */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total Entities</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.total}</p>
                                <p className="text-xs text-indigo-600 mt-1">{stats.active} active</p>
                            </div>
                            <div className="p-3 bg-indigo-200 rounded-xl">
                                <Building2 className="h-6 w-6 text-indigo-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Consolidated</p>
                                <p className="text-2xl font-bold text-emerald-900">{stats.consolidated}</p>
                                <p className="text-xs text-emerald-600 mt-1">Full/Equity method</p>
                            </div>
                            <div className="p-3 bg-emerald-200 rounded-xl">
                                <Globe className="h-6 w-6 text-emerald-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Subsidiaries</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.subsidiary}</p>
                                <p className="text-xs text-blue-600 mt-1">Controlled entities</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Users className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Joint Ventures</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.jointVenture}</p>
                                <p className="text-xs text-purple-600 mt-1">Strategic partnerships</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <Target className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-700 font-medium">Avg Ownership</p>
                                <p className="text-2xl font-bold text-cyan-900">
                                    {stats.total > 0 ? (stats.totalOwnership / stats.total).toFixed(1) : 0}%
                                </p>
                                <p className="text-xs text-cyan-600 mt-1">Average ownership</p>
                            </div>
                            <div className="p-3 bg-cyan-200 rounded-xl">
                                <Award className="h-6 w-6 text-cyan-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters - Add Parent to types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search entities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Subsidiary">Subsidiary</SelectItem>
                        <SelectItem value="Associate">Associate</SelectItem>
                        <SelectItem value="JointVenture">Joint Venture</SelectItem>
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
                    </SelectContent>
                </Select>

                <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger className="md:w-40">
                        <Globe className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Countries</SelectItem>
                        {countries.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterConsolidation} onValueChange={setFilterConsolidation}>
                    <SelectTrigger className="md:w-44">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Consolidation" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Consolidated">Consolidated</SelectItem>
                        <SelectItem value="NonConsolidated">Non-Consolidated</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterType('All');
                        setFilterStatus('All');
                        setFilterCountry('All');
                        setFilterConsolidation('All');
                        fetchData();
                    }}
                    className="flex items-center gap-2"
                >
                    <X size={16} />
                    Clear Filters
                </Button>
            </div>

            {/* Table - Updated column headers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Consolidated</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ownership</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Building2 className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No entities found</p>
                                        <p className="text-sm text-gray-400">Create your first entity to get started</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={14} className="text-gray-400" />
                                            {item.country}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={item.isConsolidated ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                                            {item.isConsolidated ? 'Yes' : 'No'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                                        {item.ownershipPercentage}%
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Badge className={getStatusColor(item.isActive)}>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
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
                {/* Pagination - Same as before */}
            </div>

            {/* View Modal - Updated with legalName and fiscalYearStart */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            Entity Details
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
                                    <p className="text-sm text-gray-500">Legal Name</p>
                                    <p className="font-medium">{selectedItem.legalName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeColor(selectedItem.type)}>{selectedItem.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedItem.isActive)}>
                                        {selectedItem.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Country</p>
                                    <p className="font-medium">{selectedItem.country}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Currency</p>
                                    <p className="font-medium">{selectedItem.currency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Registration Number</p>
                                    <p className="font-medium">{selectedItem.registrationNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tax ID</p>
                                    <p className="font-medium">{selectedItem.taxId || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Parent Entity</p>
                                    <p className="font-medium">{selectedItem.parentEntityName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ownership %</p>
                                    <p className="font-medium">{selectedItem.ownershipPercentage}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Consolidation Method</p>
                                    <Badge className={getConsolidationMethodColor(selectedItem.consolidationMethod)}>
                                        {selectedItem.consolidationMethod}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Fiscal Year Start</p>
                                    <p className="font-medium">{formatDate(selectedItem.fiscalYearStart)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Fiscal Year End</p>
                                    <p className="font-medium">{formatDate(selectedItem.fiscalYearEnd)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created</p>
                                    <p className="font-medium">{formatDate(selectedItem.dateAdd)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Modified</p>
                                    <p className="font-medium">{formatDate(selectedItem.dateMod)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Consolidated</p>
                                    <Badge className={selectedItem.isConsolidated ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}>
                                        {selectedItem.isConsolidated ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{selectedItem.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{selectedItem.email || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">{selectedItem.address || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Website</p>
                                        <p className="font-medium text-blue-600">{selectedItem.website || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Form Modal - Updated with all fields including legalName and fiscalYearStart */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            {formMode === 'create' ? 'Create Entity' : 'Edit Entity'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Code *</Label>
                                <Input
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g., ENT-001"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Name *</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Entity name"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Legal Name</Label>
                                <Input
                                    value={formData.legalName || ''}
                                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                    placeholder="Legal entity name"
                                />
                            </div>
                            <div>
                                <Label>Type *</Label>
                                <Select
                                    value={formData.type || 'Subsidiary'}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Parent">Parent</SelectItem>
                                        <SelectItem value="Subsidiary">Subsidiary</SelectItem>
                                        <SelectItem value="Associate">Associate</SelectItem>
                                        <SelectItem value="JointVenture">Joint Venture</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Country *</Label>
                                <Input
                                    value={formData.country || ''}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="Country"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Currency *</Label>
                                <Input
                                    value={formData.currency || ''}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    placeholder="e.g., USD"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Registration Number</Label>
                                <Input
                                    value={formData.registrationNumber || ''}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    placeholder="Registration number"
                                />
                            </div>
                            <div>
                                <Label>Tax ID</Label>
                                <Input
                                    value={formData.taxId || ''}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    placeholder="Tax ID"
                                />
                            </div>
                            <div>
                                <Label>Ownership Percentage</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.ownershipPercentage || 100}
                                    onChange={(e) => setFormData({ ...formData, ownershipPercentage: parseFloat(e.target.value) || 0 })}
                                    placeholder="100"
                                />
                            </div>
                            <div>
                                <Label>Parent Entity ID</Label>
                                <Input
                                    value={formData.parentEntityId || ''}
                                    onChange={(e) => setFormData({ ...formData, parentEntityId: e.target.value || null })}
                                    placeholder="Parent entity ID (GUID)"
                                />
                            </div>
                            <div>
                                <Label>Fiscal Year Start</Label>
                                <Input
                                    type="date"
                                    value={formData.fiscalYearStart || ''}
                                    onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value || null })}
                                />
                            </div>
                            <div>
                                <Label>Fiscal Year End</Label>
                                <Input
                                    type="date"
                                    value={formData.fiscalYearEnd || ''}
                                    onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value || null })}
                                />
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Phone number"
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Email address"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Address</Label>
                                <Input
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Street address"
                                />
                            </div>
                            <div>
                                <Label>Website</Label>
                                <Input
                                    value={formData.website || ''}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="Website URL"
                                />
                            </div>
                            <div>
                                <Label>Is Active</Label>
                                <Select
                                    value={formData.isActive ? 'true' : 'false'}
                                    onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Is Consolidated</Label>
                                <Select
                                    value={formData.isConsolidated ? 'true' : 'false'}
                                    onValueChange={(value) => setFormData({ ...formData, isConsolidated: value === 'true' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Consolidation Method</Label>
                                <Select
                                    value={formData.consolidationMethod || 'Full'}
                                    onValueChange={(value) => setFormData({ ...formData, consolidationMethod: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full">Full Consolidation</SelectItem>
                                        <SelectItem value="Equity">Equity Method</SelectItem>
                                        <SelectItem value="Proportional">Proportional</SelectItem>
                                        <SelectItem value="Cost">Cost Method</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (formMode === 'create' ? 'Create' : 'Update')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal - Same as before */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Confirm Delete
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this entity? This action cannot be undone.
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
                            <Download className="h-5 w-5 text-indigo-600" />
                            Export Entities
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
                                <p>Consolidated: <strong>{stats.consolidated}</strong></p>
                                <p>Subsidiaries: <strong>{stats.subsidiary}</strong></p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => handleExport({ entities: filteredItems, stats })}
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

export default Entities;