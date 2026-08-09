import { useState } from "react";
import { motion } from "framer-motion";
import { X, MessageSquare, Send, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import type { LeaveRequest } from "./LeaveRequestTable";
import { showToast } from "../../../../layout/layout";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequest | null;
  onApprove: (row: LeaveRequest, comment: string) => void;
  onReject: (row: LeaveRequest, comment: string) => void;
  currentStep?: number;
  totalSteps?: number;
  isFinalStep?: boolean;
}

type ActionType = "approve" | "reject" | "";

const ReviewLeaveRequestModal: React.FC<Props> = ({
                                                    isOpen,
                                                    onClose,
                                                    leaveRequest,
                                                    onApprove,
                                                    onReject,
                                                    currentStep,
                                                    totalSteps,
                                                    isFinalStep,
                                                  }) => {
  const [comment, setComment] = useState("");
  const [action, setAction] = useState<ActionType>("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !leaveRequest) return null;

  const handleSubmit = async () => {
    if (!action) {
      showToast.error("Please select an action");
      return;
    }

    if (!comment.trim()) {
      showToast.error("Please add a comment");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    if (action === "approve") {
      onApprove(leaveRequest, comment);
      showToast.success(isFinalStep ? "Request fully approved!" : "Step approved! Moving to next step...");
    } else {
      onReject(leaveRequest, comment);
      showToast.error("Request rejected");
    }

    setComment("");
    setAction("");
    setLoading(false);
    onClose();
  };

  const getActionDescription = () => {
    if (action === "approve") {
      if (isFinalStep) {
        return "This is the final step. Approval will complete the request and deduct leave balance.";
      }
      return `This will approve step ${currentStep || 1} and move to step ${(currentStep || 1) + 1}.`;
    }
    if (action === "reject") {
      return "This will reject the entire leave request.";
    }
    return "";
  };

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              {action === "approve" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
              ) : action === "reject" ? (
                  <XCircle className="w-5 h-5 text-red-600" />
              ) : null}
              <h2 className="text-lg font-semibold text-gray-800">
                {action === "approve" ? "Approve Request" : action === "reject" ? "Reject Request" : "Review Decision"}
              </h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Step Information */}
            {currentStep && totalSteps && (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-800">
                    <strong>Current Step:</strong> {currentStep} of {totalSteps}
                  </p>
                  {isFinalStep && (
                      <p className="text-xs text-purple-600 mt-1">
                        This is the final step. Approval will complete the request.
                      </p>
                  )}
                </div>
            )}

            <div className="space-y-2">
              <Label>Action <span className="text-red-500">*</span></Label>
              <Select value={action} onValueChange={(v) => setAction(v as ActionType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              {action && (
                  <p className="text-xs text-gray-500 mt-1">{getActionDescription()}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Comment <span className="text-red-500">*</span></Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="pl-10 min-h-[100px]"
                    placeholder="Write your comment..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
                onClick={handleSubmit}
                disabled={loading || !action || !comment.trim()}
                className={action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </div>
              ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit {action}
                  </div>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
  );
};

export default ReviewLeaveRequestModal;