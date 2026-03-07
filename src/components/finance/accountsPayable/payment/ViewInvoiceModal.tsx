import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { FileText } from 'lucide-react';
import type { Invoice } from '../types';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function ViewInvoiceModal({
  isOpen,
  onClose,
  invoice
}: ViewInvoiceModalProps) {
  if (!invoice) return null;

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
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Partially_Paid':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Paid':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
            <span>Invoice Details</span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status.replace('_', ' ')}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Information */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="text-base font-semibold text-gray-900">{invoice.invoice_no}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendor</p>
                <p className="text-base font-semibold text-gray-900">{invoice.vendor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(invoice.invoice_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(invoice.due_date)}</p>
              </div>
            </div>
          </div>

          {/* Amount Details */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(invoice.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-gray-900 font-semibold">Remaining Amount:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(invoice.remaining_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {invoice.description && (
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{invoice.description}</p>
            </div>
          )}
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
