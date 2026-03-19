import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EvaluationStepAddDto } from '../../../../../types/hr/evaluationStep';
import type { EvaluationTypeListDto } from '../../../../../types/hr/evaluationType';

interface AddEvaluationStepModalProps {
  isOpen: boolean;
  flowId: string;
  evaluationTypes: EvaluationTypeListDto[];
  onClose: () => void;
  onSubmit: (data: EvaluationStepAddDto) => void;
}

const defaultForm: EvaluationStepAddDto = {
  stepName: '',
  stepOrder: 1,
  isFinal: false,
  evalTypeId: '',
  evaluationFlowId: '',
};

const AddEvaluationStepModal: React.FC<AddEvaluationStepModalProps> = ({
  isOpen,
  flowId,
  evaluationTypes,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<EvaluationStepAddDto>({ ...defaultForm, evaluationFlowId: flowId });

  useEffect(() => {
    if (isOpen) setForm({ ...defaultForm, evaluationFlowId: flowId });
  }, [isOpen, flowId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Evaluation Step</h2>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Step Name</label>
                <input
                  type="text"
                  required
                  value={form.stepName}
                  onChange={e => setForm(f => ({ ...f, stepName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Technical Interview"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Step Order</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.stepOrder}
                  onChange={e => setForm(f => ({ ...f, stepOrder: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Type</label>
                <select
                  required
                  value={form.evalTypeId}
                  onChange={e => setForm(f => ({ ...f, evalTypeId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select evaluation type...</option>
                  {evaluationTypes.map(et => (
                    <option key={et.id} value={et.id}>{et.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFinal"
                  checked={form.isFinal}
                  onChange={e => setForm(f => ({ ...f, isFinal: e.target.checked }))}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isFinal" className="text-sm font-medium text-gray-700">Is Final Step</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Add Step
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddEvaluationStepModal;
