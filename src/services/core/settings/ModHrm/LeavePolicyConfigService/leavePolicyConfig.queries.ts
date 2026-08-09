// services/core/settings/ModHrm/LeavePolicyConfigService/leavePolicyConfig.queries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { leavePolicyConfigFetcher } from "./leavePolicyConfig.api";
import { leavePolicyConfigKeys } from "./leavePolicyConfig.key";
import type {
  LeavePolicyConfigListDto,
  LeavePolicyConfigAddDto,
  LeavePolicyConfigModDto,
  UUID,
} from "../../../../../types/core/Settings/leavePolicyConfig";
import type { StatChangeDto } from "../../../../../types/core/Settings/statChangeDto";

export const useLeavePolicyConfig = (
    id: UUID | undefined,
    options?: Omit<
        UseQueryOptions<LeavePolicyConfigListDto | null, Error>,
        "queryKey" | "queryFn"
    >,
) =>
    useQuery({
      queryKey: leavePolicyConfigKeys.detail(id!),
      queryFn: () => leavePolicyConfigFetcher.getById(id!),
      enabled: !!id,
      ...options,
    });

export const useActiveLeavePolicyConfig = (
    id: UUID | undefined,
    options?: Omit<
        UseQueryOptions<LeavePolicyConfigListDto | null, Error>,
        "queryKey" | "queryFn"
    >,
) =>
    useQuery({
      queryKey: leavePolicyConfigKeys.active(id!),
      queryFn: () => leavePolicyConfigFetcher.getActiveById(id!),
      enabled: !!id,
      ...options,
    });

export const useAllLeavePolicyConfigs = (
    id: UUID | undefined,
    options?: Omit<
        UseQueryOptions<LeavePolicyConfigListDto[], Error>,
        "queryKey" | "queryFn"
    >,
) =>
    useQuery({
      queryKey: leavePolicyConfigKeys.list(id!),
      queryFn: () => leavePolicyConfigFetcher.getAllById(id!),
      enabled: !!id,
      ...options,
    });

// FIXED: Create mutation
export const useCreateLeavePolicyConfig = (
    options?: Omit<
        UseMutationOptions<LeavePolicyConfigListDto, Error, LeavePolicyConfigAddDto>,
        "mutationFn"
    >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LeavePolicyConfigAddDto) => leavePolicyConfigFetcher.create(data),
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: leavePolicyConfigKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: leavePolicyConfigKeys.list(variables.leavePolicyId),
      });
      queryClient.invalidateQueries({
        queryKey: leavePolicyConfigKeys.active(variables.leavePolicyId),
      });
    },
    ...options,
  });
};

export const useUpdateLeavePolicyConfig = (
    options?: Omit<
        UseMutationOptions<LeavePolicyConfigListDto, Error, LeavePolicyConfigModDto>,
        "mutationFn"
    >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LeavePolicyConfigModDto) => leavePolicyConfigFetcher.update(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: leavePolicyConfigKeys.detail(data.id as UUID),
      });
      queryClient.invalidateQueries({
        queryKey: leavePolicyConfigKeys.all,
      });
    },
    ...options,
  });
};

export const useDeleteLeavePolicyConfig = (
    options?: Omit<UseMutationOptions<void, Error, UUID>, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: UUID) => leavePolicyConfigFetcher.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: leavePolicyConfigKeys.all });
    },
    ...options,
  });
};

export const useChangeStatusLeavePolicyConfig = (
    options?: Omit<UseMutationOptions<void, Error, StatChangeDto>, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statDto: StatChangeDto) => leavePolicyConfigFetcher.changeStatus(statDto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leavePolicyConfigKeys.all,
      });
    },
    ...options,
  });
};