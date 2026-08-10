import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { policyAssignmentRuleFetcher } from "@/modules/core/services/settings/ModHrm/LeavePolicyAssignmentRule/policyAssignmentRule.api";
import { policyAssignmentRuleKeys } from "@/modules/core/services/settings/ModHrm/LeavePolicyAssignmentRule/policyAssignmentRule.keys";

import type {
  PolicyAssignmentRuleListDto,
  PolicyAssignmentRuleAddDto,
  PolicyAssignmentRuleModDto,
  UUID,
} from "@/modules/core/types/Settings/policyAssignmentRule";
import type { StatChangeDto } from "@/modules/core/types/Settings/statChangeDto";

// Get by ID
export const usePolicyAssignmentRule = (
  id: UUID,
  options?: UseQueryOptions<PolicyAssignmentRuleListDto>,
) => {
  return useQuery({
    queryKey: policyAssignmentRuleKeys.detail(id),
    queryFn: () => policyAssignmentRuleFetcher.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Get Active by ID
export const useActivePolicyAssignmentRule = (
  id: UUID,
  options?: UseQueryOptions<PolicyAssignmentRuleListDto[]>,
) => {
  return useQuery({
    queryKey: policyAssignmentRuleKeys.active(id),
    queryFn: () => policyAssignmentRuleFetcher.getActiveById(id),
    enabled: !!id,
    ...options,
  });
};

// Get All by Policy ID - Added this hook
export const useAllPolicyAssignmentRules = (
  policyId: UUID,
  options?: UseQueryOptions<PolicyAssignmentRuleListDto[]>,
) => {
  return useQuery({
    queryKey: policyAssignmentRuleKeys.list(policyId),
    queryFn: () => policyAssignmentRuleFetcher.getAllByPolicyId(policyId),
    enabled: !!policyId,
    ...options,
  });
};

// Create
export const useCreatePolicyAssignmentRule = (
  options?: UseMutationOptions<
    PolicyAssignmentRuleListDto,
    Error,
    PolicyAssignmentRuleAddDto
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyAssignmentRuleFetcher.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyAssignmentRuleKeys.all,
      });
    },
    ...options,
  });
};

// Update
export const useUpdatePolicyAssignmentRule = (
  options?: UseMutationOptions<
    PolicyAssignmentRuleListDto,
    Error,
    PolicyAssignmentRuleModDto
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyAssignmentRuleFetcher.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyAssignmentRuleKeys.all,
      });
    },
    ...options,
  });
};

// Change Status
export const useChangeStatusPolicyAssignmentRule = (
  options?: UseMutationOptions<void, Error, StatChangeDto>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyAssignmentRuleFetcher.changeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyAssignmentRuleKeys.all,
      });
    },
    ...options,
  });
};

// Delete
export const useDeletePolicyAssignmentRule = (
  options?: UseMutationOptions<any, Error, UUID>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyAssignmentRuleFetcher.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyAssignmentRuleKeys.all,
      });
    },
    ...options,
  });
};