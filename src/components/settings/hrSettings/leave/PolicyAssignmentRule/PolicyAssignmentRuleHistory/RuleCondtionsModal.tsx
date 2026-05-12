import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { UUID } from "../../../../../../types/core/Settings/PolicyRuleCondtion";
import { Button } from "../../../../../ui/button";
import { useAllPolicyRuleConditions } from "../../../../../../services/core/settings/ModHrm/PolicyRuleCondition/policyRuleCondition.queries";
import { EmpNature, WorkArrangement } from "../../../../../../types/hr/enum";
import {
  PolicyGender,
} from "../../../../../../types/core/enum";
import type { NameListItem } from "../../../../../../types/NameList/nameList";
import { hrmmNamesApi } from "../../../../../../services/List/hrmmNames/hrmmNames.api";

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

  if (!isOpen) return null;
  const getDisplayValue = (field: string, value: string) => {
    switch (field) {
      case "0":
        return EmpNature[value as keyof typeof EmpNature] || value;
      case "1":
        return PolicyGender[value as keyof typeof PolicyGender] || value;
      case "2":
        return `${value} Months`;
      case "3":
        return WorkArrangement[value as keyof typeof WorkArrangement] || value;
      case "4":
        const jobGrade = jobGrades.find((grade) => grade.id === value);
        return jobGrade ? jobGrade.name : value;
      default:
        return value;
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-xl h-[70vh] flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 sm:px-6 py-3 bg-white rounded-t-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {ruleName} Conditions
          </h2>
          <button
            onClick={handleClose}
            className="text-green-400 hover:text-green-600 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : conditions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No conditions configured for this rule.
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedConditions.map((cond, idx) => (
                <motion.div
                  key={cond.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  {/* Left: Index + Field + Operator */}
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 font-semibold w-6 h-6 flex items-center justify-center rounded-full text-xs">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </div>
                    <div className="flex gap-x-1">
                      <p className="text-sm font-medium text-gray-900">
                        {cond.fieldStr || cond.field}
                      </p>
                      <p className="text-sm text-gray-500">
                    {cond.operatorStr || cond.operator}
                      </p>
                      <span className="text-sm text-gray-700 font-medium">
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
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RuleConditionModal;
