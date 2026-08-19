import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { leaveFetcher } from '@/modules/hr/services/leave/leave.api';
import { leaveKeys } from '@/modules/hr/services/leave/leave.keys';
import type { LeaveRequestListDto, LeaveRequestAddDto, LeaveRequestModDto, UUID } from '@/modules/hr/types/leaverequest';

export const useMyLeaveRequests = (
  options?: Omit<UseQueryOptions<LeaveRequestListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<LeaveRequestListDto[], Error>({
    queryKey: leaveKeys.mine(),
    queryFn: leaveFetcher.getMyLeaveRequests,
    ...options,
  });

export const useLeaveRequest = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<LeaveRequestListDto, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<LeaveRequestListDto, Error>({
    queryKey: leaveKeys.detail(id!),
    queryFn: () => leaveFetcher.getLeaveRequestById(id!),
    enabled: !!id,
    ...options,
  });

export const useAddLeaveRequest = (
  options?: Omit<UseMutationOptions<LeaveRequestListDto, Error, LeaveRequestAddDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<LeaveRequestListDto, Error, LeaveRequestAddDto>({
    mutationFn: leaveFetcher.addLeaveRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaveKeys.mine() }),
    ...options,
  });
};

export const useUpdateLeaveRequest = (
  options?: Omit<UseMutationOptions<LeaveRequestListDto, Error, LeaveRequestModDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<LeaveRequestListDto, Error, LeaveRequestModDto>({
    mutationFn: leaveFetcher.updateLeaveRequest,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.mine() });
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(updated.id) });
    },
    ...options,
  });
};

export const useDeleteLeaveRequest = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UUID>({
    mutationFn: leaveFetcher.deleteLeaveRequest,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: leaveKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.mine() });
    },
    ...options,
  });
};
