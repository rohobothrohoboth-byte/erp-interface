import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Building2, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import type { BranchListDto, UUID } from '../../../types/core/branch';
import { BranchStat } from '../../../types/core/enum';

interface StatBranchModalProps {
  branch: BranchListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (branchId: UUID, newStatus: string) => void;
}

const StatBranchModal: React.FC<StatBranchModalProps> = ({
                                                           branch,
                                                           isOpen,
                                                           onClose,
                                                           onConfirm
                                                         }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (branch) {
      setSelectedStatus(branch.branchStat);
    }
  }, [branch]);

  const getStatusText = (status: string): string => {
    switch (status) {
      case BranchStat.Active: return 'Active';
      case BranchStat.InAct: return 'Inactive';
      case BranchStat.UndCon: return 'Under Construction';
      default: return status;
    }
  };

  const handleConfirm = () => {
    if (branch && selectedStatus && selectedStatus !== branch.branchStat) {
      onConfirm(branch.id, selectedStatus);
      onClose();
    }
  };

  if (!isOpen || !branch) return null;

  const currentStatusText = getStatusText(branch.branchStat);
  const newStatusText = getStatusText(selectedStatus);
  const isChanged = selectedStatus !== branch.branchStat;

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
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Repeat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Change Branch Status
            </h2>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <p className="font-medium text-slate-800 dark:text-slate-200">{branch.name}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{branch.code} • {branch.location}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">Current Status</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {currentStatusText}
              </span>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  New Status
                </label>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value={BranchStat.Active}>Active</option>
                  <option value={BranchStat.InAct}>Inactive</option>
                  <option value={BranchStat.UndCon}>Under Construction</option>
                </select>
              </div>
            </div>

            {isChanged && (
                <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 text-xs">
                  <AlertCircle size={14} />
                  <span>Status will change from {currentStatusText} to {newStatusText}</span>
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-center gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <Button
                onClick={handleConfirm}
                disabled={!isChanged}
                className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 h-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Change
            </Button>
            <Button
                onClick={onClose}
                variant="outline"
                className="px-5 h-8 text-sm"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
  );
};

export default StatBranchModal;