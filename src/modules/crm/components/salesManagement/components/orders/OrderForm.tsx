import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, ShoppingCart, DollarSign, Calendar, User, Building, Package, Truck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import type { Opportunity } from '@/modules/crm/types/crm';

interface OrderItem {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id?: string;
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
  items: OrderItem[];
  notes: string;
  shippingAddress: string;
  billingAddress: string;
}

interface OrderFormProps {
  order?: Order | null;
  opportunity?: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Partial<Order>) => void;
  mode: 'add' | 'edit';
}

export default function OrderForm({
  order,
  opportunity,
  isOpen,
  onClose,
  onSubmit,
  mode
}: OrderFormProps) {
  const [formData, setFormData] = useState<Partial<Order>>({
    orderNumber: '',
    opportunityId: '',
    opportunityName: '',
    accountName: '',
    contactName: '',
    amount: 0,
    status: 'Draft',
    priority: 'Medium',
    orderDate: '',
    expectedDelivery: '',
    assignedTo: '',
    items: [],
    notes: '',
    shippingAddress: '',
    billingAddress: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && order) {
        setFormData(order);
      } else if (mode === 'add') {
        // Generate order number
        const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Set default delivery date (14 days from now)
        const expectedDelivery = new Date();
        expectedDelivery.setDate(expectedDelivery.getDate() + 14);
        
        setFormData({
          orderNumber,
          opportunityId: opportunity?.id || '',
          opportunityName: opportunity?.name || '',
          accountName: opportunity?.accountId || '',
          contactName: opportunity?.contactId || '',
          amount: opportunity?.amount || 0,
          status: 'Draft',
          priority: 'Medium',
          orderDate: new Date().toISOString().split('T')[0],
          expectedDelivery: expectedDelivery.toISOString().split('T')[0],
          assignedTo: 'Production Team',
          items: opportunity?.products?.map((product, index) => ({
            id: (index + 1).toString(),
            productName: product,
            description: '',
            quantity: 1,
            unitPrice: Math.floor((opportunity.amount || 0) / (opportunity.products?.length || 1)),
            total: Math.floor((opportunity.amount || 0) / (opportunity.products?.length || 1))
          })) || [],
          notes: '',
          shippingAddress: '',
          billingAddress: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, order, opportunity]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderNumber?.trim()) {
      newErrors.orderNumber = 'Order number is required';
    }
    if (!formData.opportunityName?.trim()) {
      newErrors.opportunityName = 'Opportunity name is required';
    }
    if (!formData.accountName?.trim()) {
      newErrors.accountName = 'Account name is required';
    }
    if (!formData.contactName?.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    if (!formData.expectedDelivery) {
      newErrors.expectedDelivery = 'Expected delivery date is required';
    }
    if (!formData.assignedTo?.trim()) {
      newErrors.assignedTo = 'Assigned to is required';
    }
    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate total amount
      const totalAmount = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;

      const orderData = {
        ...formData,
        amount: totalAmount
      };

      await onSubmit(orderData);
      onClose();
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof Order, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateItem = (itemId: string, field: keyof OrderItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total when quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotal = () => {
    return formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <span>{mode === 'add' ? 'Create Order' : 'Edit Order'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="items" className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Items</span>
                </TabsTrigger>
                <TabsTrigger value="delivery" className="flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span>Delivery</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Notes</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orderNumber">Order Number *</Label>
                      <Input
                        id="orderNumber"
                        value={formData.orderNumber}
                        onChange={(e) => handleChange('orderNumber', e.target.value)}
                        className={`mt-1 ${errors.orderNumber ? 'border-red-500' : ''}`}
                        placeholder="ORD-2024-001"
                      />
                      {errors.orderNumber && <p className="text-sm text-red-500 mt-1">{errors.orderNumber}</p>}
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="In Production">In Production</SelectItem>
                          <SelectItem value="Ready to Ship">Ready to Ship</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="opportunityName">Opportunity *</Label>
                      <Input
                        id="opportunityName"
                        value={formData.opportunityName}
                        onChange={(e) => handleChange('opportunityName', e.target.value)}
                        className={`mt-1 ${errors.opportunityName ? 'border-red-500' : ''}`}
                        placeholder="Opportunity name"
                      />
                      {errors.opportunityName && <p className="text-sm text-red-500 mt-1">{errors.opportunityName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="accountName">Account *</Label>
                      <Input
                        id="accountName"
                        value={formData.accountName}
                        onChange={(e) => handleChange('accountName', e.target.value)}
                        className={`mt-1 ${errors.accountName ? 'border-red-500' : ''}`}
                        placeholder="Account name"
                      />
                      {errors.accountName && <p className="text-sm text-red-500 mt-1">{errors.accountName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleChange('contactName', e.target.value)}
                        className={`mt-1 ${errors.contactName ? 'border-red-500' : ''}`}
                        placeholder="Contact person name"
                      />
                      {errors.contactName && <p className="text-sm text-red-500 mt-1">{errors.contactName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assignedTo">Assigned To *</Label>
                      <Select value={formData.assignedTo} onValueChange={(value) => handleChange('assignedTo', value)}>
                        <SelectTrigger className={`mt-1 ${errors.assignedTo ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Production Team">Production Team</SelectItem>
                          <SelectItem value="Logistics Team">Logistics Team</SelectItem>
                          <SelectItem value="Quality Team">Quality Team</SelectItem>
                          <SelectItem value="Fulfillment Team">Fulfillment Team</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.assignedTo && <p className="text-sm text-red-500 mt-1">{errors.assignedTo}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orderDate">Order Date</Label>
                      <Input
                        id="orderDate"
                        type="date"
                        value={formData.orderDate}
                        onChange={(e) => handleChange('orderDate', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expectedDelivery">Expected Delivery *</Label>
                      <Input
                        id="expectedDelivery"
                        type="date"
                        value={formData.expectedDelivery}
                        onChange={(e) => handleChange('expectedDelivery', e.target.value)}
                        className={`mt-1 ${errors.expectedDelivery ? 'border-red-500' : ''}`}
                      />
                      {errors.expectedDelivery && <p className="text-sm text-red-500 mt-1">{errors.expectedDelivery}</p>}
                    </div>
                  </div>
                </TabsContent>

                {/* Items Tab */}
                <TabsContent value="items" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Order Items</h3>
                    <div className="text-lg font-bold">
                      Total: ${calculateTotal().toLocaleString()}
                    </div>
                  </div>

                  {formData.items && formData.items.length > 0 ? (
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product/Service</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-20">Qty</TableHead>
                              <TableHead className="w-24">Unit Price</TableHead>
                              <TableHead className="w-24">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <Input
                                    value={item.productName}
                                    onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                                    placeholder="Product name"
                                    className="min-w-32"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    placeholder="Description"
                                    className="min-w-40"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                    className="w-24"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">${item.total.toLocaleString()}</div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No items added</h3>
                          <p className="text-gray-500">Items from the opportunity will appear here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {errors.items && <p className="text-sm text-red-500">{errors.items}</p>}
                </TabsContent>

                {/* Delivery Tab */}
                <TabsContent value="delivery" className="space-y-4">
                  <div>
                    <Label htmlFor="shippingAddress">Shipping Address</Label>
                    <Textarea
                      id="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={(e) => handleChange('shippingAddress', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Enter shipping address..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Textarea
                      id="billingAddress"
                      value={formData.billingAddress}
                      onChange={(e) => handleChange('billingAddress', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Enter billing address..."
                    />
                  </div>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Order Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className="mt-1"
                      rows={8}
                      placeholder="Enter any special instructions or notes for this order..."
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div>Order Number: {formData.orderNumber || 'Not specified'}</div>
                      <div>Opportunity: {formData.opportunityName || 'Not specified'}</div>
                      <div>Account: {formData.accountName || 'Not specified'}</div>
                      <div>Total Amount: ${calculateTotal().toLocaleString()}</div>
                      <div>Status: {formData.status}</div>
                      <div>Priority: {formData.priority}</div>
                      <div>Expected Delivery: {formData.expectedDelivery || 'Not set'}</div>
                      <div>Assigned To: {formData.assignedTo || 'Not assigned'}</div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.form>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t bg-white">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'add' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'add' ? 'Create Order' : 'Update Order'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}