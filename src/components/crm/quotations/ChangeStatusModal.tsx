// src/components/crm/quotations/ChangeStatusModal.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: number, note?: string) => void;
  currentStatus: number;
  isLoading?: boolean;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onConfirm,
                                                               currentStatus,
                                                               isLoading = false,
                                                             }) => {
  const [status, setStatus] = useState<number>(currentStatus);
  const [note, setNote] = useState('');

  const statusOptions = [
    { value: 1, label: 'Draft', icon: <FileText className="h-4 w-4" /> },
    { value: 2, label: 'Sent', icon: <Send className="h-4 w-4" /> },
    { value: 3, label: 'Viewed', icon: <Eye className="h-4 w-4" /> },
    { value: 4, label: 'Accepted', icon: <CheckCircle className="h-4 w-4" /> },
    { value: 5, label: 'Rejected', icon: <XCircle className="h-4 w-4" /> },
    { value: 6, label: 'Expired', icon: <Clock className="h-4 w-4" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(status, note);
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        />

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Change Status</h2>
            <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select
                  value={String(status)}
                  onValueChange={(value) => setStatus(parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                                        <span className="flex items-center gap-2">
                                            {opt.icon}
                                          {opt.label}
                                        </span>
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this status change..."
                  className="mt-1"
                  rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isLoading || status === currentStatus}
              >
                {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                ) : (
                    'Update Status'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
  );
};

export default ChangeStatusModal;