import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newStatus: string) => void;
  quotation: any;
}

const statusOptions = ['Draft', 'Pending Approval', 'Approved', 'Sent', 'Accepted', 'Rejected'];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Draft': 'text-gray-600',
    'Pending Approval': 'text-yellow-600',
    'Approved': 'text-orange-600',
    'Sent': 'text-orange-600',
    'Accepted': 'text-purple-600',
    'Rejected': 'text-red-600',
  };
  return colors[status] || 'text-gray-600';
};

export default function ChangeStatusModal({
  isOpen,
  onClose,
  onSubmit,
  quotation
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quotation) setSelectedStatus(quotation.status);
  }, [quotation]);

  const handleSubmit = async () => {
    if (!selectedStatus || selectedStatus === quotation?.status) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selectedStatus);
      onClose();
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(quotation?.status || '');
    onClose();
  };

  if (!isOpen || !quotation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
          <RefreshCw className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">Change Quotation Status</h2>
        </div>

        <div className="px-6">
          <div className="py-4 space-y-3">
            <div className="space-y-1">
              <Label>New Status <span className="text-red-500">*</span></Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem
                      key={status}
                      value={status}
                      className={status === quotation.status ? 'opacity-50' : ''}
                    >
                      <span className={getStatusColor(status)}>
                        {status}{status === quotation.status && ' (Current)'}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting || !selectedStatus || selectedStatus === quotation?.status}
            >
              {isSubmitting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Updating...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" />Update Status</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
