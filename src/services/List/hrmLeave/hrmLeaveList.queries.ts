import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { hrmLeaveListApi } from './hrmLeaveList.api';
import { hrmLeaveListKeys } from './hrmLeaveList.keys';
import type { ListItem } from '../../../types/List/list';

export const useLeaveTypes = (
  options?: Omit<UseQueryOptions<ListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ListItem[], Error>({
    queryKey: hrmLeaveListKeys.leaveTypes(),
    queryFn: hrmLeaveListApi.getAllLeaveTypes,
    ...options,
  });
