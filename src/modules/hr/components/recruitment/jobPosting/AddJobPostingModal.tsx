// src/components/hr/recruitment/jobPosting/AddJobPostingModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Calendar, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import EnumSelect from '@/shared/components/ui/enumSelect';
import { Badge } from '@/shared/components/ui/badge';
import type { JobPostingAddDto } from '@/modules/hr/types/recruit/jobPosting';
import { JobPostingType } from '@/modules/hr/types/enum';

interface AddJobPostingModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  reqId: string;
  reqNumber?: string;
  onClose: () => void;
  onSubmit: (data: JobPostingAddDto) => void;
}

const makeDefault = (reqId: string): JobPostingAddDto => ({
  id: reqId,
  postType: '0' as any,
  deadlineDate: '',
});

const AddJobPostingModal: React.FC<AddJobPostingModalProps> = ({
                                                                 isOpen,
                                                                 isLoading = false,
                                                                 reqId,
                                                                 reqNumber,
                                                                 onClose,
                                                                 onSubmit
                                                               }) => {
  const [form, setForm] = useState<JobPostingAddDto>(makeDefault(reqId));
  const [errors, setErrors] = useState<{ deadlineDate?: string; postType?: string }>({});

  // Reset form when modal opens with new reqId
  useEffect(() => {
    if (isOpen) {
      setForm(makeDefault(reqId));
      setErrors({});
    }
  }, [isOpen, reqId]);

  const reset = () => {
    setForm(makeDefault(reqId));
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: { deadlineDate?: string; postType?: string } = {};

    if (!form.postType || form.postType === '') {
      newErrors.postType = 'Please select a post type';
    }

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

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      id: reqId,
      postType: form.postType,
      deadlineDate: form.deadlineDate ? new Date(form.deadlineDate).toISOString() : '',
    });
    reset();
  };

  // Calculate min date (today)
  const today = new Date().toISOString().split('T')[0];

  // Calculate max date (6 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const getPostTypeLabel = (value: string): string => {
    const labels: Record<string, string> = {
      '0': 'Internal',
      '1': 'External',
      '2': 'Both',
    };
    return labels[value] || 'Unknown';
  };

  return (
      <AnimatePresence>
        {isOpen && (
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
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-3 border-b px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Megaphone size={20} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">Add Job Posting</h2>
                    {reqNumber && (
                        <p className="text-xs text-gray-500">Requisition: {reqNumber}</p>
                    )}
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    New
                  </Badge>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Requisition Info */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Creating posting for requisition</span>
                      <span className="font-mono text-xs font-medium text-gray-800">{reqNumber || reqId.slice(0, 8)}</span>
                    </div>
                  </div>

                  {/* Post Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Post Type <span className="text-red-500">*</span>
                    </Label>
                    <EnumSelect
                        enumObject={JobPostingType}
                        value={form.postType as string}
                        onChange={(v) => {
                          setForm(f => ({ ...f, postType: v as any }));
                          if (errors.postType) setErrors({ ...errors, postType: undefined });
                        }}
                        placeholder="Select type"
                        disabled={isLoading}
                        className={errors.postType ? 'border-red-500' : ''}
                    />
                    {errors.postType && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.postType}
                        </p>
                    )}
                    {form.postType && (
                        <p className="text-xs text-gray-500">
                          Selected: <span className="font-medium">{getPostTypeLabel(form.postType as string)}</span>
                        </p>
                    )}
                  </div>

                  {/* Deadline Date */}
                  <div className="space-y-2">
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
                            if (errors.deadlineDate) setErrors({ ...errors, deadlineDate: undefined });
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

                  {/* Info Box */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-blue-700">
                      💡 The job posting will be created and visible to applicants based on the selected post type and deadline.
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
                      type="button"
                      disabled={isLoading || !form.deadlineDate}
                      onClick={handleSubmit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 cursor-pointer"
                  >
                    {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Adding...
                        </>
                    ) : (
                        <>
                          <Megaphone className="w-4 h-4 mr-2" />
                          Add Posting
                        </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default AddJobPostingModal;