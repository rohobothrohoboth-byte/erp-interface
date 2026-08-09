// EmployeeTable.tsx - Complete with Status Filter Buttons + List & Card View

import React, { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  Eye,
  PenBox,
  Trash2,
  Lock,
  ClipboardCheck,
  UserCheck,
  UserX,
  Calendar,
  Briefcase,
  Building2,
  Award,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  AlertTriangle,
  LayoutGrid,
  List,
  Mail,
  Phone,
  MapPin,
  Users,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import DeleteEmployeeModal from './DeleteEmployeeModal';
import { ReviewDecision } from '../../../types/hr/enum';
import type { EmpState } from '../../../types/hr/enum';
import { useNavigate } from 'react-router';
import { Button } from '../../ui/button';
import { useAuthStore } from '../../../stores/auth.store';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '../../../services/hr/dashboard/dashboard.key';
import toast from 'react-hot-toast';
import { employeeReviewApi } from '../../../services/hr/employee/employeeReview.api';
import { empApi } from '../../../services/hr/employee/emp.api';

// ============================================================
// TYPES
// ============================================================

interface Employee {
  id: string;
  code: string;
  empFullName: string;
  empFullNameAm: string;
  gender: string;
  department: string;
  position: string;
  branch?: string;
  jobGrade?: string;
  empType?: string;
  empNature?: string;
  photo?: string;
  empState: EmpState;
  employmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  email?: string;
  phone?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEmployeeUpdate: (updatedEmployee: Employee) => void;
  onEmployeeStatusChange: (employeeId: string, newStatus: string) => void;
  onEmployeeTerminate: (employeeId: string) => void;
  onEmployeeDelete: (employeeId: string) => void;
  onAddAccount?: (employee: Employee) => void;
  showAddAccountButton?: boolean;
  loading?: boolean;
  onPageSizeChange?: (size: number) => void;
  onEmployeeReview?: (employeeId: string, decision: 'Accept' | 'Reject') => Promise<void>;
  onRefresh?: () => void;
  onLeaveEmployeeIds?: Set<string>;
  // ✅ Status filter
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

// ============================================================
// PERMISSIONS
// ============================================================

const EMPLOYEE_PERMISSIONS = {
  VIEW_DETAILS: 'hr.emp.view',
  EDIT: 'hr.emp.mod',
  DELETE: 'hr.emp.del',
  REVIEW: 'hr.emp.rev',
  ADD_ACCOUNT: 'hr.emp.add',
  VIEW_SENSITIVE: 'hr.emp.dtl',
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();

  const getStatusText = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'under probation':
      case 'prob':
        return 'Under Probation';
      case 'standby':
        return 'Standby';
      case 'terminated':
        return 'Terminated';
      case 'on leave':
      case 'leave':
        return 'On Leave';
      case 'retired':
        return 'Retired';
      default:
        return status || 'Unknown';
    }
  };

  const getConfig = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-700 dark:text-emerald-400',
          icon: UserCheck,
          border: 'border-emerald-200 dark:border-emerald-800',
        };
      case 'pending':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          text: 'text-amber-700 dark:text-amber-400',
          icon: ClockIcon,
          border: 'border-amber-200 dark:border-amber-800',
        };
      case 'under probation':
      case 'prob':
      case 'standby':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-700 dark:text-yellow-400',
          icon: AlertTriangle,
          border: 'border-yellow-200 dark:border-yellow-800',
        };
      case 'terminated':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-400',
          icon: UserX,
          border: 'border-red-200 dark:border-red-800',
        };
      case 'on leave':
      case 'leave':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-700 dark:text-orange-400',
          icon: Calendar,
          border: 'border-orange-200 dark:border-orange-800',
        };
      case 'retired':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800/30',
          text: 'text-gray-700 dark:text-gray-400',
          icon: Award,
          border: 'border-gray-200 dark:border-gray-700',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800/30',
          text: 'text-gray-700 dark:text-gray-400',
          icon: UserCheck,
          border: 'border-gray-200 dark:border-gray-700',
        };
    }
  };

  const c = getConfig();
  const Icon = c.icon;

  return (
      <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text} border ${c.border}`}
      >
      <Icon className="w-3 h-3" />
        {getStatusText(status)}
    </span>
  );
};

// ============================================================
// REVIEW MODAL
// ============================================================

interface ReviewModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess?: () => void;
  onEmployeeReview?: (employeeId: string, decision: 'Accept' | 'Reject') => Promise<void>;
}

function ReviewModal({ employee, onClose, onSuccess, onEmployeeReview }: ReviewModalProps) {
  const { t } = useLanguage();
  const [decision, setDecision] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');

  const getDecisionConfig = (value: string) => {
    if (value === ReviewDecision.Accept) {
      return {
        icon: CheckCircle,
        color: "emerald",
        gradient: "from-emerald-500 to-teal-600",
        bgGradient: "from-emerald-50 to-teal-50",
        borderColor: "border-emerald-200",
        textColor: "text-emerald-700",
        bgColor: "bg-emerald-50",
        buttonGradient: "from-emerald-600 to-teal-600",
        buttonHover: "hover:from-emerald-700 hover:to-teal-700"
      };
    } else {
      return {
        icon: XCircle,
        color: "red",
        gradient: "from-red-500 to-rose-600",
        bgGradient: "from-red-50 to-rose-50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        bgColor: "bg-red-50",
        buttonGradient: "from-red-600 to-rose-600",
        buttonHover: "hover:from-red-700 hover:to-rose-700"
      };
    }
  };

  const handleSubmit = async () => {
    if (!decision) {
      toast.error(t.selectDecision || "Please select a decision");
      return;
    }

    if (!employee?.id) {
      toast.error("Employee ID is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onEmployeeReview) {
        await onEmployeeReview(employee.id, decision as 'Accept' | 'Reject');
      } else {
        await employeeReviewApi.reviewEmployee(employee.id, decision as 'Accept' | 'Reject', remarks);
      }

      if (decision === ReviewDecision.Accept) {
        toast.success(`✅ Employee ${employee.empFullName} has been APPROVED!`);
      } else {
        toast.success(`❌ Employee ${employee.empFullName} has been REJECTED.`);
      }

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error: any) {
      console.error('Review error:', error);
      toast.error(error.response?.data?.message || 'Failed to review employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConfig = decision ? getDecisionConfig(decision) : null;

  return createPortal(
      <AnimatePresence>
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
        >
          <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Review Employee
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    Review and take action
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Employee Info */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                  {employee.empFullName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{employee.empFullName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {employee.position} • {employee.department}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    ID: {employee.code}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Status: <span className="font-medium text-amber-600">Pending</span>
                  </p>
                </div>
              </div>

              {/* Decision */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 block">
                  Decision <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(ReviewDecision).map((value) => {
                    const isSelected = decision === value;
                    const config = getDecisionConfig(value);
                    const Icon = config.icon;

                    return (
                        <label
                            key={value}
                            className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isSelected
                                    ? `${config.borderColor} ${config.bgColor} shadow-md`
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                        >
                          <input
                              type="radio"
                              name="decision"
                              value={value}
                              checked={isSelected}
                              onChange={() => setDecision(value)}
                              className={`w-4 h-4 ${
                                  isSelected
                                      ? value === ReviewDecision.Accept
                                          ? 'accent-emerald-600'
                                          : 'accent-red-600'
                                      : 'accent-slate-400'
                              }`}
                          />
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${isSelected ? config.bgColor : 'bg-slate-100 dark:bg-slate-800'}`}>
                              <Icon className={`w-4 h-4 ${isSelected ? config.textColor : 'text-slate-500 dark:text-slate-400'}`} />
                            </div>
                            <span className={`text-sm font-medium ${
                                isSelected ? config.textColor : 'text-slate-700 dark:text-slate-300'
                            }`}>
                          {value === ReviewDecision.Accept ? 'Approve' : 'Reject'}
                        </span>
                          </div>
                        </label>
                    );
                  })}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                  Remarks (Optional)
                </label>
                <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any additional comments..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    rows={3}
                    disabled={isSubmitting}
                />
              </div>

              {/* Impact Note */}
              {decision && (
                  <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl bg-gradient-to-r ${currentConfig?.bgGradient} border ${currentConfig?.borderColor}`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`w-4 h-4 ${currentConfig?.textColor} mt-0.5`} />
                      <div>
                        <p className={`text-xs font-medium ${currentConfig?.textColor}`}>
                          {decision === ReviewDecision.Accept
                              ? '✅ This will APPROVE the employee record and change status to Active.'
                              : '❌ This will REJECT the employee application. The employee will be notified.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
              <Button
                  onClick={onClose}
                  variant="outline"
                  className="px-5 cursor-pointer"
                  disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                  disabled={!decision || isSubmitting}
                  onClick={handleSubmit}
                  className={`bg-gradient-to-r ${
                      decision === ReviewDecision.Accept
                          ? "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                          : "from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  } text-white cursor-pointer px-6 gap-2 transition-all duration-200`}
              >
                {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                ) : (
                    <>
                      {decision === ReviewDecision.Accept ? (
                          <CheckCircle className="w-4 h-4" />
                      ) : (
                          <XCircle className="w-4 h-4" />
                      )}
                      Submit {decision === ReviewDecision.Accept ? 'Approve' : 'Reject'}
                    </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>,
      document.body
  );
}

// ============================================================
// VIEW TOGGLE
// ============================================================

interface ViewToggleProps {
  view: 'list' | 'card';
  onViewChange: (view: 'list' | 'card') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  const { t } = useLanguage();

  return (
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
            onClick={() => onViewChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                view === 'list'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <List className="w-3.5 h-3.5" />
          {t.list || ''}
        </button>
        <button
            onClick={() => onViewChange('card')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                view === 'card'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          {t.cardView || ''}
        </button>
      </div>
  );
};

// ============================================================
// EMPLOYEE CARD
// ============================================================

interface EmployeeCardProps {
  employee: Employee;
  index: number;
  displayStatus: string;
  canViewDetails: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReview: boolean;
  canAddAccount: boolean;
  showAddAccountButton: boolean;
  onViewDetails: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onReview: (employee: Employee) => void;
  onAddAccountClick: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
                                                     employee,
                                                     index,
                                                     displayStatus,
                                                     canViewDetails,
                                                     canEdit,
                                                     canDelete,
                                                     canReview,
                                                     canAddAccount,
                                                     showAddAccountButton,
                                                     onViewDetails,
                                                     onEdit,
                                                     onDelete,
                                                     onReview,
                                                     onAddAccountClick,
                                                   }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const hasAnyActions = canViewDetails || canEdit || canDelete || canReview;

  const getInitials = (name: string) => {
    return name
        ?.trim()
        .split(' ')
        .slice(0, 2)
        .map((n) => n.charAt(0).toUpperCase())
        .join('') || 'U';
  };

  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        <div className="p-4">
          {/* Header: Avatar + Name + Status */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {employee.photo ? (
                  <img
                      src={`data:image/png;base64,${employee.photo}`}
                      alt={employee.empFullName}
                      className="h-full w-full object-cover"
                  />
              ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
                {getInitials(employee.empFullName)}
              </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {employee.empFullName || 'No Name'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {employee.position || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {employee.department || 'N/A'}
                  </p>
                </div>
                <StatusBadge status={displayStatus} />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {employee.branch || 'N/A'}
            </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {employee.jobGrade || 'N/A'}
            </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {employee.email || 'N/A'}
            </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {employee.phone || 'N/A'}
            </span>
            </div>
          </div>

          {/* Code */}
          <div className="mt-3">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {employee.code || 'N/A'}
          </span>
          </div>

          {/* Actions */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            {showAddAccountButton && canAddAccount ? (
                <button
                    onClick={() => onAddAccountClick(employee)}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium hover:shadow-lg transition-all"
                    title="Add Account"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Add Account
                </button>
            ) : hasAnyActions ? (
                <div className="flex items-center gap-1">
                  {canViewDetails && (
                      <button
                          onClick={() => onViewDetails(employee)}
                          className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                          title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                  )}
                  {canEdit && (
                      <button
                          onClick={() => onEdit(employee)}
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Edit"
                      >
                        <PenBox className="w-4 h-4" />
                      </button>
                  )}
                  {canReview && employee.empState === 'Pending' && (
                      <button
                          onClick={() => onReview(employee)}
                          className="p-2 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                          title="Review"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                      </button>
                  )}
                  {canDelete && (
                      <button
                          onClick={() => onDelete(employee)}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  )}
                </div>
            ) : null}
          </div>
        </div>
      </motion.div>
  );
};

// ============================================================
// STATUS FILTER BUTTONS
// ============================================================

interface StatusFilterProps {
  employees: Employee[];
  onLeaveEmployeeIds?: Set<string>;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
                                                     employees,
                                                     onLeaveEmployeeIds,
                                                     selectedStatus,
                                                     onStatusChange,
                                                   }) => {
  const { t } = useLanguage();

  // Calculate counts for each status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: employees.length,
      active: 0,
      pending: 0,
      'on leave': 0,
      inactive: 0,
    };

    employees.forEach((emp) => {
      let status = emp.empState?.toLowerCase() || 'unknown';

      // Override for on leave
      if (onLeaveEmployeeIds?.has(emp.id)) {
        status = 'on leave';
      }

      if (status === 'active' || status === 'approved') {
        counts.active++;
      } else if (status === 'pending') {
        counts.pending++;
      } else if (status === 'on leave' || status === 'leave') {
        counts['on leave']++;
      } else if (status === 'terminated' || status === 'retired' || status === 'inactive') {
        counts.inactive++;
      }
    });

    return counts;
  }, [employees, onLeaveEmployeeIds]);

  const statuses = [
    { key: 'all', label: 'All Statuses', icon: Users },
    { key: 'active', label: 'Active', icon: UserCheck, color: 'emerald' },
    { key: 'pending', label: 'Pending', icon: ClockIcon, color: 'amber' },
    { key: 'on leave', label: 'On Leave', icon: Calendar, color: 'orange' },
    { key: 'inactive', label: 'Inactive', icon: UserX, color: 'red' },
  ];

  const getColorClasses = (key: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700';
    }

    const colors: Record<string, string> = {
      all: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
      active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700',
      pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700',
      'on leave': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700',
      inactive: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
    };

    return colors[key] || colors.all;
  };

  return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>{t.filterBy || 'Filter by'}:</span>
        </div>
        {statuses.map((status) => {
          const isSelected = selectedStatus === status.key;
          const count = statusCounts[status.key] || 0;
          const Icon = status.icon;
          const colorClasses = getColorClasses(status.key, isSelected);

          return (
              <button
                  key={status.key}
                  onClick={() => onStatusChange(status.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                      colorClasses
                  } ${isSelected ? 'shadow-sm' : 'hover:shadow-sm'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{status.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/30 dark:bg-white/10' : 'bg-slate-100 dark:bg-slate-700'
                }`}>
              {count}
            </span>
                {isSelected && (
                    <X
                        className="w-3 h-3 ml-0.5 cursor-pointer hover:opacity-70"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange('all');
                        }}
                    />
                )}
              </button>
          );
        })}
      </div>
  );
};

// ============================================================
// MAIN EMPLOYEE TABLE
// ============================================================

const EmployeeTable: React.FC<EmployeeTableProps> = ({
                                                       employees,
                                                       currentPage,
                                                       totalPages,
                                                       totalItems,
                                                       onPageChange,
                                                       onEmployeeDelete,
                                                       onAddAccount,
                                                       showAddAccountButton = false,
                                                       loading = false,
                                                       onEmployeeReview,
                                                       onEmployeeUpdate,
                                                       onEmployeeStatusChange,
                                                       onEmployeeTerminate,
                                                       onRefresh,
                                                       onLeaveEmployeeIds,
                                                       statusFilter: externalStatusFilter,
                                                       onStatusFilterChange,
                                                     }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewEmployee, setReviewEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [internalStatusFilter, setInternalStatusFilter] = useState('all');
  const { permissions, role } = useAuthStore();

  // Use external filter if provided, otherwise use internal
  const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
  const setStatusFilter = onStatusFilterChange || setInternalStatusFilter;

  // ============================================================
  // ✅ GET EMPLOYEE STATUS (with On Leave override)
  // ============================================================

  const getEmployeeStatus = useCallback((employee: Employee): string => {
    if (onLeaveEmployeeIds?.has(employee.id)) {
      return 'On Leave';
    }
    return employee.empState || 'Unknown';
  }, [onLeaveEmployeeIds]);

  // ============================================================
  // ✅ FILTER EMPLOYEES BY STATUS
  // ============================================================

  const filteredEmployees = useMemo(() => {
    if (statusFilter === 'all') {
      return employees;
    }

    return employees.filter((emp) => {
      let status = emp.empState?.toLowerCase() || '';

      // Override for on leave
      if (onLeaveEmployeeIds?.has(emp.id)) {
        status = 'on leave';
      }

      if (statusFilter === 'active') {
        return status === 'active' || status === 'approved';
      } else if (statusFilter === 'pending') {
        return status === 'pending';
      } else if (statusFilter === 'on leave') {
        return status === 'on leave' || status === 'leave';
      } else if (statusFilter === 'inactive') {
        return status === 'terminated' || status === 'retired' || status === 'inactive';
      }
      return true;
    });
  }, [employees, statusFilter, onLeaveEmployeeIds]);

  // ============================================================
  // ✅ CACHE INVALIDATION HELPERS
  // ============================================================

  const invalidateAllCaches = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.pending() });
    await queryClient.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
    await queryClient.invalidateQueries({ queryKey: ['employees'] });
    await queryClient.invalidateQueries({ queryKey: ['employees', 'paginated'] });

    if (onRefresh) {
      onRefresh();
    }
  }, [queryClient, onRefresh]);

  // ============================================================
  // PERMISSION CHECKS
  // ============================================================

  const hasPermission = useCallback(
      (actionKey: string): boolean => {
        if (!permissions?.length) return false;
        if (role === 'admin' || role === 'super_admin') return true;
        return permissions.some((module: any) =>
            module.M?.some(
                (menu: any) =>
                    menu.A?.includes(actionKey) ||
                    menu.C?.some((child: any) => child.A?.includes(actionKey))
            )
        );
      },
      [permissions, role]
  );

  const canViewDetails = useMemo(
      () => hasPermission(EMPLOYEE_PERMISSIONS.VIEW_DETAILS),
      [hasPermission]
  );
  const canEdit = useMemo(
      () => hasPermission(EMPLOYEE_PERMISSIONS.EDIT),
      [hasPermission]
  );
  const canDelete = useMemo(
      () => hasPermission(EMPLOYEE_PERMISSIONS.DELETE),
      [hasPermission]
  );
  const canReview = useMemo(
      () => hasPermission(EMPLOYEE_PERMISSIONS.REVIEW),
      [hasPermission]
  );
  const canAddAccount = useMemo(
      () => hasPermission(EMPLOYEE_PERMISSIONS.ADD_ACCOUNT),
      [hasPermission]
  );
  const canViewSensitive = useMemo(
      () => hasPermission(EMPLOYEE_PERMISSIONS.VIEW_SENSITIVE),
      [hasPermission]
  );
  const hasAnyActions = canViewDetails || canEdit || canDelete || canReview;

  // ============================================================
  // ✅ HANDLE VIEW DETAILS
  // ============================================================

  const handleViewDetails = (employee: Employee) => {
    if (!canViewDetails) return;
    sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    navigate(`/hr/employees/${employee.id}`);
    setPopoverOpen(null);
  };

  // ============================================================
  // ✅ HANDLE EDIT
  // ============================================================

  const handleEdit = (employee: Employee) => {
    if (!canEdit) return;
    sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
    navigate(`/hr/employees/edit/${employee.id}`);
    setPopoverOpen(null);
  };

  // ============================================================
  // ✅ HANDLE DELETE
  // ============================================================

  const handleDelete = (employee: Employee) => {
    if (!canDelete) return;
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
    setPopoverOpen(null);
  };

  const confirmDeletion = async (employeeId: string) => {
    setIsDeleting(true);
    try {
      await empApi.deleteEmployee(employeeId as any);
      await invalidateAllCaches();
      toast.success('Employee deleted successfully!');
      onEmployeeDelete(employeeId);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
  };

  // ============================================================
  // ✅ HANDLE ADD ACCOUNT
  // ============================================================

  const handleAddAccountClick = (employee: Employee) => {
    if (onAddAccount && canAddAccount) {
      onAddAccount(employee);
      setPopoverOpen(null);
    }
  };

  // ============================================================
  // ✅ HANDLE REVIEW
  // ============================================================

  const handleReviewClick = (employee: Employee) => {
    setReviewEmployee(employee);
    setPopoverOpen(null);
  };

  const handleReviewSuccess = async () => {
    if (reviewEmployee) {
      await invalidateAllCaches();
      const updatedEmployee = {
        ...reviewEmployee,
        empState: 'Active' as EmpState,
      };
      onEmployeeUpdate(updatedEmployee);
    }
    setReviewEmployee(null);
  };

  // ============================================================
  // ✅ SORTED & FILTERED EMPLOYEES
  // ============================================================

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const dateA = a.employmentDate || a.createdAt || '';
    const dateB = b.employmentDate || b.createdAt || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // ============================================================
  // ✅ LOADING STATE
  // ============================================================

  if (loading && employees.length === 0) {
    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-12 flex items-center justify-center border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-200 rounded-full" />
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-500 font-medium">
              {t.loadingEmployees || 'Loading employees...'}
            </p>
          </div>
        </div>
    );
  }

  // ============================================================
  // ✅ RENDER LIST VIEW
  // ============================================================

  const renderListView = () => (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-900">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Employee
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Code
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Branch
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Department
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Position
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Job Grade
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Status
            </th>
            {hasAnyActions && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  Actions
                </th>
            )}
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedEmployees.length === 0 ? (
              <tr>
                <td
                    colSpan={hasAnyActions ? 8 : 7}
                    className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      {statusFilter !== 'all'
                          ? `No ${statusFilter} employees found`
                          : (t.noEmployeesFound || 'No employees found')}
                    </p>
                  </div>
                </td>
              </tr>
          ) : (
              sortedEmployees.map((employee, index) => {
                const displayStatus = getEmployeeStatus(employee);

                return (
                    <motion.tr
                        key={employee.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ backgroundColor: 'rgba(16,185,129,0.02)' }}
                        className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center overflow-hidden">
                            {employee.photo ? (
                                <img
                                    src={`data:image/png;base64,${employee.photo}`}
                                    alt={employee.empFullName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                            {employee.empFullName
                                ?.trim()
                                .split(' ')
                                .slice(0, 2)
                                .map((n) => n.charAt(0).toUpperCase())
                                .join('') || 'U'}
                          </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {employee.empFullName || 'No Name'}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              {employee.empFullNameAm || employee.empFullName}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {employee.gender || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {employee.code || 'N/A'}
                    </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                        {employee.branch || 'N/A'}
                      </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                        {employee.department || 'N/A'}
                      </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {employee.position || 'N/A'}
                    </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {employee.jobGrade || 'N/A'}
                    </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={displayStatus} />
                      </td>
                      {hasAnyActions && (
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {showAddAccountButton && canAddAccount ? (
                                <button
                                    onClick={() => handleAddAccountClick(employee)}
                                    className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg"
                                    title="Add Account"
                                >
                                  <Lock className="h-4 w-4" />
                                </button>
                            ) : showAddAccountButton && !canAddAccount ? (
                                <button
                                    disabled
                                    className="p-2 rounded-xl bg-slate-200 text-slate-400 cursor-not-allowed"
                                    title="No permission"
                                >
                                  <Lock className="h-4 w-4" />
                                </button>
                            ) : (
                                (canViewDetails || canEdit || canDelete || canReview) && (
                                    <Popover
                                        open={popoverOpen === employee.id}
                                        onOpenChange={(open) =>
                                            setPopoverOpen(open ? employee.id : null)
                                        }
                                    >
                                      <PopoverTrigger asChild>
                                        <button className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                          <MoreVertical className="h-4 w-4" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                          className="w-48 p-1 rounded-xl shadow-lg"
                                          align="end"
                                      >
                                        <div className="py-1">
                                          {canViewDetails && (
                                              <button
                                                  onClick={() => handleViewDetails(employee)}
                                                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-lg flex items-center gap-2"
                                              >
                                                <Eye size={14} /> View Details
                                              </button>
                                          )}
                                          {canEdit && (
                                              <button
                                                  onClick={() => handleEdit(employee)}
                                                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg flex items-center gap-2"
                                              >
                                                <PenBox size={14} /> Edit
                                              </button>
                                          )}
                                          {canReview &&
                                              employee.empState === 'Pending' && (
                                                  <button
                                                      onClick={() => handleReviewClick(employee)}
                                                      className="w-full text-left px-3 py-2 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg flex items-center gap-2"
                                                  >
                                                    <ClipboardCheck size={14} /> Review
                                                  </button>
                                              )}
                                          {canDelete && (
                                              <button
                                                  onClick={() => handleDelete(employee)}
                                                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg flex items-center gap-2"
                                              >
                                                <Trash2 size={14} /> Delete
                                              </button>
                                          )}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                )
                            )}
                          </td>
                      )}
                    </motion.tr>
                );
              })
          )}
          </tbody>
        </table>
      </div>
  );

  // ============================================================
  // ✅ RENDER CARD VIEW
  // ============================================================

  const renderCardView = () => {
    if (sortedEmployees.length === 0) {
      return (
          <div className="col-span-full py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {statusFilter !== 'all'
                    ? `No ${statusFilter} employees found`
                    : (t.noEmployeesFound || 'No employees found')}
              </p>
            </div>
          </div>
      );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedEmployees.map((employee, index) => {
            const displayStatus = getEmployeeStatus(employee);

            return (
                <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    index={index}
                    displayStatus={displayStatus}
                    canViewDetails={canViewDetails}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canReview={canReview}
                    canAddAccount={canAddAccount}
                    showAddAccountButton={showAddAccountButton}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReview={handleReviewClick}
                    onAddAccountClick={handleAddAccountClick}
                />
            );
          })}
        </div>
    );
  };

  // ============================================================
  // ✅ RENDER
  // ============================================================

  return (
      <>
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { type: 'spring', stiffness: 100, damping: 15 },
              },
            }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden"
        >
          {/* ============================================================ */}
          {/* STATUS FILTER ROW */}
          {/* ============================================================ */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
            <StatusFilter
                employees={employees}
                onLeaveEmployeeIds={onLeaveEmployeeIds}
                selectedStatus={statusFilter}
                onStatusChange={setStatusFilter}
            />
          </div>

          {/* ============================================================ */}
          {/* TOOLBAR ROW */}
          {/* ============================================================ */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {filteredEmployees.length} {t.employees || 'Employees'} found
                  {statusFilter !== 'all' && (
                      <span className="text-xs font-normal text-slate-400 ml-1">
                    (filtered by {statusFilter})
                  </span>
                  )}
              </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          {!canViewSensitive && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {t.limitedViewAccess || 'You have limited view access. Some details may be hidden.'}
                </p>
              </div>
          )}

          {/* List or Card View */}
          {viewMode === 'list' ? renderListView() : renderCardView()}

          {/* Pagination */}
          {totalItems > 0 && (
              <div className="bg-white/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                      onClick={() =>
                          onPageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing{' '}
                    <span className="font-semibold">
                  {(currentPage - 1) * 10 + 1}
                </span>{' '}
                    to{' '}
                    <span className="font-semibold">
                  {Math.min(currentPage * 10, totalItems)}
                </span>{' '}
                    of{' '}
                    <span className="font-semibold">{totalItems}</span>{' '}
                    employees
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let p;
                      if (totalPages <= 5) p = i + 1;
                      else if (currentPage <= 3) p = i + 1;
                      else if (currentPage >= totalPages - 2)
                        p = totalPages - 4 + i;
                      else p = currentPage - 2 + i;
                      return (
                          <button
                              key={p}
                              onClick={() => onPageChange(p)}
                              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                                  currentPage === p
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                              }`}
                          >
                            {p}
                          </button>
                      );
                    })}
                    <button
                        onClick={() =>
                            onPageChange(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
          )}
        </motion.div>

        {/* Delete Modal */}
        <DeleteEmployeeModal
            employee={selectedEmployee}
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={confirmDeletion}
            isDeleting={isDeleting}
        />

        {/* Review Modal */}
        {reviewEmployee && (
            <ReviewModal
                employee={reviewEmployee}
                onClose={() => setReviewEmployee(null)}
                onSuccess={handleReviewSuccess}
                onEmployeeReview={onEmployeeReview}
            />
        )}
      </>
  );
};

export default EmployeeTable;