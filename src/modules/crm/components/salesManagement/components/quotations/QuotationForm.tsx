import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, FileText, DollarSign, Calendar, User, Building, Plus, Trash2 } from 'lucide-react';
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

interface QuotationItem {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Quotation {
  id?: string;
  quotationNumber: string;
  opportunityId: string;
  opportunityName: string;
  accountName: string;
  contactName: string;
  contactEmail: string;
  amount: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  validUntil: string;
  createdBy: string;
  createdAt: string;
  version: number;
  items: QuotationItem[];
  terms: string;
  notes: string;
  taxRate: number;
  discountAmount: number;
}

interface QuotationFormProps {
  quotation?: Quotation | null;
  opportunity?: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quotationData: Partial<Quotation>) => void;
  mode: 'add' | 'edit';
}

export default function QuotationForm({
  quotation,
  opportunity,
  isOpen,
  onClose,
  onSubmit,
  mode
}: QuotationFormProps) {
  const [formData, setFormData] = useState<Partial<Quotation>>({
    quotationNumber: '',
    opportunityId: '',
    opportunityName: '',
    accountName: '',
    contactName: '',
    contactEmail: '',
    amount: 0,
    status: 'Draft',
    validUntil: '',
    terms: '',
    notes: '',
    taxRate: 0,
    discountAmount: 0,
    items: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && quotation) {
        setFormData(quotation);
      } else if (mode === 'add') {
        // Generate quotation number
        const quotationNumber = `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Set default valid until date (30 days from now)
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);
        
        setFormData({
          quotationNumber,
          opportunityId: opportunity?.id || '',
          opportunityName: opportunity?.name || '',
          accountName: opportunity?.accountId || '',
          contactName: opportunity?.contactId || '',
          contactEmail: '',
          amount: opportunity?.amount || 0,
          status: 'Draft',
          validUntil: validUntil.toISOString().split('T')[0],
          terms: 'Payment due within 30 days of acceptance.\nPrices are valid for 30 days from quotation date.\nAll prices are exclusive of taxes unless otherwise stated.',
          notes: '',
          taxRate: 10,
          discountAmount: 0,
          items: opportunity?.products?.map((product, index) => ({
            id: (index + 1).toString(),
            productName: product,
            description: '',
            quantity: 1,
            unitPrice: Math.floor((opportunity.amount || 0) / (opportunity.products?.length || 1)),
            discount: 0,
            total: Math.floor((opportunity.amount || 0) / (opportunity.products?.length || 1))
          })) || []
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, quotation, opportunity]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.quotationNumber?.trim()) {
      newErrors.quotationNumber = 'Quotation number is required';
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
    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
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
      // Calculate totals
      const subtotal = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;
      const discountAmount = formData.discountAmount || 0;
      const taxAmount = ((subtotal - discountAmount) * (formData.taxRate || 0)) / 100;
      const totalAmount = subtotal - discountAmount + taxAmount;

      const quotationData = {
        ...formData,
        amount: totalAmount,
        version: mode === 'edit' ? (quotation?.version || 1) + 1 : 1
      };

      await onSubmit(quotationData);
      onClose();
    } catch (error) {
      console.error('Error submitting quotation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof Quotation, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const updateItem = (itemId: string, field: keyof QuotationItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total when quantity, unitPrice, or discount changes
          if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
            const subtotal = updatedItem.quantity * updatedItem.unitPrice;
            updatedItem.total = subtotal - (subtotal * updatedItem.discount / 100);
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;
    const discountAmount = formData.discountAmount || 0;
    const taxAmount = ((subtotal - discountAmount) * (formData.taxRate || 0)) / 100;
    const total = subtotal - discountAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>{mode === 'add' ? 'Create Quotation' : 'Edit Quotation'}</span>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="items" className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Items & Pricing</span>
                </TabsTrigger>
                <TabsTrigger value="terms" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Terms & Notes</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quotationNumber">Quotation Number *</Label>
                      <Input
                        id="quotationNumber"
                        value={formData.quotationNumber}
                        onChange={(e) => handleChange('quotationNumber', e.target.value)}
                        className={`mt-1 ${errors.quotationNumber ? 'border-red-500' : ''}`}
                        placeholder="QUO-2024-001"
                      />
                      {errors.quotationNumber && <p className="text-sm text-red-500 mt-1">{errors.quotationNumber}</p>}
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Sent">Sent</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
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

                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleChange('contactEmail', e.target.value)}
                        className="mt-1"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="validUntil">Valid Until *</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => handleChange('validUntil', e.target.value)}
                        className={`mt-1 ${errors.validUntil ? 'border-red-500' : ''}`}
                      />
                      {errors.validUntil && <p className="text-sm text-red-500 mt-1">{errors.validUntil}</p>}
                    </div>
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.taxRate}
                        onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                        className="mt-1"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discountAmount">Discount Amount ($)</Label>
                      <Input
                        id="discountAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discountAmount}
                        onChange={(e) => handleChange('discountAmount', Number(e.target.value))}
                        className="mt-1"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Items & Pricing Tab */}
                <TabsContent value="items" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Quotation Items</h3>
                    <Button type="button" onClick={addItem} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
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
                              <TableHead className="w-20">Discount %</TableHead>
                              <TableHead className="w-24">Total</TableHead>
                              <TableHead className="w-16">Actions</TableHead>
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
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.discount}
                                    onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">${item.total.toFixed(2)}</div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
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
                          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No items added</h3>
                          <p className="text-gray-500 mb-4">Add items to create your quotation.</p>
                          <Button type="button" onClick={addItem}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Item
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {errors.items && <p className="text-sm text-red-500">{errors.items}</p>}

                  {/* Totals Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax ({formData.taxRate}%):</span>
                          <span>${taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Terms & Notes Tab */}
                <TabsContent value="terms" className="space-y-4">
                  <div>
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      value={formData.terms}
                      onChange={(e) => handleChange('terms', e.target.value)}
                      className="mt-1"
                      rows={8}
                      placeholder="Enter terms and conditions..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Internal notes (not visible to customer)..."
                    />
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
            className="bg-blue-600 hover:bg-blue-700"
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
                {mode === 'add' ? 'Create Quotation' : 'Update Quotation'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}