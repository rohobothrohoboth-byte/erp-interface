// components/hr/employee/PendingEmployee/ReviewModal.tsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  ExternalLink,
  User,
  Building2,
  Briefcase,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react";
// ✅ FIX: Import from the correct path
import { ReviewDecision } from "../../../../types/hr/enum";
import { Button } from "../../../ui/button";
import type { EmpDbPendList } from "../../../../types/hr/dashboard";
import { employeeReviewApi } from "../../../../services/hr/employee/employeeReview.api";
import toast from "react-hot-toast";
import { useLanguage } from "../../../../i18n/LanguageContext";

interface ReviewModalProps {
  employee: EmpDbPendList;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewModal({ employee, onClose, onSuccess }: ReviewModalProps) {
  const { t } = useLanguage();
  const [decision, setDecision] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');

  // ✅ Check for employee.id
  const employeeId = employee?.id || employee?.employeeId || '';

  console.log('ReviewModal employee data:', employee);
  console.log('Employee ID being used:', employeeId);

  // ✅ Get employee name safely
  const getEmployeeName = () => {
    return employee?.empFullName || employee?.fullName || employee?.name || 'Unnamed Employee';
  };

  // ✅ Get employee code safely
  const getEmployeeCode = () => {
    return employee?.code || employee?.employeeCode || 'N/A';
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
      console.log('Reviewing employee:', {
        id: employee.id,
        name: getEmployeeName(),
        decision: decision
      });

      const result = await employeeReviewApi.reviewEmployee(employee.id, decision as 'Accept' | 'Reject', remarks);

      console.log('Review result:', result);

      if (decision === ReviewDecision.Accept) {
        toast.success(t.employeeApproved || `✅ ${getEmployeeName()} has been APPROVED and status changed to Active!`);
      } else {
        toast.success(t.employeeRejected || `❌ ${getEmployeeName()} has been REJECTED.`);
      }

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Review error details:', error);

      let errorMessage = 'Failed to review employee';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Get decision config with correct imports
  const getDecisionConfig = (value: string) => {
    // Use the imported ReviewDecision enum
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

  const currentConfig = decision ? getDecisionConfig(decision) : null;

  return (
      <AnimatePresence>
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
        >
          <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{t.reviewEmployee || "Review Employee Application"}</h2>
                  <p className="text-sm text-white/80 mt-0.5">{t.reviewAndMakeDecision || "Review and make a decision"}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Employee Summary */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-md opacity-30" />
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      {getEmployeeName()}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.id || "ID"}: {getEmployeeCode()}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {employee.department && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                        <Building2 className="w-3 h-3" />
                            {employee.department}
                      </span>
                      )}
                      {employee.position && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                        <Briefcase className="w-3 h-3" />
                            {employee.position}
                      </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  {employee.branch && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span>{employee.branch}</span>
                      </div>
                  )}
                  {employee.jobGrade && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{t.grade || "Grade"}: {employee.jobGrade}</span>
                      </div>
                  )}
                </div>
              </div>

              {/* View Full Details Link */}
              <a
                  href={`/hr/employees/${employee.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800 hover:shadow-md transition-all group"
              >
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">{t.employeeDetails || "Employee Details"}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">{t.viewFullProfileBeforeDeciding || "View full profile before deciding"}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Decision Section */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 block">
                  {t.decision || "Decision"}
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
                          {value === ReviewDecision.Accept ? (t.accept || "Accept") : (t.reject || "Reject")}
                        </span>
                          </div>
                        </label>
                    );
                  })}
                </div>
              </div>

              {/* Remarks */}
              {decision && (
                  <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                      {t.remarks || "Remarks (Optional)"}
                    </label>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder={t.addRemarks || "Add any additional comments..."}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        rows={3}
                        disabled={isSubmitting}
                    />
                  </motion.div>
              )}

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
                              ? (t.approveImpact || "This will approve the employee record and change status to Active.")
                              : (t.rejectImpact || "This will reject the employee application. The employee will be notified.")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
              <Button
                  onClick={onClose}
                  variant="outline"
                  className="cursor-pointer px-5"
                  disabled={isSubmitting}
              >
                {t.cancel || "Cancel"}
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
                      {t.processing || "Processing..."}
                    </>
                ) : (
                    <>
                      {decision === ReviewDecision.Accept ? (
                          <CheckCircle className="w-4 h-4" />
                      ) : (
                          <XCircle className="w-4 h-4" />
                      )}
                      {t.submit || "Submit"} {decision === ReviewDecision.Accept ? (t.approve || "Approve") : (t.reject || "Reject")}
                    </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
  );
}