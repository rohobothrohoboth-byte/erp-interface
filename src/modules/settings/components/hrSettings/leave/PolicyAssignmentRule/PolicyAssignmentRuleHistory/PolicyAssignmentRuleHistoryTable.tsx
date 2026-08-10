import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  PenBox,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import type { PolicyAssignmentRuleListDto } from "@/modules/core/types/Settings/policyAssignmentRule";
import { Button } from "@/shared/components/ui/button";

interface PolicyAssignmentRuleHistoryTableProps {
  policyAssignmentRule: PolicyAssignmentRuleListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onEdit: (policyAssignmentRule: PolicyAssignmentRuleListDto) => void;
  onDelete: (policyAssignmentRule: PolicyAssignmentRuleListDto) => void;
  onToggleStatus?: (policyAssignmentRule: PolicyAssignmentRuleListDto) => void;
  onConditionClick:(policyAssignmentRule: PolicyAssignmentRuleListDto) => void;
}

const PolicyAssignmentRuleHistoryTable: React.FC<
  PolicyAssignmentRuleHistoryTableProps
> = ({
  policyAssignmentRule,
  currentPage,
  totalPages,
  totalItems,
  isLoading = false,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onConditionClick,
}) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const handleEdit = (rule: PolicyAssignmentRuleListDto) => {
    onEdit(rule);
    setPopoverOpen(null);
  };

  const handleDelete = (rule: PolicyAssignmentRuleListDto) => {
    onDelete(rule);
    setPopoverOpen(null);
  };

  const handleToggleStatus = (rule: PolicyAssignmentRuleListDto) => {
    if (onToggleStatus) {
      onToggleStatus(rule);
    }
    setPopoverOpen(null);
  };
  const handleConditionClick = (rule: PolicyAssignmentRuleListDto) => {
    onConditionClick(rule);
  };

  const getBooleanColor = (value: boolean): string => {
    return value
      ? "bg-green-100 text-green-800 border border-green-300"
      : "bg-red-100 text-red-700 border border-red-300";
  };

  const getBooleanIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="h-3 w-3 text-green-700" />
    ) : (
      <XCircle className="h-3 w-3 text-red-600" />
    );
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      High: "bg-red-100 text-red-800 border border-red-200",
      Medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      Low: "bg-green-100 text-green-800 border border-green-200",
    };
    return (
      colors[priority] || "bg-gray-100 text-gray-800 border border-gray-200"
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl shadow-sm overflow-hidden bg-white"
      >
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      Code
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Effective From
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Effective To
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Conditions
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {policyAssignmentRule.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        No policy assignment rules found.
                      </td>
                    </tr>
                  ) : (
                    policyAssignmentRule.map((rule, index) => (
                      <motion.tr
                        key={rule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="transition-colors hover:bg-gray-50"
                      >
                        {/* Number */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                            {(currentPage - 1) * 10 + index + 1}
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-4 py-3 text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {rule.code}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3 text-left">
                          <span className="text-sm text-gray-700">
                            {rule.name}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3 align-middle text-center">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-3 font-semibold rounded-full ${getPriorityColor(
                              rule.priorityStr,
                            )}`}
                          >
                            {rule.priorityStr}
                          </span>
                        </td>

                        {/* Is Active */}
                        <td className="px-4 py-3 align-middle text-center">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-3 font-semibold gap-1 rounded-full ${getBooleanColor(
                              rule.isActive,
                            )}`}
                          >
                            {getBooleanIcon(rule.isActive)}
                            {rule.isActiveStr}
                          </span>
                        </td>

                        {/* Effective From */}
                        <td className="px-4 py-3 text-left">
                          <span className="text-sm text-gray-700">
                            {rule.effectiveFromStr || rule.effectiveFrom}
                          </span>
                        </td>

                        {/* Effective To */}
                        <td className="px-4 py-3 text-left">
                          <span className="text-sm text-gray-700">
                            {rule.effectiveToStr || rule.effectiveTo || "N/A"}
                          </span>
                        </td>

                        {/* condition */}
                        <td className="px-4 py-3 text-left">
                          <Button
                            onClick={() => handleConditionClick(rule)}
                            variant="outline"
                            size="sm"
                            className="gap-2 hover:bg-green-50 hover:text-green-600"
                          >
                            <Settings size={16} />
                          </Button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <Popover
                            open={popoverOpen === rule.id}
                            onOpenChange={(open) =>
                              setPopoverOpen(open ? rule.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                aria-label="Actions"
                              >
                                <MoreVertical size={18} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              className="w-48 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
                            >
                              <div className="space-y-1">
                                <button
                                  onClick={() => handleEdit(rule)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                >
                                  <PenBox size={16} />
                                  Edit
                                </button>
                                {onToggleStatus && (
                                  <button
                                    onClick={() => handleToggleStatus(rule)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                  >
                                    {rule.isActive ? (
                                      <>
                                        <XCircle size={16} />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle size={16} />
                                        Activate
                                      </>
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(rule)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      onPageChange(Math.min(totalPages, currentPage + 1))
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
                        {(currentPage - 1) * 10 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, totalItems)}
                      </span>{" "}
                      of <span className="font-medium">{totalItems}</span> rules
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          onPageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}
                      <button
                        onClick={() =>
                          onPageChange(Math.min(totalPages, currentPage + 1))
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
          </>
        )}
      </motion.div>
    </>
  );
};

export default PolicyAssignmentRuleHistoryTable;
