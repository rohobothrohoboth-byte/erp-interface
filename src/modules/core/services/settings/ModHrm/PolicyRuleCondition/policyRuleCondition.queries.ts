import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import type {
  PolicyRuleCondListDto,
  PolicyRuleCondAddDto,
  PolicyRuleCondModDto,
  UUID,
} from "@/modules/core/types/Settings/PolicyRuleCondtion";

import { policyRuleConditionFetcher } from "@/modules/core/services/settings/ModHrm/PolicyRuleCondition/policyRuleCondition.api";
import { policyRuleConditionKeys } from "@/modules/core/services/settings/ModHrm/PolicyRuleCondition/policyRuleCondition.keys";

// Get by ID
export const usePolicyRuleCondition = (
  id: UUID | undefined,
  options?: Omit<
    UseQueryOptions<PolicyRuleCondListDto, Error>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    enabled: !!id,
    queryKey: policyRuleConditionKeys.detail(id!),
    queryFn: () => policyRuleConditionFetcher.getById(id!),
    ...options,
  });

// Get All by Rule ID
export const useAllPolicyRuleConditions = (
  ruleId: UUID | undefined,
  options?: Omit<
    UseQueryOptions<PolicyRuleCondListDto[], Error>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    enabled: !!ruleId,
    queryKey: policyRuleConditionKeys.list(ruleId!),
    queryFn: () => policyRuleConditionFetcher.getAllByRuleId(ruleId!),
    ...options,
  });

// Create
export const useCreatePolicyRuleCondition = (
  options?: Omit<
    UseMutationOptions<
      PolicyRuleCondListDto,
      Error,
      PolicyRuleCondAddDto
    >,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyRuleConditionFetcher.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: policyRuleConditionKeys.list(data.policyAssRuleId),
      });
      queryClient.invalidateQueries({
        queryKey: policyRuleConditionKeys.all,
      });
    },
    ...options,
  });
};

// Update
export const useUpdatePolicyRuleCondition = (
  options?: Omit<
    UseMutationOptions<
      PolicyRuleCondListDto,
      Error,
      PolicyRuleCondModDto
    >,
    "mutationFn"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyRuleConditionFetcher.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: policyRuleConditionKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: policyRuleConditionKeys.all,
      });
    },
    ...options,
  });
};

// Delete
export const useDeletePolicyRuleCondition = (
  options?: Omit<UseMutationOptions<any, Error, UUID>, "mutationFn">,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: policyRuleConditionFetcher.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyRuleConditionKeys.all,
      });
    },
    ...options,
  });
};