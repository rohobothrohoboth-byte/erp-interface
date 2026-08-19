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
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import type { LeavePolicyConfigListDto } from "@/modules/core/types/Settings/leavePolicyConfig";

interface LeavePolicyHistoryTableProps {
  leavePolicyConfig: LeavePolicyConfigListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onEdit: (leavePolicyConfigHistory: LeavePolicyConfigListDto) => void;
  onDelete: (leavePolicyConfigHistory: LeavePolicyConfigListDto) => void;
  onToggleStatus?: (leavePolicyConfigHistory: LeavePolicyConfigListDto) => void;
}

const LeavePolicyConfigHistoryTable: React.FC<LeavePolicyHistoryTableProps> = ({
  leavePolicyConfig,
  currentPage,
  totalPages,
  totalItems,
  isLoading = false,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const handleEdit = (config: LeavePolicyConfigListDto) => {
    onEdit(config);
    setPopoverOpen(null);
  };

  const handleDelete = (config: LeavePolicyConfigListDto) => {
    onDelete(config);
    setPopoverOpen(null);
  };

  const handleToggleStatus = (config: LeavePolicyConfigListDto) => {
    if (onToggleStatus) {
      onToggleStatus(config);
    }
    setPopoverOpen(null);
  };


  const getStatusColor = (isActive: boolean): string => {
    return isActive
      ? "bg-green-100 text-green-800 border border-green-300"
      : "bg-red-100 text-red-700 border border-red-300";
  };

  const getBooleanIcon = (value: boolean) =>
    value ? (
      <CheckCircle className="h-3 w-3 text-green-700" />
    ) : (
      <XCircle className="h-3 w-3 text-red-600" />
    );

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
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  Annual Entitlement
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Accrual Frequency
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Accrual Rate
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Max Days Per Request
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Max Carry Over Days
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Min Service Months
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                 Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fiscal Year
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
              {leavePolicyConfig.length === 0 ? (
                <tr>
                  <td
                    colSpan={10} // Fixed: Changed from 9 to 10 (number of columns including #)
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No leave policies found.
                  </td>
                </tr>
              ) : (
                leavePolicyConfig.map((config, index) => (
                  <motion.tr
                    key={config.id}
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

                    {/* Annual Entitlement */}
                    <td className="px-6 py-3 text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {config.annualEntitlement}
                      </div>
                    </td>

                    {/* Accrual Frequency */}
                    <td className="px-4 py-3 align-middle text-center">
                      <span className="text-sm text-gray-700">
                        {config.accrualFrequencyStr}
                      </span>
                    </td>

                    {/* Accrual Rate */}
                    <td className="px-4 py-3 align-middle text-center">
                      <span className="text-sm text-gray-700">
                        {config.accrualRate}
                      </span>
                    </td>

                    {/* Max Days Per Request */}
                    <td className="px-4 py-3 align-middle text-center">
                      <span className="text-sm text-gray-700">
                        {config.maxDaysPerReq}
                      </span>
                    </td>

                    {/* Max Carry Over Days */}
                    <td className="px-4 py-3 align-middle text-center">
                      <span className="text-sm text-gray-700">
                        {config.maxCarryOverDays}
                      </span>
                    </td>

                    {/* Min Service Months */}
                    <td className="px-4 py-3 align-middle text-center">
                      <span className="text-sm text-gray-700">
                        {config.minServiceMonths}
                      </span>
                    </td>

                    {/* Is Active */}
                    <td className="px-4 py-3 text-left">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-3 font-semibold gap-1 rounded-full ${getStatusColor(
                          config.isActive
                        )}`}
                      >
                        {getBooleanIcon(config.isActive)}
                        {config.isActiveStr==="Active"?"Active":"Inactive"}
                      </span>
                    </td>

                    {/* Fiscal Year */}
                    <td className="px-4 py-3 align-middle text-center">
                      <span className="text-sm text-gray-700">
                        {config.fiscalYear}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Popover
                        open={popoverOpen === config.id}
                        onOpenChange={(open) =>
                          setPopoverOpen(open ? config.id : null)
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
                              onClick={() => handleEdit(config)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                            >
                              <PenBox size={16} />
                              Edit
                            </button>
                            {onToggleStatus && (
                              <button
                                onClick={() => handleToggleStatus(config)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                              >
                                {config.isActive ? (
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
                              onClick={() => handleDelete(config)}
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
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
                      <span className="font-medium">{totalItems}</span> policy configs
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => onPageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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

export default LeavePolicyConfigHistoryTable;
