import React from "react";
import { motion } from "framer-motion";
import { X, Eye, Building2, MapPin, Calendar, Hash } from "lucide-react";
import type { BranchListDto } from "../../../types/core/branch";
import { Button } from "../../ui/button";

interface ViewBranchModalProps {
  selectedBranch: BranchListDto | null;
  onClose: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getBranchTypeText: (branchType: string) => string;
}

const ViewBranchModal: React.FC<ViewBranchModalProps> = ({
                                                           selectedBranch,
                                                           onClose,
                                                           getStatusColor,
                                                           getStatusText,
                                                           getBranchTypeText,
                                                         }) => {
  if (!selectedBranch) return null;

  return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Branch Details
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
          <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Branch Name */}
            <div className="mb-4 text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {selectedBranch.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedBranch.nameAm}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Branch Code</span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedBranch.code || '—'}
                </p>
              </div>

              {/* Location */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Location</span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedBranch.location || '—'}
                </p>
              </div>

              {/* Type */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Branch Type</span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {getBranchTypeText(selectedBranch.branchType)}
                </p>
              </div>

              {/* Status */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                </div>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedBranch.branchStat)}`}>
                {getStatusText(selectedBranch.branchStat)}
              </span>
              </div>

              {/* Date Opened */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Date Opened</span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedBranch.openDateStr}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedBranch.openDateStrAm}
                </p>
              </div>

              {/* Company */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Company</span>
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {selectedBranch.comp}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedBranch.compAm}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  <span className="font-medium">Created:</span> {selectedBranch.createdAt}
                </div>
                <div>
                  <span className="font-medium">Modified:</span> {selectedBranch.modifiedAt || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <Button
                onClick={onClose}
                variant="outline"
                className="px-5 h-8 text-sm"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
  );
};

export default ViewBranchModal;