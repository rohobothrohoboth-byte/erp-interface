import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";

interface AddRoutingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

interface FormData {
  name: string;
  description: string;
  assignTo: string;
  priority: number;
  isActive: boolean;
}

const salesReps = ['Sarah Johnson', 'Mike Wilson', 'Emily Davis', 'Robert Chen', 'Lisa Anderson'];

export default function AddRoutingRuleModal({ isOpen, onClose, onSubmit }: AddRoutingRuleModalProps) {
  const [formData, setFormData] = useState<FormData>({ name: "", description: "", assignTo: "", priority: 1, isActive: true });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFormData({ name: "", description: "", assignTo: "", priority: 1, isActive: true });
    setError(null); onClose();
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return setError("Please enter a rule name");
    if (!formData.assignTo) return setError("Please select a sales rep to assign to");
    setIsSubmitting(true); setError(null);
    try { onSubmit(formData); handleClose(); } catch { setError("Failed to save routing rule. Please try again."); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 border-b px-6 py-4 sticky top-0 bg-white z-10">
          <GitBranch className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">Add Routing Rule</h2>
        </div>
        <div className="px-6">
          <div className="py-4 space-y-3">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Rule Name <span className="text-red-500">*</span></Label>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Enterprise Leads" disabled={isSubmitting} />
              </div>
              <div className="space-y-1">
                <Label>Priority <span className="text-red-500">*</span></Label>
                <Input type="number" value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: Number(e.target.value) }))} min="1" disabled={isSubmitting} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe when this rule should be applied" rows={2} disabled={isSubmitting} />
            </div>
            <div className="space-y-1">
              <Label>Assign To <span className="text-red-500">*</span></Label>
              <Select value={formData.assignTo} onValueChange={v => setFormData(p => ({ ...p, assignTo: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select sales rep" /></SelectTrigger>
                <SelectContent>{salesReps.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>

          </div>
        </div>
        <div className="border-t px-6 py-2">
          <div className="flex justify-center items-center gap-1.5">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isSubmitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Adding...</> : "Save Rule"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
