import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Edit } from "lucide-react";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import type {
  BenefitSetListDto,
  BenefitSetModDto,
} from "../../../../types/hr/benefit";
import type { UUID } from "crypto";

interface EditBenefitSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (benefitSet: BenefitSetModDto) => void;
  benefitSet: BenefitSetListDto | null;
}

const EditBenefitSetModal: React.FC<EditBenefitSetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  benefitSet,
}) => {
  const [formData, setFormData] = useState<BenefitSetModDto>({
    id: "" as UUID,
    name: "",
    benefitValue: 0,
    rowVersion: "",
    per:"",
  });

  // Initialize form when benefitSet changes
  useEffect(() => {
    if (benefitSet) {
      setFormData({
        id: benefitSet.id,
        name: benefitSet.name,
        benefitValue: benefitSet.benefit,
        per: benefitSet.per,
        rowVersion: benefitSet.rowVersion || "",
      });
    }
  }, [benefitSet]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "benefitValue" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || formData.benefitValue <= 0) {
      return;
    }

    onSave(formData);
    onClose();
  };

  // Convert benefit to display format with ETB after the amount
  const formatBenefit = (benefit: number): string => {
    const formattedAmount = new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(benefit);

    return `${formattedAmount} ETB`;
  };

  // Calculate monthly equivalent

  if (!isOpen || !benefitSet) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Edit size={20} />
            <h2 className="text-lg font-bold text-gray-800">Edit </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6">
          <div className="py-4 space-y-3">
            {/* Benefit Set Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-gray-500">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Eg. Health Insurance, Transport Allowance"
                className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Benefit Value */}
            <div className="space-y-2">
              <Label htmlFor="benefitValue" className="text-sm text-gray-500">
                Value (Amount) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="benefitValue"
                name="benefitValue"
                type="number"
                value={formData.benefitValue || ""}
                onChange={handleChange}
                placeholder="50000"
                min="0"
                step="0.01"
                className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Benefit Preview
            {formData.benefitValue > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-800 font-medium mb-2">
                  Benefit Preview:
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Annual</p>
                    <p className="font-semibold">
                      {formatBenefit(formData.benefitValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly</p>
                    <p className="font-semibold">
                      {formatBenefit(monthlyBenefit)}
                    </p>
                  </div>
                </div>
              </div>
            )} */}

            {/* Original Values for Reference */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-2">
                Original Values:
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{benefitSet.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Value (Amount)</p>
                  <p className="font-medium">
                    {formatBenefit(benefitSet.benefit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-2">
          <div className="mx-auto flex justify-center items-center gap-1.5">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6"
              onClick={handleSubmit}
              disabled={!formData.name.trim() || formData.benefitValue <= 0}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer px-6"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditBenefitSetModal;
