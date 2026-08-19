import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { hierarchyFetcher } from '@/modules/core/services/hierarchy/hierarchy.api';
import { hierarchyKeys } from '@/modules/core/services/hierarchy/hierarchy.keys';
import type { HierListDto, AddHierDto, EditHierDto, UUID } from '@/modules/core/types/hier';

export const useHierarchies = (
  options?: Omit<UseQueryOptions<HierListDto[], Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HierListDto[], Error>({
    queryKey: hierarchyKeys.lists(),
    queryFn: hierarchyFetcher.getAllHierarchies,
    ...options,
  });

export const useHierarchy = (
  id: UUID | undefined,
  options?: Omit<UseQueryOptions<HierListDto, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<HierListDto, Error>({
    queryKey: hierarchyKeys.detail(id!),
    queryFn: () => hierarchyFetcher.getHierarchyById(id!),
    enabled: !!id,
    ...options,
  });

export const useCreateHierarchy = (
  options?: Omit<UseMutationOptions<HierListDto, Error, AddHierDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<HierListDto, Error, AddHierDto>({
    mutationFn: hierarchyFetcher.createHierarchy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hierarchyKeys.lists() }),
    ...options,
  });
};

export const useUpdateHierarchy = (
  options?: Omit<UseMutationOptions<HierListDto, Error, EditHierDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<HierListDto, Error, EditHierDto>({
    mutationFn: hierarchyFetcher.updateHierarchy,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: hierarchyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hierarchyKeys.detail(updated.id) });
    },
    ...options,
  });
};

export const useDeleteHierarchy = (
  options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UUID>({
    mutationFn: hierarchyFetcher.deleteHierarchy,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: hierarchyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: hierarchyKeys.lists() });
    },
    ...options,
  });
};
