// src/components/crm/orders/OrderInvoicePayment.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  Download,
  Mail,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { showToast } from '../../../layout/layout';

interface OrderInvoicePaymentProps {
  orderId: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  onPayment: (data: any) => Promise<void>;
  onGenerateInvoice: () => Promise<void>;
  isProcessing?: boolean;
}

const OrderInvoicePayment: React.FC<OrderInvoicePaymentProps> = ({
                                                                   orderId,
                                                                   totalAmount,
                                                                   paidAmount,
                                                                   status,
                                                                   onPayment,
                                                                   onGenerateInvoice,
                                                                   isProcessing = false,
                                                                 }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(totalAmount - paidAmount);
  const [reference, setReference] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Paid': 'bg-green-100 text-green-700 border-green-200',
      'Partial': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Unpaid': 'bg-red-100 text-red-700 border-red-200',
      'Overdue': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentAmount <= 0) {
      showToast.error('Payment amount must be greater than 0');
      return;
    }

    if (!paymentMethod) {
      showToast.error('Please select a payment method');
      return;
    }

    try {
      await onPayment({
        amount: paymentAmount,
        method: paymentMethod,
        reference,
        date: new Date().toISOString(),
      });
      showToast.success('Payment recorded successfully');
    } catch (error) {
      showToast.error('Failed to process payment');
    }
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Invoice & Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid Amount</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance Due</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(totalAmount - paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={getStatusBadge(status)}>
                {status}
              </Badge>
            </div>
          </div>

          {/* Invoice Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onGenerateInvoice}
                disabled={isProcessing}
                className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Invoice
            </Button>
            <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Invoice
            </Button>
          </div>

          {/* Payment Form */}
          {(status === 'Unpaid' || status === 'Partial') && (
              <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t pt-4"
              >
                <h4 className="font-medium text-gray-900 mb-4">Record Payment</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentAmount">Payment Amount</Label>
                      <Input
                          id="paymentAmount"
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                          min={0.01}
                          max={totalAmount - paidAmount}
                          step={0.01}
                          className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="PayPal">PayPal</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference / Notes</Label>
                    <Input
                        id="reference"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Transaction reference or notes..."
                        className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isProcessing || paymentAmount <= 0}
                    >
                      {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                      ) : (
                          'Record Payment'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
          )}
        </CardContent>
      </Card>
  );
};

export default OrderInvoicePayment;