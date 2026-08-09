// src/pages/crm/contactManagement/ContactManagementPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    RefreshCw,
    Plus,
    Search,
    Filter,
    Users,
    Mail,
    Phone,
    Building2,
    User,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { getContacts, deleteContact } from '../../../services/crm/crm.api';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../../components/ui/dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import type { ContactDto } from '../../../types/crm/crm.types';

const ITEMS_PER_PAGE = 10;

const ContactManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState<ContactDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCustomerId, setFilterCustomerId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedContact, setSelectedContact] = useState<ContactDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, [searchTerm, filterCustomerId]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (searchTerm) params.search = searchTerm;
            if (filterCustomerId) params.customerId = filterCustomerId;

            const response = await getContacts(params);
            const data = response.data?.data || response.data || [];
            setContacts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showToast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedContact) return;
        try {
            setIsDeleting(true);
            await deleteContact(selectedContact.id);
            showToast.success('Contact deleted successfully');
            setIsDeleteModalOpen(false);
            fetchContacts();
        } catch (error) {
            showToast.error('Failed to delete contact');
        } finally {
            setIsDeleting(false);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
        ) : (
            <Badge className="bg-red-100 text-red-700 border-red-200">Inactive</Badge>
        );
    };

    const filteredContacts = contacts.filter(contact => {
        const search = searchTerm.toLowerCase();
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const company = (contact.customerName || '').toLowerCase();

        return fullName.includes(search) || email.includes(search) || company.includes(search);
    });

    const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedContacts = filteredContacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24 mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
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
                        onClick={() => navigate('/crm')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
                        <p className="text-sm text-gray-500">
                            Manage all your contacts and relationships
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchContacts}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => navigate('/crm/contacts/add')}
                    >
                        <Plus size={16} />
                        New Contact
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterCustomerId} onValueChange={setFilterCustomerId}>
                    <SelectTrigger className="w-48">
                        <Building2 className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by customer" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Customers">All Customers</SelectItem>
                        {/* Add customer options here */}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterCustomerId('');
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total Contacts</p>
                                <p className="text-2xl font-bold text-blue-900">{contacts.length}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Users className="h-6 w-6 text-blue-700" />
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
                                    {contacts.filter(c => c.isActive).length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Primary Contacts</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {contacts.filter(c => c.isPrimary).length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Star className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Decision Makers</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {contacts.filter(c => c.isDecisionMaker).length}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-200 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-orange-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contacts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedContacts.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No contacts found</h3>
                        <p className="text-gray-500">Create your first contact to get started.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => navigate('/crm/contacts/add')}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Contact
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedContacts.map((contact) => (
                                <tr
                                    key={contact.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                                    {getInitials(contact.firstName, contact.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {contact.firstName} {contact.lastName}
                                                </p>
                                                {contact.title && (
                                                    <p className="text-xs text-gray-500">{contact.title}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Mail size={14} className="text-gray-400" />
                                            {contact.email || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Phone size={14} className="text-gray-400" />
                                            {contact.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Building2 size={14} className="text-gray-400" />
                                            {contact.customerName || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(contact.isActive)}
                                            {contact.isPrimary && (
                                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                                    Primary
                                                </Badge>
                                            )}
                                            {contact.isDecisionMaker && (
                                                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                                    Decision Maker
                                                </Badge>
                                            )}
                                        </div>
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
                                                <DropdownMenuItem onClick={() => navigate(`/crm/contacts/${contact.id}`)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate(`/crm/contacts/edit/${contact.id}`)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Contact
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setSelectedContact(contact);
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
                {paginatedContacts.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredContacts.length)} of {filteredContacts.length} contacts
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

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Contact
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this contact? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="py-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Avatar>
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                        {getInitials(selectedContact.firstName, selectedContact.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {selectedContact.firstName} {selectedContact.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{selectedContact.email || 'No email'}</p>
                                </div>
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
                                    Delete Contact
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ContactManagementPage;