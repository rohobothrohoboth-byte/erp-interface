import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Trash2,
  X,
  User,
  Briefcase,
  Building2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

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
  status?: "active" | "on-leave";
  employmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface DeleteEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (employeeId: string) => void;
  isDeleting?: boolean;
}

const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
                                                                   employee,
                                                                   isOpen,
                                                                   onClose,
                                                                   onConfirm,
                                                                   isDeleting = false,
                                                                 }) => {
  if (!employee) return null;

  const handleConfirm = () => {
    onConfirm(employee.id);
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const infoCardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.1 } }
  };

  return (
      <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-md"
                  onClick={onClose}
              />

              {/* Modal */}
              <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                {/* Header with gradient accent */}
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600" />
                  <div className="flex items-center justify-between p-6 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-xl">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Delete Employee
                      </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                  {/* Warning Section */}
                  <motion.div
                      variants={infoCardVariants}
                      className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-amber-100 rounded-full">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-800 mb-1">
                          Warning: This action cannot be undone
                        </h3>
                        <p className="text-sm text-amber-700">
                          Deleting this employee will permanently remove all associated data including attendance, salary records, and performance history.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Employee Information Card */}
                  <motion.div
                      variants={infoCardVariants}
                      className="mb-6 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                          {employee.empFullName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {employee.empFullName}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {employee.code}</p>
                        </div>
                        {employee.status && (
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                employee.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                            }`}>
                        {employee.status === "active" ? "Active" : "On Leave"}
                      </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{employee.position || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{employee.department || "—"}</span>
                        </div>
                      </div>

                      {employee.branch && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-4" /> {/* Spacer for alignment */}
                            <span className="text-gray-500">Branch: {employee.branch}</span>
                          </div>
                      )}

                      {employee.employmentDate && (
                          <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">
                        Employed since: {new Date(employee.employmentDate).toLocaleDateString()}
                      </span>
                          </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Additional Warning */}
                  <motion.div
                      variants={infoCardVariants}
                      className="mb-6 p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <p className="text-xs text-red-700 text-center">
                      ⚠️ This action is irreversible. Please confirm before proceeding.
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                      variants={infoCardVariants}
                      className="flex gap-3"
                  >
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="flex-1 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                      ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Yes, Delete Employee
                          </>
                      )}
                    </Button>
                    <Button
                        onClick={onClose}
                        disabled={isDeleting}
                        variant="outline"
                        className="flex-1 cursor-pointer px-6 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl text-gray-700 font-medium transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
        )}
      </AnimatePresence>
  );
};

export default DeleteEmployeeModal;