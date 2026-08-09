import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    PenBox,
    Trash2,
    Calendar,
    TrendingUp,
    Clock,
    Users,
} from "lucide-react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "../../../../../ui/popover";
import type { LeavePolicyConfigListDto } from "../../../../../../types/core/Settings/leavePolicyConfig";

interface LeavePolicyConfigTableProps {
    leavePolicyConfig: LeavePolicyConfigListDto[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    onEdit: (config: LeavePolicyConfigListDto) => void;
    onDelete: (config: LeavePolicyConfigListDto) => void;
    onToggleStatus?: (config: LeavePolicyConfigListDto) => void;
}

const LeavePolicyConfigTable: React.FC<LeavePolicyConfigTableProps> = ({
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

    const MetricCard = ({ label, value, icon: Icon }: any) => (
        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 min-w-[80px]">
            <Icon size={14} className="text-gray-500 mb-1" />
            <span className="text-lg font-semibold text-gray-800">{value}</span>
            <span className="text-xs text-gray-500">{label}</span>
        </div>
    );

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
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Annual Entitlement
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Accrual Frequency
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Accrual Rate
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Max Days/Request
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Max Carryover
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Min Service
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Fiscal Year
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                            {leavePolicyConfig.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Calendar size={32} className="text-gray-300" />
                                            <p>No policy configurations found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                leavePolicyConfig.map((config, index) => (
                                    <motion.tr
                                        key={config.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-center">
                        <span className="text-lg font-semibold text-emerald-600">
                          {config.annualEntitlement}
                        </span>
                                            <span className="text-xs text-gray-500 ml-0.5">days</span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Clock size={12} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{config.accrualFrequencyStr || config.accrualFrequency}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {config.accrualRate}/period
                        </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm text-gray-700">{config.maxDaysPerReq}</span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm text-gray-700">{config.maxCarryOverDays || "—"}</span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users size={12} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{config.minServiceMonths}m</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(config.isActive)}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm text-gray-600">{config.fiscalYear || "—"}</span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <Popover
                                                open={popoverOpen === config.id}
                                                onOpenChange={(open) => setPopoverOpen(open ? config.id : null)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <MoreVertical size={16} className="text-gray-500" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-44 p-1" align="end">
                                                    <button
                                                        onClick={() => {
                                                            onEdit(config);
                                                            setPopoverOpen(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                                    >
                                                        <PenBox size={14} /> Edit
                                                    </button>
                                                    {onToggleStatus && (
                                                        <button
                                                            onClick={() => {
                                                                onToggleStatus(config);
                                                                setPopoverOpen(null);
                                                            }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                                        >
                                                            {config.isActive ? (
                                                                <>
                                                                    <XCircle size={14} /> Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle size={14} /> Activate
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            onDelete(config);
                                                            setPopoverOpen(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                                                    >
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
                                    <span className="font-medium">{totalItems}</span> configurations
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
        </motion.div>
    );
};

export default LeavePolicyConfigTable;