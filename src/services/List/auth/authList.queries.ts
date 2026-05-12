import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { authListApi } from './authList.api';
import { authListKeys } from './authList.keys';
import type { NameListItem, RoleListItem } from '../../../types/NameList/nameList';

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
