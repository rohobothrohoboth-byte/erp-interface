import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type { EvaluationFlowListDto, EvaluationFlowAddDto } from '@/modules/hr/types/recruit/evaluationFlow';

interface EditEvaluationFlowModalProps {
  isOpen: boolean;
  item: EvaluationFlowListDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: EvaluationFlowAddDto) => void;
}

const EditEvaluationFlowModal: React.FC<EditEvaluationFlowModalProps> = ({ isOpen, item, isLoading = false, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<EvaluationFlowAddDto>({ name: '', isGlobal: false, isActive: true });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) setFormData({ name: item.name, isGlobal: item.isGlobal, isActive: item.isActive });
  }, [item]);

  const handleClose = () => { if (!isLoading) { setError(null); onClose(); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Please enter a name'); return; }
    setError(null);
    onSubmit(formData);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Edit size={20} />
          <h2 className="text-lg font-bold text-gray-800">Edit Evaluation Flow</h2>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-flow-name" className="text-sm text-gray-500">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-flow-name"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="edit-flow-isGlobal"
              type="checkbox"
              checked={formData.isGlobal}
              onChange={(e) => setFormData(p => ({ ...p, isGlobal: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              disabled={isLoading}
            />
            <Label htmlFor="edit-flow-isGlobal" className="text-sm text-gray-600 cursor-pointer">Global (applies to all positions)</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="edit-flow-isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              disabled={isLoading}
            />
            <Label htmlFor="edit-flow-isActive" className="text-sm text-gray-600 cursor-pointer">Active</Label>
          </div>

          <div className="flex justify-center gap-2 pt-2 border-t">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer" disabled={isLoading}>
              {isLoading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
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

export default EditEvaluationFlowModal;
