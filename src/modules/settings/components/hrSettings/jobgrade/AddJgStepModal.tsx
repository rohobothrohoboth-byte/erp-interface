import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, BadgePlus, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import type { JgStepAddDto } from "@/modules/hr/types/JgStep";
import type { UUID } from "@/modules/hr/types/jobgrade";
import { toast } from "react-hot-toast";

interface AddJgStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStep: (step: JgStepAddDto) => void;
  jobGradeId: UUID;
  minSalary: number;
  maxSalary: number;
}

// ✅ Currency options with 3-letter codes only (ISO 4217)
const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "ETB", label: "ETB" },
  { value: "KES", label: "KES" },
  { value: "TZS", label: "TZS" },
  { value: "UGX", label: "UGX" },
];

// ✅ Salary pay frequency options
const SALARY_PAY_FREQS = [
  { value: "Mthly", label: "Monthly" },
  { value: "BiWkly", label: "Bi-Weekly" },
  { value: "Wkly", label: "Weekly" },
  { value: "Hrly", label: "Hourly" },
  { value: "Annl", label: "Annually" },
];

const AddJgStepModal: React.FC<AddJgStepModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         onAddStep,
                                                         jobGradeId,
                                                         minSalary,
                                                         maxSalary,
                                                       }) => {
  const [formData, setFormData] = useState<JgStepAddDto>({
    name: "",
    salary: 0,
    jobGradeId: jobGradeId,
    currency: "ETB",
    salaryPayFreq: "Monthly",
  });
  const [salaryError, setSalaryError] = useState<string>("");
  const [touched, setTouched] = useState({
    name: false,
    salary: false,
    currency: false,
    salaryPayFreq: false,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        salary: 0,
        jobGradeId: jobGradeId,
        currency: "ETB",
        salaryPayFreq: "Monthly",
      });
      setSalaryError("");
      setTouched({ name: false, salary: false, currency: false, salaryPayFreq: false });
    }
  }, [isOpen, jobGradeId]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (
      e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
  ) => {
    const { name, value } = e.target;

    if (name === "salary") {
      const salaryValue = value === "" ? 0 : Number(value);
      setFormData((prev) => ({ ...prev, [name]: salaryValue }));

      if (value !== "") {
        if (salaryValue < minSalary) {
          setSalaryError(
              `Salary cannot be less than ${formatCurrency(minSalary)}`
          );
        } else if (salaryValue > maxSalary) {
          setSalaryError(`Salary cannot exceed ${formatCurrency(maxSalary)}`);
        } else {
          setSalaryError("");
        }
      } else {
        setSalaryError("");
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Handle select changes with debug logging
  const handleSelectChange = (name: string, value: string) => {
    console.log(`📝 Select changed: ${name} = "${value}" (length: ${value.length})`);

    // ✅ Ensure currency is exactly 3 characters
    if (name === "currency" && value.length > 5) {
      console.warn("⚠️ Currency value too long, truncating to 5 characters");
      value = value.substring(0, 5);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    setTouched({ name: true, salary: true, currency: true, salaryPayFreq: true });

    // Validate all fields
    if (!formData.name.trim()) {
      toast.error("Step name is required");
      return;
    }

    if (formData.salary <= 0) {
      setSalaryError("Salary is required");
      toast.error("Salary is required");
      return;
    }

    if (formData.salary < minSalary || formData.salary > maxSalary) {
      const errorMsg = `Salary must be between ${formatCurrency(minSalary)} and ${formatCurrency(maxSalary)}`;
      setSalaryError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!formData.currency) {
      toast.error("Currency is required");
      return;
    }

    // ✅ Validate currency length
    if (formData.currency.length > 5) {
      toast.error(`Currency code must be 3 characters (got: ${formData.currency})`);
      return;
    }

    if (!formData.salaryPayFreq) {
      toast.error("Salary Pay Frequency is required");
      return;
    }

    // ✅ Log the exact data being sent
    const payload = {
      ...formData,
      jobGradeId: jobGradeId,
    };

    console.log("📤 SUBMITTING PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("📤 Currency value:", payload.currency, "length:", payload.currency.length);

    onAddStep(payload);
    onClose();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSalaryValidationStatus = () => {
    if (!formData.salary || formData.salary === 0) return "empty";
    if (formData.salary < minSalary) return "too-low";
    if (formData.salary > maxSalary) return "too-high";
    return "valid";
  };

  const salaryStatus = getSalaryValidationStatus();

  // Form validation
  const isNameValid = formData.name.trim().length > 0;
  const isSalaryValid = salaryStatus === "valid";
  const isCurrencyValid = !!formData.currency && formData.currency.length <= 5;
  const isPayFreqValid = !!formData.salaryPayFreq;

  // Show error only when field is touched
  const showNameError = touched.name && !isNameValid;
  const showSalaryError = touched.salary && salaryError;
  const showCurrencyError = touched.currency && !isCurrencyValid;
  const showPayFreqError = touched.salaryPayFreq && !isPayFreqValid;

  if (!isOpen) return null;

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
              <BadgePlus size={20} />
              <h2 className="text-lg font-bold text-gray-800">
                Add New Job Step
              </h2>
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
            <div className="py-4 space-y-4">
              {/* Step Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-gray-500">
                  Step Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    placeholder="Eg. Junior Level, Intermediate Level, etc."
                    className={`w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                        showNameError ? "border-red-300" : ""
                    }`}
                    required
                />
                {showNameError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Step name is required
                    </p>
                )}
              </div>

              {/* Salary Input */}
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-sm text-gray-500">
                  Step Salary <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                      id="salary"
                      name="salary"
                      type="number"
                      value={formData.salary || ""}
                      onChange={handleChange}
                      onBlur={() => handleBlur("salary")}
                      placeholder="50000"
                      min={minSalary}
                      max={maxSalary}
                      className={`w-full focus:outline-none focus:ring-1 ${
                          salaryStatus === "valid" && formData.salary > 0
                              ? "focus:ring-green-500 border-green-300"
                              : salaryStatus === "empty" || formData.salary === 0
                                  ? "focus:ring-green-500"
                                  : "focus:ring-red-500 border-red-300"
                      } focus:border-transparent`}
                      required
                  />
                  {salaryStatus === "valid" && formData.salary > 0 && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {(salaryStatus === "too-low" ||
                      salaryStatus === "too-high") && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>

                {showSalaryError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {salaryError}
                    </p>
                )}

                {salaryStatus === "valid" && formData.salary > 0 && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Salary is within the valid range
                    </p>
                )}

                {touched.salary && formData.salary === 0 && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Salary is required
                    </p>
                )}
              </div>

              {/* ✅ Currency Select - with debug display */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm text-gray-500">
                  Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange("currency", value)}
                >
                  <SelectTrigger
                      className={`w-full ${
                          showCurrencyError ? "border-red-300" : ""
                      }`}
                  >
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
                <p className="text-xs text-gray-400">
                  Selected: <span className="font-mono font-bold">{formData.currency || "(none)"}</span>
                  {formData.currency && ` (length: ${formData.currency.length})`}
                </p>
                {showCurrencyError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Currency is required (max 5 characters)
                    </p>
                )}
              </div>

              {/* ✅ Salary Pay Frequency Select */}
              <div className="space-y-2">
                <Label htmlFor="salaryPayFreq" className="text-sm text-gray-500">
                  Salary Pay Frequency <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={formData.salaryPayFreq}
                    onValueChange={(value) =>
                        handleSelectChange("salaryPayFreq", value)
                    }
                >
                  <SelectTrigger
                      className={`w-full ${
                          showPayFreqError ? "border-red-300" : ""
                      }`}
                  >
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
                {showPayFreqError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Salary Pay Frequency is required
                    </p>
                )}
              </div>

              {/* Salary Range Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                  Salary Range
                </span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    Minimum:{" "}
                    <span className="font-semibold">
                    {formatCurrency(minSalary)} ETB
                  </span>
                  </div>
                  <div>
                    Maximum:{" "}
                    <span className="font-semibold">
                    {formatCurrency(maxSalary)} ETB
                  </span>
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
                  disabled={!isNameValid || !isSalaryValid || !isCurrencyValid || !isPayFreqValid}
              >
                Save
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

export default AddJgStepModal;