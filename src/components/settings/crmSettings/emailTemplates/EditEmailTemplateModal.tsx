import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Checkbox } from "../../../ui/checkbox";
import { Textarea } from "../../../ui/textarea";
import type { EmailTemplate } from "./EmailTemplatesSection";

interface EditEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EmailTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
  template: EmailTemplate | null;
}

export default function EditEmailTemplateModal({ isOpen, onClose, onSubmit, template }: EditEmailTemplateModalProps) {
  const [formData, setFormData] = useState({ name: "", subject: "", body: "", is_active: true });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) { setFormData({ name: template.name, subject: template.subject, body: template.body, is_active: template.is_active }); setError(null); }
  }, [template]);

  const handleClose = () => { if (!isSubmitting) { setError(null); onClose(); } };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return setError("Please enter a template name");
    if (!formData.subject.trim()) return setError("Please enter email subject");
    if (!formData.body.trim()) return setError("Please enter email body");
    setIsSubmitting(true); setError(null);
    try { onSubmit(formData); } catch { setError("Failed to update template. Please try again."); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 border-b px-6 py-2 sticky top-0 bg-white z-10">
          <Mail className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">Edit Email Template</h2>
        </div>
        <div className="px-6">
          <div className="py-4 space-y-3">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}
            <div className="space-y-1">
              <Label>Template Name <span className="text-red-500">*</span></Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Welcome Email, Follow-up" disabled={isSubmitting} />
            </div>
            <div className="space-y-1">
              <Label>Email Subject <span className="text-red-500">*</span></Label>
              <Input value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))} placeholder="e.g., Welcome to {{company_name}}" disabled={isSubmitting} />
              <p className="text-xs text-gray-500">Use variables: {"{{contact_name}}"}, {"{{company_name}}"}, {"{{lead_source}}"}</p>
            </div>
            <div className="space-y-1">
              <Label>Email Body <span className="text-red-500">*</span></Label>
              <Textarea value={formData.body} onChange={e => setFormData(p => ({ ...p, body: e.target.value }))} placeholder="Enter email body content..." rows={10} disabled={isSubmitting} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={c => setFormData(p => ({ ...p, is_active: c as boolean }))} disabled={isSubmitting} />
              <Label htmlFor="is_active">Active</Label>
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
