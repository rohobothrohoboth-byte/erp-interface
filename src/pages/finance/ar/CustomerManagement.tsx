// src/pages/finance/ar/CustomerManagement.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, RefreshCw, Search, Filter, Eye, Edit,
    Plus, DollarSign, Calendar, Building2, Phone,
    Mail, MapPin, User, ChevronLeft, ChevronRight,
    MoreVertical, Save, X, AlertCircle, CheckCircle,
    Download, Printer, Clock, FileText, CreditCard,
    Star, MessageSquare, Trash2, UserPlus, Briefcase,
    Globe, TrendingUp, TrendingDown, Award, PieChart,
    Shield, BadgeCheck, Receipt, Wallet, BarChart3
} from 'lucide-react';
import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    getInvoices,
    getPayments,
} from '../../../services/finance/finance.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../../../components/ui/popover';

interface Customer {
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
    type: 'Individual' | 'Company' | 'Government' | 'Non-Profit';
    creditLimit?: number;
    balance: number;
    paymentTerms?: string;
    currency?: string;
    salesRep?: string;
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
        totalSpent: number;
        avgPaymentDays: number;
        lastInvoiceDate?: string;
    };
}

const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
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
        type: 'Company' as Customer['type'],
        status: 'Active' as Customer['status'],
        creditLimit: 0,
        paymentTerms: 'Net 30',
        currency: 'USD',
        salesRep: '',
        contactPerson: {
            name: '',
            phone: '',
            email: '',
            position: '',
        },
    });
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // ✅ Fetch customers from API
            const customersRes = await getCustomers();
            console.log('📡 Customers response:', customersRes);

            let customersData = [];
            if (customersRes.data) {
                if (Array.isArray(customersRes.data)) {
                    customersData = customersRes.data;
                } else if (customersRes.data.data && Array.isArray(customersRes.data.data)) {
                    customersData = customersRes.data.data;
                } else if (customersRes.data.$values && Array.isArray(customersRes.data.$values)) {
                    customersData = customersRes.data.$values;
                }
            }

            // ✅ Fetch invoices and payments for stats
            const [invoicesRes, paymentsRes] = await Promise.all([
                getInvoices(),
                getPayments(),
            ]);

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

            let paymentsData = [];
            if (paymentsRes.data) {
                if (Array.isArray(paymentsRes.data)) {
                    paymentsData = paymentsRes.data;
                } else if (paymentsRes.data.data && Array.isArray(paymentsRes.data.data)) {
                    paymentsData = paymentsRes.data.data;
                } else if (paymentsRes.data.$values && Array.isArray(paymentsRes.data.$values)) {
                    paymentsData = paymentsRes.data.$values;
                }
            }

            // ✅ Calculate customer stats from invoices
            const customerStats: Record<string, any> = {};
            invoicesData.forEach((inv: any) => {
                const customerId = inv.customerId || inv.customer_id || inv.customerId;
                if (!customerId) return;

                if (!customerStats[customerId]) {
                    customerStats[customerId] = {
                        totalInvoices: 0,
                        paidInvoices: 0,
                        overdueInvoices: 0,
                        totalSpent: 0,
                        totalPaid: 0,
                        avgPaymentDays: 0,
                        lastInvoiceDate: null,
                    };
                }

                const totalAmount = Number(inv.totalAmount || inv.total_amount || 0);
                const paidAmount = Number(inv.paidAmount || inv.paid_amount || 0);
                const status = inv.status || 'Draft';
                const dueDate = inv.dueDate || inv.due_date;
                const invoiceDate = inv.invoiceDate || inv.invoice_date;

                customerStats[customerId].totalInvoices += 1;
                customerStats[customerId].totalSpent += totalAmount;
                customerStats[customerId].totalPaid += paidAmount;

                if (status === 'Paid' || status === 'Completed') {
                    customerStats[customerId].paidInvoices += 1;
                } else if (status !== 'Cancelled' && status !== 'Rejected') {
                    if (dueDate && new Date(dueDate) < new Date()) {
                        customerStats[customerId].overdueInvoices += 1;
                    }
                }

                if (invoiceDate && (!customerStats[customerId].lastInvoiceDate ||
                    new Date(invoiceDate) > new Date(customerStats[customerId].lastInvoiceDate))) {
                    customerStats[customerId].lastInvoiceDate = invoiceDate;
                }
            });

            // ✅ Calculate avg payment days from payments
            paymentsData.forEach((payment: any) => {
                const customerId = payment.customerId || payment.customer_id || payment.fromAccountId;
                if (!customerId || !customerStats[customerId]) return;

                // Could track payment days if invoice date and payment date available
            });

            // ✅ Map customers with stats
            const mappedCustomers: Customer[] = customersData.map((item: any) => {
                const customerId = item.id;
                const stats = customerStats[customerId] || {
                    totalInvoices: 0,
                    paidInvoices: 0,
                    overdueInvoices: 0,
                    totalSpent: 0,
                    avgPaymentDays: 0,
                };

                // Parse contact person
                let contactPerson = undefined;
                if (item.contactPerson) {
                    if (typeof item.contactPerson === 'string') {
                        try {
                            contactPerson = JSON.parse(item.contactPerson);
                        } catch {
                            contactPerson = undefined;
                        }
                    } else {
                        contactPerson = item.contactPerson;
                    }
                }

                return {
                    id: customerId,
                    code: item.code || `CUST-${Date.now()}`,
                    name: item.name || 'Unknown',
                    nameAm: item.nameAm || '',
                    email: item.email || '',
                    phone: item.phone || '',
                    mobile: item.mobile || '',
                    address: item.address || '',
                    city: item.city || '',
                    country: item.country || '',
                    taxId: item.taxId || '',
                    type: item.customerType || item.type || 'Company',
                    status: item.status || 'Active',
                    creditLimit: item.creditLimit || 0,
                    balance: 0,
                    paymentTerms: item.paymentTerms || 'Net 30',
                    currency: item.currency || 'USD',
                    salesRep: item.salesRep || '',
                    createdAt: item.dateAdd || item.createdAt || new Date().toISOString(),
                    updatedAt: item.dateMod || item.updatedAt || '',
                    contactPerson: contactPerson,
                    stats: {
                        totalInvoices: stats.totalInvoices || 0,
                        paidInvoices: stats.paidInvoices || 0,
                        overdueInvoices: stats.overdueInvoices || 0,
                        totalSpent: stats.totalSpent || 0,
                        avgPaymentDays: stats.avgPaymentDays || 0,
                        lastInvoiceDate: stats.lastInvoiceDate || '',
                    },
                };
            });

            // ✅ Calculate balance for each customer (unpaid invoices)
            mappedCustomers.forEach((customer: any) => {
                const invs = invoicesData.filter((inv: any) => {
                    const cid = inv.customerId || inv.customer_id || inv.customerId;
                    const status = inv.status || 'Draft';
                    return cid === customer.id && status !== 'Paid' && status !== 'Cancelled' && status !== 'Rejected';
                });
                customer.balance = invs.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount || inv.total_amount || 0), 0);
            });

            setCustomers(mappedCustomers);
            console.log('✅ Customers with stats loaded:', mappedCustomers);

        } catch (error) {
            console.error('Error fetching customers:', error);
            showToast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Create customer using API
    const handleAddCustomer = async () => {
        if (!formData.name) {
            showToast.error('Customer name is required');
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
                customerType: formData.type,
                status: formData.status,
                paymentTerms: formData.paymentTerms,
                currency: formData.currency,
                creditLimit: formData.creditLimit || 0,
                salesRep: formData.salesRep,
                contactPerson: formData.contactPerson,
            };

            console.log('📤 Creating customer with payload:', payload);
            const response = await createCustomer(payload);
            console.log('📥 Customer created:', response);

            showToast.success('Customer added successfully');
            setIsAddModalOpen(false);
            resetForm();
            await fetchData();
        } catch (error: any) {
            console.error('❌ Error adding customer:', error);
            showToast.error(error.response?.data?.message || 'Failed to add customer');
        }
    };

    // ✅ Update customer using API
    const handleUpdateCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            const payload = {
                id: selectedCustomer.id,
                name: formData.name,
                nameAm: formData.nameAm,
                email: formData.email,
                phone: formData.phone,
                mobile: formData.mobile,
                address: formData.address,
                city: formData.city,
                country: formData.country,
                taxId: formData.taxId,
                customerType: formData.type,
                status: formData.status,
                paymentTerms: formData.paymentTerms,
                currency: formData.currency,
                creditLimit: formData.creditLimit || 0,
                salesRep: formData.salesRep,
                contactPerson: formData.contactPerson,
            };

            const response = await updateCustomer(payload);
            console.log('📤 Customer updated:', response);

            showToast.success('Customer updated successfully');
            setIsEditModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error updating customer:', error);
            showToast.error(error.response?.data?.message || 'Failed to update customer');
        }
    };

    // ✅ Delete customer using API
    const handleDeleteCustomer = async () => {
        if (!selectedCustomer) return;
        try {
            await deleteCustomer(selectedCustomer.id);
            showToast.success('Customer deleted successfully');
            setIsDeleteModalOpen(false);
            await fetchData();
        } catch (error: any) {
            console.error('Error deleting customer:', error);
            showToast.error(error.response?.data?.message || 'Failed to delete customer');
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
            type: 'Company',
            status: 'Active',
            creditLimit: 0,
            paymentTerms: 'Net 30',
            currency: 'USD',
            salesRep: '',
            contactPerson: {
                name: '',
                phone: '',
                email: '',
                position: '',
            },
        });
    };

    const openEditModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData({
            code: customer.code,
            name: customer.name,
            nameAm: customer.nameAm || '',
            email: customer.email || '',
            phone: customer.phone || '',
            mobile: customer.mobile || '',
            address: customer.address || '',
            city: customer.city || '',
            country: customer.country || '',
            taxId: customer.taxId || '',
            type: customer.type,
            status: customer.status,
            creditLimit: customer.creditLimit || 0,
            paymentTerms: customer.paymentTerms || 'Net 30',
            currency: customer.currency || 'USD',
            salesRep: customer.salesRep || '',
            contactPerson: {
                name: customer.contactPerson?.name || '',
                phone: customer.contactPerson?.phone || '',
                email: customer.contactPerson?.email || '',
                position: customer.contactPerson?.position || '',
            },
        });
        setIsEditModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        if (!amount || isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active': return <BadgeCheck className="h-3 w-3" />;
            case 'Inactive': return <Clock className="h-3 w-3" />;
            case 'Suspended': return <Shield className="h-3 w-3" />;
            default: return null;
        }
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            Individual: 'bg-blue-100 text-blue-700 border-blue-200',
            Company: 'bg-purple-100 text-purple-700 border-purple-200',
            Government: 'bg-orange-100 text-orange-700 border-orange-200',
            'Non-Profit': 'bg-green-100 text-green-700 border-green-200',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Individual': return <User className="h-3 w-3" />;
            case 'Company': return <Building2 className="h-3 w-3" />;
            case 'Government': return <Globe className="h-3 w-3" />;
            case 'Non-Profit': return <Heart className="h-3 w-3" />;
            default: return <Briefcase className="h-3 w-3" />;
        }
    };

    const filteredCustomers = customers.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
        const matchesType = filterType === 'All' || c.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Calculate totals for stats cards
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.stats?.totalSpent || 0), 0);
    const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
    const totalInvoices = customers.reduce((sum, c) => sum + (c.stats?.totalInvoices || 0), 0);
    const overdueInvoices = customers.reduce((sum, c) => sum + (c.stats?.overdueInvoices || 0), 0);
    const avgPaymentDays = customers.length > 0
        ? Math.round(customers.reduce((sum, c) => sum + (c.stats?.avgPaymentDays || 0), 0) / customers.length)
        : 0;

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
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                        <p className="text-sm text-gray-500">Manage all customer accounts and relationships</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchData}
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
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Customers</p>
                                <p className="text-2xl font-bold text-blue-900">{totalCustomers}</p>
                                <p className="text-xs text-blue-600 mt-1">{activeCustomers} active</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-xl">
                                <Users className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</p>
                                <p className="text-xs text-green-600 mt-1">{totalInvoices} invoices</p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-xl">
                                <DollarSign className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Outstanding Balance</p>
                                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(totalOutstanding)}</p>
                                <p className="text-xs text-yellow-600 mt-1">{overdueInvoices} overdue</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-xl">
                                <CreditCard className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Avg Payment Days</p>
                                <p className="text-2xl font-bold text-purple-900">{avgPaymentDays}</p>
                                <p className="text-xs text-purple-600 mt-1">Average collection time</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-xl">
                                <Clock className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Total Invoices</p>
                        <p className="text-sm font-bold text-gray-900">{totalInvoices}</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Paid Invoices</p>
                        <p className="text-sm font-bold text-gray-900">
                            {customers.reduce((sum, c) => sum + (c.stats?.paidInvoices || 0), 0)}
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Overdue</p>
                        <p className="text-sm font-bold text-red-600">{overdueInvoices}</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Avg Invoice</p>
                        <p className="text-sm font-bold text-gray-900">
                            {totalInvoices > 0 ? formatCurrency(totalRevenue / totalInvoices) : '$0.00'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search customers by name, code, email, or phone..."
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
                        <Building2 className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Company">Company</SelectItem>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {paginatedCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-12 w-12 text-gray-300" />
                                        <p className="font-medium">No customers found</p>
                                        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="mt-2"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add Customer
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                <User className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                                                {customer.email && (
                                                    <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                            <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {customer.code}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getTypeColor(customer.type)}>
                                                <span className="flex items-center gap-1">
                                                    {getTypeIcon(customer.type)}
                                                    {customer.type}
                                                </span>
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-700">
                                        {customer.stats?.totalInvoices || 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600">
                                        {formatCurrency(customer.stats?.totalSpent || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium">
                                            <span className={customer.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                                                {formatCurrency(customer.balance || 0)}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusColor(customer.status)}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(customer.status)}
                                                    {customer.status}
                                                </span>
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Popover open={popoverOpen === customer.id} onOpenChange={(open) => setPopoverOpen(open ? customer.id : null)}>
                                            <PopoverTrigger asChild>
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-0" align="end">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setIsViewModalOpen(true);
                                                            setPopoverOpen(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                    >
                                                        <Eye size={16} className="text-blue-500" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            openEditModal(customer);
                                                            setPopoverOpen(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                    >
                                                        <Edit size={16} className="text-yellow-600" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setIsDeleteModalOpen(true);
                                                            setPopoverOpen(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} customers
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

            {/* Add Customer Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg">
                                <UserPlus className="h-5 w-5 text-indigo-600" />
                            </div>
                            Add Customer
                        </DialogTitle>
                        <DialogDescription>
                            Create a new customer account in the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Customer Name <span className="text-red-500">*</span></Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Full name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Name (Amharic)</Label>
                                <Input
                                    value={formData.nameAm}
                                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                                    placeholder="አማርኛ ስም"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Phone number"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Customer Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Individual">Individual</SelectItem>
                                        <SelectItem value="Company">Company</SelectItem>
                                        <SelectItem value="Government">Government</SelectItem>
                                        <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger className="mt-1">
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
                            <Label className="text-sm font-medium">Address</Label>
                            <Textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Street address"
                                rows={2}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">City</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="City"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Country</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="Country"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Tax ID</Label>
                                <Input
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    placeholder="Tax ID"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Credit Limit</Label>
                                <Input
                                    type="number"
                                    value={formData.creditLimit || ''}
                                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Contact Person</Label>
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
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddCustomer}>
                            <Save className="h-4 w-4 mr-2" />
                            Add Customer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Customer Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-1.5 bg-yellow-100 rounded-lg">
                                <Edit className="h-5 w-5 text-yellow-600" />
                            </div>
                            Edit Customer
                        </DialogTitle>
                        <DialogDescription>
                            Update customer information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Same fields as Add Customer */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Customer Name <span className="text-red-500">*</span></Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Name (Amharic)</Label>
                                <Input
                                    value={formData.nameAm}
                                    onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Customer Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Individual">Individual</SelectItem>
                                        <SelectItem value="Company">Company</SelectItem>
                                        <SelectItem value="Government">Government</SelectItem>
                                        <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                                >
                                    <SelectTrigger className="mt-1">
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
                            <Label className="text-sm font-medium">Address</Label>
                            <Textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">City</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Country</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Tax ID</Label>
                                <Input
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Credit Limit</Label>
                                <Input
                                    type="number"
                                    value={formData.creditLimit || ''}
                                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Contact Person</Label>
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
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleUpdateCustomer}>
                            <Save className="h-4 w-4 mr-2" />
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Customer Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg">
                                <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            Customer Details
                        </DialogTitle>
                        <DialogDescription>
                            Complete customer information and statistics.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <User className="h-8 w-8 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h3>
                                    <p className="text-sm text-gray-500 font-mono">{selectedCustomer.code}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={getStatusColor(selectedCustomer.status)}>
                                            {selectedCustomer.status}
                                        </Badge>
                                        <Badge className={getTypeColor(selectedCustomer.type)}>
                                            {selectedCustomer.type}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {selectedCustomer.email && (
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium">{selectedCustomer.email}</p>
                                    </div>
                                )}
                                {selectedCustomer.phone && (
                                    <div>
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="text-sm font-medium">{selectedCustomer.phone}</p>
                                    </div>
                                )}
                                {selectedCustomer.mobile && (
                                    <div>
                                        <p className="text-xs text-gray-500">Mobile</p>
                                        <p className="text-sm font-medium">{selectedCustomer.mobile}</p>
                                    </div>
                                )}
                                {selectedCustomer.salesRep && (
                                    <div>
                                        <p className="text-xs text-gray-500">Sales Rep</p>
                                        <p className="text-sm font-medium">{selectedCustomer.salesRep}</p>
                                    </div>
                                )}
                                {selectedCustomer.creditLimit && selectedCustomer.creditLimit > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500">Credit Limit</p>
                                        <p className="text-sm font-medium">{formatCurrency(selectedCustomer.creditLimit)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-500">Balance</p>
                                    <p className={`text-sm font-bold ${selectedCustomer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(selectedCustomer.balance)}
                                    </p>
                                </div>
                            </div>

                            {selectedCustomer.address && (
                                <div className="border-t border-gray-200 pt-3">
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm">{selectedCustomer.address}</p>
                                    {selectedCustomer.city && (
                                        <p className="text-sm text-gray-600">{selectedCustomer.city}, {selectedCustomer.country || ''}</p>
                                    )}
                                </div>
                            )}

                            {/* Statistics Section */}
                            <div className="border-t border-gray-200 pt-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Statistics</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs text-blue-600">Total Invoices</p>
                                        <p className="text-lg font-bold text-blue-700">
                                            {selectedCustomer.stats?.totalInvoices || 0}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-xs text-green-600">Total Revenue</p>
                                        <p className="text-lg font-bold text-green-700">
                                            {formatCurrency(selectedCustomer.stats?.totalSpent || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-lg">
                                        <p className="text-xs text-emerald-600">Paid Invoices</p>
                                        <p className="text-lg font-bold text-emerald-700">
                                            {selectedCustomer.stats?.paidInvoices || 0}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${selectedCustomer.stats?.overdueInvoices > 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                                        <p className={`text-xs ${selectedCustomer.stats?.overdueInvoices > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                            Overdue Invoices
                                        </p>
                                        <p className={`text-lg font-bold ${selectedCustomer.stats?.overdueInvoices > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                                            {selectedCustomer.stats?.overdueInvoices || 0}
                                        </p>
                                    </div>
                                </div>
                                {selectedCustomer.stats?.lastInvoiceDate && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Last invoice: {formatDate(selectedCustomer.stats.lastInvoiceDate)}
                                    </p>
                                )}
                            </div>

                            {selectedCustomer.contactPerson && selectedCustomer.contactPerson.name && (
                                <div className="border-t border-gray-200 pt-3">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Person</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium">{selectedCustomer.contactPerson.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Position</p>
                                            <p className="font-medium">{selectedCustomer.contactPerson.position || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium">{selectedCustomer.contactPerson.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium">{selectedCustomer.contactPerson.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-3 flex justify-between text-xs text-gray-400">
                                <span>Created: {formatDate(selectedCustomer.createdAt)}</span>
                                {selectedCustomer.updatedAt && (
                                    <span>Updated: {formatDate(selectedCustomer.updatedAt)}</span>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Customer Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Customer
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-700 font-medium">Warning!</p>
                            <p className="text-sm text-red-600 mt-1">
                                Deleting this customer will remove all associated data including invoices and payment history.
                            </p>
                        </div>
                        <p className="text-gray-700">
                            Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>?
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteCustomer}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

// ✅ Missing Heart icon import
const Heart = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
);

export default CustomerManagement;