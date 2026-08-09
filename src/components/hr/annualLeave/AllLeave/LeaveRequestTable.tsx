import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreVertical, Eye, PenBox, Trash2, Loader2, GitBranch, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Badge } from '../../../ui/badge';
import type { LeaveRequestListDto } from '../../../../types/hr/leaverequest';

interface LeaveRequestTableProps {
    leaves: LeaveRequestListDto[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onView: (leave: LeaveRequestListDto) => void;
    onEdit: (leave: LeaveRequestListDto) => void;
    onDelete: (leave: LeaveRequestListDto) => void;
    onViewWorkflow?: (leave: LeaveRequestListDto) => void;
}

const getStatusBadge = (status: string, currentStep?: number, totalSteps?: number) => {
    const config: Record<string, { color: string; bg: string }> = {
        pending: { color: 'text-yellow-800', bg: 'bg-yellow-100' },
        approved: { color: 'text-green-800', bg: 'bg-green-100' },
        rejected: { color: 'text-red-800', bg: 'bg-red-100' },
        cancelled: { color: 'text-gray-800', bg: 'bg-gray-100' },
    };
    const { color, bg } = config[status.toLowerCase()] || config.pending;

    if (status.toLowerCase() === 'pending' && currentStep && totalSteps) {
        return (
            <div className="flex flex-col gap-1">
                <Badge className={`${bg} ${color} border-0`}>
                    <Clock className="w-3 h-3 mr-1 inline" />
                    Step {currentStep} of {totalSteps}
                </Badge>
                <div className="w-full bg-gray-200 rounded-full h-1 w-20">
                    <div className="bg-purple-600 h-1 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                </div>
            </div>
        );
    }

    return <Badge className={`${bg} ${color} border-0`}>{status}</Badge>;
};

const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const LeaveRequestTable: React.FC<LeaveRequestTableProps> = ({
                                                                 leaves,
                                                                 loading,
                                                                 currentPage,
                                                                 totalPages,
                                                                 onPageChange,
                                                                 onView,
                                                                 onEdit,
                                                                 onDelete,
                                                                 onViewWorkflow,
                                                             }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (leaves.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">No leave requests found</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Requested</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {leaves.map((leave, index) => {
                        const currentStep = (leave as any).currentStepOrder;
                        const totalSteps = (leave as any).totalSteps;
                        const isPending = leave.statusStr === 'Pending';

                        return (
                            <motion.tr
                                key={leave.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-4 py-3">{getStatusBadge(leave.statusStr, currentStep, totalSteps)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{leave.leaveType}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(leave.startDate)}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(leave.endDate)}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{leave.daysRequestedStr}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(leave.dateRequested)}</td>
                                <td className="px-4 py-3 text-right">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1 rounded-full hover:bg-gray-100">
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-40 p-1" align="end">
                                            <button onClick={() => onView(leave)} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                                                <Eye className="w-4 h-4" /> View
                                            </button>
                                            {onViewWorkflow && isPending && currentStep && (
                                                <button onClick={() => onViewWorkflow(leave)} className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded flex items-center gap-2">
                                                    <GitBranch className="w-4 h-4" /> View Workflow
                                                </button>
                                            )}
                                            {isPending && (
                                                <>
                                                    <button onClick={() => onEdit(leave)} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                                                        <PenBox className="w-4 h-4" /> Edit
                                                    </button>
                                                    <button onClick={() => onDelete(leave)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2">
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </>
                                            )}
                                        </PopoverContent>
                                    </Popover>
                                </td>
                            </motion.tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequestTable;