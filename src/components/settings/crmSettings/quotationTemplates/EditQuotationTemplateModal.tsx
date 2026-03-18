import React, { useState, useEffect } from "react";
import { AlertCircle, X, Pencil } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Alert, AlertDescription } from "../../../ui/alert";
import type { QuotationTemplate } from "./QuotationTemplatesSection";
import { motion } from "framer-motion";

interface EditQuotationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      QuotationTemplate,
      "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy"
    >,
  ) => void;
  template: QuotationTemplate | null;
}

const EditQuotationTemplateModal: React.FC<EditQuotationTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    termsAndConditions: "",
    validityDays: 30,
    is_active: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        title: template.title,
        description: template.description,
        termsAndConditions: template.termsAndConditions,
        validityDays: template.validityDays,
        is_active: template.is_active,
      });
      setError(null);
    }
  }, [template]);

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return setError("Please enter a template name");
    if (!formData.title.trim())
      return setError("Please enter a quotation title");
    if (!formData.termsAndConditions.trim())
      return setError("Please enter terms and conditions");
    if (formData.validityDays <= 0)
      return setError("Validity days must be greater than 0");

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch {
      setError("Failed to update quotation template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Pencil size={20} />
            <h2 className="text-lg font-bold text-gray-800">Edit Template</h2>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto py-4"
        >
          <div className="grid grid-cols-2 gap-4 px-6">
            {/* LEFT */}
            <div className="space-y-2">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">
                  Terms and Conditions *
                </Label>
                <Textarea
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      termsAndConditions: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  className="text-sm h-24 resize-none overflow-y-auto"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">
                  Validity Period *
                </Label>
                <Input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      validityDays: Number(e.target.value),
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>


            </div>

            {/* RIGHT */}
            <div className="space-y-2">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">
                  Quotation Title *
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  disabled={isSubmitting}
                  className="text-sm h-24 resize-none overflow-y-auto"
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-center items-center gap-1.5 pt-4 border-t">
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditQuotationTemplateModal;
