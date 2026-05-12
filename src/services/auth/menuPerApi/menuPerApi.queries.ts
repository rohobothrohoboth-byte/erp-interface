import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { menuPerApiFetcher } from './menuPerApi.api';
import { menuPerApiKeys } from './menuPerApi.keys';
import type { MenuPerApiListDto, NameList, UUID } from '../../../types/auth/MenuPerApi';

export const usePerApisByUser = (
  userId: UUID | undefined,
  options?: Omit<UseQueryOptions<MenuPerApiListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<MenuPerApiListDto[], Error>({
    queryKey: menuPerApiKeys.byUser(userId!),
    queryFn: () => menuPerApiFetcher.getPerApisByUser(userId!),
    enabled: !!userId,
    ...options,
  });

export const useFilteredPerApisForUser = (
  userId: UUID | undefined,
  selectedMenuIds: UUID[],
  options?: Omit<UseQueryOptions<MenuPerApiListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<MenuPerApiListDto[], Error>({
    queryKey: menuPerApiKeys.filtered(userId!, selectedMenuIds),
    queryFn: () => menuPerApiFetcher.getFilteredPerApisForUser(userId!, selectedMenuIds),
    enabled: !!userId && selectedMenuIds.length > 0,
    ...options,
  });

export const useFlattenedPerApisForUser = (
  userId: UUID | undefined,
  selectedMenuIds: UUID[],
  options?: Omit<
    UseQueryOptions<Array<NameList & { menuId: UUID; menuName: string }>, Error>,
    'queryKey' | 'queryFn'
  >
) =>
  useQuery<Array<NameList & { menuId: UUID; menuName: string }>, Error>({
    queryKey: menuPerApiKeys.flattened(userId!, selectedMenuIds),
    queryFn: () => menuPerApiFetcher.getFlattenedPerApisForUser(userId!, selectedMenuIds),
    enabled: !!userId && selectedMenuIds.length > 0,
    ...options,
  });

export const useAvailableMenusForUser = (
  userId: UUID | undefined,
  options?: Omit<UseQueryOptions<Array<{ id: UUID; name: string }>, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<Array<{ id: UUID; name: string }>, Error>({
    queryKey: menuPerApiKeys.availableMenus(userId!),
    queryFn: () => menuPerApiFetcher.getAvailableMenusForUser(userId!),
    enabled: !!userId,
    ...options,
  });
