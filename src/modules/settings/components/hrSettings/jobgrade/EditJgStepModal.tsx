import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { JgStepListDto, JgStepModDto } from '@/modules/hr/types/JgStep';
import type { UUID } from 'crypto';

interface EditJgStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (step: JgStepModDto) => void;
  step: JgStepListDto | null;
}

// ✅ Currency options (3-letter codes)
const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "ETB", label: "ETB" },
  { value: "KES", label: "KES" },
  { value: "TZS", label: "TZS" },
  { value: "UGX", label: "UGX" },
];

// ✅ Salary pay frequency options (abbreviated for 5-char limit)
const SALARY_PAY_FREQS = [
  { value: "Mthly", label: "Monthly" },
  { value: "BiWkly", label: "Bi-Weekly" },
  { value: "Wkly", label: "Weekly" },
  { value: "Hrly", label: "Hourly" },
  { value: "Annl", label: "Annually" },
];

const EditJgStepModal: React.FC<EditJgStepModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onSave,
                                                           step
                                                         }) => {
  const [formData, setFormData] = useState<JgStepModDto>({
    id: '' as UUID,
    name: '',
    salary: 0,
    jobGradeId: '' as UUID,
    currency: 'ETB',
    salaryPayFreq: 'Mthly',
    rowVersion: ''
  });

  // Initialize form when step changes
  useEffect(() => {
    if (step) {
      setFormData({
        id: step.id,
        name: step.name,
        salary: step.salary,
        jobGradeId: step.jobGradeId,
        currency: step.currency || 'ETB',
        salaryPayFreq: step.salaryPayFreq || 'Mthly',
        rowVersion: step.rowVersion || ''
      });
    }
  }, [step]);

  const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value
    }));
  };

  // ✅ Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || formData.salary <= 0) {
      return;
    }

    if (!formData.currency) {
      alert('Currency is required');
      return;
    }

    if (!formData.salaryPayFreq) {
      alert('Salary Pay Frequency is required');
      return;
    }

    onSave(formData);
    onClose();
  };

  // Convert salary to display format with ETB after the amount
  const formatSalary = (salary: number): string => {
    const formattedAmount = new Intl.NumberFormat('en-ET', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);

    return `${formattedAmount} ETB`;
  };

  if (!isOpen || !step) return null;

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
              <h2 className="text-lg font-bold text-gray-800">Edit Job Grade Step</h2>
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
              {/* Step Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-gray-500">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Eg. Junior Level, Intermediate Level, etc."
                    className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    required
                />
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-sm text-gray-500">
                  Salary <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary || ''}
                    onChange={handleChange}
                    placeholder="50000"
                    min="0"
                    className="w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    required
                />
              </div>

              {/* ✅ Currency Select */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm text-gray-500">
                  Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange('currency', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ✅ Salary Pay Frequency Select */}
              <div className="space-y-2">
                <Label htmlFor="salaryPayFreq" className="text-sm text-gray-500">
                  Salary Pay Frequency <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.salaryPayFreq}
                    onValueChange={(value) => handleSelectChange('salaryPayFreq', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select pay frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_PAY_FREQS.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Original Values for Reference */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-2">Original Values:</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Step Name</p>
                    <p className="font-medium">{step.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Salary</p>
                    <p className="font-medium">{formatSalary(step.salary)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Currency</p>
                    <p className="font-medium">{step.currency || 'ETB'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pay Frequency</p>
                    <p className="font-medium">{step.salaryPayFreq || 'Mthly'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Job Grade</p>
                    <p className="font-medium">{step.jobGrade}</p>
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
                  disabled={!formData.name.trim() || formData.salary <= 0}
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

export default EditJgStepModal;