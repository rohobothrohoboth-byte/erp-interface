import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Loader2, Shield, XCircle, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/shared/components/ui/button';
import type { UUID } from '@/modules/hr/types/employee';
import { useDeleteAccount } from '@/modules/hr/services/employee/user/user.queries';

interface DeleteAccountModalProps {
  userId?: UUID;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
                                                                        userId,
                                                                        isOpen,
                                                                        onClose,
                                                                        userName,
                                                                        userEmail,
                                                                      }) => {
  const { mutateAsync, isPending } = useDeleteAccount();
  const prefersReducedMotion = useReducedMotion();

  const handleConfirm = async () => {
    if (!userId) {
      toast.error('Invalid user selected');
      return;
    }

    try {
      await mutateAsync(userId);
      toast.success('Account deleted successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to delete account');
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: prefersReducedMotion ? 0.15 : 0.2 } },
    exit: { opacity: 0, transition: { duration: prefersReducedMotion ? 0.15 : 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: prefersReducedMotion ? "tween" : "spring",
        stiffness: 300,
        damping: 25,
        duration: prefersReducedMotion ? 0.2 : 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: prefersReducedMotion ? 0.15 : 0.2 }
    }
  };

  const buttonVariants = {
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  };

  if (!isOpen) return null;

  return (
      <AnimatePresence>
        <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
          <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 px-6 py-4 border-b border-red-100 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Delete Account</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-10" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  This action cannot be undone. The account will be permanently removed from the system.
                </p>

                {/* User Information (if provided) */}
                {(userName || userEmail) && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Account to delete:</p>
                      {userName && (
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{userName}</p>
                      )}
                      {userEmail && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{userEmail}</p>
                      )}
                    </div>
                )}

                {/* Warning Note */}
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 w-full">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="text-left">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                        Consequences of deletion:
                      </p>
                      <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-0.5 list-disc list-inside">
                        <li>User will lose all access to the system</li>
                        <li>All associated data will be removed</li>
                        <li>This action is permanent and irreversible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-center gap-3 bg-slate-50 dark:bg-slate-800/50">
              <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleConfirm}
                  disabled={isPending || !userId}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
  );
};

export default DeleteAccountModal;