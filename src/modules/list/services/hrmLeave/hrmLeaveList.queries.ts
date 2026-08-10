import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { hrmLeaveListApi } from '@/modules/list/services/hrmLeave/hrmLeaveList.api';
import { hrmLeaveListKeys } from '@/modules/list/services/hrmLeave/hrmLeaveList.keys';
import type { ListItem } from '@/modules/list/types/list';

export const useLeaveTypes = (
  options?: Omit<UseQueryOptions<ListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ListItem[], Error>({
    queryKey: hrmLeaveListKeys.leaveTypes(),
    queryFn: hrmLeaveListApi.getAllLeaveTypes,
    ...options,
  });
