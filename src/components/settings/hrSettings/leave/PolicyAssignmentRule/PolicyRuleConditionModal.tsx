import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../../ui/button";
import { Label } from "../../../../ui/label";
import { Input } from "../../../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../ui/select";
import type {
  PolicyRuleCondListDto,
  PolicyRuleCondAddDto,
  PolicyRuleCondModDto,
  UUID,
} from "../../../../../types/core/Settings/PolicyRuleCondtion";
import {
  ConditionField,
  ConditionOperator,
  PolicyGender,
} from "../../../../../types/core/enum";
import { EmpNature, WorkArrangement } from "../../../../../types/hr/enum";
import type { NameListItem } from "../../../../../types/NameList/nameList";
import {
  useAllPolicyRuleConditions,
  useCreatePolicyRuleCondition,
  useUpdatePolicyRuleCondition,
  useDeletePolicyRuleCondition,
} from "../../../../../services/core/settings/ModHrm/PolicyRuleCondition/policyRuleCondition.queries";
import { hrmmNamesApi } from "../../../../../services/List/hrmmNames/hrmmNames.api";
import DeletePolicyRuleConditionModal from "./DeletePolicyRuleConditionModal";

interface PolicyRuleConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleId: UUID;
  ruleName: string;
}

interface ConditionFormData {
  field: string;
  operator: string;
  value: string;
}

const PolicyRuleConditionModal: React.FC<PolicyRuleConditionModalProps> = ({
  isOpen,
  onClose,
  ruleId,
  ruleName,
}) => {
  const [editingCondition, setEditingCondition] =
    useState<PolicyRuleCondListDto | null>(null);
  const [deletingCondition, setDeletingCondition] =
    useState<PolicyRuleCondListDto | null>(null);
  const [formData, setFormData] = useState<ConditionFormData>({
    field: "",
    operator: "",
    value: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [jobGrades, setJobGrades] = useState<NameListItem[]>([]);
  const itemsPerPage = 5;

  // React Query hooks
  const {
    data: conditions = [],
    refetch,
    isLoading,
  } = useAllPolicyRuleConditions(ruleId);
  const createMutation = useCreatePolicyRuleCondition();
  const updateMutation = useUpdatePolicyRuleCondition();
  const deleteMutation = useDeletePolicyRuleCondition();

  // Pagination calculations
  const totalItems = conditions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedConditions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return conditions.slice(startIndex, startIndex + itemsPerPage);
  }, [conditions, currentPage, itemsPerPage]);

  const handleClose = useCallback(() => {
    setEditingCondition(null);
    setDeletingCondition(null);
    setFormData({ field: "", operator: "", value: "" });
    setCurrentPage(1);
    onClose();
  }, [onClose]);

  // Auto-set operator to "Equals" for non-Service Months fields
  useEffect(() => {
    if (formData.field && formData.field !== "2" && formData.operator !== "0") {
      setFormData((prev) => ({
        ...prev,
        operator: "0", // Set to "Equals"
      }));
    }
  }, [formData.field]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      refetch();
      setCurrentPage(1);
      // Fetch job grades
      const fetchJobGrades = async () => {
        try {
          const grades = await hrmmNamesApi.getAllJobGradeNames();
          setJobGrades(grades);
        } catch (error) {
          console.error("Failed to fetch job grades:", error);
          setJobGrades([]);
        }
      };
      fetchJobGrades();
    } else {
      setEditingCondition(null);
      setDeletingCondition(null);
      setFormData({ field: "", operator: "", value: "" });
      setCurrentPage(1);
    }
  }, [isOpen, refetch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset value when field changes and auto-set operator for non-Service Months fields
      ...(name === "field" && {
        value: "",
        // Auto-select "Equals" operator for all fields except Service Months (field "2")
        operator: value === "2" ? prev.operator : "0",
      }),
    }));
  };

  const handleEditCondition = (condition: PolicyRuleCondListDto) => {
    setEditingCondition(condition);
    setFormData({
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
    });
  };

  const handleDeleteCondition = (condition: PolicyRuleCondListDto) => {
    setDeletingCondition(condition);
  };

  const handleConfirmDelete = async (conditionId: UUID) => {
    try {
      await deleteMutation.mutateAsync(conditionId);
      refetch();
      setDeletingCondition(null);
    } catch (error) {
      console.error("Failed to delete condition:", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeletingCondition(null);
  };

  const handleSaveCondition = async () => {
    if (!formData.field || !formData.operator || !formData.value) {
      return;
    }

    try {
      if (editingCondition) {
        const modData: PolicyRuleCondModDto = {
          id: editingCondition.id,
          field: formData.field,
          operator: formData.operator,
          value: formData.value,
          rowVersion: editingCondition.rowVersion,
        };
        await updateMutation.mutateAsync(modData);
      } else {
        const addData: PolicyRuleCondAddDto = {
          field: formData.field,
          operator: formData.operator,
          value: formData.value,
          policyAssRuleId: ruleId,
        };
        await createMutation.mutateAsync(addData);
      }

      setEditingCondition(null);
      setFormData({ field: "", operator: "", value: "" });
      refetch();
    } catch (error) {
      console.error("Failed to save condition:", error);
    }
  };

  const handleCancelCondition = () => {
    setEditingCondition(null);
    setFormData({ field: "", operator: "", value: "" });
  };

  const getValueOptions = (field: string) => {
    switch (field) {
      case "0": // Employment Nature
        return Object.entries(EmpNature).map(([key, value]) => ({
          key,
          value,
        }));
      case "1": // Gender
        return Object.entries(PolicyGender).map(([key, value]) => ({
          key,
          value,
        }));
      case "3": // Work Arrangement
        return Object.entries(WorkArrangement).map(([key, value]) => ({
          key,
          value,
        }));
      case "4": // Job Grade
        return jobGrades.map((grade) => ({
          key: grade.id,
          value: grade.name,
        }));
      default:
        return [];
    }
  };

  const getDisplayValue = (field: string, value: string) => {
    switch (field) {
      case "0": // Employment Nature
        return EmpNature[value as keyof typeof EmpNature] || value;
      case "1": // Gender
        return PolicyGender[value as keyof typeof PolicyGender] || value;
      case "2": // Service Months
        return `${value} Months`;
      case "3": // Work Arrangement
        return WorkArrangement[value as keyof typeof WorkArrangement] || value;
      case "4": // Job Grade
        const jobGrade = jobGrades.find((grade) => grade.id === value);
        return jobGrade ? jobGrade.name : value;
      default:
        return value;
    }
  };

  const renderValueInput = () => {
    const valueOptions = getValueOptions(formData.field);

    if (formData.field === "2") {
      // Service Months - input field
      return (
        <Input
          name="value"
          type="number"
          value={formData.value}
          onChange={handleInputChange}
          placeholder="Enter service months"
          className="w-full h-8 sm:h-9 text-xs sm:text-sm"
          min="0"
        />
      );
    }

    if (valueOptions.length > 0) {
      return (
        <Select
          value={formData.value}
          onValueChange={(value) => handleSelectChange("value", value)}
        >
          <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {valueOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        name="value"
        value={formData.value}
        onChange={handleInputChange}
        placeholder="Enter value"
        className="w-full h-8 sm:h-9 text-xs sm:text-sm"
      />
    );
  };

  const fieldOptions = Object.entries(ConditionField).map(([key, value]) => ({
    key,
    value,
  }));

  const operatorOptions = Object.entries(ConditionOperator).map(
    ([key, value]) => ({
      key,
      value,
    }),
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] sm:h-[75vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 sm:px-6 py-3 bg-white rounded-lg">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {ruleName} conditions
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body - Responsive Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden rounded-lg">
          {/* Form Section */}
          <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 p-3 sm:p-4 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Plus size={14} className="sm:w-4 sm:h-4 text-green-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                  {editingCondition ? "Edit" : "Add"} Condition
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4 flex-1">
                {/* Field */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Field <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.field}
                    onValueChange={(value) =>
                      handleSelectChange("field", value)
                    }
                  >
                    <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {option.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operator */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Operator <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.operator}
                    onValueChange={(value) =>
                      handleSelectChange("operator", value)
                    }
                    disabled={formData.field !== "2"} 
                  >
                    <SelectTrigger
                      className={`w-full h-8 sm:h-9 text-xs sm:text-sm ${
                        formData.field !== "2"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          formData.field !== "2"
                            ? "Equals (Auto-selected)"
                            : "Select operator"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions.map((option) => (
                        <SelectItem key={option.key} value={option.key}>
                          {option.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.field !== "2" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Operator "Equals" only works for this field type.
                    </p>
                  )}
                </div>

                {/* Value */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Value <span className="text-red-500">*</span>
                  </Label>
                  {renderValueInput()}
                </div>
              </div>

              {/* Form Actions */}
              <div className="space-y-2 mt-4 sm:mt-8">
                <Button
                  onClick={handleSaveCondition}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
                  disabled={
                    !formData.field || !formData.operator || !formData.value
                  }
                >
                  {editingCondition ? "Update" : "Add"}
                </Button>
                {editingCondition && (
                  <Button
                    onClick={handleCancelCondition}
                    variant="outline"
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="w-full lg:w-3/5 flex flex-col bg-white">
            {/* Table Container */}
            <div className="flex-1 overflow-hidden">
              <div className="rounded-lg shadow-sm overflow-hidden bg-white h-full flex flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Operator
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {conditions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 sm:py-12 text-center"
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                                <Plus
                                  size={16}
                                  className="sm:w-5 sm:h-5 text-gray-400"
                                />
                              </div>
                              <p className="text-gray-500 font-medium mb-1 text-sm">
                                No conditions configured
                              </p>
                              <p className="text-gray-400 text-xs sm:text-sm">
                                Add your first condition using the form
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedConditions.map((condition, index) => (
                          <motion.tr
                            key={condition.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {/* Index */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </div>
                            </td>

                            {/* Field */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {condition.fieldStr}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {condition.operatorStr}
                              </div>
                            </td>

                            {/* Operator - Hidden on mobile */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden sm:table-cell">
                              <div className="text-sm text-gray-900">
                                {condition.operatorStr}
                              </div>
                            </td>

                            {/* Value */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {getDisplayValue(
                                  condition.field,
                                  condition.value,
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleEditCondition(condition)}
                                  className="p-1 sm:p-1.5 text-gray-400 hover:text-green-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit condition"
                                >
                                  <Edit
                                    size={12}
                                    className="sm:w-3.5 sm:h-3.5"
                                  />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteCondition(condition)
                                  }
                                  className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete condition"
                                >
                                  <Trash2
                                    size={12}
                                    className="sm:w-3.5 sm:h-3.5"
                                  />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="bg-white px-4 sm:px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * itemsPerPage + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                          </span>{" "}
                          of <span className="font-medium">{totalItems}</span>{" "}
                          conditions
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft size={16} />
                          </button>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1),
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight size={16} />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Condition Modal */}
        <DeletePolicyRuleConditionModal
          condition={deletingCondition}
          isOpen={!!deletingCondition}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </motion.div>
    </div>
  );
};

export default PolicyRuleConditionModal;
