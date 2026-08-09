// src/components/crm/leadManagement/assignedLeads/ChangeLeadStatusModal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Badge } from '../../../ui/badge';
import type { LeadDto } from '../../../../types/crm/crm.types';

interface ChangeLeadStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newStatus: string) => void;
  lead: LeadDto | null;
}

const STATUS_OPTIONS = [
  'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost', 'Archived'
];

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-800 border-blue-200',
  'Contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Qualified': 'bg-green-100 text-green-800 border-green-200',
  'Proposal': 'bg-purple-100 text-purple-800 border-purple-200',
  'Negotiation': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Converted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Lost': 'bg-red-100 text-red-800 border-red-200',
  'Archived': 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  'New': 'Lead has just been created, no action taken yet',
  'Contacted': 'Initial contact has been made with the lead',
  'Qualified': 'Lead has been qualified and is ready for sales',
  'Proposal': 'Proposal has been sent to the lead',
  'Negotiation': 'Actively negotiating with the lead',
  'Converted': 'Lead has been converted to a customer',
  'Lost': 'Lead has been lost to a competitor',
  'Archived': 'Lead has been archived for future reference',
};

export default function ChangeLeadStatusModal({
                                                isOpen,
                                                onClose,
                                                onSubmit,
                                                lead
                                              }: ChangeLeadStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (lead) {
      setSelectedStatus(lead.status || 'New');
    }
  }, [lead]);

  const handleSubmit = async () => {
    if (!selectedStatus || selectedStatus === lead?.status) {
      showToast.warning('No change in status');
      return;
    }

    // Confirm for critical status changes
    if (selectedStatus === 'Converted' || selectedStatus === 'Lost' || selectedStatus === 'Archived') {
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
    setNotes('');
    onClose();
  };

  if (!isOpen || !lead) return null;

  const isCurrentStatus = selectedStatus === lead.status;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Lead Status</h2>
            <Badge className="ml-auto bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
              {lead.status || 'New'}
            </Badge>
          </div>

          <div className="px-6 py-4">
            {/* Lead Info */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {lead.fullName || `${lead.firstName} ${lead.lastName}`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lead.companyName || 'No company'} • {lead.title || 'No title'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Status <span className="text-red-500">*</span></Label>
                <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                        <SelectItem
                            key={status}
                            value={status}
                            disabled={status === lead.status}
                            className={status === lead.status ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center gap-2">
                            <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}>
                              {status}
                            </Badge>
                            {status === lead.status && (
                                <span className="text-xs text-gray-400">(Current)</span>
                            )}
                          </div>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStatus && STATUS_DESCRIPTIONS[selectedStatus] && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {STATUS_DESCRIPTIONS[selectedStatus]}
                      </p>
                    </div>
                  </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="statusNotes">Notes <span className="text-gray-400 text-sm">(Optional)</span></Label>
                <textarea
                    id="statusNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this status change..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex justify-center items-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                  onClick={handleSubmit}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isSubmitting || isCurrentStatus}
              >
                {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Updating...
                    </>
                ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Status
                    </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
}