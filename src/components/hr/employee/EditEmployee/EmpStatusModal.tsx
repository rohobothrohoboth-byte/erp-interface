import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
}

export const EmpStatusConfirmModal: React.FC<
  EmpStatusConfirmModalProps
> = ({
  action,
  employeeId,
  open,
  onClose,
}) => {
  const terminateMutation = useTerminateEmployee();
  const standByMutation = useStandByEmployee();
  const suspendMutation = useSuspendEmployee();
  const retireMutation = useRetireEmployee();

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      switch (action) {
        case 'Terminate':
          await terminateMutation.mutateAsync(employeeId);
          break;

        case 'Stand By':
          await standByMutation.mutateAsync(employeeId);
          break;

        case 'Suspend':
          await suspendMutation.mutateAsync(employeeId);
          break;

        case 'Retire':
          await retireMutation.mutateAsync(employeeId);
          break;
      }

      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading =
    terminateMutation.isPending ||
    standByMutation.isPending ||
    suspendMutation.isPending ||
    retireMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Body */}
        <div className="flex flex-col items-center text-center gap-4 px-6 py-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>

          <div>
            <p className="text-base font-semibold text-gray-800">
              Are you sure?
            </p>

            <p className="text-sm text-gray-500 mt-1">
              This will{' '}
              <span className="font-medium text-gray-700">
                {action}
              </span>{' '}
              the employee.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3">
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="destructive"
              className="w-28"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Yes'
              )}
            </Button>

            <Button
              variant="outline"
              className="w-28"
              onClick={onClose}
              disabled={isLoading}
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};