// src/pages/hr/leave/LeaveRequestForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Calendar, MessageSquare, Loader2, GitBranch, Eye, Clock, CheckCircle, XCircle, RefreshCw, X, Users, FileText } from 'lucide-react';
import { leaveApi } from '@/modules/hr/services/leave/leave.api';
import { hrmLeaveListApi } from '@/modules/list/services/hrmLeave/hrmLeaveList.api';
import { leaveAppChainServices } from '@/modules/core/services/settings/ModHrm/leaveAppChainServices';
import { leaveAppStepServices } from '@/modules/core/services/settings/ModHrm/leaveAppStepService';
import { api } from '@/shared/services/api';
import { showToast } from '@/shared/lib/toast';
import { useLeaveNotificationIntegration } from '@/modules/hr/hooks/leave/useLeaveNotificationIntegration';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { ListItem } from '@/modules/list/types/list';
import { Badge } from '@/shared/components/ui/badge';

interface LeaveRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  leavePolicyId?: string;
}

interface RecentRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysRequestedStr: string;
  statusStr: string;
  currentStepOrder?: number;
  totalSteps?: number;
  approvalChainId?: string;
}

const LeaveRequestForm = ({ onSuccess, onCancel, leavePolicyId }: LeaveRequestFormProps) => {
  const { employeeId, employeeName: currentUserName } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<ListItem[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [checkingApprovalChain, setCheckingApprovalChain] = useState(false);
  const [activeChain, setActiveChain] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RecentRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [approvalSteps, setApprovalSteps] = useState<any[]>([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [totalStepsCache, setTotalStepsCache] = useState<Record<string, number>>({});

  const { notifyLeaveRequestSubmitted, getManagersForEmployee } = useLeaveNotificationIntegration();

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    leaveTypeName: "",
    startDate: "",
    endDate: "",
    comments: ""
  });

  const fetchTotalStepsForChain = async (chainId: string): Promise<number> => {
    if (totalStepsCache[chainId]) {
      return totalStepsCache[chainId];
    }
    try {
      const response = await api.get(`/hrm/leave/v1/Policy/Chain/Step/All/${chainId}`);
      const steps = response.data?.data || [];
      const count = Array.isArray(steps) ? steps.length : 0;
      setTotalStepsCache(prev => ({ ...prev, [chainId]: count }));
      return count;
    } catch (error) {
      console.error('Error fetching steps count:', error);
      return 0;
    }
  };

  const fetchRecentRequests = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const data = await leaveApi.getMyLeaveRequests();
      const requests = Array.isArray(data) ? data : [];

      const recentRequestsList = requests.slice(0, 5);

      const enrichedRequests = await Promise.all(recentRequestsList.map(async (req) => {
        let currentAppStep = (req as any).currentStepOrder ?? (req as any).CurrentAppStep ?? 0;
        const approvalChainId = (req as any).approvalChainId;
        const statusDisplay = (req as any).statusStr || 'Pending';
        let totalSteps = 0;

        if (approvalChainId && statusDisplay === 'Pending') {
          totalSteps = await fetchTotalStepsForChain(approvalChainId);
          if (currentAppStep === 0 && statusDisplay === 'Pending') {
            currentAppStep = 1;
          }
        }

        return {
          id: req.id,
          leaveType: (req as any).leaveType || 'Leave Request',
          startDate: (req as any).startDate,
          endDate: (req as any).endDate,
          daysRequestedStr: (req as any).daysRequestedStr || '0 days',
          statusStr: statusDisplay,
          currentStepOrder: currentAppStep > 0 ? currentAppStep : undefined,
          totalSteps: totalSteps,
          approvalChainId: approvalChainId,
        };
      }));

      setRecentRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
    } finally {
      setLoadingRecent(false);
    }
  }, [totalStepsCache]);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const types = await hrmLeaveListApi.getAllLeaveTypes();
        setLeaveTypes(types);
      } catch (error) {
        console.error('Error fetching leave types:', error);
        showToast.error('Failed to load leave types');
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchLeaveTypes();
    fetchRecentRequests();
  }, [fetchRecentRequests]);

  useEffect(() => {
    const checkApprovalChain = async () => {
      if (!leavePolicyId || !formData.startDate) {
        setActiveChain(null);
        return;
      }

      setCheckingApprovalChain(true);
      try {
        const { activeAppChain } = leaveAppChainServices(leavePolicyId);
        await activeAppChain.refetch();
        const chain = activeAppChain.data;

        if (chain) {
          setActiveChain(chain);
        } else {
          setActiveChain(null);
        }
      } catch (error) {
        console.error('Error checking approval chain:', error);
        setActiveChain(null);
      } finally {
        setCheckingApprovalChain(false);
      }
    };

    checkApprovalChain();
  }, [leavePolicyId, formData.startDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    const selectedType = leaveTypes.find(t => t.id === value);
    setFormData(prev => ({
      ...prev,
      leaveTypeId: value,
      leaveTypeName: selectedType?.name || ''
    }));
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();

  const fetchApprovalWorkflow = async (request: RecentRequest) => {
    if (!request.approvalChainId) {
      showToast.error('No approval chain associated with this request');
      return;
    }

    setWorkflowLoading(true);
    try {
      const response = await api.get(`/hrm/leave/v1/Policy/Chain/Step/All/${request.approvalChainId}`);
      let steps = response.data?.data || [];
      if (!Array.isArray(steps) && steps && typeof steps === 'object') {
        steps = Object.values(steps);
      }
      setApprovalSteps(steps);
      setShowWorkflowModal(true);
    } catch (error: any) {
      console.error('Error fetching workflow:', error);
      showToast.error(error?.message || 'Failed to load approval workflow');
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.leaveTypeId) {
      showToast.error('Please select a leave type');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      showToast.error('Please select start and end dates');
      return;
    }
    if (!formData.comments.trim()) {
      showToast.error('Please provide a reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: any = {
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isHalfDay: false,
        comments: formData.comments,
      };

      if (activeChain) {
        requestData.approvalChainId = activeChain.id;
        const { listByChain } = leaveAppStepServices(activeChain.id);
        await listByChain.refetch();
        const steps = listByChain.data || [];
        const firstStep = steps.sort((a, b) => (a.StepOrder || 0) - (b.StepOrder || 0))[0];
        if (firstStep) {
          requestData.currentStepId = firstStep.Id || firstStep.id;
          requestData.currentStepOrder = firstStep.StepOrder;
        }
      }

      await leaveApi.addLeaveRequest(requestData);

      // Send notifications
      if (employeeId) {
        try {
          const managers = await getManagersForEmployee(employeeId);
          if (managers.length > 0) {
            await notifyLeaveRequestSubmitted(
                employeeId,
                currentUserName || 'Employee',
                formData.leaveTypeName || 'Leave',
                totalDays,
                formData.startDate,
                formData.endDate,
                managers
            );
          }
        } catch (notifError) {
          console.error('Error sending notifications:', notifError);
        }
      }

      const message = activeChain
          ? 'Leave request submitted for approval workflow!'
          : 'Leave request submitted successfully!';

      showToast.success(message);
      setFormData({ leaveTypeId: "", leaveTypeName: "", startDate: "", endDate: "", comments: "" });
      await fetchRecentRequests();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      showToast.error(error.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string, currentStep?: number, totalSteps?: number) => {
    if (status === 'Approved') {
      return <Badge className="bg-green-100 text-green-700 border-0"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    }
    if (status === 'Rejected') {
      return <Badge className="bg-red-100 text-red-700 border-0"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    if (currentStep && totalSteps && totalSteps > 0) {
      return (
          <div className="flex flex-col gap-1">
            <Badge className="bg-purple-100 text-purple-700 border-0">
              <Clock className="w-3 h-3 mr-1" />Step {currentStep} of {totalSteps}
            </Badge>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-purple-600 h-1 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
            </div>
          </div>
      );
    }
    return <Badge className="bg-yellow-100 text-yellow-700 border-0"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  const WorkflowModalComponent = () => {
    const currentStepOrder = selectedRequest?.currentStepOrder || 1;
    const requestStatus = selectedRequest?.statusStr || 'Pending';

    const getStepStatus = (stepOrder: number) => {
      if (requestStatus === 'Rejected') {
        if (stepOrder === currentStepOrder) return 'rejected';
        if (stepOrder < currentStepOrder) return 'completed';
        return 'pending';
      }
      if (requestStatus === 'Approved') return 'completed';
      if (stepOrder < currentStepOrder) return 'completed';
      if (stepOrder === currentStepOrder) return 'current';
      return 'pending';
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full"><GitBranch className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h2 className="text-lg font-semibold">Approval Workflow</h2>
                  <p className="text-xs text-gray-500">
                    {requestStatus === 'Rejected'
                        ? `Request rejected at step ${currentStepOrder}`
                        : requestStatus === 'Approved'
                            ? 'Request fully approved'
                            : 'Your request approval process'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowWorkflowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {workflowLoading ? (
                  <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" /><p>Loading workflow...</p></div>
              ) : approvalSteps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500"><AlertCircle className="w-12 h-12 mx-auto mb-3" /><p>No approval steps configured</p></div>
              ) : (
                  <div className="relative">
                    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">
                                            {requestStatus === 'Rejected' ? 'Rejected at:' : 'Progress:'}
                                        </span>
                        <span className={`text-sm font-semibold ${requestStatus === 'Rejected' ? 'text-red-600' : 'text-purple-600'}`}>
                                            {requestStatus === 'Rejected'
                                                ? `Step ${currentStepOrder} of ${approvalSteps.length}`
                                                : requestStatus === 'Approved'
                                                    ? 'Completed'
                                                    : `Step ${currentStepOrder} of ${approvalSteps.length}`}
                                        </span>
                      </div>
                      {requestStatus !== 'Rejected' && requestStatus !== 'Approved' && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(currentStepOrder / approvalSteps.length) * 100}%` }} />
                          </div>
                      )}
                      {requestStatus === 'Rejected' && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(currentStepOrder / approvalSteps.length) * 100}%` }} />
                          </div>
                      )}
                    </div>

                    {approvalSteps
                        .sort((a, b) => (a.StepOrder || a.stepOrder || 0) - (b.StepOrder || b.stepOrder || 0))
                        .map((step, index) => {
                          const stepOrder = step.StepOrder || step.stepOrder || 0;
                          const stepName = step.StepName || step.stepName || 'Unnamed Step';
                          const roleStr = step.RoleStr || step.roleStr || step.Role || step.role || 'Not Assigned';
                          const employee = step.Employee || step.employee;

                          const stepStatus = getStepStatus(stepOrder);

                          let statusText = '';
                          let bgColor = '';
                          let borderColor = '';
                          let icon = null;

                          if (stepStatus === 'completed') {
                            statusText = 'Completed';
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-200';
                            icon = <CheckCircle className="w-4 h-4 text-green-500" />;
                          } else if (stepStatus === 'current') {
                            statusText = 'Current';
                            bgColor = 'bg-purple-50';
                            borderColor = 'border-purple-200';
                            icon = <Clock className="w-4 h-4 text-purple-500" />;
                          } else if (stepStatus === 'rejected') {
                            statusText = 'Rejected';
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-200';
                            icon = <XCircle className="w-4 h-4 text-red-500" />;
                          } else {
                            statusText = 'Pending';
                            bgColor = 'bg-gray-50';
                            borderColor = 'border-gray-200';
                            icon = null;
                          }

                          return (
                              <div key={step.Id || step.id || index} className="flex items-start gap-4 mb-6">
                                <div className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                      stepStatus === 'completed' ? 'bg-green-500 text-white' :
                                          stepStatus === 'current' ? 'bg-purple-600 text-white ring-2 ring-purple-300' :
                                              stepStatus === 'rejected' ? 'bg-red-500 text-white' :
                                                  'bg-gray-200 text-gray-600'
                                  }`}>
                                    {stepStatus === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                                        stepStatus === 'rejected' ? <XCircle className="w-4 h-4" /> :
                                            stepOrder}
                                  </div>
                                  {index < approvalSteps.length - 1 && (
                                      <div className={`w-0.5 h-12 mt-1 ${stepStatus === 'completed' ? 'bg-green-400' : stepStatus === 'current' ? 'bg-purple-300' : stepStatus === 'rejected' ? 'bg-red-300' : 'bg-gray-300'}`} />
                                  )}
                                </div>
                                <div className={`flex-1 p-3 rounded-lg border ${bgColor} ${borderColor}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-gray-900">{stepName}</h3>
                                      {icon}
                                    </div>
                                    <Badge className={`${stepStatus === 'completed' ? 'bg-green-100 text-green-700' : stepStatus === 'current' ? 'bg-purple-100 text-purple-700' : stepStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'} border-0`}>
                                      {statusText}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <Users className="w-3 h-3" />
                                    <span>Reviewer: {roleStr}</span>
                                  </div>
                                  {employee && (
                                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                        <User className="w-3 h-3" />
                                        <span>Specific Approver: {employee}</span>
                                      </div>
                                  )}
                                  {stepStatus === 'current' && requestStatus !== 'Rejected' && (
                                      <div className="mt-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
                                        ⏳ Waiting for {roleStr} to review
                                      </div>
                                  )}
                                  {stepStatus === 'rejected' && (
                                      <div className="mt-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded inline-block">
                                        ❌ Rejected by {roleStr}
                                      </div>
                                  )}
                                </div>
                              </div>
                          );
                        })}
                  </div>
              )}
            </div>
            <div className="border-t px-6 py-4 bg-gray-50"><Button onClick={() => setShowWorkflowModal(false)} className="w-full">Close</Button></div>
          </motion.div>
        </div>
    );
  };

  const DetailModalComponent = () => {
    if (!selectedRequest) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full"><FileText className="w-5 h-5 text-blue-600" /></div>
                <div><h2 className="text-lg font-semibold">Request Details</h2><p className="text-xs text-gray-500">{selectedRequest.leaveType}</p></div>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Start Date</p><p className="text-sm font-medium">{formatDate(selectedRequest.startDate)}</p></div>
                <div><p className="text-xs text-gray-500">End Date</p><p className="text-sm font-medium">{formatDate(selectedRequest.endDate)}</p></div>
              </div>
              <div><p className="text-xs text-gray-500">Duration</p><p className="text-sm font-medium">{selectedRequest.daysRequestedStr}</p></div>
              <div><p className="text-xs text-gray-500">Status</p>{getStatusBadge(selectedRequest.statusStr, selectedRequest.currentStepOrder, selectedRequest.totalSteps)}</div>
              {selectedRequest.statusStr === 'Pending' && selectedRequest.currentStepOrder && selectedRequest.totalSteps && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-1">Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(selectedRequest.currentStepOrder / selectedRequest.totalSteps) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Step {selectedRequest.currentStepOrder} of {selectedRequest.totalSteps}</p>
                  </div>
              )}
              <div className="pt-4 border-t"><Button onClick={() => setDetailModalOpen(false)} className="w-full">Close</Button></div>
            </div>
          </motion.div>
        </div>
    );
  };

  if (loadingTypes) {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border">
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>
        </div>
    );
  }

  return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">New Leave Request</h2>

        {/* Recent Requests Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Recent Requests</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchRecentRequests} disabled={loadingRecent} className="h-7 px-2">
              <RefreshCw className={`w-3 h-3 ${loadingRecent ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loadingRecent ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : recentRequests.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500">No recent leave requests</p>
                <p className="text-xs text-gray-400 mt-1">Submit a request to see it here</p>
              </div>
          ) : (
              <div className="space-y-2">
                {recentRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-medium text-gray-800">{request.leaveType}</span>
                            <span className="text-xs text-gray-400">{request.daysRequestedStr}</span>
                            {getStatusBadge(request.statusStr, request.currentStepOrder, request.totalSteps)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </div>
                          {request.statusStr === 'Pending' && request.currentStepOrder && request.totalSteps && (
                              <div className="mt-2 w-full max-w-[200px]">
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-gray-500">Progress</span>
                                  <span className="text-purple-600">{Math.round((request.currentStepOrder / request.totalSteps) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(request.currentStepOrder / request.totalSteps) * 100}%` }} />
                                </div>
                              </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                              onClick={() => { setSelectedRequest(request); setDetailModalOpen(true); }}
                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {request.statusStr === 'Pending' && request.currentStepOrder && request.currentStepOrder > 0 && (
                              <button
                                  onClick={() => fetchApprovalWorkflow(request)}
                                  className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View Workflow"
                              >
                                <GitBranch className="w-4 h-4" />
                              </button>
                          )}
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* Approval Chain Status */}
        {leavePolicyId && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Approval Workflow</span>
              </div>
              {checkingApprovalChain ? (
                  <div className="flex items-center gap-2 mt-1"><Loader2 className="w-3 h-3 animate-spin text-blue-600" /><span className="text-xs text-blue-600">Checking approval chain...</span></div>
              ) : activeChain ? (
                  <div className="mt-1">
                    <p className="text-xs text-blue-700">Active from: {new Date(activeChain.effectiveFrom).toLocaleDateString()}</p>
                    <p className="text-xs text-green-600 mt-1">✓ Your request will go through the approval workflow</p>
                  </div>
              ) : (
                  <p className="text-xs text-amber-600 mt-1">⚠️ No active approval chain found. Request will be submitted as pending.</p>
              )}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Leave Type <span className="text-red-500">*</span></label>
            <Select onValueChange={handleSelectChange} value={formData.leaveTypeId}>
              <SelectTrigger className="cursor-pointer w-full"><SelectValue placeholder="Select leave type" /></SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (<SelectItem key={type.id} value={type.id} className="cursor-pointer">{type.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} required className="pl-9 focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || new Date().toISOString().split('T')[0]} required className="pl-9 focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
            {formData.startDate && formData.endDate && (<p className="text-sm text-gray-500 mt-1">Total: <span className="font-semibold text-emerald-600">{totalDays}</span> day(s)</p>)}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Reason <span className="text-red-500">*</span></label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea name="comments" value={formData.comments} onChange={handleChange} placeholder="Please explain the reason for your leave..." className="pl-9 resize-none min-h-[100px] focus:ring-2 focus:ring-emerald-500" required />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</>) : ('Submit Request')}
            </Button>
            {onCancel && (<Button type="button" variant="outline" onClick={onCancel} className="flex-1 cursor-pointer" disabled={isSubmitting}>Cancel</Button>)}
          </div>
        </form>

        {/* Workflow Modal */}
        {showWorkflowModal && <WorkflowModalComponent />}

        {/* Detail Modal */}
        {detailModalOpen && <DetailModalComponent />}
      </div>
  );
};

export default LeaveRequestForm;