import React from "react";
import { motion } from "framer-motion";
import { X, Eye, Building2, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { DeptListDto } from "@/modules/core/types/dept";

interface ViewDeptModalProps {
  selectedDepartment: DeptListDto | null;
  onClose: () => void;
  getStatusColor: (status: string) => string;
}

const ViewDeptModal: React.FC<ViewDeptModalProps> = ({
                                                       selectedDepartment,
                                                       onClose,
                                                       getStatusColor,
                                                     }) => {
  if (!selectedDepartment) return null;

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Department Details
              </h2>
            </div>
            <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Department Name */}
            <div className="text-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {selectedDepartment.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedDepartment.nameAm}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Branch</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {selectedDepartment.branch}
              </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(selectedDepartment.deptStat)}`}>
                {selectedDepartment.deptStatStr}
              </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Contact Person</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedDepartment.managerName || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Phone</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedDepartment.phone || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedDepartment.email || '—'}
                </span>
              </div>
              <div className="py-2">
                <span className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Description</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedDepartment.description || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-center">
              <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-5 h-8 text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default ViewDeptModal;