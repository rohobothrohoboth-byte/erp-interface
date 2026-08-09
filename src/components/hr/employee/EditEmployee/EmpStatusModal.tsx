import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Loader2,
  UserX,
  BedDouble,
  PauseCircle,
  XCircle,
  CheckCircle,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '../../../ui/button';

import {
  useRetireEmployee,
  useStandByEmployee,
  useSuspendEmployee,
  useTerminateEmployee,
} from '../../../../services/hr/employee/empStatus/empStatus.queries';
import type { UUID } from 'crypto';

interface EmpStatusConfirmModalProps {
  action: 'Terminate' | 'Stand By' | 'Suspend' | 'Retire';
  employeeId: UUID;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EmpStatusConfirmModal: React.FC<EmpStatusConfirmModalProps> = ({
                                                                              action,
                                                                              employeeId,
                                                                              open,
                                                                              onClose,
                                                                              onSuccess,
                                                                            }) => {
  const terminateMutation = useTerminateEmployee();
  const standByMutation = useStandByEmployee();
  const suspendMutation = useSuspendEmployee();
  const retireMutation = useRetireEmployee();

  if (!open) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'Terminate':
        return {
          icon: UserX,
          gradient: 'from-red-500 to-rose-600',
          bgGradient: 'from-red-50 to-rose-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonGradient: 'from-red-500 to-rose-600',
          buttonHover: 'hover:from-red-600 hover:to-rose-700',
          title: 'Terminate Employee',
          description: 'This action will permanently terminate the employee record.',
          warning: 'This action cannot be undone.',
        };
      case 'Stand By':
        return {
          icon: BedDouble,
          gradient: 'from-amber-500 to-orange-600',
          bgGradient: 'from-amber-50 to-orange-50',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          buttonGradient: 'from-amber-500 to-orange-600',
          buttonHover: 'hover:from-amber-600 hover:to-orange-700',
          title: 'Stand By Employee',
          description: 'This will place the employee on standby status.',
          warning: 'The employee can be reactivated later.',
        };
      case 'Suspend':
        return {
          icon: PauseCircle,
          gradient: 'from-yellow-500 to-amber-600',
          bgGradient: 'from-yellow-50 to-amber-50',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonGradient: 'from-yellow-500 to-amber-600',
          buttonHover: 'hover:from-yellow-600 hover:to-amber-700',
          title: 'Suspend Employee',
          description: 'This will temporarily suspend the employee.',
          warning: 'Suspension can be reviewed and lifted.',
        };
      case 'Retire':
        return {
          icon: XCircle,
          gradient: 'from-slate-500 to-gray-600',
          bgGradient: 'from-slate-50 to-gray-50',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          buttonGradient: 'from-slate-500 to-gray-600',
          buttonHover: 'hover:from-slate-600 hover:to-gray-700',
          title: 'Retire Employee',
          description: 'This will mark the employee as retired.',
          warning: 'Retirement records are kept for history.',
        };
      default:
        return {
          icon: AlertTriangle,
          gradient: 'from-red-500 to-rose-600',
          bgGradient: 'from-red-50 to-rose-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonGradient: 'from-red-500 to-rose-600',
          buttonHover: 'hover:from-red-600 hover:to-rose-700',
          title: 'Confirm Action',
          description: 'Please confirm this action.',
          warning: 'This action may have consequences.',
        };
    }
  };

  const getMutation = () => {
    switch (action) {
      case 'Terminate': return terminateMutation;
      case 'Stand By': return standByMutation;
      case 'Suspend': return suspendMutation;
      case 'Retire': return retireMutation;
      default: return terminateMutation;
    }
  };

  const mutation = getMutation();
  const config = getActionConfig();
  const IconComponent = config.icon;
  const isLoading = mutation.isPending;

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync(employeeId);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <AnimatePresence>
        {open && (
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
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                {/* Header with Gradient */}
                <div className={`bg-gradient-to-r ${config.gradient} px-6 py-5`}>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white/20 rounded-xl">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{config.title}</h3>
                      <p className="text-sm text-white/80 mt-0.5">{config.description}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Warning</p>
                      <p className="text-sm text-amber-700 mt-0.5">{config.warning}</p>
                    </div>
                  </div>

                  <div className="mt-5 text-center">
                    <p className="text-slate-600">
                      Are you sure you want to <span className="font-semibold text-slate-800">{action.toLowerCase()}</span> this employee?
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Employee ID: {employeeId.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className={`flex-1 bg-gradient-to-r ${config.buttonGradient} ${config.buttonHover} text-white cursor-pointer gap-2`}
                  >
                    {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                    ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Confirm {action}
                        </>
                    )}
                  </Button>
                </div>

                {/* Loading Overlay for Mutation */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">
                    {action.toLowerCase()} employee...
                  </span>
                      </div>
                    </div>
                )}
              </motion.div>
            </div>
        )}
      </AnimatePresence>
  );
};

export default EmpStatusConfirmModal;