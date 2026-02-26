import { useState } from "react";
import { motion } from "framer-motion";
import { X, BadgePlus } from "lucide-react";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import type { BudgetCategory } from "./BudgetCategorySection";

interface AddBudgetCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BudgetCategory, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
}

const AddBudgetCategoryModal: React.FC<AddBudgetCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    categoryNameEn: "",
    categoryNameAm: "",
    categoryCode: "",
    description: "",
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ 
        categoryNameEn: "", 
        categoryNameAm: "", 
        categoryCode: "", 
        description: "", 
        is_active: true 
      });
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!formData.categoryNameEn.trim() || !formData.categoryCode.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setFormData({ 
        categoryNameEn: "", 
        categoryNameAm: "", 
        categoryCode: "", 
        description: "", 
        is_active: true 
      });
    } catch (error) {
      console.error("Failed to add budget category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.categoryNameEn.trim() && formData.categoryCode.trim();

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
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <BadgePlus size={20} />
                <h2 className="text-lg font-bold text-gray-800">Add New Budget Category</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6">
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryCode" className="text-sm text-gray-500">
                    Category Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="categoryCode"
                    value={formData.categoryCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryCode: e.target.value,
                      }))
                    }
                    placeholder="e.g., 2200"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryNameEn" className="text-sm text-gray-500">
                    Category Name (English) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="categoryNameEn"
                    value={formData.categoryNameEn}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryNameEn: e.target.value,
                      }))
                    }
                    placeholder="e.g., Supplies & Materials"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryNameAm" className="text-sm text-gray-500">
                    Category Name (Amharic)
                  </Label>
                  <Input
                    id="categoryNameAm"
                    value={formData.categoryNameAm}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryNameAm: e.target.value,
                      }))
                    }
                    placeholder="e.g., አላቂ ዕቃዎች"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm text-gray-500">
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
                    placeholder="Brief description of this budget category"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="is_active" className="text-sm text-gray-500">
                    Active
                  </Label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-2">
              <div className="mx-auto flex justify-center items-center gap-1.5">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer px-6"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer px-6"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AddBudgetCategoryModal;
