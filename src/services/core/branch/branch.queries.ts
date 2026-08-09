// src/services/core/branch/branch.queries.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query';
import { branchFetcher } from './branch.api';
import { branchKeys } from './branch.key';
import type {
  Branch,
  BranchListDto,
  AddBranchDto,
  EditBranchDto,
  BranchCompListDto,
  UUID
} from '../../../types/core/branch';
import type { BranchFilters } from './branch.api';

// Query Hooks

export const useBranches = (
    filters?: BranchFilters,
    options?: Omit<UseQueryOptions<BranchListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<BranchListDto[], Error>({
    queryKey: branchKeys.list(filters),
    queryFn: async () => {
      if (filters?.companyId) {
        return branchFetcher.getCompanyBranches(filters.companyId);
      }
      return branchFetcher.getAllBranches();
    },
    ...options,
  });
};

export const useBranch = (
    id: UUID | undefined,
    options?: Omit<UseQueryOptions<Branch, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Branch, Error>({
    queryKey: branchKeys.detail(id!),
    queryFn: () => branchFetcher.getBranchById(id!),
    enabled: !!id,
    ...options,
  });
};

// FIXED: Better error handling for branch list
export const useBranchCompanyList = (
    options?: Omit<UseQueryOptions<BranchCompListDto[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<BranchCompListDto[], Error>({
    queryKey: branchKeys.companyList(),
    queryFn: async () => {
      console.log('Fetching branch list for dropdown...');
      try {
        const result = await branchFetcher.getBranchCompanyList();
        console.log('Branch list result:', result);
        return result || [];
      } catch (error) {
        console.error('Error in useBranchCompanyList:', error);
        return [];
      }
    },
    // Don't retry on failure to avoid infinite loops
    retry: 1,
    // Stale time to avoid unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Mutation Hooks
export const useCreateBranch = (
    options?: Omit<UseMutationOptions<BranchListDto, Error, AddBranchDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<BranchListDto, Error, AddBranchDto>({
    mutationFn: branchFetcher.createBranch,
    onSuccess: (newBranch) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      if (newBranch.compId) {
        queryClient.invalidateQueries({
          queryKey: branchKeys.list({ companyId: newBranch.compId })
        });
      }
      // Also invalidate the company list
      queryClient.invalidateQueries({ queryKey: branchKeys.companyList() });
      console.info('Branch created successfully:', newBranch.id);
    },
    ...options,
  });
};

export const useUpdateBranch = (
    options?: Omit<UseMutationOptions<BranchListDto, Error, EditBranchDto>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<BranchListDto, Error, EditBranchDto>({
    mutationFn: branchFetcher.updateBranch,
    onSuccess: (updatedBranch) => {
      queryClient.invalidateQueries({
        queryKey: branchKeys.detail(updatedBranch.id as UUID)
      });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      if (updatedBranch.compId) {
        queryClient.invalidateQueries({
          queryKey: branchKeys.list({ companyId: updatedBranch.compId })
        });
      }
      queryClient.invalidateQueries({ queryKey: branchKeys.companyList() });
      console.info('Branch updated successfully:', updatedBranch.id);
    },
    ...options,
  });
};

export const useDeleteBranch = (
    options?: Omit<UseMutationOptions<void, Error, UUID>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UUID>({
    mutationFn: branchFetcher.deleteBranch,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: branchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
      queryClient.invalidateQueries({ queryKey: branchKeys.companyList() });
      console.info('Branch deleted successfully:', id);
    },
    ...options,
  });
};
