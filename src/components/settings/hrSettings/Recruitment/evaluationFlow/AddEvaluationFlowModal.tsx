import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgePlus, AlertCircle } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import type { EvaluationFlowAddDto } from '../../../../../types/hr/recruit/evaluationFlow';

interface AddEvaluationFlowModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: EvaluationFlowAddDto) => void;
}

const AddEvaluationFlowModal: React.FC<AddEvaluationFlowModalProps> = ({ isOpen, isLoading = false, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<EvaluationFlowAddDto>({ name: '', isGlobal: false });
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setFormData({ name: '', isGlobal: false }); setError(null); };
  const handleClose = () => { if (!isLoading) { reset(); onClose(); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Please enter a name'); return; }
    setError(null);
    onSubmit(formData);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <BadgePlus size={20} />
          <h2 className="text-lg font-bold text-gray-800">Add Evaluation Flow</h2>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flow-name" className="text-sm text-gray-500">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="flow-name"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Standard Hiring Flow, Technical Track"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="flow-isGlobal"
              type="checkbox"
              checked={formData.isGlobal}
              onChange={(e) => setFormData(p => ({ ...p, isGlobal: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              disabled={isLoading}
            />
            <Label htmlFor="flow-isGlobal" className="text-sm text-gray-600 cursor-pointer">Global (applies to all positions)</Label>
          </div>

          <div className="flex justify-center gap-2 pt-2 border-t">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer" disabled={isLoading}>
              {isLoading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Adding...</>
              ) : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="px-6 cursor-pointer">
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddEvaluationFlowModal;
