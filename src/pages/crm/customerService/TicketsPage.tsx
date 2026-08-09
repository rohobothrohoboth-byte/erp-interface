// src/pages/crm/customerService/TicketsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    RefreshCw,
    Plus,
    Search,
    Filter,
    Ticket,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    User,
    Calendar,
    Flag,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

// Types
interface Ticket {
    id: string;
    title: string;
    description: string;
    customer: string;
    customerEmail: string;
    customerPhone: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    category: string;
    assignedTo: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

// Mock data - will be replaced with API calls
const mockTickets: Ticket[] = [
    {
        id: 'T-001',
        title: 'Unable to access account after password reset',
        description: 'Customer cannot log in after resetting password. Receiving "Invalid credentials" error.',
        customer: 'John Smith',
        customerEmail: 'john.smith@example.com',
        customerPhone: '+1-555-123-4567',
        status: 'Open',
        priority: 'High',
        category: 'Account Access',
        assignedTo: 'Support Agent A',
        createdAt: '2026-07-10T10:30:00Z',
        updatedAt: '2026-07-10T10:30:00Z',
    },
    {
        id: 'T-002',
        title: 'Payment processing issue',
        description: 'Customer reported that payment is not processing. Error: "Payment gateway timeout".',
        customer: 'Jane Doe',
        customerEmail: 'jane.doe@example.com',
        customerPhone: '+1-555-987-6543',
        status: 'In Progress',
        priority: 'Urgent',
        category: 'Payments',
        assignedTo: 'Support Agent B',
        createdAt: '2026-07-10T09:15:00Z',
        updatedAt: '2026-07-10T11:00:00Z',
    },
    {
        id: 'T-003',
        title: 'Feature request: Bulk export',
        description: 'Customer requested ability to export all data in bulk. This would be useful for reporting purposes.',
        customer: 'TechCorp Inc.',
        customerEmail: 'contact@techcorp.com',
        customerPhone: '+1-555-456-7890',
        status: 'Resolved',
        priority: 'Medium',
        category: 'Feature Request',
        assignedTo: 'Support Agent C',
        createdAt: '2026-07-09T16:45:00Z',
        updatedAt: '2026-07-10T14:00:00Z',
        resolvedAt: '2026-07-10T14:00:00Z',
    },
];

const ITEMS_PER_PAGE = 10;

const TicketsPage: React.FC = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Simulate loading - replace with actual API call
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleDelete = async () => {
        if (!selectedTicket) return;
        try {
            setIsDeleting(true);
            // Replace with actual delete API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setTickets(tickets.filter(t => t.id !== selectedTicket.id));
            showToast.success('Ticket deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            showToast.error('Failed to delete ticket');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'Open': 'bg-blue-100 text-blue-700 border-blue-200',
            'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Resolved': 'bg-green-100 text-green-700 border-green-200',
            'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, string> = {
            'Low': 'bg-gray-100 text-gray-700 border-gray-200',
            'Medium': 'bg-blue-100 text-blue-700 border-blue-200',
            'High': 'bg-orange-100 text-orange-700 border-orange-200',
            'Urgent': 'bg-red-100 text-red-700 border-red-200',
        };
        return variants[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredTickets = tickets.filter(ticket => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = ticket.title.toLowerCase().includes(search) ||
            ticket.customer.toLowerCase().includes(search) ||
            ticket.description.toLowerCase().includes(search);
        const matchesStatus = filterStatus === 'all' || ticket.status.toLowerCase() === filterStatus.toLowerCase();
        const matchesPriority = filterPriority === 'all' || ticket.priority.toLowerCase() === filterPriority.toLowerCase();
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved').length,
        closed: tickets.filter(t => t.status === 'Closed').length,
    };

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
                        onClick={() => navigate('/crm/support')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                        <p className="text-sm text-gray-500">Manage all support tickets</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                            setLoading(true);
                            setTimeout(() => setLoading(false), 1000);
                        }}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        onClick={() => navigate('/crm/support/tickets/add')}
                    >
                        <Plus size={16} />
                        New Ticket
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
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Ticket className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Open</p>
                                <p className="text-2xl font-bold text-yellow-900">{stats.open}</p>
                            </div>
                            <div className="p-3 bg-yellow-200 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Resolved</p>
                                <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
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
                                <p className="text-sm text-purple-700 font-medium">In Progress</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.inProgress}</p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
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
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40">
                        <Flag className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        setFilterPriority('all');
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedTickets.length === 0 ? (
                    <div className="text-center py-12">
                        <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No tickets found</h3>
                        <p className="text-gray-500">Create your first support ticket to get started.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => navigate('/crm/support/tickets/add')}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Ticket
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedTickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/crm/support/tickets/${ticket.id}`)}
                                >
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{ticket.title}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-xs">
                                                {ticket.description}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm text-gray-900">{ticket.customer}</p>
                                            <p className="text-xs text-gray-500">{ticket.customerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getStatusBadge(ticket.status)}>
                                            {ticket.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={getPriorityBadge(ticket.priority)}>
                                            {ticket.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {ticket.assignedTo}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDate(ticket.createdAt)}
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
                                                <DropdownMenuItem onClick={() => navigate(`/crm/support/tickets/${ticket.id}`)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate(`/crm/support/tickets/edit/${ticket.id}`)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Ticket
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => {
                                                        setSelectedTicket(ticket);
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
                {paginatedTickets.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTickets.length)} of {filteredTickets.length} tickets
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
                            Delete Ticket
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this ticket? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedTicket.title}</p>
                                <p className="text-sm text-gray-500">{selectedTicket.customer}</p>
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
                                    Delete Ticket
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default TicketsPage;