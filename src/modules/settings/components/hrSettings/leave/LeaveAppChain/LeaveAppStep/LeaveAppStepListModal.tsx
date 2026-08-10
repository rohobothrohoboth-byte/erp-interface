import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Edit, Trash2, List, AlertTriangle, User, Shield } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import toast from "react-hot-toast";
import type {
  LeaveAppStepListDto,
  LeaveAppStepModDto,
  UUID,
} from "@/modules/core/types/Settings/leaveAppStep";
import { ApprovalRole } from "@/modules/core/types/enum";
import type { NameListDto } from "@/modules/hr/types/NameListDto";
import EditLeaveAppStepModal from "@/modules/settings/components/hrSettings/leave/LeaveAppChain/LeaveAppStep/EditLeaveAppStepModal";

interface LeaveAppStepListModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: LeaveAppStepListDto[];
  onUpdateStep: (stepData: LeaveAppStepModDto) => Promise<any>;
  onDeleteStep: (stepId: UUID) => Promise<any>;
  employees: NameListDto[];
  loading: boolean;
}

const LeaveAppStepListModal: React.FC<LeaveAppStepListModalProps> = ({
                                                                       isOpen,
                                                                       onClose,
                                                                       steps,
                                                                       onUpdateStep,
                                                                       onDeleteStep,
                                                                       employees,
                                                                       loading,
                                                                     }) => {
  const [editingStep, setEditingStep] = useState<LeaveAppStepListDto | null>(null);
  const [deletingStepId, setDeletingStepId] = useState<UUID | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getRoleColor = (role: ApprovalRole) => {
    switch (role) {
      case ApprovalRole["0"]:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case ApprovalRole["1"]:
        return "bg-purple-100 text-purple-700 border-purple-200";
      case ApprovalRole["2"]:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRoleIcon = (role: ApprovalRole) => {
    switch (role) {
      case ApprovalRole["0"]:
        return <Shield size={12} />;
      case ApprovalRole["1"]:
        return <User size={12} />;
      default:
        return <User size={12} />;
    }
  };

  const handleEdit = (step: LeaveAppStepListDto) => {
    setEditingStep(step);
  };

  const handleDelete = (stepId: UUID) => {
    setDeletingStepId(stepId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingStepId) return;
    try {
      await onDeleteStep(deletingStepId);
      toast.success("Approval step deleted successfully");
      setShowDeleteConfirm(false);
      setDeletingStepId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete approval step");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingStepId(null);
  };

  const handleUpdateStep = async (stepData: LeaveAppStepModDto) => {
    try {
      await onUpdateStep(stepData);
      toast.success("Approval step updated successfully");
      setEditingStep(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update approval step");
    }
  };

  if (!isOpen) return null;

  return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100">
                  <List size={16} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Approval Steps</h2>
                <Badge variant="outline" className="bg-white">
                  {steps.length} {steps.length === 1 ? "Step" : "Steps"}
                </Badge>
              </div>
              <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
              ) : steps.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <List size={20} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No approval steps</p>
                    <p className="text-gray-400 text-sm">Add steps to create an approval workflow</p>
                  </div>
              ) : (
                  <div className="space-y-2">
                    {steps
                        .sort((a, b) => a.stepOrder - b.stepOrder)
                        .map((step, index) => (
                            <div
                                key={step.id}
                                className="group bg-white border border-gray-200 hover:border-purple-200 rounded-lg p-3 transition-all duration-200 hover:shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                {/* Step Number */}
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
                                  {step.stepOrder}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-9 w-9 border border-gray-200">
                                  <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                    {step.employee
                                        ? step.employee
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)
                                        : "UN"}
                                  </AvatarFallback>
                                </Avatar>

                                {/* Step Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-medium text-gray-900 text-sm">
                                      {step.stepName}
                                    </h3>
                                    {step.isFinal && (
                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                                          Final Step
                                        </Badge>
                                    )}
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${getRoleColor(
                                            ApprovalRole[step.role as keyof typeof ApprovalRole]
                                        )}`}
                                    >
                              <span className="flex items-center gap-1">
                                {getRoleIcon(ApprovalRole[step.role as keyof typeof ApprovalRole])}
                                {ApprovalRole[step.role as keyof typeof ApprovalRole]}
                              </span>
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {step.employee || "No specific person assigned"}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                      onClick={() => handleEdit(step)}
                                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                                      title="Edit step"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                      onClick={() => handleDelete(step.id)}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                      title="Delete step"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Connection line between steps */}
                              {index < steps.length - 1 && (
                                  <div className="flex justify-center mt-2">
                                    <div className="w-px h-2 bg-gray-200"></div>
                                  </div>
                              )}
                            </div>
                        ))}
                  </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-4 py-3 bg-gray-50">
              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose} className="px-5">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-xl w-full max-w-md"
              >
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete Approval Step?
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone. The approval step will be permanently removed.
                  </p>
                </div>
                <div className="border-t px-6 py-4 flex justify-end gap-3">
                  <Button variant="outline" onClick={cancelDelete}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Delete Step
                  </Button>
                </div>
              </motion.div>
            </div>
        )}

        {/* Edit Modal */}
        {editingStep && (
            <EditLeaveAppStepModal
                isOpen={!!editingStep}
                onClose={() => setEditingStep(null)}
                onUpdateStep={handleUpdateStep}
                step={editingStep}
                employees={employees}
            />
        )}
      </>
  );
};

export default LeaveAppStepListModal;