// src/pages/finance/ap/VendorManagement.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, RefreshCw, Search, Filter, Eye, Edit,
    Plus, DollarSign, Calendar, Phone, Mail, MapPin,
    ChevronLeft, ChevronRight, MoreVertical, Save, X,
    AlertCircle, CheckCircle, Download, Printer, Clock,
    FileText, CreditCard, Briefcase, Truck, Trash2,
    UserPlus, Building, Globe, Star, MessageSquare
} from 'lucide-react';
import {
    getAccounts,
    getVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    toggleVendorStatus,
    getInvoices, // ✅ Import getInvoices
} from '@/modules/finance/services/finance.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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

interface Vendor {
    id: string;
    code: string;
    name: string;
    nameAm?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    type: 'Supplier' | 'Service Provider' | 'Contractor' | 'Consultant';
    paymentTerms?: string;
    currency?: string;
    bankName?: string;
    bankAccount?: string;
    createdAt: string;
    updatedAt?: string;
    notes?: string[];
    contactPerson?: {
        name: string;
        phone: string;
        email: string;
        position: string;
    };
    stats?: {
        totalInvoices: number;
        paidInvoices: number;
        overdueInvoices: number;
        totalSpent: number;      // Sum of all invoice amounts
        totalPayable: number;    // Sum of unpaid invoice amounts (balance due)
        avgPaymentDays: number;
    };
}

const VendorManagement: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameAm: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
        type: 'Supplier' as Vendor['type'],
        status: 'Active' as Vendor['status'],
        paymentTerms: 'Net 30',
        currency: 'USD',
        bankName: '',
        bankAccount: '',
        contactPerson: {
            name: '',
            phone: '',
            email: '',
            position: '',
        },
    });
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchVendorsWithStats();
    }, []);

    // ✅ Fetch vendors with statistics from invoices
    const fetchVendorsWithStats = async () => {
        try {
            setLoading(true);

            // Fetch vendors
            const vendorsRes = await getVendors();
            console.log('📡 Vendors response:', vendorsRes);

            let vendorsData = [];
            if (vendorsRes.data) {
                if (Array.isArray(vendorsRes.data)) {
                    vendorsData = vendorsRes.data;
                } else if (vendorsRes.data.data && Array.isArray(vendorsRes.data.data)) {
                    vendorsData = vendorsRes.data.data;
                } else if (vendorsRes.data.$values && Array.isArray(vendorsRes.data.$values)) {
                    vendorsData = vendorsRes.data.$values;
                }
            }

            // Fetch invoices to calculate statistics
            const invoicesRes = await getInvoices();
            console.log('📡 Invoices response:', invoicesRes);

            let invoicesData = [];
            if (invoicesRes.data) {
                if (Array.isArray(invoicesRes.data)) {
                    invoicesData = invoicesRes.data;
                } else if (invoicesRes.data.data && Array.isArray(invoicesRes.data.data)) {
                    invoicesData = invoicesRes.data.data;
                } else if (invoicesRes.data.$values && Array.isArray(invoicesRes.data.$values)) {
                    invoicesData = invoicesRes.data.$values;
                }
            }

            // ✅ Calculate statistics per vendor
            const vendorStats: Record<string, any> = {};

            invoicesData.forEach((inv: any) => {
                const vendorId = inv.vendorId || inv.vendor_id || inv.supplierId;
                if (!vendorId) return;

                if (!vendorStats[vendorId]) {
                    vendorStats[vendorId] = {
                        totalInvoices: 0,
                        paidInvoices: 0,
                        overdueInvoices: 0,
                        totalSpent: 0,
                        totalPayable: 0,
                        totalPaid: 0,
                        avgPaymentDays: 0,
                        paymentDays: [],
                    };
                }

                const totalAmount = Number(inv.totalAmount || inv.total_amount || 0);
                const paidAmount = Number(inv.paidAmount || inv.paid_amount || 0);
                const balanceDue = totalAmount - paidAmount;
                const status = inv.status || 'Draft';

                // Count invoices
                vendorStats[vendorId].totalInvoices += 1;

                // Count paid invoices
                if (status === 'Paid') {
                    vendorStats[vendorId].paidInvoices += 1;
                }

                // Check for overdue (if due date passed and not paid)
                if (status !== 'Paid' && status !== 'Rejected') {
                    const dueDate = inv.dueDate || inv.due_date;
                    if (dueDate && new Date(dueDate) < new Date()) {
                        vendorStats[vendorId].overdueInvoices += 1;
                    }
                }

                // Total spent (sum of all invoice amounts)
                vendorStats[vendorId].totalSpent += totalAmount;

                // Total payable (sum of balance due)
                vendorStats[vendorId].totalPayable += balanceDue;

                // Total paid amount
                vendorStats[vendorId].totalPaid += paidAmount;
            });

            // Map vendors with their stats
            const mappedVendors: Vendor[] = vendorsData.map((item: any) => {
                const vendorId = item.id;
                const stats = vendorStats[vendorId] || {
                    totalInvoices: 0,
                    paidInvoices: 0,
                    overdueInvoices: 0,
                    totalSpent: 0,
                    totalPayable: 0,
                    avgPaymentDays: 0,
                };

                return {
                    id: vendorId,
                    code: item.code || `VEND-${Date.now()}`,
                    name: item.name || 'Unknown Vendor',
                    nameAm: item.nameAm || '',
                    email: item.email || '',
                    phone: item.phone || '',
                    mobile: item.mobile || '',
                    address: item.address || '',
                    city: item.city || '',
                    country: item.country || '',
                    taxId: item.taxId || '',
                    type: item.vendorType || item.type || 'Supplier',
                    status: item.status || 'Active',
                    paymentTerms: item.paymentTerms || 'Net 30',
                    currency: item.currency || 'USD',
                    bankName: item.bankName || '',
                    bankAccount: item.bankAccount || '',
                    createdAt: item.dateAdd || item.createdAt || new Date().toISOString(),
                    updatedAt: item.dateMod || item.updatedAt,
                    contactPerson: item.contactPerson ?
                        (typeof item.contactPerson === 'string' ? JSON.parse(item.contactPerson) : item.contactPerson)
                        : undefined,
                    stats: {
                        totalInvoices: stats.totalInvoices || 0,
                        paidInvoices: stats.paidInvoices || 0,
                        overdueInvoices: stats.overdueInvoices || 0,
                        totalSpent: stats.totalSpent || 0,
                        totalPayable: stats.totalPayable || 0,
                        avgPaymentDays: stats.avgPaymentDays || 0,
                    },
                };
            });

            setVendors(mappedVendors);
            console.log('✅ Vendors with stats loaded:', mappedVendors);

        } catch (error) {
            console.error('Error fetching vendors:', error);
            showToast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Create vendor using createVendor
    const handleAddVendor = async () => {
        if (!formData.name) {
            showToast.error('Vendor name is required');
            return;
        }

        try {
            const payload = {
                name: formData.name,
                nameAm: formData.nameAm,
                email: formData.email,
                phone: formData.phone,
                mobile: formData.mobile,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                taxId: formData.taxId,
                vendorType: formData.type,
                paymentTerms: formData.paymentTerms,
                currency: formData.currency,
                bankName: formData.bankName,
                bankAccount: formData.bankAccount,
                contactPerson: formData.contactPerson,
            };

            console.log('📤 Creating vendor with payload:', payload);
            const response = await createVendor(payload);
            console.log('📥 Vendor created:', response);

            showToast.success('Vendor added successfully');
            setIsAddModalOpen(false);
            resetForm();
            await fetchVendorsWithStats();
        } catch (error: any) {
            console.error('❌ Error adding vendor:', error);
            console.error('❌ Response:', error.response?.data);
            showToast.error(error.response?.data?.message || 'Failed to add vendor');
        }
    };

    // ✅ Update vendor using updateVendor
    const handleUpdateVendor = async () => {
        if (!selectedVendor) return;

        try {
            const payload = {
                id: selectedVendor.id,
                name: formData.name,
                nameAm: formData.nameAm,
                email: formData.email,
                phone: formData.phone,
                mobile: formData.mobile,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                taxId: formData.taxId,
                vendorType: formData.type,
                status: formData.status,
                paymentTerms: formData.paymentTerms,
                currency: formData.currency,
                bankName: formData.bankName,
                bankAccount: formData.bankAccount,
                contactPerson: formData.contactPerson,
            };

            const response = await updateVendor(payload);
            console.log('📤 Vendor updated:', response);

            showToast.success('Vendor updated successfully');
            setIsEditModalOpen(false);
            await fetchVendorsWithStats();
        } catch (error: any) {
            console.error('Error updating vendor:', error);
            showToast.error(error.response?.data?.message || 'Failed to update vendor');
        }
    };

    // ✅ Delete vendor using deleteVendor
    const handleDeleteVendor = async () => {
        if (!selectedVendor) return;

        try {
            await deleteVendor(selectedVendor.id);
            showToast.success('Vendor deleted successfully');
            setIsDeleteModalOpen(false);
            await fetchVendorsWithStats();
        } catch (error: any) {
            console.error('Error deleting vendor:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete vendor');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            nameAm: '',
            email: '',
            phone: '',
            mobile: '',
            address: '',
            city: '',
            country: '',
            taxId: '',
            type: 'Supplier',
            status: 'Active',
            paymentTerms: 'Net 30',
            currency: 'USD',
            bankName: '',
            bankAccount: '',
            contactPerson: {
                name: '',
                phone: '',
                email: '',
                position: '',
            },
        });
    };

    const openEditModal = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setFormData({
            code: vendor.code,
            name: vendor.name,
            nameAm: vendor.nameAm || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            mobile: vendor.mobile || '',
            address: vendor.address || '',
            city: vendor.city || '',
            country: vendor.country || '',
            taxId: vendor.taxId || '',
            type: vendor.type,
            status: vendor.status,
            paymentTerms: vendor.paymentTerms || 'Net 30',
            currency: vendor.currency || 'USD',
            bankName: vendor.bankName || '',
            bankAccount: vendor.bankAccount || '',
            contactPerson: {
                name: vendor.contactPerson?.name || '',
                phone: vendor.contactPerson?.phone || '',
                email: vendor.contactPerson?.email || '',
                position: vendor.contactPerson?.position || '',
            },
        });
        setIsEditModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Active: 'bg-green-100 text-green-700 border-green-200',
            Inactive: 'bg-gray-100 text-gray-700 border-gray-200',
            Suspended: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Supplier: 'bg-blue-100 text-blue-700',
            'Service Provider': 'bg-purple-100 text-purple-700',
            Contractor: 'bg-orange-100 text-orange-700',
            Consultant: 'bg-green-100 text-green-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredVendors = vendors.filter(v => {
        const matchesSearch =
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
        const matchesType = filterType === 'All' || v.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedVendors = filteredVendors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Calculate totals for stats cards
    const totalSpent = vendors.reduce((sum, v) => sum + (v.stats?.totalSpent || 0), 0);
    const totalPayable = vendors.reduce((sum, v) => sum + (v.stats?.totalPayable || 0), 0);
    const totalInvoices = vendors.reduce((sum, v) => sum + (v.stats?.totalInvoices || 0), 0);

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
                        <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
                        <p className="text-sm text-gray-500">Manage all vendor accounts</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchVendorsWithStats}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        <UserPlus size={16} />
                        Add Vendor
                    </Button>
                </div>
            </div>

            {/* Stats Cards - Updated with real data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Vendors</p>
                                <p className="text-2xl font-bold text-blue-900">{vendors.length}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                            {vendors.filter(v => v.status === 'Active').length} active
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Spend</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {formatCurrency(totalSpent)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <DollarSign className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                            Total invoice amount
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Total Payable</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {formatCurrency(totalPayable)}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <CreditCard className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                            Outstanding balance
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Total Invoices</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {totalInvoices}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <FileText className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                            All invoice history
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search vendors..."
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
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:w-40">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Supplier">Supplier</SelectItem>
                        <SelectItem value="Service Provider">Service Provider</SelectItem>
                        <SelectItem value="Contractor">Contractor</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table - Updated with more columns */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Spend</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payable</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invoices</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedVendors.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                    No vendors found
                                </td>
                            </tr>
                        ) : (
                            paginatedVendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <Building className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                                                {vendor.email && (
                                                    <p className="text-xs text-gray-500">{vendor.email}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{vendor.code}</td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(vendor.type)}>
                                            {vendor.type}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                                        {formatCurrency(vendor.stats?.totalSpent )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-yellow-600">
                                        {formatCurrency(vendor.stats?.totalPayable )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                            {vendor.stats?.totalInvoices }
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(vendor.status)}>
                                            {vendor.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedVendor(vendor);
                                                    setIsViewModalOpen(true);
                                                }}
                                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <Eye size={16} className="text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(vendor)}
                                                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} className="text-yellow-600" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedVendor(vendor);
                                                    setIsDeleteModalOpen(true);
                                                }}
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
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredVendors.length)} of {filteredVendors.length} vendors
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages || 1}
                        </span>
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

            {/* Add Vendor Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-indigo-600" />
                            Add Vendor
                        </DialogTitle>
                        <DialogDescription>
                            Create a new vendor account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Vendor Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <Label>Name (Amharic)</Label>
                                <Input
                                    value={formData.nameAm}
                                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                                    placeholder="አማርኛ ስም"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Vendor Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Supplier">Supplier</SelectItem>
                                        <SelectItem value="Service Provider">Service Provider</SelectItem>
                                        <SelectItem value="Contractor">Contractor</SelectItem>
                                        <SelectItem value="Consultant">Consultant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Street address"
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>City</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="Country"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tax ID</Label>
                                <Input
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    placeholder="Tax identification number"
                                />
                            </div>
                            <div>
                                <Label>Payment Terms</Label>
                                <Select
                                    value={formData.paymentTerms}
                                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Net 15">Net 15</SelectItem>
                                        <SelectItem value="Net 30">Net 30</SelectItem>
                                        <SelectItem value="Net 45">Net 45</SelectItem>
                                        <SelectItem value="Net 60">Net 60</SelectItem>
                                        <SelectItem value="COD">COD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Bank Name</Label>
                                <Input
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    placeholder="Bank name"
                                />
                            </div>
                            <div>
                                <Label>Bank Account</Label>
                                <Input
                                    value={formData.bankAccount}
                                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                    placeholder="Account number"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Contact Person</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <Input
                                    value={formData.contactPerson.name}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, name: e.target.value } })}
                                    placeholder="Name"
                                />
                                <Input
                                    value={formData.contactPerson.phone}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, phone: e.target.value } })}
                                    placeholder="Phone"
                                />
                                <Input
                                    value={formData.contactPerson.email}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, email: e.target.value } })}
                                    placeholder="Email"
                                />
                                <Input
                                    value={formData.contactPerson.position}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, position: e.target.value } })}
                                    placeholder="Position"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddVendor}>
                            <Save className="h-4 w-4 mr-2" />
                            Add Vendor
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Vendor Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-indigo-600" />
                            Edit Vendor
                        </DialogTitle>
                        <DialogDescription>
                            Update vendor information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Vendor Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Name (Amharic)</Label>
                                <Input
                                    value={formData.nameAm}
                                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Vendor Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Supplier">Supplier</SelectItem>
                                        <SelectItem value="Service Provider">Service Provider</SelectItem>
                                        <SelectItem value="Contractor">Contractor</SelectItem>
                                        <SelectItem value="Consultant">Consultant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Address</Label>
                            <Textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>City</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tax ID</Label>
                                <Input
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Payment Terms</Label>
                                <Select
                                    value={formData.paymentTerms}
                                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Net 15">Net 15</SelectItem>
                                        <SelectItem value="Net 30">Net 30</SelectItem>
                                        <SelectItem value="Net 45">Net 45</SelectItem>
                                        <SelectItem value="Net 60">Net 60</SelectItem>
                                        <SelectItem value="COD">COD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Bank Name</Label>
                                <Input
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Bank Account</Label>
                                <Input
                                    value={formData.bankAccount}
                                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Contact Person</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <Input
                                    value={formData.contactPerson.name}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, name: e.target.value } })}
                                />
                                <Input
                                    value={formData.contactPerson.phone}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, phone: e.target.value } })}
                                />
                                <Input
                                    value={formData.contactPerson.email}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, email: e.target.value } })}
                                />
                                <Input
                                    value={formData.contactPerson.position}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: { ...formData.contactPerson, position: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleUpdateVendor}>
                            <Save className="h-4 w-4 mr-2" />
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* View Vendor Modal - Updated with stats */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            Vendor Details
                        </DialogTitle>
                        <DialogDescription>
                            View vendor information and statistics.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedVendor && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Code</p>
                                    <p className="font-mono font-medium">{selectedVendor.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedVendor.name}</p>
                                </div>
                                {selectedVendor.nameAm && (
                                    <div>
                                        <p className="text-sm text-gray-500">Name (Amharic)</p>
                                        <p className="font-medium">{selectedVendor.nameAm}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <Badge className={getTypeColor(selectedVendor.type)}>
                                        {selectedVendor.type}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <Badge className={getStatusColor(selectedVendor.status)}>
                                        {selectedVendor.status}
                                    </Badge>
                                </div>
                            </div>

                            {/* ✅ Statistics Section */}
                            <div className="border-t border-gray-200 pt-3 mt-2">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Statistics</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <p className="text-xs text-blue-600">Total Spend</p>
                                        <p className="text-lg font-bold text-blue-700">
                                            {formatCurrency(selectedVendor.stats?.totalSpent )}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 p-2 rounded-lg">
                                        <p className="text-xs text-yellow-600">Payable</p>
                                        <p className="text-lg font-bold text-yellow-700">
                                            {formatCurrency(selectedVendor.stats?.totalPayable )}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded-lg">
                                        <p className="text-xs text-green-600">Total Invoices</p>
                                        <p className="text-lg font-bold text-green-700">
                                            {selectedVendor.stats?.totalInvoices }
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-2 rounded-lg">
                                        <p className="text-xs text-purple-600">Paid Invoices</p>
                                        <p className="text-lg font-bold text-purple-700">
                                            {selectedVendor.stats?.paidInvoices }
                                        </p>
                                    </div>
                                </div>
                                {/* Overdue Invoices Card - Always visible */}
                                <div className={`mt-2 p-2 rounded-lg border ${selectedVendor.stats?.overdueInvoices > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className={`text-xs font-medium ${selectedVendor.stats?.overdueInvoices > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                        Overdue Invoices
                                    </p>
                                    <p className={`text-lg font-bold ${selectedVendor.stats?.overdueInvoices > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                                        {selectedVendor.stats?.overdueInvoices || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            {selectedVendor.contactPerson && selectedVendor.contactPerson.name && (
                                <div className="border-t border-gray-200 pt-3">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Person</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Name</p>
                                            <p className="font-medium">{selectedVendor.contactPerson.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Position</p>
                                            <p className="font-medium">{selectedVendor.contactPerson.position || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Phone</p>
                                            <p className="font-medium">{selectedVendor.contactPerson.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="font-medium">{selectedVendor.contactPerson.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedVendor.address && (
                                <div className="border-t border-gray-200 pt-3">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-sm">{selectedVendor.address}</p>
                                    {selectedVendor.city && (
                                        <p className="text-sm text-gray-600">{selectedVendor.city}, {selectedVendor.country || ''}</p>
                                    )}
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3 flex justify-between text-xs text-gray-400">
                                <span>Created: {formatDate(selectedVendor.createdAt)}</span>
                                {selectedVendor.updatedAt && (
                                    <span>Updated: {formatDate(selectedVendor.updatedAt)}</span>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Vendor Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Vendor
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700">
                            Are you sure you want to delete <strong>{selectedVendor?.name}</strong>?
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            This will remove all vendor data and transaction history.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteVendor}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default VendorManagement;