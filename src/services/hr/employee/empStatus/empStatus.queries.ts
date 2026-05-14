import { useMutation, useQueryClient } from '@tanstack/react-query';
import { empStatusKeys } from './empStatus.keys';
import { empStateApi } from './empStatus.api';
import type { UUID } from 'crypto';

// ── Terminate Employee ─────────────────────────────────────
export const useTerminateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: UUID) =>
      empStateApi.terminateEmp(employeeId),

    onSuccess: (_, employeeId) => {
      queryClient.invalidateQueries({
        queryKey: empStatusKeys.termEmp(employeeId),
      });

      queryClient.invalidateQueries({
        queryKey: empStatusKeys.all,
      });
    },
  });
};

// ── Stand By Employee ──────────────────────────────────────
export const useStandByEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: UUID) =>
      empStateApi.standByEmp(employeeId),

    onSuccess: (_, employeeId) => {
      queryClient.invalidateQueries({
        queryKey: empStatusKeys.stByEmp(employeeId),
      });

      queryClient.invalidateQueries({
        queryKey: empStatusKeys.all,
      });
    },
  });
};

// ── Suspend Employee ───────────────────────────────────────
export const useSuspendEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: UUID) =>
      empStateApi.suspendEmp(employeeId),

    onSuccess: (_, employeeId) => {
      queryClient.invalidateQueries({
        queryKey: empStatusKeys.susEmp(employeeId),
      });

      queryClient.invalidateQueries({
        queryKey: empStatusKeys.all,
      });
    },
  });
};

// ── Retire Employee ────────────────────────────────────────
export const useRetireEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: UUID) =>
      empStateApi.retireEmp(employeeId),

    onSuccess: (_, employeeId) => {
      queryClient.invalidateQueries({
        queryKey: empStatusKeys.retireEmp(employeeId),
      });

      queryClient.invalidateQueries({
        queryKey: empStatusKeys.all,
      });
    },
  });
};