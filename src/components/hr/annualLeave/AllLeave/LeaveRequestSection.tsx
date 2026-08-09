import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircleIcon } from "lucide-react";
import AllLeaveRequestTable, { type LeaveRequest } from "./LeaveRequestTable";
import LeaveRequestHeader from "./LeaveRequestHeader";
import { showToast } from "../../../../layout/layout";
import ReviewLeaveRequestModal from "./ReviewLeaveRequestModal";
import LeaveRequestDetailModal from "./LeaveRequestDetailModal";
import { api } from "../../../../services/api";
import { leaveApi } from "../../../../services/hr/leave/leave.api";

// -------- SAMPLE DATA --------
const SAMPLE_DATA: LeaveRequest[] = [
  {
    id: "1",
    employee: { id: "e1", fullName: "Abel Tesfaye", employeeCode: "EMP001" },
    leaveType: "Annual Leave",
    startDate: "2025-02-10",
    endDate: "2025-02-14",
    dateRequested: "2025-01-20",
    duration: 5,
    isHalfDay: false,
    fiscalYear: "2025/26",
    appStep: 3,
  },
  {
    id: "2",
    employee: { id: "e2", fullName: "Sara Mekonnen", employeeCode: "EMP002" },
    leaveType: "Sick Leave",
    startDate: "2025-02-03",
    endDate: "2025-02-03",
    dateRequested: "2025-01-20",
    duration: 1,
    isHalfDay: true,
    fiscalYear: "2025/26",
    appStep: 3,
  },
];

const ITEMS_PER_PAGE = 10;

const LeaveRequestSection = () => {
  const [data, setData] = useState<LeaveRequest[]>(SAMPLE_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [approvalSteps, setApprovalSteps] = useState<any[]>([]);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [selectedWorkflowRequest, setSelectedWorkflowRequest] = useState<LeaveRequest | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Fetch approval steps for workflow
  const fetchApprovalWorkflow = async (request: LeaveRequest) => {
    const chainId = (request as any).approvalChainId;
    if (!chainId) {
      showToast.error('No approval chain associated with this request');
      return;
    }

    setWorkflowLoading(true);
    try {
      const response = await api.get(`/hrm/leave/v1/Policy/Chain/Step/All/${chainId}`);
      let steps = response.data?.data || [];
      if (!Array.isArray(steps) && steps && typeof steps === 'object') {
        steps = Object.values(steps);
      }
      setApprovalSteps(steps);
      setSelectedWorkflowRequest(request);
      setShowWorkflowModal(true);
    } catch (error: any) {
      console.error('Error fetching workflow:', error);
      showToast.error(error?.message || 'Failed to load approval workflow');
    } finally {
      setWorkflowLoading(false);
    }
  };

  // ---------------- FILTER ----------------
  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return data.filter(
        (row) =>
            row.employee.fullName.toLowerCase().includes(search) ||
            row.employee.employeeCode?.toLowerCase().includes(search) ||
            row.leaveType.toLowerCase().includes(search) ||
            row.fiscalYear.toLowerCase().includes(search),
    );
  }, [data, searchTerm]);

  // ---------------- PAGINATION ----------------
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
  );

  // ---------------- ACTION HANDLERS ----------------
  const handleApprove = (row: LeaveRequest, comment: string) => {
    setData((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "Approved" } : r)),
    );
    showToast.success(`Approved: ${row.employee.fullName}`);
  };

  const handleReject = (row: LeaveRequest, comment: string) => {
    setData((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "Rejected" } : r)),
    );
    showToast.error(`Rejected: ${row.employee.fullName}`);
  };

  const handleReview = (row: LeaveRequest) => {
    setSelectedRequest(row);
    setReviewOpen(true);
  };

  const handleView = (row: LeaveRequest) => {
    setSelectedRequest(row);
    setDetailOpen(true);
  };

  const handleViewWorkflow = (row: LeaveRequest) => {
    fetchApprovalWorkflow(row);
  };

  // Workflow Modal Component
  const WorkflowModal = () => {
    if (!showWorkflowModal || !selectedWorkflowRequest) return null;

    const currentStepOrder = (selectedWorkflowRequest as any).currentStepOrder || 1;
    const totalSteps = approvalSteps.length;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-purple-50">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-purple-600" />
                <div>
                  <h2 className="text-lg font-semibold">Approval Workflow</h2>
                  <p className="text-xs text-gray-500">Step-by-step approval process</p>
                </div>
              </div>
              <button onClick={() => setShowWorkflowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
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
                        <span className="text-sm font-medium text-gray-700">Progress:</span>
                        <span className="text-sm font-semibold text-purple-600">Step {currentStepOrder} of {totalSteps}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(currentStepOrder / totalSteps) * 100}%` }} />
                      </div>
                    </div>
                    {approvalSteps.map((step, index) => {
                      const stepOrder = step.StepOrder || 0;
                      const stepName = step.StepName || '';
                      const roleStr = step.RoleStr || step.Role || '';
                      const isPastStep = stepOrder < currentStepOrder;
                      const isCurrentStep = stepOrder === currentStepOrder;

                      return (
                          <div key={index} className="flex items-start gap-4 mb-6">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                  isPastStep ? 'bg-green-500 text-white' : isCurrentStep ? 'bg-purple-600 text-white ring-2 ring-purple-300' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {isPastStep ? <CheckCircle className="w-4 h-4" /> : stepOrder}
                              </div>
                              {index < approvalSteps.length - 1 && <div className={`w-0.5 h-12 mt-1 ${isPastStep ? 'bg-green-400' : isCurrentStep ? 'bg-purple-300' : 'bg-gray-300'}`} />}
                            </div>
                            <div className={`flex-1 p-3 rounded-lg border ${isCurrentStep ? 'bg-purple-50 border-purple-200' : isPastStep ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">{stepName}</h3>
                                <Badge className={`${isPastStep ? 'bg-green-100 text-green-700' : isCurrentStep ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'} border-0`}>
                                  {isPastStep ? 'Completed' : isCurrentStep ? 'Current' : 'Pending'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <Users className="w-3 h-3" />
                                <span>Reviewer: {roleStr}</span>
                              </div>
                              {isCurrentStep && (
                                  <div className="mt-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
                                    ⏳ Waiting for {roleStr} to review
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

  return (
      <div className="space-y-6">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <LeaveRequestHeader />
        </motion.div>

        {totalItems === 0 && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-50 to-red-100 border-l-4 border-yellow-500 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <h3 className="text-yellow-800 font-medium">No Leave Requests Found</h3>
                  <p className="text-yellow-700 text-sm mt-1">No leave requests match your search criteria.</p>
                </div>
              </div>
            </motion.div>
        )}

        {totalItems > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
              <AllLeaveRequestTable
                  leaveRequests={paginatedData}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onReview={handleReview}
                  onView={handleView}
                  onViewWorkflow={handleViewWorkflow}
              />

              <ReviewLeaveRequestModal
                  isOpen={reviewOpen}
                  onClose={() => setReviewOpen(false)}
                  leaveRequest={selectedRequest}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  currentStep={(selectedRequest as any)?.currentStepOrder}
                  totalSteps={(selectedRequest as any)?.totalSteps}
                  isFinalStep={(selectedRequest as any)?.currentStepOrder === (selectedRequest as any)?.totalSteps}
              />
              <LeaveRequestDetailModal
                  isOpen={detailOpen}
                  onClose={() => setDetailOpen(false)}
                  leave={selectedRequest}
              />
            </motion.div>
        )}

        {/* Workflow Modal */}
        <WorkflowModal />
      </div>
  );
};

export default LeaveRequestSection;