import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { perMenuFetcher } from './perMenu.api';
import { perMenuKeys } from './perMenu.keys';
import type { ModPerMenuListDto, NameList, UUID } from '../../../types/auth/ModPerMenu';

export const usePerMenusByUser = (
  userId: UUID | undefined,
  options?: Omit<UseQueryOptions<ModPerMenuListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ModPerMenuListDto[], Error>({
    queryKey: perMenuKeys.byUser(userId!),
    queryFn: () => perMenuFetcher.getPerMenusByUser(userId!),
    enabled: !!userId,
    ...options,
  });

export const useFilteredPermissionsForUser = (
  userId: UUID | undefined,
  selectedModuleIds: UUID[],
  options?: Omit<UseQueryOptions<ModPerMenuListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ModPerMenuListDto[], Error>({
    queryKey: perMenuKeys.filtered(userId!, selectedModuleIds),
    queryFn: () => perMenuFetcher.getFilteredPermissionsForUser(userId!, selectedModuleIds),
    enabled: !!userId && selectedModuleIds.length > 0,
    ...options,
  });

export const useFlattenedPermissionsForUser = (
  userId: UUID | undefined,
  selectedModuleIds: UUID[],
  options?: Omit<
    UseQueryOptions<Array<NameList & { moduleId: UUID; moduleName: string }>, Error>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<Array<NameList & { moduleId: UUID; moduleName: string }>, Error>({
    queryKey: perMenuKeys.flattened(userId!, selectedModuleIds),
    queryFn: () => perMenuFetcher.getFlattenedPermissionsForUser(userId!, selectedModuleIds),
    enabled: !!userId && selectedModuleIds.length > 0,
    ...options,
  });

export const useAvailableModulesForUser = (
  userId: UUID | undefined,
  options?: Omit<UseQueryOptions<Array<{ id: UUID; name: string }>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<Array<{ id: UUID; name: string }>, Error>({
    queryKey: perMenuKeys.availableModules(userId!),
    queryFn: () => perMenuFetcher.getAvailableModulesForUser(userId!),
    enabled: !!userId,
    ...options,
  });
