import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    MoreVertical,
    PenBox,
    CheckCircle,
    XCircle,
    Trash2,
    Cog,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Paperclip,
} from "lucide-react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/shared/components/ui/popover";
import type { LeavePolicyListDto } from "@/modules/core/types/Settings/leavepolicy";
import { useNavigate } from "react-router-dom";

interface LeavePolicyTableProps {
    leavePolicies: LeavePolicyListDto[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    onEdit: (leaveType: LeavePolicyListDto) => void;
    onDelete: (leaveType: LeavePolicyListDto) => void;
    onToggleStatus?: (leaveType: LeavePolicyListDto) => void;
}

const LeavePolicyTable: React.FC<LeavePolicyTableProps> = ({
                                                               leavePolicies,
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
    const navigate = useNavigate();

    // FIXED: Handle both "0"/"1" and "Active"/"Inactive" status formats
    const getStatusBadge = (status: string) => {
        // Check if status is "Active" (from database) or "0" (from API)
        const isActive = status === "0" || status === "Active";

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

    // FIXED: Check if status can be toggled
    const isStatusActive = (status: string) => {
        return status === "0" || status === "Active";
    };

    const getBooleanBadge = (value: boolean, label: string) => {
        if (value) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                    <CheckCircle size={10} /> Yes
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                <XCircle size={10} /> No
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
                                    Policy Name
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Encashment
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Attachment
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Leave Type
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Configuration
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                            {leavePolicies.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Cog size={32} className="text-gray-300" />
                                            <p>No leave policies found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                leavePolicies.map((policy, index) => (
                                    <motion.tr
                                        key={policy.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                        <span className="text-emerald-600 font-semibold text-sm">
                                                            {policy.name?.charAt(0).toUpperCase() || "?"}
                                                        </span>
                                                </div>
                                                <span className="font-medium text-gray-900">{policy.name}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded-md font-mono">
                                                {policy.code}
                                            </code>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center">
                                                {getBooleanBadge(policy.allowEncashment, "Encash")}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center">
                                                {getBooleanBadge(policy.requiresAttachment, "Required")}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(policy.status)}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm text-gray-600">{policy.leaveType || "—"}</span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => navigate(`/settings/hr/leave/leavePolicyConfig/${policy.id}`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 transition-all duration-200"
                                            >
                                                <Cog size={14} />
                                                <span className="text-xs font-medium">Configure</span>
                                            </button>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <Popover
                                                open={popoverOpen === policy.id}
                                                onOpenChange={(open) => setPopoverOpen(open ? policy.id : null)}
                                            >
                                                <PopoverTrigger asChild>
                                                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                                        <MoreVertical size={16} className="text-gray-500" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-44 p-1" align="end">
                                                    <button
                                                        onClick={() => {
                                                            onEdit(policy);
                                                            setPopoverOpen(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                                    >
                                                        <PenBox size={14} /> Edit
                                                    </button>
                                                    {onToggleStatus && (
                                                        <button
                                                            onClick={() => {
                                                                onToggleStatus(policy);
                                                                setPopoverOpen(null);
                                                            }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                                                        >
                                                            {isStatusActive(policy.status) ? (
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
                                                            onDelete(policy);
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
                                    <span className="font-medium">{totalItems}</span> policies
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

export default LeavePolicyTable;