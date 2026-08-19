// services/hr/employee/empStatus/empStatus.queries.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { empStatusKeys } from '@/modules/hr/services/employee/empStatus/empStatus.keys';
import { empStateApi } from '@/modules/hr/services/employee/empStatus/empStatus.api';
import type { UUID } from 'crypto';
import type { EmpRevDto } from "@/modules/hr/types/employee/empAddDto";

// ✅ Import dashboard keys to invalidate dashboard
import { dashboardKeys } from "@/modules/hr/services/dashboard/dashboard.key";

// ✅ Import employee keys to invalidate employee list
import { empKeys } from "@/modules/hr/services/employee/emp.keys";

// ── Helper to invalidate all related caches ──────────────
const invalidateAll = async (queryClient: any, employeeId: UUID) => {
  // Invalidate employee status specific queries
  await queryClient.invalidateQueries({
    queryKey: empStatusKeys.termEmp(employeeId),
  });
  await queryClient.invalidateQueries({
    queryKey: empStatusKeys.stByEmp(employeeId),
  });
  await queryClient.invalidateQueries({
    queryKey: empStatusKeys.susEmp(employeeId),
  });
  await queryClient.invalidateQueries({
    queryKey: empStatusKeys.retireEmp(employeeId),
  });
  await queryClient.invalidateQueries({
    queryKey: empStatusKeys.reviewEmp(employeeId),
  });
  await queryClient.invalidateQueries({
    queryKey: empStatusKeys.activateEmp(employeeId),
  });

  // Invalidate all status queries
  await queryClient.invalidateQueries({
    queryKey: empStatusKeys.all,
  });

  // ✅ Invalidate employee list
  await queryClient.invalidateQueries({
    queryKey: empKeys.lists(),
  });

  // ✅ Invalidate dashboard
  await queryClient.invalidateQueries({
    queryKey: dashboardKeys.all,
  });

  // ✅ Invalidate employee details if it was cached
  await queryClient.invalidateQueries({
    queryKey: empKeys.detail(employeeId),
  });

  // ✅ Invalidate pending employees
  await queryClient.invalidateQueries({
    queryKey: dashboardKeys.pending(),
  });

  // ✅ Invalidate pending education/experience
  await queryClient.invalidateQueries({
    queryKey: dashboardKeys.pendingEdu(),
  });
};

// ── Review Employee ────────────────────────────────────────
export const useReviewEmp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: UUID; data: EmpRevDto }) =>
        empStateApi.reviewEmp(employeeId, data),
    onSuccess: (_, { employeeId }) => {
      invalidateAll(queryClient, employeeId);
    },
    onError: (error: any) => {
      console.error('Review employee error:', error);
    },
  });
};

// ── Terminate Employee ─────────────────────────────────────
export const useTerminateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: UUID) =>
        empStateApi.terminateEmp(employeeId),

    onSuccess: (_, employeeId) => {
      invalidateAll(queryClient, employeeId);
    },
    onError: (error: any) => {
      console.error('Terminate employee error:', error);
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
      invalidateAll(queryClient, employeeId);
    },
    onError: (error: any) => {
      console.error('Standby employee error:', error);
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
      invalidateAll(queryClient, employeeId);
    },
    onError: (error: any) => {
      console.error('Suspend employee error:', error);
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
      invalidateAll(queryClient, employeeId);
    },
    onError: (error: any) => {
      console.error('Retire employee error:', error);
    },
  });
};

// ── Activate Employee ──────────────────────────────────────
export const useActivateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: UUID) =>
        empStateApi.activateEmp(employeeId),

    onSuccess: (_, employeeId) => {
      invalidateAll(queryClient, employeeId);
    },
    onError: (error: any) => {
      console.error('Activate employee error:', error);
    },
  });
};