import { useState } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import type { Industry } from "./IndustriesSection";

interface AddIndustryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Industry, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
}

export default function AddIndustryModal({ isOpen, onClose, onSubmit }: AddIndustryModalProps) {
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => { setFormData({ name: "" }); setError(null); };
  const handleClose = () => { if (!isSubmitting) { reset(); onClose(); } };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return setError("Please enter an industry name");
    setIsSubmitting(true); setError(null);
    try { await onSubmit(formData); reset(); } catch { setError("Failed to add industry. Please try again."); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Building2 className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">Add Industry</h2>
        </div>
        <div className="px-6">
          <div className="py-4 space-y-3">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div className="space-y-1">
              <Label>Industry Name <span className="text-red-500">*</span></Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Technology, Healthcare, Finance" disabled={isSubmitting} />
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
