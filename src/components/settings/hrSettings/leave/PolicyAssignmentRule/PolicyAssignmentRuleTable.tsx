import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  PenBox,
  Trash2,
  Calendar,
  Hash,
  Tag,
  Activity,
} from "lucide-react";
import { Button } from "../../../../ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../../ui/popover";
import type { PolicyAssignmentRuleListDto } from "../../../../../types/core/Settings/policyAssignmentRule";
import PolicyRuleConditionModal from "./PolicyRuleConditionModal";

interface PolicyAssignmentRuleProps {
  policyAssignmentRule: PolicyAssignmentRuleListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

const PolicyAssignmentRule: React.FC<PolicyAssignmentRuleProps> = ({
                                                                     policyAssignmentRule,
                                                                     currentPage,
                                                                     totalPages,
                                                                     totalItems,
                                                                     isLoading = false,
                                                                     onPageChange,
                                                                   }) => {
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PolicyAssignmentRuleListDto | null>(null);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const handleConditionClick = (rule: PolicyAssignmentRuleListDto) => {
    setSelectedRule(rule);
    setConditionModalOpen(true);
    setPopoverOpen(null);
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      High: "bg-red-100 text-red-700 border-red-200",
      Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Low: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle size={12} />
          Active
        </span>
      );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle size={12} />
        Inactive
      </span>
    );
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-200 overflow-hidden bg-white"
      >
        {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            </div>
        ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Hash size={12} /> Code
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Tag size={12} /> Name
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} /> Effective From
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} /> Effective To
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Activity size={12} /> Conditions
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                  {policyAssignmentRule.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Settings size={32} className="text-gray-300" />
                            <p>No policy assignment rules found</p>
                          </div>
                        </td>
                      </tr>
                  ) : (
                      policyAssignmentRule.map((rule, index) => (
                          <motion.tr
                              key={rule.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-semibold text-sm">
                              {rule.code.charAt(0).toUpperCase()}
                            </span>
                                </div>
                                <span className="font-mono text-sm text-gray-700">{rule.code}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                            </td>

                            <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priorityStr)}`}>
                          {rule.priorityStr}
                        </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              {getStatusBadge(rule.isActive)}
                            </td>

                            <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {rule.effectiveFromStr || rule.effectiveFrom}
                        </span>
                            </td>

                            <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {rule.effectiveToStr || rule.effectiveTo || "—"}
                        </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <Button
                                  onClick={() => handleConditionClick(rule)}
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                              >
                                <Settings size={14} />
                                <span className="text-xs">Configure</span>
                              </Button>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <Popover
                                  open={popoverOpen === rule.id}
                                  onOpenChange={(open) => setPopoverOpen(open ? rule.id : null)}
                              >
                                <PopoverTrigger asChild>
                                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                    <MoreVertical size={16} className="text-gray-500" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-44 p-1" align="end">
                                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                                    <PenBox size={14} /> Edit
                                  </button>
                                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                                    <Trash2 size={14} /> Delete
                                  </button>
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
              {totalItems > 0 && totalPages > 1 && (
                  <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{" "}
                        <span className="font-medium">{totalItems}</span> rules
                      </p>
                      <div className="flex gap-1">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </>
        )}

        <PolicyRuleConditionModal
            isOpen={conditionModalOpen}
            onClose={() => {
              setConditionModalOpen(false);
              setSelectedRule(null);
            }}
            ruleId={selectedRule?.id || ""}
            ruleName={selectedRule?.name || ""}
        />
      </motion.div>
  );
};

export default PolicyAssignmentRule;