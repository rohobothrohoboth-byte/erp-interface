// src/pages/crm/contactManagement/CompaniesPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Search,
    RefreshCw,
    Plus,
    Filter,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Users,
    Mail,
    Phone,
    MapPin,
    Globe,
    Briefcase,
    Loader2,
} from 'lucide-react';
import { getCompanies, deleteCompany } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import type { CompanyDto } from '../../../types/crm/crm.types';
import AddCompanyModal from '../../../components/crm/companies/AddCompanyModal';
import EditCompanyModal from '../../../components/crm/companies/EditCompanyModal';
import ViewCompanyModal from '../../../components/crm/companies/ViewCompanyModal';

const ITEMS_PER_PAGE = 10;

const CompaniesPage: React.FC = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<CompanyDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterIndustry, setFilterIndustry] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCompany, setSelectedCompany] = useState<CompanyDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterIndustry !== 'all') params.industry = filterIndustry;
            if (filterStatus !== 'all') params.status = filterStatus;
            if (searchTerm) params.search = searchTerm;

            const response = await getCompanies(params);
            const data = response.data?.data || response.data || [];
            setCompanies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching companies:', error);
            showToast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCompany) return;
        try {
            setIsDeleting(true);
            await deleteCompany(selectedCompany.id);
            showToast.success('Company deleted successfully');
            setIsDeleteModalOpen(false);
            fetchCompanies();
        } catch (error) {
            showToast.error('Failed to delete company');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleView = (company: CompanyDto) => {
        setSelectedCompany(company);
        setIsViewModalOpen(true);
    };

    const handleEdit = (company: CompanyDto) => {
        setSelectedCompany(company);
        setIsEditModalOpen(true);
    };

    const handleAddSuccess = () => {
        fetchCompanies();
    };

    const handleEditSuccess = () => {
        fetchCompanies();
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'Active': 'bg-green-100 text-green-700 border-green-200',
            'Inactive': 'bg-gray-100 text-gray-700 border-gray-200',
            'Lead': 'bg-blue-100 text-blue-700 border-blue-200',
            'Prospect': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Customer': 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const filteredCompanies = companies.filter(company => {
        const search = searchTerm.toLowerCase();
        return company.name.toLowerCase().includes(search) ||
            (company.email || '').toLowerCase().includes(search) ||
            (company.phone || '').includes(search) ||
            (company.industry || '').toLowerCase().includes(search);
    });

    const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))];

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32 mt-1" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b last:border-0">
                            <div className="flex-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32 mt-1" />
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/crm/contacts')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Building2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
                        <p className="text-sm text-gray-500">
                            Manage all company records
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={fetchCompanies}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={16} />
                        Add Company
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total</p>
                                <p className="text-2xl font-bold text-blue-900">{companies.length}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Active</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {companies.filter(c => c.status === 'Active').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <Users className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Customers</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {companies.filter(c => c.status === 'Customer').length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Briefcase className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Leads</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {companies.filter(c => c.status === 'Lead' || c.status === 'Prospect').length}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <Users className="h-6 w-6 text-orange-700" />
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
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                        <SelectItem value="Customer">Customer</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterIndustry('all');
                        setFilterStatus('all');
                        fetchCompanies();
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Companies Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedCompanies.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No companies found</h3>
                        <p className="text-gray-500">Create your first company record.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Company
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Contacts</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Leads</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedCompanies.map((company) => (
                                <tr
                                    key={company.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleView(company)}
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{company.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                {company.email && (
                                                    <span className="flex items-center gap-1">
                                                            <Mail size={12} />
                                                        {company.email}
                                                        </span>
                                                )}
                                                {company.phone && (
                                                    <span className="flex items-center gap-1">
                                                            <Phone size={12} />
                                                        {company.phone}
                                                        </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {company.industry || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusBadge(company.status)}>
                                            {company.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium">
                                        {company.contactCount || 0}
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium">
                                        {company.leadCount || 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDate(company.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleView(company)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(company)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setSelectedCompany(company);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {paginatedCompanies.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredCompanies.length)} of {filteredCompanies.length} companies
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddCompanyModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            <EditCompanyModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditSuccess}
                company={selectedCompany}
            />

            <ViewCompanyModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                company={selectedCompany}
                onEdit={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedCompany!);
                }}
            />

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Company
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this company? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCompany && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedCompany.name}</p>
                                <p className="text-sm text-gray-500">{selectedCompany.industry || 'N/A'}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Company
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default CompaniesPage;