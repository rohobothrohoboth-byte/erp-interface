import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Label } from '../../../../ui/label';
import { Input } from '../../../../ui/input';
import type { OnboardingTaskAddDto } from '../../../../../types/hr/recruit/onboardingTask';

interface AddOnboardingTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OnboardingTaskAddDto) => void;
}

const defaultForm: OnboardingTaskAddDto = { taskName: '', description: '', sequenceOrder: 1 };

const AddOnboardingTaskModal: React.FC<AddOnboardingTaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState<OnboardingTaskAddDto>(defaultForm);

  useEffect(() => { if (isOpen) setForm(defaultForm); }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
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
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-taskName" className="text-sm font-medium text-gray-700">
                        Task Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="add-taskName"
                        required
                        value={form.taskName}
                        onChange={e => setForm(f => ({ ...f, taskName: e.target.value }))}
                        placeholder="e.g. Complete IT Setup"
                        className="w-full"
                      />
                    </div>
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-seqOrder" className="text-sm font-medium text-gray-700">
                        Sequence Order <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="add-seqOrder"
                        type="number"
                        required
                        min={1}
                        value={form.sequenceOrder}
                        onChange={e => setForm(f => ({ ...f, sequenceOrder: parseInt(e.target.value) || 1 }))}
                        className="w-full"
                      />
                    </div>
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-desc" className="text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="add-desc"
                      required
                      rows={6}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe what this task involves..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
              </div>

              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-xl">
                <div className="flex justify-center items-center gap-3">
                  <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer px-6 min-w-[100px]">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6 min-w-[100px]">
                    Add Task
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
