// src/pages/crm/salesManagement/OrderDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ShoppingCart,
    DollarSign,
    Calendar,
    Building2,
    Truck,
    Package,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    Trash2,
    Loader2,
    Printer,
    FileText,
    Download,
} from 'lucide-react';
import { getOrderById } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import EditOrderModal from '../../../components/crm/salesManagement/components/orders/EditOrderModal';
import type { OrderDto } from '../../../types/crm/crm.types';

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await getOrderById(id!);
            const data = response.data?.data || response.data;
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
            showToast.error('Failed to load order details');
            navigate('/crm/sales/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        fetchOrder();
        navigate('/crm/sales/orders');
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        navigate('/crm/sales/orders');
    };

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'Draft': { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: <FileText className="h-4 w-4" /> },
            'Pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="h-4 w-4" /> },
            'Processing': { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Package className="h-4 w-4" /> },
            'Shipped': { label: 'Shipped', className: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: <Truck className="h-4 w-4" /> },
            'Delivered': { label: 'Delivered', className: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
            'Cancelled': { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="h-4 w-4" /> },
            'Completed': { label: 'Completed', className: 'bg-purple-100 text-purple-700 border-purple-200', icon: <CheckCircle className="h-4 w-4" /> },
        };
        return variants[status] || variants['Draft'];
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
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-6 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Order not found</h2>
                <Button
                    className="mt-4"
                    onClick={() => navigate('/crm/sales/orders')}
                >
                    Back to Orders
                </Button>
            </div>
        );
    }

    const status = getStatusBadge(order.status);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/crm/sales/orders')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge className={status.className}>
                                    <span className="flex items-center gap-1">
                                        {status.icon}
                                        {status.label}
                                    </span>
                                </Badge>
                                {order.customerName && (
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Building2 className="h-4 w-4" />
                                        {order.customerName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={handleEditClick}
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Total Amount</p>
                                    <p className="text-3xl font-bold text-blue-900">
                                        {formatCurrency(order.totalAmount || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-200 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-blue-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Order Date</p>
                                    <p className="text-lg font-bold text-green-900">
                                        {formatDate(order.orderDate)}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-200 rounded-lg">
                                    <Calendar className="h-6 w-6 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-700 font-medium">Items</p>
                                    <p className="text-3xl font-bold text-purple-900">
                                        {order.orderLines?.length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-200 rounded-lg">
                                    <Package className="h-6 w-6 text-purple-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Lines */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Product</th>
                                    <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                    <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y">
                                {order.orderLines?.map((line, index) => (
                                    <tr key={index}>
                                        <td className="py-3">
                                            <p className="font-medium">{line.description}</p>
                                            {line.productName && (
                                                <p className="text-sm text-gray-500">{line.productName}</p>
                                            )}
                                        </td>
                                        <td className="py-3 text-right">{line.quantity}</td>
                                        <td className="py-3 text-right">{formatCurrency(line.unitPrice)}</td>
                                        <td className="py-3 text-right font-medium">{formatCurrency(line.totalPrice)}</td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot className="border-t-2">
                                <tr>
                                    <td colSpan={3} className="py-3 text-right font-medium">Subtotal</td>
                                    <td className="py-3 text-right">{formatCurrency(order.subTotal || 0)}</td>
                                </tr>
                                {order.taxAmount > 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-2 text-right text-sm">Tax</td>
                                        <td className="py-2 text-right">{formatCurrency(order.taxAmount)}</td>
                                    </tr>
                                )}
                                {order.shippingCost > 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-2 text-right text-sm">Shipping</td>
                                        <td className="py-2 text-right">{formatCurrency(order.shippingCost)}</td>
                                    </tr>
                                )}
                                <tr className="border-t">
                                    <td colSpan={3} className="py-3 text-right font-bold text-lg">Total</td>
                                    <td className="py-3 text-right font-bold text-lg">{formatCurrency(order.totalAmount)}</td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Edit Order Modal */}
            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSuccess={handleEditSuccess}
                order={order}
            />
        </>
    );
};

export default OrderDetailPage;