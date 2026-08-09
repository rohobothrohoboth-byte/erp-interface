// src/components/crm/orders/AddOrderModal.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ShoppingCart,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Building2,
  Users,
  Loader2,
  FileText,
  Target,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { createOrder } from '../../../services/crm/crm.api';
import { showToast } from '../../../layout/layout';
import { getCustomers, getOpportunities, getQuotes, getQuoteById } from '../../../services/crm/crm.api';
import type { CreateOrderDto, CreateOrderLineDto } from '../../../types/crm/crm.types';

interface OrderLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  totalPrice: number;
  productId?: string;
  notes?: string;
}

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedCustomerId?: string;
  preSelectedOpportunityId?: string;
  preSelectedQuoteId?: string;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onSuccess,
                                                       preSelectedCustomerId,
                                                       preSelectedOpportunityId,
                                                       preSelectedQuoteId,
                                                     }) => {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedQuoteData, setSelectedQuoteData] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    customerId: preSelectedCustomerId || '',
    opportunityId: preSelectedOpportunityId || '',
    quoteId: preSelectedQuoteId || '',
    orderDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    shippingAddress: '',
    billingAddress: '',
    notes: '',
    subTotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    shippingCost: 0,
    totalAmount: 0,
    terms: '',
  });

  const [lines, setLines] = useState<OrderLine[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
      totalPrice: 0,
    },
  ]);

  // Load customers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  // When customer changes, fetch opportunities and quotes
  useEffect(() => {
    if (formData.customerId) {
      fetchOpportunitiesAndQuotes(formData.customerId);
    } else {
      setOpportunities([]);
      setQuotes([]);
    }
  }, [formData.customerId]);

  // When quote is selected, load its data
  useEffect(() => {
    console.log('🔄 Quote ID changed:', formData.quoteId);
    if (formData.quoteId) {
      loadQuoteData(formData.quoteId);
    } else {
      setSelectedQuoteData(null);
    }
  }, [formData.quoteId]);

  // If pre-selected quote, load it
  useEffect(() => {
    if (isOpen && preSelectedQuoteId) {
      setFormData(prev => ({ ...prev, quoteId: preSelectedQuoteId }));
    }
  }, [isOpen, preSelectedQuoteId]);

  const fetchCustomers = async () => {
    try {
      setLoadingOptions(true);
      const response = await getCustomers({ page: 1, pageSize: 1000 });
      setCustomers(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchOpportunitiesAndQuotes = async (customerId: string) => {
    try {
      const [oppsRes, quotesRes] = await Promise.all([
        getOpportunities({ customerId, page: 1, pageSize: 1000 }),
        getQuotes({ customerId, page: 1, pageSize: 1000 }),
      ]);
      setOpportunities(oppsRes.data?.data || []);
      setQuotes(quotesRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching opportunities/quotes:', error);
    }
  };

  const loadQuoteData = async (quoteId: string) => {
    try {
      setLoadingQuote(true);
      console.log('🔍 Loading quote with ID:', quoteId);

      const quoteData = await getQuoteById(quoteId);
      console.log('📦 Quote data received:', quoteData);

      setSelectedQuoteData(quoteData);

      // Get quote lines
      const quoteLines = quoteData.quoteLines || quoteData.QuoteLines || [];

      // Populate form data from quote
      setFormData(prev => ({
        ...prev,
        customerId: quoteData.customerId || prev.customerId,
        opportunityId: quoteData.opportunityId || prev.opportunityId,
        subTotal: quoteData.subTotal || 0,
        taxAmount: quoteData.taxAmount || 0,
        discountAmount: quoteData.discountAmount || 0,
        shippingCost: quoteData.shippingCost || 0,
        totalAmount: quoteData.totalAmount || 0,
        terms: quoteData.termsAndConditions || '',
        notes: quoteData.notes ? `From Quote: ${quoteData.quoteNumber}\n${quoteData.notes}` : `From Quote: ${quoteData.quoteNumber}`,
      }));

      // Populate lines from quote
      if (quoteLines && quoteLines.length > 0) {
        const mappedLines = quoteLines.map((line: any) => ({
          id: crypto.randomUUID(),
          description: line.description || line.Description || '',
          quantity: line.quantity || line.Quantity || 1,
          unitPrice: line.unitPrice || line.UnitPrice || 0,
          discount: line.discount || line.Discount || 0,
          taxRate: line.taxRate || line.TaxRate || 0,
          totalPrice: line.totalPrice || line.TotalPrice || 0,
          productId: line.productId || line.ProductId,
          notes: line.notes || line.Notes || '',
        }));
        setLines(mappedLines);
      }

      showToast.success(`Quote ${quoteData.quoteNumber} loaded successfully`);
    } catch (error) {
      console.error('❌ Error loading quote:', error);
      showToast.error('Failed to load quote data');
    } finally {
      setLoadingQuote(false);
    }
  };

  const calculateTotals = (lines: OrderLine[]) => {
    const subTotal = lines.reduce((sum, line) => sum + line.totalPrice, 0);
    const taxAmount = lines.reduce((sum, line) => sum + (line.totalPrice * (line.taxRate / 100)), 0);
    const total = subTotal + taxAmount - formData.discountAmount + formData.shippingCost;
    return { subTotal, taxAmount, total };
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
        totalPrice: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length === 1) return;
    setLines(lines.filter(line => line.id !== id));
  };

  const updateLine = (id: string, field: keyof OrderLine, value: string | number) => {
    setLines(lines.map(line => {
      if (line.id !== id) return line;
      const updated = { ...line, [field]: value };
      const quantity = typeof updated.quantity === 'string' ? parseFloat(updated.quantity) || 0 : updated.quantity;
      const unitPrice = typeof updated.unitPrice === 'string' ? parseFloat(updated.unitPrice) || 0 : updated.unitPrice;
      const discount = typeof updated.discount === 'string' ? parseFloat(updated.discount) || 0 : updated.discount;
      const taxRate = typeof updated.taxRate === 'string' ? parseFloat(updated.taxRate) || 0 : updated.taxRate;
      const discountedPrice = unitPrice * (1 - discount / 100);
      updated.totalPrice = quantity * discountedPrice * (1 + taxRate / 100);
      return updated;
    }));
  };

  const handleClearQuote = () => {
    setFormData(prev => ({ ...prev, quoteId: '' }));
    setSelectedQuoteData(null);
    setLines([{
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
      totalPrice: 0,
    }]);
    setFormData(prev => ({
      ...prev,
      subTotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      shippingCost: 0,
      totalAmount: 0,
      terms: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      showToast.error('Please select a customer');
      return;
    }

    if (lines.some(line => !line.description.trim())) {
      showToast.error('Please add descriptions for all line items');
      return;
    }

    const { subTotal, taxAmount, total } = calculateTotals(lines);

    // ✅ Build the order data with correct types
    const orderData: CreateOrderDto = {
      CustomerId: formData.customerId,
      OpportunityId: formData.opportunityId || null,
      QuoteId: formData.quoteId || null,
      OrderDate: formData.orderDate,
      DueDate: formData.dueDate || null,
      SubTotal: subTotal,
      TaxAmount: taxAmount,
      DiscountAmount: formData.discountAmount,
      ShippingCost: formData.shippingCost,
      TotalAmount: total,
      ShippingAddress: formData.shippingAddress || '',
      BillingAddress: formData.billingAddress || '',
      Terms: formData.terms || '',
      Notes: formData.notes || '',
      Currency: 'USD',
      OrderLines: lines.map(line => ({
        ProductId: line.productId || null,
        Description: line.description,
        Quantity: line.quantity,
        UnitPrice: line.unitPrice,
        Discount: line.discount,
        TaxRate: line.taxRate || 0,
        TotalPrice: line.totalPrice,
        Notes: line.notes || '',
      })),
    };

    console.log('📦 Final order data:', JSON.stringify(orderData, null, 2));

    try {
      setLoading(true);
      const response = await createOrder(orderData);
      console.log('✅ Order created:', response);
      showToast.success('Order created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      showToast.error(error?.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      opportunityId: '',
      quoteId: '',
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      shippingAddress: '',
      billingAddress: '',
      notes: '',
      subTotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      shippingCost: 0,
      totalAmount: 0,
      terms: '',
    });
    setLines([{
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
      totalPrice: 0,
    }]);
    setSelectedQuoteData(null);
  };

  if (!isOpen) return null;

  const { subTotal, taxAmount, total } = calculateTotals(lines);
  const isLoading = loading || loadingOptions || loadingQuote;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Order</h2>
                <p className="text-sm text-gray-500">
                  {selectedQuoteData ? `From Quote: ${selectedQuoteData.quoteNumber}` : 'Create a new sales order'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
          ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Source Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Source Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="customerId" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        Customer *
                      </Label>
                      <Select
                          value={formData.customerId}
                          onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="opportunityId" className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        Opportunity
                      </Label>
                      <Select
                          value={formData.opportunityId}
                          onValueChange={(value) => setFormData({ ...formData, opportunityId: value })}
                          disabled={!formData.customerId}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select opportunity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {opportunities.map((opp) => (
                              <SelectItem key={opp.id} value={opp.id}>
                                {opp.name} (${opp.amount?.toLocaleString()})
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quoteId" className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Quote
                      </Label>
                      <div className="flex gap-2">
                        <Select
                            value={formData.quoteId}
                            onValueChange={(value) => setFormData({ ...formData, quoteId: value })}
                            disabled={!formData.customerId}
                            className="flex-1"
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select quote" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {quotes.map((quote) => (
                                <SelectItem key={quote.id} value={quote.id}>
                                  {quote.quoteNumber} (${quote.totalAmount?.toLocaleString()})
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.quoteId && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClearQuote}
                                className="mt-1 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                        )}
                      </div>
                      {selectedQuoteData && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            <span className="font-medium">Loaded from quote:</span> {selectedQuoteData.quoteNumber}
                            <span className="ml-2">•</span>
                            <span className="ml-2">Items: {selectedQuoteData.quoteLines?.length || 0}</span>
                          </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Order Date
                    </Label>
                    <Input
                        id="orderDate"
                        type="date"
                        value={formData.orderDate}
                        onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                        className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dueDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Due Date
                    </Label>
                    <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="mt-1"
                    />
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingAddress">Shipping Address</Label>
                    <Textarea
                        id="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                        placeholder="Enter shipping address..."
                        className="mt-1"
                        rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Textarea
                        id="billingAddress"
                        value={formData.billingAddress}
                        onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                        placeholder="Enter billing address..."
                        className="mt-1"
                        rows={2}
                    />
                  </div>
                </div>

                {/* Order Lines */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2">Line Items</Label>
                    {!selectedQuoteData && (
                        <Button type="button" variant="outline" size="sm" onClick={addLine} className="flex items-center gap-1">
                          <Plus className="h-4 w-4" /> Add Line
                        </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {lines.map((line) => (
                        <div key={line.id} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
                          <div className="col-span-5">
                            <Input
                                placeholder="Description"
                                value={line.description}
                                onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                                disabled={!!selectedQuoteData}
                            />
                          </div>
                          <div className="col-span-1">
                            <Input
                                type="number"
                                placeholder="Qty"
                                value={line.quantity}
                                onChange={(e) => updateLine(line.id, 'quantity', e.target.value)}
                                min={1}
                                disabled={!!selectedQuoteData}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                                type="number"
                                placeholder="Unit Price"
                                value={line.unitPrice}
                                onChange={(e) => updateLine(line.id, 'unitPrice', e.target.value)}
                                min={0}
                                step={0.01}
                                disabled={!!selectedQuoteData}
                            />
                          </div>
                          <div className="col-span-1">
                            <Input
                                type="number"
                                placeholder="Disc %"
                                value={line.discount}
                                onChange={(e) => updateLine(line.id, 'discount', e.target.value)}
                                min={0}
                                max={100}
                                disabled={!!selectedQuoteData}
                            />
                          </div>
                          <div className="col-span-2 font-medium text-right text-indigo-600">
                            ${line.totalPrice.toFixed(2)}
                          </div>
                          <div className="col-span-1">
                            {!selectedQuoteData && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLine(line.id)}
                                    disabled={lines.length === 1}
                                    className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="discountAmount" className="text-gray-600">Discount</Label>
                    <div className="w-32">
                      <Input
                          id="discountAmount"
                          type="number"
                          value={formData.discountAmount}
                          onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                          min={0}
                          step={0.01}
                          className="text-right"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="shippingCost" className="text-gray-600">Shipping</Label>
                    <div className="w-32">
                      <Input
                          id="shippingCost"
                          type="number"
                          value={formData.shippingCost}
                          onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                          min={0}
                          step={0.01}
                          className="text-right"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      className="mt-1"
                      rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                      id="terms"
                      value={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                      placeholder="Terms and conditions..."
                      className="mt-1"
                      rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      disabled={loading}
                  >
                    {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
                        </>
                    ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {selectedQuoteData ? 'Create Order from Quote' : 'Create Order'}
                        </>
                    )}
                  </Button>
                </div>
              </form>
          )}
        </motion.div>
      </div>
  );
};

export default AddOrderModal;