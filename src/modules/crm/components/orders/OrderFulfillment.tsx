// src/components/crm/orders/OrderFulfillment.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { showToast } from '@/shared/layout/layout';

interface OrderFulfillmentProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: (status: string, data: any) => Promise<void>;
  isUpdating?: boolean;
}

const OrderFulfillment: React.FC<OrderFulfillmentProps> = ({
                                                             orderId,
                                                             currentStatus,
                                                             onStatusUpdate,
                                                             isUpdating = false,
                                                           }) => {
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [notes, setNotes] = useState('');

  const statusOptions = [
    { value: 'Pending', label: 'Pending', icon: <Clock className="h-4 w-4" /> },
    { value: 'Processing', label: 'Processing', icon: <Package className="h-4 w-4" /> },
    { value: 'Shipped', label: 'Shipped', icon: <Truck className="h-4 w-4" /> },
    { value: 'Delivered', label: 'Delivered', icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'Cancelled', label: 'Cancelled', icon: <XCircle className="h-4 w-4" /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = { status };
    if (status === 'Shipped') {
      data.trackingNumber = trackingNumber;
      data.carrier = carrier;
    }
    if (notes) data.notes = notes;

    try {
      await onStatusUpdate(status, data);
      showToast.success(`Order status updated to ${status}`);
    } catch (error) {
      showToast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'Shipped': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Delivered': 'bg-green-100 text-green-700 border-green-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Order Fulfillment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Current Status:</span>
              <Badge className={getStatusBadge(currentStatus)}>
                {currentStatus}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="status">Update Status</Label>
              <Select
                  value={status}
                  onValueChange={setStatus}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                            {opt.icon}
                                          {opt.label}
                                        </span>
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {status === 'Shipped' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                >
                  <div>
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input
                        id="trackingNumber"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number..."
                        className="mt-1"
                        required
                    />
                  </div>
                  <div>
                    <Label htmlFor="carrier">Carrier</Label>
                    <Select
                        value={carrier}
                        onValueChange={setCarrier}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPS">UPS</SelectItem>
                        <SelectItem value="FedEx">FedEx</SelectItem>
                        <SelectItem value="DHL">DHL</SelectItem>
                        <SelectItem value="USPS">USPS</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
            )}

            <div>
              <Label htmlFor="fulfillmentNotes">Notes</Label>
              <Textarea
                  id="fulfillmentNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add fulfillment notes..."
                  className="mt-1"
                  rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isUpdating || status === currentStatus}
              >
                {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                ) : (
                    'Update Fulfillment'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
  );
};

export default OrderFulfillment;