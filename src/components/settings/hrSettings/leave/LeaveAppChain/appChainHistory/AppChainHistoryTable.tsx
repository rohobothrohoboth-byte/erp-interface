import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MoreVertical,
    Eye,
    PenBox,
    CheckCircle,
    XCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Cog,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../../ui/popover';
import { useNavigate } from 'react-router-dom';
import type { LeaveAppChainListDto } from '../../../../../../types/core/Settings/leaveAppChain';

interface AppChainHistoryTableProps {
    AppChainHistorys: LeaveAppChainListDto[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    onEdit: (AppChainHistory: LeaveAppChainListDto) => void;
    onDelete: (AppChainHistory: LeaveAppChainListDto) => void;
    onToggleStatus?: (AppChainHistory: LeaveAppChainListDto) => void;
    leavePolicyId?: string;
}

const AppChainHistoryTable: React.FC<AppChainHistoryTableProps> = ({
                                                                       AppChainHistorys,
                                                                       currentPage,
                                                                       totalPages,
                                                                       totalItems,
                                                                       isLoading = false,
                                                                       onPageChange,
                                                                       onEdit,
                                                                       onDelete,
                                                                       onToggleStatus,
                                                                       leavePolicyId,
                                                                   }) => {
    const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleEdit = (item: LeaveAppChainListDto) => {
        onEdit(item);
        setPopoverOpen(null);
    };

    const handleDelete = (item: LeaveAppChainListDto) => {
        onDelete(item);
        setPopoverOpen(null);
    };

    const handleToggleStatus = (item: LeaveAppChainListDto) => {
        if (onToggleStatus) {
            onToggleStatus(item);
        }
        setPopoverOpen(null);
    };

    const getStatusColor = (isActive: boolean): string => {
        return isActive
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

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (index: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: index * 0.1, duration: 0.3 }
        })
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl shadow-sm overflow-hidden bg-white"
        >
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
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective From</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective To</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Added Steps</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Policy</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {AppChainHistorys.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-gray-400 text-lg mb-2">No app chain history found</div>
                                            <p className="text-gray-400 text-sm">Try adjusting your search terms or add a new app chain.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                AppChainHistorys.map((item, index) => (
                                    <motion.tr
                                        key={item.id}
                                        custom={index}
                                        initial="hidden"
                                        animate="visible"
                                        variants={rowVariants}
                                        className="transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                                                {(currentPage - 1) * 10 + index + 1}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            <div className="text-sm font-medium text-gray-900">{item.effectiveFromStr}</div>
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            <div className="text-sm text-gray-600">{item.effectiveToStr || "Not Set"}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle">
                        <span className={`px-3 py-1 inline-flex text-xs leading-3 font-semibold gap-1 rounded-full ${getStatusColor(item.isActive)}`}>
                          {getBooleanIcon(item.isActive)}
                            {item.isActiveStr || (item.isActive ? "Active" : "Inactive")}
                        </span>
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {item.addedSteps || 0} Steps
                        </span>
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle">
                                            <div className="text-sm text-gray-700">{item.leavePolicy}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Configure Button */}
                                                {leavePolicyId && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => navigate(`/hr/leave/policy/config/${leavePolicyId}`)}
                                                        className="text-gray-600 hover:text-emerald-600 p-1 rounded-full hover:bg-emerald-50"
                                                        title="Configure Policy"
                                                    >
                                                        <Cog className="h-5 w-5" />
                                                    </motion.button>
                                                )}

                                                {/* More Actions Popover */}
                                                <Popover
                                                    open={popoverOpen === item.id}
                                                    onOpenChange={(open) => setPopoverOpen(open ? item.id : null)}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                                                        >
                                                            <MoreVertical className="h-5 w-5" />
                                                        </motion.button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-48 p-0" align="end">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded text-gray-700 flex items-center gap-2"
                                                            >
                                                                <PenBox size={16} /> Edit
                                                            </button>
                                                            {onToggleStatus && (
                                                                <button
                                                                    onClick={() => handleToggleStatus(item)}
                                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 ${
                                                                        item.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"
                                                                    }`}
                                                                >
                                                                    {item.isActive ? <><XCircle size={16} /> Deactivate</> : <><CheckCircle size={16} /> Activate</>}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                                            >
                                                                <Trash2 size={16} /> Delete
                                                            </button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
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
                                        <span className="font-medium">{totalItems}</span> app chains
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
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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
    );
};

export default AppChainHistoryTable;