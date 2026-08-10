import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Edit } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import type {
  JobGradeListDto,
  JobGradeModDto,
} from "@/modules/hr/types/jobgrade";
import type { UUID } from "crypto";

interface EditJobGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (grade: JobGradeModDto) => void;
  jobGrade: JobGradeListDto | null;
}

const EditJobGradeModal: React.FC<EditJobGradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  jobGrade,
}) => {
  const [formData, setFormData] = useState<JobGradeModDto>({
    id: "" as UUID,
    name: "",
    startSalary: 0,
    maxSalary: 0,
    rowVersion: "",
  });

  // Initialize form when jobGrade changes
  useEffect(() => {
    if (jobGrade) {
      setFormData({
        id: jobGrade.id,
        name: jobGrade.name,
        startSalary: jobGrade.startSalary,
        maxSalary: jobGrade.maxSalary,
        rowVersion: jobGrade.rowVersion,
      });
    }
  }, [jobGrade]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Salary") ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (
      !formData.name.trim() ||
      formData.startSalary <= 0 ||
      formData.maxSalary <= formData.startSalary
    ) {
      return;
    }

    onSave(formData);
    onClose();
  };

  // Convert salary to ETB display format
  // Convert salary to display format with ETB after the amount
  const formatSalary = (salary: number): string => {
    const formattedAmount = new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);

    return `${formattedAmount} ETB`;
  };

  if (!isOpen || !jobGrade) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Edit size={20} />
            <h2 className="text-lg font-bold text-gray-800">Edit</h2>
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
            {/* Grade Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-gray-500">
                Grade Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Eg. Senior Technical Grade V"
                className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startSalary" className="text-sm text-gray-500">
                  Start Salary <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startSalary"
                  name="startSalary"
                  type="number"
                  value={formData.startSalary || ""}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                  className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSalary" className="text-sm text-gray-500">
                  Max Salary <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxSalary"
                  name="maxSalary"
                  type="number"
                  value={formData.maxSalary || ""}
                  onChange={handleChange}
                  placeholder="80000"
                  min={formData.startSalary + 1}
                  className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Salary Preview
            {formData.startSalary > 0 && formData.maxSalary > formData.startSalary && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-800 font-medium mb-2">Salary Preview:</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Start</p>
                    <p className="font-semibold">{formatSalary(formData.startSalary)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Max</p>
                    <p className="font-semibold">{formatSalary(formData.maxSalary)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Midpoint</p>
                    <p className="font-semibold text-green-700">{formatSalary(midpointSalary)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Range:</span>{' '}
                    {formatSalary(formData.maxSalary - formData.startSalary)}
                  </div>
                </div>
              </div>
            )} */}

            {/* Original Values for Reference */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-2">
                Original Values:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{jobGrade.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Salary Range</p>
                  <p className="font-medium">
                    {formatSalary(jobGrade.startSalary)} -{" "}
                    {formatSalary(jobGrade.maxSalary)}
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
              disabled={
                !formData.name.trim() ||
                formData.startSalary <= 0 ||
                formData.maxSalary <= formData.startSalary
              }
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

export default EditJobGradeModal;
