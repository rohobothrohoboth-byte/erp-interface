import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { authListApi } from '@/modules/list/services/auth/authList.api';
import { authListKeys } from '@/modules/list/services/auth/authList.keys';
import type { NameListItem, RoleListItem } from '@/modules/list/types/NameList/nameList';

export const useModuleNames = (
  options?: Omit<UseQueryOptions<NameListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<NameListItem[], Error>({
    queryKey: authListKeys.moduleNames(),
    queryFn: authListApi.getAllModuleNames,
    ...options,
  });

export const useRoles = (
  options?: Omit<UseQueryOptions<RoleListItem[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<RoleListItem[], Error>({
    queryKey: authListKeys.roles(),
    queryFn: authListApi.getAllRoles,
    ...options,
  });
