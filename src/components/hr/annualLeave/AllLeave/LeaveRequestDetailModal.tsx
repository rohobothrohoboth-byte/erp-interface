import { motion } from "framer-motion";
import { X, Calendar, Clock, User, Hash, FileText, CheckCircle, XCircle, AlertCircle, GitBranch, Users, Loader2 } from "lucide-react";
import type { LeaveRequestListDto } from "../../../../types/hr/leaverequest";
import { useState, useEffect } from "react";
import { api } from "../../../../services/api";
import { Badge } from "../../../ui/badge";
import { ApprovalRole } from "../../../../types/core/enum";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequestListDto | null;
}

interface ApprovalStep {
  StepOrder: number;
  StepName: string;
  Role: string;
  RoleStr?: string;
  IsFinal?: boolean;
  EmployeeId?: string | null;
  Employee?: string;
}

const LeaveRequestDetailModal: React.FC<Props> = ({ isOpen, onClose, leave }) => {
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  useEffect(() => {
    if (isOpen && leave && leave.statusStr === 'Pending' && (leave as any).approvalChainId) {
      fetchApprovalSteps();
    }
  }, [isOpen, leave]);

  const fetchApprovalSteps = async () => {
    const chainId = (leave as any).approvalChainId;
    if (!chainId) return;

    setLoadingSteps(true);
    try {
      const response = await api.get(`/hrm/leave/v1/Policy/Chain/Step/All/${chainId}`);
      let steps = response.data?.data || [];

      console.log('Raw API response for steps:', steps);

      if (!Array.isArray(steps) && steps && typeof steps === 'object') {
        steps = Object.values(steps);
      }

      // Normalize step data
      const normalizedSteps = steps.map((step: any) => ({
        StepOrder: step.StepOrder ?? step.stepOrder ?? 0,
        StepName: step.StepName ?? step.stepName ?? `Step ${step.StepOrder ?? step.stepOrder}`,
        Role: step.Role ?? step.role ?? '0',
        RoleStr: step.RoleStr ?? step.roleStr,
        Employee: step.Employee ?? step.employee,
        IsFinal: step.IsFinal ?? step.isFinal ?? false,
      }));

      console.log('Normalized steps:', normalizedSteps);
      setApprovalSteps(normalizedSteps);
    } catch (error) {
      console.error('Error fetching approval steps:', error);
    } finally {
      setLoadingSteps(false);
    }
  };

  if (!isOpen || !leave) return null;

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
      pending: {
        color: 'text-yellow-800',
        bg: 'bg-yellow-100',
        icon: <AlertCircle className="w-5 h-5" />
      },
      approved: {
        color: 'text-green-800',
        bg: 'bg-green-100',
        icon: <CheckCircle className="w-5 h-5" />
      },
      rejected: {
        color: 'text-red-800',
        bg: 'bg-red-100',
        icon: <XCircle className="w-5 h-5" />
      },
      cancelled: {
        color: 'text-gray-800',
        bg: 'bg-gray-100',
        icon: <XCircle className="w-5 h-5" />
      },
    };
    return config[status.toLowerCase()] || config.pending;
  };

  const statusConfig = getStatusConfig(leave.statusStr);
  const currentStepOrder = (leave as any).currentStepOrder || 1;
  const totalSteps = (leave as any).totalSteps || approvalSteps.length;

  // Get step status for workflow display
  const getStepStatus = (stepOrder: number) => {
    if (leave.statusStr === 'Approved') return 'completed';
    if (leave.statusStr === 'Rejected') {
      if (stepOrder === currentStepOrder) return 'rejected';
      if (stepOrder < currentStepOrder) return 'completed';
      return 'pending';
    }
    if (stepOrder < currentStepOrder) return 'completed';
    if (stepOrder === currentStepOrder) return 'current';
    return 'pending';
  };

  // Get role display name from ApprovalRole enum
  const getRoleDisplay = (role: string): string => {
    console.log('Getting role display for:', role);

    // First check if the role is a key in ApprovalRole (like "0", "1", "2")
    if (ApprovalRole[role as keyof typeof ApprovalRole]) {
      return ApprovalRole[role as keyof typeof ApprovalRole];
    }

    // Then check if it's already a display name
    const roleValues = Object.values(ApprovalRole);
    if (roleValues.includes(role as any)) {
      return role;
    }

    // Default fallback
    return 'Not Assigned';
  };

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Leave Request Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">Reference: #{leave.id?.slice(0, 8)}</p>
              </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.icon}
                <span className="font-semibold capitalize">{leave.statusStr}</span>
              </div>
            </div>

            {/* Progress Section for Pending Requests */}
            {leave.statusStr === 'Pending' && totalSteps > 0 && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-800">Approval Progress</span>
                    <span className="text-sm font-semibold text-purple-600">
                  {Math.round((currentStepOrder / totalSteps) * 100)}%
                </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStepOrder / totalSteps) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-purple-600">
                    Step {currentStepOrder} of {totalSteps} - Waiting for approval
                  </p>
                </div>
            )}

            {/* Approval Workflow Steps */}
            {leave.statusStr === 'Pending' && approvalSteps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-purple-600" />
                    Approval Workflow
                  </h3>
                  <div className="space-y-3">
                    {approvalSteps
                        .sort((a, b) => a.StepOrder - b.StepOrder)
                        .map((step) => {
                          const stepStatus = getStepStatus(step.StepOrder);
                          const roleDisplay = getRoleDisplay(step.Role);
                          const stepName = step.StepName || `Step ${step.StepOrder}`;

                          let statusIcon = null;
                          let bgColor = '';
                          let borderColor = '';
                          let textColor = '';
                          let statusText = '';

                          if (stepStatus === 'completed') {
                            statusIcon = <CheckCircle className="w-4 h-4 text-green-500" />;
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-200';
                            textColor = 'text-green-700';
                            statusText = 'Completed';
                          } else if (stepStatus === 'current') {
                            statusIcon = <Clock className="w-4 h-4 text-purple-500" />;
                            bgColor = 'bg-purple-50';
                            borderColor = 'border-purple-200';
                            textColor = 'text-purple-700';
                            statusText = 'Current - Waiting';
                          } else if (stepStatus === 'rejected') {
                            statusIcon = <XCircle className="w-4 h-4 text-red-500" />;
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-200';
                            textColor = 'text-red-700';
                            statusText = 'Rejected';
                          } else {
                            statusIcon = <Clock className="w-4 h-4 text-gray-400" />;
                            bgColor = 'bg-gray-50';
                            borderColor = 'border-gray-200';
                            textColor = 'text-gray-500';
                            statusText = 'Pending';
                          }

                          return (
                              <div key={step.StepOrder} className={`flex items-start gap-3 p-3 rounded-lg ${bgColor} border ${borderColor}`}>
                                <div className="flex-shrink-0 w-8 text-center">
                                  <span className={`text-sm font-semibold ${textColor}`}>{step.StepOrder}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${textColor}`}>{stepName}</p>
                                    <Badge className={`${stepStatus === 'completed' ? 'bg-green-100 text-green-700' : stepStatus === 'current' ? 'bg-purple-100 text-purple-700' : stepStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'} border-0 text-xs`}>
                                      {statusText}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-medium">Approver Role:</span> {roleDisplay}
                                  </p>
                                  {step.Employee && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        <span className="font-medium">Specific Approver:</span> {step.Employee}
                                      </p>
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  {statusIcon}
                                </div>
                              </div>
                          );
                        })}
                  </div>
                </div>
            )}

            {/* Loading State */}
            {leave.statusStr === 'Pending' && loadingSteps && (
                <div className="mb-6 flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
            )}

            {/* No Steps Message */}
            {leave.statusStr === 'Pending' && !loadingSteps && approvalSteps.length === 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No approval steps configured</p>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Employee Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">{leave.employee || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Leave Type</p>
                      <p className="text-sm font-medium text-gray-900">{leave.leaveType || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Leave Period
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(leave.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(leave.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-emerald-600">{leave.daysRequestedStr || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Half Day</p>
                      <p className="text-sm font-medium text-gray-900">{leave.isHalfDayStr || 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Request Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Date Requested</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(leave.dateRequested) || formatDate(leave.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fiscal Year</p>
                      <p className="text-sm font-medium text-gray-900">{leave.fiscalYear || new Date().getFullYear()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Reason / Comments
                  </h3>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 min-h-[100px]">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {leave.comments || 'No comments provided'}
                    </p>
                  </div>
                </div>

                {/* Approval Information (if approved) */}
                {leave.statusStr === 'Approved' && leave.dateApproved && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approval Information
                      </h3>
                      <div className="space-y-1">
                        <p className="text-xs text-green-700">
                          Approved on: {formatDate(leave.dateApproved)}
                        </p>
                        {leave.approvedBy && (
                            <p className="text-xs text-green-700">
                              Approved by: {leave.approvedBy}
                            </p>
                        )}
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
  );
};

export default LeaveRequestDetailModal;