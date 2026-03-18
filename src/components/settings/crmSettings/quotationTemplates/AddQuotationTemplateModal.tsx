import React, { useState } from "react";
import { AlertCircle, BadgePlus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Alert, AlertDescription } from "../../../ui/alert";
import type { QuotationTemplate } from "./QuotationTemplatesSection";
import { motion } from "framer-motion";

interface AddQuotationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<QuotationTemplate, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
}

const AddQuotationTemplateModal: React.FC<AddQuotationTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    termsAndConditions: "",
    validityDays: 30
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      description: "",
      termsAndConditions: "",
      validityDays: 30
    });
    setError(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Please enter a template name");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a quotation title");
      return;
    }

    if (!formData.termsAndConditions.trim()) {
      setError("Please enter terms and conditions");
      return;
    }

    if (formData.validityDays <= 0) {
      setError("Validity days must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      resetForm();
    } catch (error) {
      setError("Failed to add quotation template. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* header */}
            <div className="flex justify-between items-center border-b px-6 py-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <BadgePlus size={20} />
                <h2 className="text-lg font-bold text-gray-800">Add New</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
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
                    className="h-auto p-0 text-destructive hover:text-destructive/80"
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
              <div className="grid grid-cols-2 gap-4 px-6 ">
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-gray-500">
                      Template Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Standard Quotation, Premium Package"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="termsAndConditions"
                      className="text-sm text-gray-500"
                    >
                      Terms and Conditions{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="termsAndConditions"
                      value={formData.termsAndConditions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          termsAndConditions: e.target.value,
                        }))
                      }
                      placeholder="Enter standard terms and conditions for this quotation"
                      rows={6}
                      required
                      disabled={isSubmitting}
                      className="text-sm h-24 resize-none overflow-y-auto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="validityDays"
                      className="text-sm text-gray-500"
                    >
                      Validity Period (Days){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="validityDays"
                      type="number"
                      value={formData.validityDays}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          validityDays: Number(e.target.value),
                        }))
                      }
                      placeholder="e.g., 30"
                      min="1"
                      required
                      disabled={isSubmitting}
                    />
                  </div>


                </div>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm text-gray-500">
                      Quotation Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g., Professional Services Quotation"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm text-gray-500"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of this quotation template"
                      rows={2}
                      disabled={isSubmitting}
                      className="text-sm h-24 resize-none overflow-y-auto"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center gap-1.5 pt-4 border-t">
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer px-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer px-6"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AddQuotationTemplateModal;