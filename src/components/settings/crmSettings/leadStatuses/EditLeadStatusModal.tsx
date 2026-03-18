import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import type { LeadStatus } from "./LeadStatusesSection";

interface EditLeadStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<LeadStatus, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
  status: LeadStatus | null;
}

export default function EditLeadStatusModal({ isOpen, onClose, onSubmit, status }: EditLeadStatusModalProps) {
  const [formData, setFormData] = useState({ name: "", priority: 0, is_active: true });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status) { setFormData({ name: status.name, priority: status.priority || 0, is_active: status.is_active }); setError(null); }
  }, [status]);

  const handleClose = () => { if (!isSubmitting) { setError(null); onClose(); } };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return setError("Please enter a status name");
    setIsSubmitting(true); setError(null);
    try { await onSubmit(formData); } catch { setError("Failed to update lead status. Please try again."); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <Tag className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">Edit Lead Status</h2>
        </div>
        <div className="px-6">
          <div className="py-4 space-y-3">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div className="space-y-1">
              <Label>Status Name <span className="text-red-500">*</span></Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., New, Contacted, Qualified" disabled={isSubmitting} />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Input type="number" value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: Number(e.target.value) }))} placeholder="e.g., 1, 2, 3" min="0" disabled={isSubmitting} />
            </div>

          </div>
        </div>
        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isSubmitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Updating...</> : "Update"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
