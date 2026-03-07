import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import type { Invoice } from '../types';

interface ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  actionType: 'approve' | 'reject';
  invoice: Invoice;
}

const ApproveRejectModal: React.FC<ApproveRejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  invoice,
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(comment);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setComment('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const isApprove = actionType === 'approve';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <div className="flex items-center gap-3">
            {isApprove ? (
              <CheckCircle size={24} className="text-green-600" />
            ) : (
              <XCircle size={24} className="text-red-600" />
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {isApprove ? 'Approve Invoice' : 'Reject Invoice'}
              </h2>
              <p className="text-sm text-gray-600">{invoice.invoice_no}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Invoice Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Vendor:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {invoice.vendor_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(invoice.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm text-gray-700 font-medium">
                Comment {isApprove ? '(Optional)' : <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isApprove
                    ? 'Add any comments or notes...'
                    : 'Please provide a reason for rejection...'
                }
                className="w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={4}
                required={!isApprove}
                disabled={loading}
              />
            </div>

            {/* Warning for rejection */}
            {!isApprove && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Rejecting this invoice will stop the approval
                  process. The invoice will need to be resubmitted.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex justify-end items-center gap-3">
              <Button
                variant="outline"
                className="cursor-pointer px-6"
                onClick={handleClose}
                type="button"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`cursor-pointer px-6 ${
                  isApprove
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
                disabled={loading || (!isApprove && !comment.trim())}
              >
                {loading
                  ? 'Processing...'
                  : isApprove
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ApproveRejectModal;
