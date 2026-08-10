import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { UUID } from "@/modules/core/types/Settings/PolicyRuleCondtion";
import { Button } from "@/shared/components/ui/button";
import { useAllPolicyRuleConditions } from "@/modules/core/services/settings/ModHrm/PolicyRuleCondition/policyRuleCondition.queries";
import { EmpNature, WorkArrangement } from "@/modules/hr/types/enum";
import { PolicyGender } from "@/modules/core/types/enum";
import type { NameListItem } from "@/modules/list/types/NameList/nameList";
import { hrmmNamesApi } from "@/modules/list/services/hrmmNames/hrmmNames.api";

interface RuleConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleId: UUID;
  ruleName: string;
}

const RuleConditionModal: React.FC<RuleConditionModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 ruleId,
                                                                 ruleName,
                                                               }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [jobGrades, setJobGrades] = useState<NameListItem[]>([]);

  const {
    data: conditions = [],
    refetch,
    isLoading,
  } = useAllPolicyRuleConditions(ruleId);

  // Pagination
  const totalItems = conditions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedConditions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return conditions.slice(start, start + itemsPerPage);
  }, [conditions, currentPage]);

  // Close handler
  const handleClose = useCallback(() => {
    setCurrentPage(1);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      refetch();
      setCurrentPage(1);
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
    }
  }, [isOpen, refetch]);

  // Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  const getDisplayValue = (field: string, value: string) => {
    switch (field) {
      case "EmploymentType":
      case "0":
        return EmpNature[value as keyof typeof EmpNature] || value;
      case "Gender":
      case "1":
        return PolicyGender[value as keyof typeof PolicyGender] || value;
      case "ServiceYears":
      case "2":
        return `${value} Years`;
      case "WorkArrangement":
      case "3":
        return WorkArrangement[value as keyof typeof WorkArrangement] || value;
      case "JobGrade":
      case "4":
        const jobGrade = jobGrades.find((grade) => grade.id === value);
        return jobGrade ? jobGrade.name : value;
      default:
        return value;
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case "EmploymentType": return "Employment Type";
      case "Department": return "Department";
      case "Position": return "Position";
      case "JobGrade": return "Job Grade";
      case "ServiceYears": return "Service Years";
      case "Gender": return "Gender";
      case "WorkArrangement": return "Work Arrangement";
      default: return field;
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-2 sm:px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-xl h-[70vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-4 sm:px-6 py-3 bg-white rounded-t-lg shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {ruleName}
              </h2>
              <p className="text-xs text-gray-500">Assignment Rule Conditions</p>
            </div>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
            ) : conditions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus size={24} className="text-gray-400" />
                    </div>
                    <p>No conditions configured for this rule.</p>
                    <p className="text-sm text-gray-400">
                      No conditions have been added yet
                    </p>
                  </div>
                </div>
            ) : (
                <div className="space-y-3">
                  {paginatedConditions.map((cond, idx) => (
                      <motion.div
                          key={cond.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="bg-emerald-100 text-emerald-700 font-semibold w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getFieldLabel(cond.fieldStr || cond.field)}
                      </span>
                            <span className="text-sm text-gray-500">
                        {cond.operatorStr || cond.operator}
                      </span>
                            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {getDisplayValue(cond.field, cond.value)}
                      </span>
                          </div>
                        </div>
                      </motion.div>
                  ))}
                </div>
            )}

            {/* Pagination */}
            {totalItems > itemsPerPage && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
                  <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
            )}
          </div>
        </motion.div>
      </div>
  );
};

export default RuleConditionModal;