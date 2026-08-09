import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { terminationApi } from './termination.api';
import { terminationKeys } from './termination.keys';
import type { EmpOffboardingTaskUpdateDto, EmpTerminationAddDto, EmpTerminationDecisionDto } from '../../../types/hr/termination';

export const useTerminations = () =>
  useQuery({ queryKey: terminationKeys.all, queryFn: terminationApi.getAll, staleTime: 0, refetchOnMount: 'always' });

export const useTermination = (id?: string) =>
  useQuery({
    queryKey: terminationKeys.detail(id || ''),
    queryFn: () => terminationApi.getById(id!),
    enabled: !!id,
  });

export const useOffboardingTasks = (terminationId?: string) =>
  useQuery({
    queryKey: terminationKeys.tasks(terminationId || ''),
    queryFn: () => terminationApi.getOffboarding(terminationId!),
    enabled: !!terminationId,
  });

const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: terminationKeys.all });

export const useCreateTermination = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: EmpTerminationAddDto) => terminationApi.create(d),
    onSuccess: () => { invalidate(qc); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useTerminationAction = (
  action: 'approve' | 'reject' | 'apply',
  opts?: { onSuccess?: () => void; onError?: (e: Error) => void },
) => {
  const qc = useQueryClient();
  const fn = action === 'approve' ? terminationApi.approve : action === 'reject' ? terminationApi.reject : terminationApi.apply;
  return useMutation({
    mutationFn: (d: EmpTerminationDecisionDto) => fn(d),
    onSuccess: () => { invalidate(qc); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useUpdateOffboardingTask = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: EmpOffboardingTaskUpdateDto) => terminationApi.updateTask(d),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: terminationKeys.tasks(task.terminationId) });
      invalidate(qc);
      opts?.onSuccess?.();
    },
    onError: opts?.onError,
  });
};
