// src/components/hr/recruitment/jobPosting/PostAllModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, AlertCircle, X } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import EnumSelect from '../../../ui/enumSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { useWorkforcePlans } from '../../../../services/hr/recruitment/workforcePlan/workforcePlan.queries';
import { JobPostingType } from '../../../../types/hr/enum';

interface PostAllModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (wfpId: string, postType: string, deadlineDate: string) => void;
}

const PostAllModal: React.FC<PostAllModalProps> = ({
                                                     isOpen,
                                                     isLoading = false,
                                                     onClose,
                                                     onSubmit,
                                                   }) => {
  const [wfpId, setWfpId] = useState('');
  const [postType, setPostType] = useState('0');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [errors, setErrors] = useState<{ wfpId?: string; deadlineDate?: string }>({});

  const { data: plans = [], isLoading: plansLoading } = useWorkforcePlans();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setWfpId('');
      setPostType('0');
      setDeadlineDate('');
      setErrors({});
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const validate = (): boolean => {
    const newErrors: { wfpId?: string; deadlineDate?: string } = {};

    if (!wfpId) {
      newErrors.wfpId = 'Please select a workforce plan';
    }

    if (!deadlineDate) {
      newErrors.deadlineDate = 'Please select a deadline date';
    } else {
      const selectedDate = new Date(deadlineDate);
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
    onSubmit(wfpId, postType, new Date(deadlineDate).toISOString());
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const getPlanLabel = (planId: string): string => {
    const plan = plans.find(p => p.id === planId);
    return plan ? `${plan.planCode} — ${plan.title}` : '';
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
                <div className="flex items-center gap-3 border-b px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Megaphone size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">Post All Job Requisitions</h2>
                    <p className="text-xs text-gray-500">Creates postings for all approved requisitions</p>
                  </div>
                  <button
                      onClick={handleClose}
                      disabled={isLoading}
                      className="p-1 rounded-lg hover:bg-blue-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Info Box */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700">
                        This will create job postings for all approved requisitions in the selected workforce plan.
                      </p>
                    </div>
                  </div>

                  {/* Workforce Plan */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Workforce Plan <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={wfpId}
                        onValueChange={(v) => {
                          setWfpId(v);
                          if (errors.wfpId) setErrors({ ...errors, wfpId: undefined });
                        }}
                        disabled={isLoading || plansLoading}
                    >
                      <SelectTrigger className={`w-full ${errors.wfpId ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select workforce plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plansLoading ? (
                            <div className="px-3 py-2 text-sm text-gray-400">Loading plans...</div>
                        ) : plans.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-400">No plans available</div>
                        ) : (
                            plans.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.planCode} — {p.title}
                                </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.wfpId && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.wfpId}
                        </p>
                    )}
                    {wfpId && (
                        <p className="text-xs text-gray-400">Selected: {getPlanLabel(wfpId)}</p>
                    )}
                  </div>

                  {/* Post Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Post Type <span className="text-red-500">*</span>
                    </Label>
                    <EnumSelect
                        enumObject={JobPostingType}
                        value={postType}
                        onChange={setPostType}
                        placeholder="Select type"
                        disabled={isLoading}
                    />
                  </div>

                  {/* Deadline Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Deadline Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="date"
                        value={deadlineDate}
                        min={today}
                        max={maxDateStr}
                        onChange={(e) => {
                          setDeadlineDate(e.target.value);
                          if (errors.deadlineDate) setErrors({ ...errors, deadlineDate: undefined });
                        }}
                        disabled={isLoading}
                        className={errors.deadlineDate ? 'border-red-500' : ''}
                    />
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
                      type="button"
                      onClick={handleSubmit}
                      disabled={!wfpId || !deadlineDate || isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 cursor-pointer"
                  >
                    {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Posting...
                        </>
                    ) : (
                        <>
                          <Megaphone className="w-4 h-4 mr-2" />
                          Post All
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

export default PostAllModal;