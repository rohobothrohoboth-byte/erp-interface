import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';

interface DeletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentNumber: string;
}

export default function DeletePaymentModal({
  isOpen,
  onClose,
  onConfirm,
  paymentNumber
}: DeletePaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Delete Payment Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete payment entry{' '}
            <span className="font-semibold text-gray-900">{paymentNumber}</span>?
          </p>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            This action cannot be undone. The payment entry will be permanently removed.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
