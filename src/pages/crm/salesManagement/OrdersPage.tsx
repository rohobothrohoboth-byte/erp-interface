// src/pages/crm/salesManagement/OrdersPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    Eye,
    Edit,
    Trash2,
    Plus,
    DollarSign,
    CheckCircle,
    Clock,
    Package,
    Truck,
    CheckCheck,
    XCircle,
} from 'lucide-react';
import { getOrders, deleteOrder } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { SalesHeader } from '../../../components/crm/salesManagement/components/SalesHeader';
import { SalesStats, type SalesStatItem } from '../../../components/crm/salesManagement/components/SalesStats';
import { SalesFilters } from '../../../components/crm/salesManagement/components/SalesFilters';
import { SalesTable, type TableColumn, type TableAction } from '../../../components/crm/salesManagement/components/SalesTable';
import DeleteOrderModal from '../../../components/crm/salesManagement/DeleteOrderModal';
import AddOrderModal from '../../../components/crm/salesManagement/components/orders/AddOrderModal';
import EditOrderModal from '../../../components/crm/salesManagement/components/orders/EditOrderModal';
import type { OrderDto } from '../../../types/crm/crm.types';

const ITEMS_PER_PAGE = 10;

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Check if we're on the add route
    useEffect(() => {
        if (location.pathname === '/crm/sales/orders/add') {
            setIsAddModalOpen(true);
        }
    }, [location.pathname]);

    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
        navigate('/crm/sales/orders');
    };

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        navigate('/crm/sales/orders');
        fetchOrders();
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        navigate('/crm/sales/orders');
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        navigate('/crm/sales/orders');
        fetchOrders();
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
            };
            if (searchTerm) params.searchTerm = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            const response = await getOrders(params);
            const data = response.data?.data || response.data || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedOrder) return;
        try {
            setIsDeleting(true);
            await deleteOrder(selectedOrder.id);
            showToast.success('Order deleted successfully');
            setIsDeleteModalOpen(false);
            fetchOrders();
        } catch (error) {
            showToast.error('Failed to delete order');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAdd = () => {
        navigate('/crm/sales/orders/add');
    };

    const handleView = (id: string) => {
        navigate(`/crm/sales/orders/${id}`);
    };

    const handleEdit = (item: OrderDto) => {
        setSelectedOrder(item);
        setIsEditModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            'Draft': { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
            'Pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
            'Processing': { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
            'Shipped': { label: 'Shipped', className: 'bg-cyan-100 text-cyan-700' },
            'Delivered': { label: 'Delivered', className: 'bg-green-100 text-green-700' },
            'Cancelled': { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
            'Completed': { label: 'Completed', className: 'bg-purple-100 text-purple-700' },
        };
        return variants[status] || variants['Draft'];
    };

    // Stats
    const stats: SalesStatItem[] = [
        {
            label: 'Total Orders',
            value: orders.length,
            icon: <ShoppingCart className="h-5 w-5 text-blue-600" />,
            color: 'blue',
            gradient: 'from-blue-50 to-blue-100',
        },
        {
            label: 'Delivered',
            value: orders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            color: 'green',
            gradient: 'from-green-50 to-green-100',
        },
        {
            label: 'Processing',
            value: orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length,
            icon: <Package className="h-5 w-5 text-yellow-600" />,
            color: 'yellow',
            gradient: 'from-yellow-50 to-yellow-100',
        },
        {
            label: 'Total Value',
            value: formatCurrency(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)),
            icon: <DollarSign className="h-5 w-5 text-purple-600" />,
            color: 'purple',
            gradient: 'from-purple-50 to-purple-100',
        },
    ];

    // Table Columns
    const columns: TableColumn<OrderDto>[] = [
        {
            key: 'orderNumber',
            header: 'Order #',
            accessor: (item) => (
                <p className="font-medium text-gray-900">{item.orderNumber}</p>
            ),
        },
        {
            key: 'customerName',
            header: 'Customer',
            accessor: (item) => item.customerName || 'N/A',
        },
        {
            key: 'totalAmount',
            header: 'Total',
            accessor: (item) => (
                <span className="font-medium">{formatCurrency(item.totalAmount || 0)}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            accessor: (item) => {
                const badge = getStatusBadge(item.status);
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                        {badge.label}
                    </span>
                );
            },
        },
        {
            key: 'orderDate',
            header: 'Order Date',
            accessor: (item) => {
                if (!item.orderDate) return 'N/A';
                return new Date(item.orderDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
            },
        },
    ];

    const actions: TableAction<OrderDto>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (item) => handleView(item.id),
        },
        {
            label: 'Edit',
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (item) => handleEdit(item),
        },
        {
            separator: true,
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (item) => {
                setSelectedOrder(item);
                setIsDeleteModalOpen(true);
            },
            className: 'text-red-600',
        },
    ];

    const statusOptions = [
        { value: 'Draft', label: 'Draft' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Shipped', label: 'Shipped' },
        { value: 'Delivered', label: 'Delivered' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'Completed', label: 'Completed' },
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
                    title="Sales Orders"
                    subtitle="Manage customer orders and fulfillment"
                    icon={<ShoppingCart className="w-5 h-5 text-indigo-600" />}
                    onRefresh={fetchOrders}
                    onAdd={handleAdd}
                    addButtonText="Create Order"
                />

                <SalesStats stats={stats} />

                <SalesFilters
                    searchPlaceholder="Search orders..."
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filters}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                        fetchOrders();
                    }}
                />

                <SalesTable
                    data={orders}
                    columns={columns}
                    actions={actions}
                    isLoading={loading}
                    onRowClick={(item) => handleView(item.id)}
                    emptyState={
                        <div className="text-center py-12">
                            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">No orders found</h3>
                            <p className="text-gray-500">Create your first sales order.</p>
                            <Button
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleAdd}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Order
                            </Button>
                        </div>
                    }
                />

                <DeleteOrderModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    orderNumber={selectedOrder?.orderNumber || ''}
                    customerName={selectedOrder?.customerName}
                    isDeleting={isDeleting}
                />
            </motion.div>

            <AddOrderModal
                isOpen={isAddModalOpen}
                onClose={handleAddModalClose}
                onSuccess={handleAddSuccess}
            />

            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSuccess={handleEditSuccess}
                order={selectedOrder}
            />
        </>
    );
};

export default OrdersPage;