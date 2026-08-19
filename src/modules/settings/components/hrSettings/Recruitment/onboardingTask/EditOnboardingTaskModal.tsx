// src/components/hr/recruit/onboardingTask/EditOnboardingTaskModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import type { OnboardingTaskListDto, OnboardingTaskModDto } from '@/modules/hr/types/recruit/onboardingTask';

interface EditOnboardingTaskModalProps {
  isOpen: boolean;
  item: OnboardingTaskListDto | null;
  onClose: () => void;
  onSubmit: (data: OnboardingTaskModDto) => void;
  isLoading?: boolean;
}

const EditOnboardingTaskModal: React.FC<EditOnboardingTaskModalProps> = ({
                                                                           isOpen,
                                                                           item,
                                                                           onClose,
                                                                           onSubmit,
                                                                           isLoading = false
                                                                         }) => {
  const [form, setForm] = useState<OnboardingTaskModDto>({
    id: '',
    taskName: '',
    description: '',
    sequenceOrder: 1,
    rowVersion: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      console.log('📝 Editing item:', item); // Debug log
      setForm({
        id: item.id,
        taskName: item.taskName,
        description: item.description,
        sequenceOrder: item.sequenceOrder,
        rowVersion: item.rowVersion // ✅ Include rowVersion from the item
      });
      setErrors({});
    }
  }, [item]);

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

    if (!form.rowVersion) {
      newErrors.rowVersion = 'Row version is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Submitting form:', form); // Debug log
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
                  <ClipboardCheck size={20} className="text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-800">Edit Onboarding Task</h2>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-taskName" className="text-sm font-medium text-gray-700">
                          Task Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-taskName"
                            value={form.taskName}
                            onChange={e => {
                              setForm(f => ({ ...f, taskName: e.target.value }));
                              setErrors(e => ({ ...e, taskName: '' }));
                            }}
                            className={errors.taskName ? 'border-red-500' : ''}
                            disabled={isLoading}
                            maxLength={100}
                        />
                        {errors.taskName && (
                            <p className="text-xs text-red-500">{errors.taskName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-sequenceOrder" className="text-sm font-medium text-gray-700">
                          Sequence Order <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-sequenceOrder"
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
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                          id="edit-description"
                          rows={4}
                          value={form.description}
                          onChange={e => {
                            setForm(f => ({ ...f, description: e.target.value }));
                            setErrors(e => ({ ...e, description: '' }));
                          }}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
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

                    {/* Hidden rowVersion field */}
                    <div className="hidden">
                      <input
                          type="hidden"
                          name="rowVersion"
                          value={form.rowVersion}
                      />
                    </div>

                    {/* Display rowVersion for debugging (optional) */}
                    <div className="text-xs text-gray-400 border-t pt-2 mt-2">
                      Version: {form.rowVersion ? form.rowVersion.substring(0, 12) + '...' : 'Not set'}
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
                          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px] relative"
                          disabled={isLoading}
                      >
                        {isLoading ? (
                            <>
                              <span className="opacity-0">Save</span>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            </>
                        ) : (
                            'Save Changes'
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

export default EditOnboardingTaskModal;