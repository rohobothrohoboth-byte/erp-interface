// src/components/hr/recruit/onboardingTask/AddOnboardingTaskModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
import type {
  OnboardingTaskAddDto,
  OnboardingTaskListDto
} from '../../../../../types/hr/recruit/onboardingTask';

interface AddOnboardingTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OnboardingTaskAddDto) => void;
  isLoading?: boolean;
  existingTasks?: OnboardingTaskListDto[];
}

const defaultForm: OnboardingTaskAddDto = {
  taskName: '',
  description: '',
  sequenceOrder: 1
};

const AddOnboardingTaskModal: React.FC<AddOnboardingTaskModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         onSubmit,
                                                                         isLoading = false,
                                                                         existingTasks = []
                                                                       }) => {
  const [form, setForm] = useState<OnboardingTaskAddDto>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Use ref to track if we've already reset for this open state
  const hasResetRef = useRef(false);

  // Reset form and set next sequence number
  useEffect(() => {
    if (isOpen) {
      // ✅ Only reset once per open
      if (!hasResetRef.current) {
        const maxSeq = Math.max(...existingTasks.map(t => t.sequenceOrder || 0), 0);
        setForm({ ...defaultForm, sequenceOrder: maxSeq + 1 });
        setErrors({});
        hasResetRef.current = true;
      }
    } else {
      // ✅ Reset the flag when modal closes
      hasResetRef.current = false;
    }
  }, [isOpen, existingTasks]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    } else if (form.taskName.trim().length < 3) {
      newErrors.taskName = 'Task name must be at least 3 characters';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!form.sequenceOrder || form.sequenceOrder < 1) {
      newErrors.sequenceOrder = 'Sequence order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
                onClick={e => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
            >
              <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center gap-3 border-b px-6 py-4 sticky top-0 bg-white z-10">
                  <ClipboardCheck size={20} className="text-green-600" />
                  <h2 className="text-lg font-bold text-gray-800">Add Onboarding Task</h2>
                  {existingTasks.length > 0 && (
                      <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Task #{existingTasks.length + 1}
                </span>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taskName" className="text-sm font-medium text-gray-700">
                          Task Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="taskName"
                            value={form.taskName}
                            onChange={e => {
                              setForm(f => ({ ...f, taskName: e.target.value }));
                              setErrors(e => ({ ...e, taskName: '' }));
                            }}
                            placeholder="e.g. Complete IT Setup"
                            className={errors.taskName ? 'border-red-500' : ''}
                            disabled={isLoading}
                            maxLength={100}
                        />
                        {errors.taskName && (
                            <p className="text-xs text-red-500">{errors.taskName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sequenceOrder" className="text-sm font-medium text-gray-700">
                          Sequence Order <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="sequenceOrder"
                            type="number"
                            min={1}
                            value={form.sequenceOrder}
                            onChange={e => {
                              setForm(f => ({ ...f, sequenceOrder: parseInt(e.target.value) || 1 }));
                              setErrors(e => ({ ...e, sequenceOrder: '' }));
                            }}
                            className={errors.sequenceOrder ? 'border-red-500' : ''}
                            disabled={isLoading}
                        />
                        {errors.sequenceOrder && (
                            <p className="text-xs text-red-500">{errors.sequenceOrder}</p>
                        )}
                        {!errors.sequenceOrder && (
                            <p className="text-xs text-gray-400">
                              Suggested: {Math.max(...existingTasks.map(t => t.sequenceOrder || 0), 0) + 1}
                            </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                          id="description"
                          rows={4}
                          value={form.description}
                          onChange={e => {
                            setForm(f => ({ ...f, description: e.target.value }));
                            setErrors(e => ({ ...e, description: '' }));
                          }}
                          placeholder="Describe what this task involves..."
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                              errors.description ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={isLoading}
                          maxLength={500}
                      />
                      {errors.description && (
                          <p className="text-xs text-red-500">{errors.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {form.description.length}/500 characters
                      </p>
                    </div>
                  </div>

                  <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
                    <div className="flex justify-center gap-3">
                      <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          disabled={isLoading}
                          className="min-w-[100px]"
                      >
                        Cancel
                      </Button>
                      <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] relative"
                          disabled={isLoading}
                      >
                        {isLoading ? (
                            <>
                              <span className="opacity-0">Add Task</span>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            </>
                        ) : (
                            'Add Task'
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default AddOnboardingTaskModal;