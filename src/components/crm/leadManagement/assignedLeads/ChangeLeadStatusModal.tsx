import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { Lead } from '../../../../types/crm';

interface ChangeLeadStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newStatus: Lead['status']) => void;
  lead: Lead | null;
}

const statusOptions: Lead['status'][] = [
  'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed Lost'
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'New': 'text-green-600',
    'Contacted': 'text-yellow-600',
    'Qualified': 'text-green-600',
    'Proposal Sent': 'text-purple-600',
    'Closed Won': 'text-emerald-600',
    'Closed Lost': 'text-red-600',
  };
  return colors[status] || 'text-gray-600';
};

export default function ChangeLeadStatusModal({
  isOpen,
  onClose,
  onSubmit,
  lead
}: ChangeLeadStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<Lead['status']>('New');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) setSelectedStatus(lead.status);
  }, [lead]);

  const handleSubmit = async () => {
    if (!selectedStatus || selectedStatus === lead?.status) return;

    if (selectedStatus === 'Converted' || selectedStatus === 'Closed Lost') {
      const confirmed = window.confirm(
        `Are you sure you want to mark this lead as "${selectedStatus}"? This action will be logged in the audit trail.`
      );
      if (!confirmed) return;
    }

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
    setSelectedStatus(lead?.status || 'New');
    onClose();
  };

  if (!isOpen || !lead) return null;

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
          <h2 className="text-base font-semibold text-gray-800">Change Lead Status</h2>
        </div>

        <div className="px-6">
          <div className="py-4 space-y-3">
            <div className="space-y-1">
              <Label>New Status <span className="text-red-500">*</span></Label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Lead['status'])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem
                      key={status}
                      value={status}
                      className={status === lead.status ? 'opacity-50' : ''}
                    >
                      <span className={getStatusColor(status)}>
                        {status}{status === lead.status && ' (Current)'}
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
              disabled={isSubmitting || !selectedStatus || selectedStatus === lead?.status}
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
