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
  Users,
  Calendar,
  FileText,
  AlertCircle,
  TrendingUp,
  Shield,
  Bell,
  Palette,
  Clock,
  X  // IMPORTANT: Add this for the close button
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import type { LeaveTypeListDto } from '@/modules/core/types/Settings/leavetype';

interface LeaveTypeTableProps {
  leaveTypes: LeaveTypeListDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onEdit: (leaveType: LeaveTypeListDto) => void;
  onDelete: (leaveType: LeaveTypeListDto) => void;
  onToggleStatus?: (leaveType: LeaveTypeListDto) => void;
  onAssign?: (leaveType: LeaveTypeListDto) => void;
}

const LeaveTypeTable: React.FC<LeaveTypeTableProps> = ({
                                                         leaveTypes = [],
                                                         currentPage = 1,
                                                         totalPages = 1,
                                                         totalItems = 0,
                                                         isLoading = false,
                                                         onPageChange,
                                                         onEdit,
                                                         onDelete,
                                                         onToggleStatus,
                                                         onAssign,
                                                       }) => {
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeListDto | null>(null);
  const [activeModal, setActiveModal] = useState<'view' | null>(null);
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  const handleViewDetails = (leaveType: LeaveTypeListDto) => {
    setSelectedLeaveType(leaveType);
    setActiveModal('view');
    setPopoverOpen(null);
  };

  const handleEdit = (leaveType: LeaveTypeListDto) => {
    onEdit(leaveType);
    setPopoverOpen(null);
  };

  const handleDelete = (leaveType: LeaveTypeListDto) => {
    onDelete(leaveType);
    setPopoverOpen(null);
  };

  const handleAssign = (leaveType: LeaveTypeListDto) => {
    if (onAssign) {
      onAssign(leaveType);
    }
    setPopoverOpen(null);
  };

  const handleToggleStatus = (leaveType: LeaveTypeListDto) => {
    if (onToggleStatus) {
      onToggleStatus(leaveType);
    }
    setPopoverOpen(null);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedLeaveType(null);
  };

  // Safe helper functions with null checks
  const getCategoryColor = (category?: string): string => {
    if (!category) return 'bg-gray-100 text-gray-700';
    const colors: Record<string, string> = {
      'Paid': 'bg-emerald-100 text-emerald-700',
      'Unpaid': 'bg-orange-100 text-orange-700',
      'Special': 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (isActive?: boolean): string => {
    if (isActive === undefined) return 'bg-gray-100 text-gray-700';
    return isActive
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700';
  };

  const getBooleanIcon = (value?: boolean) => {
    if (value === undefined) return <div className="h-4 w-4" />;
    return value ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
        <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getBooleanText = (value?: boolean): string => {
    if (value === undefined) return 'No';
    return value ? 'Yes' : 'No';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatList = (list?: string[]): string => {
    if (!list || list.length === 0) return 'None';
    return list.join(', ');
  };

  const formatNumberArray = (arr?: number[]): string => {
    if (!arr || arr.length === 0) return 'None';
    return arr.join(', ');
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.05, duration: 0.2 }
    })
  };

  // Error boundary for rendering
  try {
    return (
        <>
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl shadow-sm overflow-hidden bg-white"
          >
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requires Approval
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Half Day
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Holidays as Leave
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Max Days/Year
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                      {!leaveTypes || leaveTypes.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                              <div className="flex flex-col items-center justify-center">
                                <div className="text-gray-400 text-lg mb-2">
                                  No leave types found
                                </div>
                                <p className="text-gray-400 text-sm">
                                  Try adjusting your search terms or add a new leave type.
                                </p>
                              </div>
                            </td>
                          </tr>
                      ) : (
                          leaveTypes.map((leaveType, index) => (
                              <motion.tr
                                  key={leaveType?.id || index}
                                  custom={index}
                                  initial="hidden"
                                  animate="visible"
                                  variants={rowVariants}
                                  className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-medium">
                                  {leaveType?.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {leaveType?.name || 'Unnamed'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Code: {leaveType?.code || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(leaveType?.leaveCategory)}`}>
                              {leaveType?.leaveCategoryStr || leaveType?.leaveCategory || 'Unknown'}
                            </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    {getBooleanIcon(leaveType?.requiresApproval)}
                                    <span className="text-sm">{getBooleanText(leaveType?.requiresApproval)}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    {getBooleanIcon(leaveType?.allowHalfDay)}
                                    <span className="text-sm">{getBooleanText(leaveType?.allowHalfDay)}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    {getBooleanIcon(leaveType?.holidaysAsLeave)}
                                    <span className="text-sm">{getBooleanText(leaveType?.holidaysAsLeave)}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm font-medium">{leaveType?.maxDaysPerYear || 0} days</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leaveType?.isActive)}`}>
                              {leaveType?.isActiveStr || (leaveType?.isActive ? 'Active' : 'Inactive')}
                            </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  <Popover
                                      open={popoverOpen === leaveType?.id}
                                      onOpenChange={(open) => setPopoverOpen(open ? leaveType?.id || null : null)}
                                  >
                                    <PopoverTrigger asChild>
                                      <button className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100">
                                        <MoreVertical className="h-5 w-5" />
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-0" align="end">
                                      <div className="py-1">
                                        <button
                                            onClick={() => handleViewDetails(leaveType)}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                                        >
                                          <Eye size={16} />
                                          View Details
                                        </button>
                                        <button
                                            onClick={() => handleEdit(leaveType)}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                                        >
                                          <PenBox size={16} />
                                          Edit
                                        </button>
                                        {onAssign && (
                                            <button
                                                onClick={() => handleAssign(leaveType)}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-100 text-blue-600 flex items-center gap-2"
                                            >
                                              <Users size={16} />
                                              Assign to Employees
                                            </button>
                                        )}
                                        {onToggleStatus && (
                                            <button
                                                onClick={() => handleToggleStatus(leaveType)}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${leaveType?.isActive ? 'text-amber-600' : 'text-green-600'}`}
                                            >
                                              {leaveType?.isActive ? (
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
                                            onClick={() => handleDelete(leaveType)}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1"
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
                  {totalItems > 0 && totalPages > 1 && (
                      <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                              <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> of{' '}
                              <span className="font-medium">{totalItems}</span> leave types
                            </p>
                          </div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
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
                              <ChevronRight size={16} />
                            </button>
                          </nav>
                        </div>
                      </div>
                  )}
                </>
            )}
          </motion.div>

          {/* View Details Modal - Complete with all fields */}
          {activeModal === "view" && selectedLeaveType && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${selectedLeaveType?.color || 'emerald'}-100`}>
                        <Calendar className={`h-5 w-5 text-${selectedLeaveType?.color || 'emerald'}-600`} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedLeaveType?.name || 'Leave Type'}</h2>
                        <p className="text-sm text-gray-500">Leave Type Details</p>
                      </div>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Basic Information Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-emerald-500" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Leave Type Name</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.name || '—'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name (Amharic)</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.nameAm || '—'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Unique Code</label>
                          <p className="text-gray-900 mt-1 font-mono">{selectedLeaveType?.code || '—'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Category</label>
                          <p className="mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedLeaveType?.leaveCategory)}`}>
                          {selectedLeaveType?.leaveCategoryStr || selectedLeaveType?.leaveCategory || 'Unknown'}
                        </span>
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-500">Description</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.description || 'No description provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Accrual Settings Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" />
                        Accrual Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Accrual Frequency</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.accrualFrequency || 'Annual'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Days per Period</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.accrualRate || 0} days</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Maximum Accrual</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.maxAccrual || 0} days</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Allow Carryover</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getBooleanIcon(selectedLeaveType?.allowCarryover)}
                            <span>{getBooleanText(selectedLeaveType?.allowCarryover)}</span>
                          </div>
                        </div>
                        {selectedLeaveType?.allowCarryover && (
                            <>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Max Carryover Days</label>
                                <p className="text-gray-900 mt-1">{selectedLeaveType?.maxCarryoverDays || 0} days</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Carryover Expiry</label>
                                <p className="text-gray-900 mt-1">{selectedLeaveType?.carryoverExpiryMonths || 0} months</p>
                              </div>
                            </>
                        )}
                      </div>
                    </div>

                    {/* Rules Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-purple-500" />
                        Leave Rules
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Max Days Per Request</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.maxDaysPerRequest || 0} days</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Max Days Per Year</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.maxDaysPerYear || 0} days</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Min Days Per Request</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.minDaysPerRequest || 0} days</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Requires Approval</span>
                            <div className="flex items-center gap-2">
                              {getBooleanIcon(selectedLeaveType?.requiresApproval)}
                              <span>{getBooleanText(selectedLeaveType?.requiresApproval)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Requires Attachment</span>
                            <div className="flex items-center gap-2">
                              {getBooleanIcon(selectedLeaveType?.requiresAttachment)}
                              <span>{getBooleanText(selectedLeaveType?.requiresAttachment)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Requires Doctor's Note</span>
                            <div className="flex items-center gap-2">
                              {getBooleanIcon(selectedLeaveType?.requiresDoctorNote)}
                              <span>{getBooleanText(selectedLeaveType?.requiresDoctorNote)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Allow Half Day</span>
                            <div className="flex items-center gap-2">
                              {getBooleanIcon(selectedLeaveType?.allowHalfDay)}
                              <span>{getBooleanText(selectedLeaveType?.allowHalfDay)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Allow Negative Balance</span>
                            <div className="flex items-center gap-2">
                              {getBooleanIcon(selectedLeaveType?.allowNegativeBalance)}
                              <span>{getBooleanText(selectedLeaveType?.allowNegativeBalance)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Holidays as Leave</span>
                            <div className="flex items-center gap-2">
                              {getBooleanIcon(selectedLeaveType?.holidaysAsLeave)}
                              <span>{getBooleanText(selectedLeaveType?.holidaysAsLeave)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Eligibility Section */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-orange-500" />
                        Eligibility Criteria
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Minimum Service Months</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.minServiceMonths || 0} months</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Probation Period Only</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getBooleanIcon(selectedLeaveType?.probationPeriodOnly)}
                            <span>{getBooleanText(selectedLeaveType?.probationPeriodOnly)}</span>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-500">Eligible Employment Types</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedLeaveType?.eligibleEmploymentTypes && selectedLeaveType.eligibleEmploymentTypes.length > 0 ? (
                                selectedLeaveType.eligibleEmploymentTypes.map((type) => (
                                    <span key={type} className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                              {type}
                            </span>
                                ))
                            ) : (
                                <span className="text-gray-500">All employment types</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell size={18} className="text-yellow-500" />
                        Notification Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Notify Manager on Request</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getBooleanIcon(selectedLeaveType?.notifyManagerOnRequest)}
                            <span>{getBooleanText(selectedLeaveType?.notifyManagerOnRequest)}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Send Reminder Days</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedLeaveType?.sendReminderDays && selectedLeaveType.sendReminderDays.length > 0 ? (
                                selectedLeaveType.sendReminderDays.map((days) => (
                                    <span key={days} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                              {days} days before
                            </span>
                                ))
                            ) : (
                                <span className="text-gray-500">No reminders set</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Display Settings */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Palette size={18} className="text-pink-500" />
                        Display Settings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Icon</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.icon || 'Calendar'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Color</label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-6 h-6 rounded-full bg-${selectedLeaveType?.color || 'emerald'}-500`} />
                            <span className="capitalize">{selectedLeaveType?.color || 'emerald'}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Display Priority</label>
                          <p className="text-gray-900 mt-1">{selectedLeaveType?.priority || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Metadata */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-gray-500" />
                        Status & Metadata
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <p className="mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedLeaveType?.isActive)}`}>
                          {selectedLeaveType?.isActiveStr || (selectedLeaveType?.isActive ? 'Active' : 'Inactive')}
                        </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created Date</label>
                          <p className="text-gray-900 mt-1">{formatDate(selectedLeaveType?.createdAt)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Modified Date</label>
                          <p className="text-gray-900 mt-1">{formatDate(selectedLeaveType?.modifiedAt) || 'Not modified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <Button variant="outline" onClick={handleCloseModal}>
                      Close
                    </Button>
                    <Button
                        onClick={() => {
                          handleCloseModal();
                          onEdit(selectedLeaveType);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <PenBox size={16} className="mr-2" />
                      Edit Leave Type
                    </Button>
                  </div>
                </motion.div>
              </div>
          )}
        </>
    );
  } catch (error) {
    console.error('LeaveTypeTable render error:', error);
    return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-red-800 font-semibold mb-1">Something went wrong</h3>
          <p className="text-red-600 text-sm">
            {(error as Error)?.message || 'Failed to load leave types table'}
          </p>
          <button
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          >
            Reload page
          </button>
        </div>
    );
  }
};

export default LeaveTypeTable;