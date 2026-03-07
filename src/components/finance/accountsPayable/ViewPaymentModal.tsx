import { X, Download, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import type { PaymentEntry } from './types';

interface ViewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentEntry | null;
}

export default function ViewPaymentModal({
  isOpen,
  onClose,
  payment
}: ViewPaymentModalProps) {
  if (!payment) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Posted':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
            <span>Payment Entry Details</span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(payment.status)}`}>
              {payment.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Information */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">PV Number</p>
                <p className="text-base font-semibold text-gray-900">{payment.internal_pv_no}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bank Reference</p>
                <p className="text-base font-semibold text-gray-900">{payment.external_bank_ref}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Date</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(payment.payment_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="text-base font-semibold text-gray-900">{payment.payment_method.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vendor Name</p>
                <p className="text-base font-semibold text-gray-900">{payment.vendor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bank Account</p>
                <p className="text-base font-semibold text-gray-900">{payment.bank_account_name}</p>
              </div>
            </div>
          </div>

          {/* Invoices Paid */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices Paid</h3>
            <div className="space-y-3">
              {payment.invoices_paid.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invoice.invoice_no}</p>
                      <p className="text-sm text-gray-500">Invoice ID: {invoice.invoice_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(invoice.amount_paid)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total Payment Amount:</span>
              <span className="text-3xl font-bold text-emerald-600">
                {formatCurrency(payment.total_amount)}
              </span>
            </div>
          </div>

          {/* Attachment */}
          {payment.attachment_url && (
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachment</h3>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Attachment
              </Button>
            </div>
          )}

          {/* Audit Information */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p>Created By: {payment.created_by}</p>
                <p>Created At: {formatDate(payment.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
