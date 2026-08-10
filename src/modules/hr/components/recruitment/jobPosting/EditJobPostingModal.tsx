// src/components/hr/recruitment/jobPosting/EditJobPostingModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Calendar, AlertCircle, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import EnumSelect from '@/shared/components/ui/enumSelect';
import { Badge } from '@/shared/components/ui/badge';
import type { JobPostingListDto, JobPostingModDto } from '@/modules/hr/types/recruit/jobPosting';
import { JobPostingType, PostingStatus } from '@/modules/hr/types/enum';

interface EditJobPostingModalProps {
  isOpen: boolean;
  item: JobPostingListDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: JobPostingModDto) => void;
}

const EditJobPostingModal: React.FC<EditJobPostingModalProps> = ({
                                                                   isOpen,
                                                                   item,
                                                                   isLoading = false,
                                                                   onClose,
                                                                   onSubmit,
                                                                 }) => {
  const [form, setForm] = useState<Omit<JobPostingModDto, 'id' | 'rowVersion'>>({
    status: '0' as any,
    postType: '0' as any,
    deadlineDate: '',
  });
  const [errors, setErrors] = useState<{ deadlineDate?: string }>({});

  useEffect(() => {
    if (item) {
      setForm({
        status: item.status,
        postType: item.postType,
        deadlineDate: item.deadlineDate?.split('T')[0] || '',
      });
      setErrors({});
    }
  }, [item]);

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const validate = (): boolean => {
    const newErrors: { deadlineDate?: string } = {};

    if (!form.deadlineDate) {
      newErrors.deadlineDate = 'Please select a deadline date';
    } else {
      const selectedDate = new Date(form.deadlineDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deadlineDate = 'Deadline date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !validate()) return;
    onSubmit({ ...form, id: item.id, rowVersion: item.rowVersion });
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const getStatusLabel = (value: string): string => {
    const labels: Record<string, string> = {
      '0': 'Draft',
      '1': 'Published',
      '2': 'Closed',
      '3': 'Expired',
      '4': 'Cancelled',
    };
    return labels[value] || 'Unknown';
  };

  const getPostTypeLabel = (value: string): string => {
    const labels: Record<string, string> = {
      '0': 'Internal',
      '1': 'External',
      '2': 'Both',
    };
    return labels[value] || 'Unknown';
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
      <AnimatePresence>
        {isOpen && item && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
            >
              <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Megaphone size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">Edit Job Posting</h2>
                    <p className="text-xs text-gray-500">{item.postNumber}</p>
                  </div>
                  <Badge className={item.statusStr === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {item.statusStr}
                  </Badge>
                  <button
                      onClick={handleClose}
                      disabled={isLoading}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Post Type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Post Type <span className="text-red-500">*</span>
                      </Label>
                      <EnumSelect
                          enumObject={JobPostingType}
                          value={form.postType as string}
                          onChange={(v) => setForm(f => ({ ...f, postType: v as any }))}
                          placeholder="Select type"
                          disabled={isLoading}
                      />
                      <p className="text-xs text-gray-400">
                        Current: {getPostTypeLabel(form.postType as string)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <EnumSelect
                          enumObject={PostingStatus}
                          value={form.status as string}
                          onChange={(v) => setForm(f => ({ ...f, status: v as any }))}
                          placeholder="Select status"
                          disabled={isLoading}
                      />
                      <p className="text-xs text-gray-400">
                        Current: {getStatusLabel(form.status as string)}
                      </p>
                    </div>

                    {/* Deadline Date */}
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm font-medium">
                        Deadline Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="date"
                            required
                            value={form.deadlineDate}
                            min={today}
                            max={maxDateStr}
                            onChange={(e) => {
                              setForm(f => ({ ...f, deadlineDate: e.target.value }));
                              if (errors.deadlineDate) setErrors({});
                            }}
                            disabled={isLoading}
                            className={`pl-9 ${errors.deadlineDate ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.deadlineDate && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.deadlineDate}
                          </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Deadline must be between {new Date(today).toLocaleDateString()} and {new Date(maxDateStr).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-6 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 cursor-pointer"
                    >
                      {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Saving...
                          </>
                      ) : (
                          'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default EditJobPostingModal;