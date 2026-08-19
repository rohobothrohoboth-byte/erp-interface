// src/pages/crm/salesManagement/ContractsPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
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
    DollarSign,
    Building2,
    Calendar,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import { getContracts, deleteContract, getContractById } from '@/modules/crm/services/crm.api';
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
import { SalesHeader } from '@/modules/crm/components/salesManagement/components/SalesHeader';
import { SalesStats, type SalesStatItem } from '@/modules/crm/components/salesManagement/components/SalesStats';
import { SalesFilters } from '@/modules/crm/components/salesManagement/components/SalesFilters';
import { SalesTable, type TableColumn, type TableAction } from '@/modules/crm/components/salesManagement/components/SalesTable';
import DeleteContractModal from '@/modules/crm/components/salesManagement/components/contracts/DeleteContractModal';
import AddContractModal from '@/modules/crm/components/salesManagement/components/contracts/AddContractModal';
import EditContractModal from '@/modules/crm/components/salesManagement/components/contracts/EditContractModal';
import ViewContractModal from '@/modules/crm/components/salesManagement/components/contracts/ViewContractModal';
import type { ContractDto } from '@/modules/crm/types/crm.types';

const ITEMS_PER_PAGE = 10;

const ContractsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [contracts, setContracts] = useState<ContractDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedContract, setSelectedContract] = useState<ContractDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isViewLoading, setIsViewLoading] = useState(false);

    // Check if we're on the add route
    useEffect(() => {
        if (location.pathname === '/crm/sales/contracts/add') {
            setIsAddModalOpen(true);
        }
    }, [location.pathname]);

    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
        navigate('/crm/sales/contracts');
    };

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        navigate('/crm/sales/contracts');
        fetchContracts();
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedContract(null);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setSelectedContract(null);
        fetchContracts();
    };

    const handleViewModalClose = () => {
        setIsViewModalOpen(false);
        setSelectedContract(null);
        setIsViewLoading(false);
    };

    useEffect(() => {
        fetchContracts();
    }, [currentPage, searchTerm, filterStatus]);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
            };
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            const response = await getContracts(params);
            const data = response.data?.data || response.data || [];
            setContracts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            showToast.error('Failed to load contracts');
        } finally {
            setLoading(false);
        }
    };



    const handleView = async (item: ContractDto) => {
        try {
            setIsViewLoading(true);
            setSelectedContract(item);
            setIsViewModalOpen(true);

            // Fetch full contract details with lines if needed
            const response = await getContractById(item.id);
            const fullContract = response.data?.data || response.data;

            if (fullContract) {
                const updatedContract = {
                    ...item,
                    ...fullContract,
                };
                setSelectedContract(updatedContract);
            }
            setIsViewLoading(false);
        } catch (error) {
            console.error('Error fetching contract details:', error);
            setIsViewLoading(false);
            // Still show the modal with basic data
            setIsViewModalOpen(true);
        }
    };

    const handleAdd = () => {
        navigate('/crm/sales/contracts/add');
    };

    const handleEdit = (item: ContractDto) => {
        const status = getStatusValue(item.status);
        // Only Draft (1) or Pending (2) contracts can be edited
        if (status !== 1 && status !== 2) {
            showToast.warning(`Cannot edit contract with status "${getStatusLabel(item.status)}"`);
            return;
        }
        setSelectedContract(item);
        setIsEditModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedContract) return;

        const status = getStatusValue(selectedContract.status);
        if (status !== 1 && status !== 2) {
            showToast.warning(`Cannot delete contract with status "${getStatusLabel(selectedContract.status)}"`);
            setIsDeleteModalOpen(false);
            setSelectedContract(null);
            return;
        }

        try {
            setIsDeleting(true);
            await deleteContract(selectedContract.id);
            showToast.success('Contract deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedContract(null);
            fetchContracts();
        } catch (error) {
            showToast.error('Failed to delete contract');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    const getStatusLabel = (status: number | string): string => {
        const statusMap: Record<number, string> = {
            1: 'Draft',
            2: 'Pending',
            3: 'Active',
            4: 'Signed',
            5: 'Expired',
            6: 'Terminated',
        };
        const statusNum = typeof status === 'string' ? parseInt(status) : status;
        return statusMap[statusNum] || 'Unknown';
    };

    const getStatusValue = (status: number | string): number => {
        return typeof status === 'string' ? parseInt(status) : status;
    };

// Update the canEdit/Delete checks
    const canEditContract = (contract: ContractDto): boolean => {
        const status = getStatusValue(contract.status);
        return status === 1 || status === 2; // Draft or Pending
    };

    const canDeleteContract = (contract: ContractDto): boolean => {
        const status = getStatusValue(contract.status);
        return status === 1 || status === 2; // Draft or Pending
    };
    const getStatusBadge = (status: number | string) => {
        const statusNum = getStatusValue(status);
        const variants: Record<number, { label: string; className: string; icon: React.ReactNode }> = {
            1: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: <FileText className="h-3 w-3" /> },
            2: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="h-3 w-3" /> },
            3: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="h-3 w-3" /> },
            4: { label: 'Signed', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: <FileText className="h-3 w-3" /> },
            5: { label: 'Expired', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock className="h-3 w-3" /> },
            6: { label: 'Terminated', className: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-3 w-3" /> },
        };
        return variants[statusNum] || variants[1];
    };

    // Stats
    const stats: SalesStatItem[] = [
        {
            label: 'Total Contracts',
            value: contracts.length,
            icon: <FileText className="h-5 w-5 text-blue-600" />,
            color: 'blue',
            gradient: 'from-blue-50 to-blue-100',
        },
        {
            label: 'Active',
            value: contracts.filter(c => c.status === 'Active' || c.status === 'Signed').length,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            color: 'green',
            gradient: 'from-green-50 to-green-100',
        },
        {
            label: 'Pending',
            value: contracts.filter(c => c.status === 'Draft' || c.status === 'Pending').length,
            icon: <Clock className="h-5 w-5 text-yellow-600" />,
            color: 'yellow',
            gradient: 'from-yellow-50 to-yellow-100',
        },
        {
            label: 'Total Value',
            value: formatCurrency(contracts.reduce((sum, c) => sum + (c.totalValue || 0), 0)),
            icon: <DollarSign className="h-5 w-5 text-purple-600" />,
            color: 'purple',
            gradient: 'from-purple-50 to-purple-100',
        },
    ];

    // Table Columns
    const columns: TableColumn<ContractDto>[] = [
        {
            key: 'contractNumber',
            header: 'Contract #',
            accessor: (item) => (
                <p className="font-medium text-gray-900">{item.contractNumber}</p>
            ),
        },
        {
            key: 'title',
            header: 'Title',
            accessor: (item) => (
                <p className="text-gray-900">{item.title}</p>
            ),
        },
        {
            key: 'customerName',
            header: 'Customer',
            accessor: (item) => item.customerName || 'N/A',
        },
        {
            key: 'totalValue',
            header: 'Total Value',
            accessor: (item) => (
                <span className="font-medium">{formatCurrency(item.totalValue || 0)}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            accessor: (item) => {
                const status = getStatusBadge(item.status);
                return (
                    <Badge className={status.className}>
                        <span className="flex items-center gap-1">
                            {status.icon}
                            {status.label}
                        </span>
                    </Badge>
                );
            },
        },
        {
            key: 'startDate',
            header: 'Start Date',
            accessor: (item) => formatDate(item.startDate),
        },
        {
            key: 'endDate',
            header: 'End Date',
            accessor: (item) => formatDate(item.endDate),
        },
    ];

    const actions: TableAction<ContractDto>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (item) => handleView(item),
        },
        {
            label: 'Edit',
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (item) => handleEdit(item),
            disabled: (item) => {
                const status = getStatusValue(item.status);
                return status !== 1 && status !== 2;
            },
        },
        {
            separator: true,
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (item) => {
                const status = getStatusValue(item.status);
                if (status !== 1 && status !== 2) {
                    showToast.warning(`Cannot delete contract with status "${getStatusLabel(item.status)}"`);
                    return;
                }
                setSelectedContract(item);
                setIsDeleteModalOpen(true);
            },
            className: 'text-red-600',
            disabled: (item) => {
                const status = getStatusValue(item.status);
                return status !== 1 && status !== 2;
            },
        },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'Draft', label: 'Draft' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Signed', label: 'Signed' },
        { value: 'Active', label: 'Active' },
        { value: 'Expired', label: 'Expired' },
        { value: 'Terminated', label: 'Terminated' },
    ];

    const filters = [
        {
            key: 'status',
            label: 'Status',
            options: statusOptions,
            value: filterStatus,
            onChange: setFilterStatus,
        },
    ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 p-6"
            >
                <SalesHeader
                    title="Contracts"
                    subtitle="Manage customer contracts and agreements"
                    icon={<FileText className="w-5 h-5 text-indigo-600" />}
                    onRefresh={fetchContracts}
                    onAdd={handleAdd}
                    addButtonText="Create Contract"
                />

                <SalesStats stats={stats} />

                <SalesFilters
                    searchPlaceholder="Search contracts..."
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filters}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        fetchContracts();
                    }}
                />

                <SalesTable
                    data={contracts}
                    columns={columns}
                    actions={actions}
                    isLoading={loading}
                    onRowClick={(item) => handleView(item)}
                    emptyState={
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">No contracts found</h3>
                            <p className="text-gray-500">Create your first contract.</p>
                            <Button
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleAdd}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Contract
                            </Button>
                        </div>
                    }
                />
            </motion.div>

            {/* View Contract Modal */}
            <ViewContractModal
                isOpen={isViewModalOpen}
                onClose={handleViewModalClose}
                onEdit={() => {
                    if (selectedContract) {
                        setIsViewModalOpen(false);
                        handleEdit(selectedContract);
                    }
                }}
                onDelete={() => {
                    if (selectedContract) {
                        setIsViewModalOpen(false);
                        setSelectedContract(selectedContract);
                        setIsDeleteModalOpen(true);
                    }
                }}
                contract={selectedContract}
                isLoading={isViewLoading}
            />

            {/* Add Contract Modal */}
            <AddContractModal
                isOpen={isAddModalOpen}
                onClose={handleAddModalClose}
                onSuccess={handleAddSuccess}
            />

            {/* Edit Contract Modal */}
            <EditContractModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSuccess={handleEditSuccess}
                contract={selectedContract}
            />

            {/* Delete Contract Modal */}
            <DeleteContractModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedContract(null);
                }}
                onConfirm={handleDelete}
                contractNumber={selectedContract?.contractNumber || ''}
                customerName={selectedContract?.customerName}
                isDeleting={isDeleting}
            />
        </>
    );
};

export default ContractsPage;