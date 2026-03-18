import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import type { LeadScoringCriteria } from "./LeadScoringSection";

interface AddScoringCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<LeadScoringCriteria, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
  currentTotalPercentage: number;
}

export default function AddScoringCriteriaModal({ isOpen, onClose, onSubmit, currentTotalPercentage }: AddScoringCriteriaModalProps) {
  const [formData, setFormData] = useState({ name: "", maxPoints: 0, percentage: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => { setFormData({ name: "", maxPoints: 0, percentage: 0 }); setError(null); };
  const handleClose = () => { if (!isSubmitting) { reset(); onClose(); } };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return setError("Please enter a criteria name");
    if (formData.maxPoints <= 0) return setError("Max points must be greater than 0");
    if (formData.percentage <= 0 || formData.percentage > 100) return setError("Percentage must be between 1 and 100");
    if (currentTotalPercentage + formData.percentage > 100) return setError(`Total percentage would be ${currentTotalPercentage + formData.percentage}%. Cannot exceed 100%`);
    setIsSubmitting(true); setError(null);
    try { onSubmit(formData); reset(); } catch { setError("Failed to add criteria. Please try again."); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Star className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">Add Scoring Criteria</h2>
        </div>
        <div className="px-6">
          <div className="py-4 space-y-3">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div className="space-y-1">
              <Label>Criteria Name <span className="text-red-500">*</span></Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Interest Level, Budget, Authority" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Max Points <span className="text-red-500">*</span></Label>
                <Input type="number" value={formData.maxPoints} onChange={e => setFormData(p => ({ ...p, maxPoints: Number(e.target.value) }))} min="1" disabled={isSubmitting} />
              </div>
              <div className="space-y-1">
                <Label>Weight (%) <span className="text-red-500">*</span></Label>
                <Input type="number" step="0.01" value={formData.percentage} onChange={e => setFormData(p => ({ ...p, percentage: Number(e.target.value) }))} min="0.01" max="100" disabled={isSubmitting} />
              </div>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded text-xs text-gray-600">
              Current total: <span className="font-semibold">{currentTotalPercentage}%</span>
              {formData.percentage > 0 && <> â†’ New total: <span className="font-semibold">{currentTotalPercentage + formData.percentage}%</span></>}
            </div>
          </div>
        </div>
        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isSubmitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Adding...</> : "Save"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
