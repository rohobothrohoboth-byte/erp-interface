import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, User, Building, Eye, Edit, Truck, Package, MoreHorizontal, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Pagination } from '@/shared/components/ui/pagination';
import DeleteOrderModal from '@/modules/crm/components/salesManagement/DeleteOrderModal';

interface Order {
  id: string;
  orderNumber: string;
  opportunityId: string;
  opportunityName: string;
  accountName: string;
  contactName: string;
  amount: number;
  status: 'Draft' | 'Confirmed' | 'In Production' | 'Ready to Ship' | 'Shipped' | 'Delivered' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  orderDate: string;
  expectedDelivery: string;
  assignedTo: string;
  progress: number;
  items: number;
}

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onDelete: (order: Order) => void;
}

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-800',
  'Confirmed': 'bg-blue-100 text-blue-800',
  'In Production': 'bg-yellow-100 text-yellow-800',
  'Ready to Ship': 'bg-orange-100 text-orange-800',
  'Shipped': 'bg-purple-100 text-purple-800',
  'Delivered': 'bg-green-100 text-green-800',
  'Completed': 'bg-emerald-100 text-emerald-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-blue-100 text-blue-800',
  'High': 'bg-orange-100 text-orange-800',
  'Urgent': 'bg-red-100 text-red-800'
};

export default function OrderTable({
  orders,
  onView,
  onEdit,
  onUpdateStatus,
  onDelete
}: OrderTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dateString: string, status: string) => {
    return new Date(dateString) < new Date() && !['Delivered', 'Completed', 'Cancelled'].includes(status);
  };

  const handleDeleteClick = (order: Order) => {
    setDeletingOrder(order);
  };

  const handleConfirmDelete = () => {
    if (deletingOrder) {
      onDelete(deletingOrder);
      setDeletingOrder(null);
    }
  };

  // Pagination calculations
  const totalItems = orders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return orders.slice(startIndex, endIndex);
  }, [orders, currentPage]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sales Orders ({orders.length})</span>
          <div className="text-sm text-gray-500">
            Total Value: {formatCurrency(orders.reduce((sum, order) => sum + order.amount, 0))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-blue-600">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(order.orderDate)} • {order.items} items
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{order.opportunityName}</div>
                      <div className="text-sm text-gray-500">{order.contactName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{order.accountName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatCurrency(order.amount)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[order.priority]} variant="outline">
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={order.progress} className="w-16 h-2" />
                      <span className="text-sm font-medium w-10">{order.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center space-x-1 ${
                      isOverdue(order.expectedDelivery, order.status) ? 'text-red-600' : ''
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(order.expectedDelivery)}
                      </span>
                      {isOverdue(order.expectedDelivery, order.status) && (
                        <Badge variant="destructive" className="text-xs ml-1">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{order.assignedTo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(order)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(order)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Order
                        </DropdownMenuItem>
                        {order.status === 'Ready to Ship' && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'Shipped')}>
                            <Truck className="w-4 h-4 mr-2" />
                            Mark as Shipped
                          </DropdownMenuItem>
                        )}
                        {order.status === 'Shipped' && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'Delivered')}>
                            <Package className="w-4 h-4 mr-2" />
                            Mark as Delivered
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(order)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {orders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="orders"
          />
        )}
        
        {orders.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Package className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here once opportunities are converted.</p>
          </div>
        )}
      </CardContent>

      {/* Delete Modal */}
      <DeleteOrderModal
        orderName={deletingOrder?.orderNumber || null}
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
}