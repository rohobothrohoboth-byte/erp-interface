// src/pages/crm/contactManagement/InteractionsPage.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare,
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
    Calendar,
    Clock,
    Loader2,
    User,
    Building2,
    FileText,
} from 'lucide-react';
import { getInteractions, deleteInteraction } from '@/modules/crm/services/crm.api';
import { showToast } from '@/shared/layout/layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { InteractionDto } from '@/modules/crm/types/crm.types';

// Import the modals
import AddInteractionModal from '@/modules/crm/components/interactions/AddInteractionModal';
import EditInteractionModal from '@/modules/crm/components/interactions/EditInteractionModal';
import ViewInteractionModal from '@/modules/crm/components/interactions/ViewInteractionModal';

const ITEMS_PER_PAGE = 10;

const InteractionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [interactions, setInteractions] = useState<InteractionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInteraction, setSelectedInteraction] = useState<InteractionDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        fetchInteractions();
    }, []);

    const fetchInteractions = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterType !== 'all') params.type = filterType;
            if (searchTerm) params.search = searchTerm;

            const response = await getInteractions(params);
            const data = response.data?.data || response.data || [];
            setInteractions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching interactions:', error);
            showToast.error('Failed to load interactions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedInteraction) return;
        try {
            setIsDeleting(true);
            await deleteInteraction(selectedInteraction.id);
            showToast.success('Interaction deleted successfully');
            setIsDeleteModalOpen(false);
            fetchInteractions();
        } catch (error) {
            showToast.error('Failed to delete interaction');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleView = (interaction: InteractionDto) => {
        setSelectedInteraction(interaction);
        setIsViewModalOpen(true);
    };

    const handleEdit = (interaction: InteractionDto) => {
        setSelectedInteraction(interaction);
        setIsEditModalOpen(true);
    };

    const handleAddSuccess = () => {
        fetchInteractions();
    };

    const handleEditSuccess = () => {
        fetchInteractions();
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Call':
                return <Phone className="h-4 w-4" />;
            case 'Email':
                return <Mail className="h-4 w-4" />;
            case 'Meeting':
                return <Users className="h-4 w-4" />;
            case 'Note':
                return <FileText className="h-4 w-4" />;
            case 'Task':
                return <FileText className="h-4 w-4" />;
            case 'Chat':
                return <MessageSquare className="h-4 w-4" />;
            case 'SMS':
                return <MessageSquare className="h-4 w-4" />;
            case 'Letter':
                return <FileText className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<string, string> = {
            'Call': 'bg-blue-100 text-blue-700 border-blue-200',
            'Email': 'bg-purple-100 text-purple-700 border-purple-200',
            'Meeting': 'bg-green-100 text-green-700 border-green-200',
            'Note': 'bg-gray-100 text-gray-700 border-gray-200',
            'Task': 'bg-orange-100 text-orange-700 border-orange-200',
            'Chat': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            'SMS': 'bg-pink-100 text-pink-700 border-pink-200',
            'Letter': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
        return variants[type] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusBadge = (status: number) => {
        const variants: Record<number, { label: string; className: string }> = {
            1: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200' },
            2: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
            3: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
            4: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
            5: { label: 'Postponed', className: 'bg-orange-100 text-orange-700 border-orange-200' },
        };
        return variants[status] || variants[1];
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredInteractions = interactions.filter(interaction => {
        const search = searchTerm.toLowerCase();
        return interaction.subject.toLowerCase().includes(search) ||
            (interaction.description || '').toLowerCase().includes(search) ||
            (interaction.leadName || '').toLowerCase().includes(search) ||
            (interaction.customerName || '').toLowerCase().includes(search) ||
            (interaction.type || '').toLowerCase().includes(search);
    });

    const totalPages = Math.ceil(filteredInteractions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedInteractions = filteredInteractions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const types = [...new Set(interactions.map(i => i.type).filter(Boolean))];

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
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Interactions</h1>
                        <p className="text-sm text-gray-500">
                            Track all customer and lead interactions
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={fetchInteractions}
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
                        Log Interaction
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
                                <p className="text-2xl font-bold text-blue-900">{interactions.length}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <MessageSquare className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Calls</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {interactions.filter(i => i.type === 'Call').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-200 rounded-lg">
                                <Phone className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Emails</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {interactions.filter(i => i.type === 'Email').length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-200 rounded-lg">
                                <Mail className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 font-medium">Meetings</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {interactions.filter(i => i.type === 'Meeting').length}
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
                        placeholder="Search interactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {types.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                        fetchInteractions();
                    }}
                    className="flex items-center gap-2"
                >
                    Clear Filters
                </Button>
            </div>

            {/* Interactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {paginatedInteractions.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No interactions found</h3>
                        <p className="text-gray-500">Log your first interaction.</p>
                        <Button
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Log Interaction
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedInteractions.map((interaction) => {
                                const status = getStatusBadge(interaction.status || 1);
                                return (
                                    <tr
                                        key={interaction.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => handleView(interaction)}
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{interaction.subject}</p>
                                                {interaction.description && (
                                                    <p className="text-xs text-gray-500 truncate max-w-xs">
                                                        {interaction.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-gray-100 rounded">
                                                    {getTypeIcon(interaction.type)}
                                                </div>
                                                <Badge className={getTypeBadge(interaction.type)}>
                                                    {interaction.type}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={status.className}>
                                                {status.label}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                {interaction.leadName && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <User size={14} className="text-gray-400" />
                                                        <span>{interaction.leadName}</span>
                                                    </div>
                                                )}
                                                {interaction.customerName && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Building2 size={14} className="text-gray-400" />
                                                        <span>{interaction.customerName}</span>
                                                    </div>
                                                )}
                                                {!interaction.leadName && !interaction.customerName && (
                                                    <span className="text-sm text-gray-400">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {interaction.assignedToUserName || 'Unassigned'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {formatDate(interaction.createdAt)}
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
                                                    <DropdownMenuItem onClick={() => handleView(interaction)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(interaction)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setSelectedInteraction(interaction);
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
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
                {paginatedInteractions.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredInteractions.length)} of {filteredInteractions.length} interactions
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

            {/* Add Interaction Modal */}
            <AddInteractionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            {/* Edit Interaction Modal */}
            <EditInteractionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditSuccess}
                interaction={selectedInteraction}
            />

            {/* View Interaction Modal */}
            <ViewInteractionModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                interaction={selectedInteraction}
                onEdit={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedInteraction!);
                }}
            />

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Interaction
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this interaction? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInteraction && (
                        <div className="py-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedInteraction.subject}</p>
                                <p className="text-sm text-gray-500">{selectedInteraction.type}</p>
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
                                    Delete Interaction
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default InteractionsPage;