import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Edit, AlertCircle } from 'lucide-react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import type { EvaluationTypeListDto, EvaluationTypeAddDto } from '../../../../../types/hr/evaluationType';

interface EditEvaluationTypeModalProps {
  isOpen: boolean;
  item: EvaluationTypeListDto | null;
  onClose: () => void;
  onSubmit: (data: EvaluationTypeAddDto) => void;
}

const EditEvaluationTypeModal: React.FC<EditEvaluationTypeModalProps> = ({ isOpen, item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<EvaluationTypeAddDto>({ name: '', maxScore: 100, isActive: true });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) setFormData({ name: item.name, maxScore: item.maxScore, isActive: item.isActive });
  }, [item]);

  const handleClose = () => {
    if (!isSubmitting) { setError(null); onClose(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Please enter a name'); return; }
    if (formData.maxScore <= 0) { setError('Max score must be greater than 0'); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(formData);
    } catch {
      setError('Failed to update evaluation type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="flex justify-between items-center border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Edit size={20} />
            <h2 className="text-lg font-bold text-gray-800">Edit Evaluation Type</h2>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className='px-6 space-y-4'>
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm text-gray-500">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-maxScore" className="text-sm text-gray-500">
              Max Score <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-maxScore"
              type="number"
              min="1"
              value={formData.maxScore}
              onChange={(e) => setFormData(p => ({ ...p, maxScore: Number(e.target.value) }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="edit-isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <Label htmlFor="edit-isActive" className="text-sm text-gray-600 cursor-pointer">Active</Label>
          </div>
</div>
          <div className="flex justify-center gap-2 pt-2 border-t">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Saving...</>
              ) : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="px-6 cursor-pointer">
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditEvaluationTypeModal;
