import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/services/api";
import type {
  LeaveAppChainListDto,
  LeaveAppChainAddDto,
  LeaveAppChainModDto,
} from "@/modules/core/types/Settings/leaveAppChain";
import type { UUID } from "@/modules/core/types/Settings/leavePolicyConfig";
import type { StatChangeDto } from "@/modules/core/types/Settings/statChangeDto";

// From LeavePolicyController - endpoints under /Policy/Chain
const baseUrl = "/hrm/leave/v1/Policy/Chain";

const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(", ");
  }
  if (error.message) return error.message;
  return "An unexpected error occurred";
};

export const leaveAppChainKeys = {
  all: ["leave-app-chain"] as const,
  byPolicy: (leavePolicyId: UUID) =>
      [...leaveAppChainKeys.all, leavePolicyId] as const,
  activeByPolicy: (leavePolicyId: UUID) =>
      [...leaveAppChainKeys.all, "activeByPolicy", leavePolicyId] as const,
  byId: (leaveAppChainId: UUID) =>
      [...leaveAppChainKeys.all, leaveAppChainId] as const,
};

export const leaveAppChainServices = (leavePolicyId: UUID) => {
  const queryClient = useQueryClient();

  const listByPolicy = useQuery({
    queryKey: leaveAppChainKeys.byPolicy(leavePolicyId),
    queryFn: async (): Promise<LeaveAppChainListDto[]> => {
      // GET /Policy/Chain/All/{policyId}
      const res = await api.get(`${baseUrl}/All/${leavePolicyId}`);
      return res.data?.data || [];
    },
    enabled: !!leavePolicyId,
  });

  const activeAppChain = useQuery({
    queryKey: leaveAppChainKeys.activeByPolicy(leavePolicyId),
    queryFn: async (): Promise<LeaveAppChainListDto | null> => {
      try {
        // GET /Policy/Chain/Active/{policyId}
        const res = await api.get(`${baseUrl}/Active/${leavePolicyId}`);
        return res.data?.data || null;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!leavePolicyId,
  });

  const create = useMutation({
    mutationFn: async (payload: LeaveAppChainAddDto): Promise<LeaveAppChainListDto> => {
      // POST /Policy/Chain/Add
      const res = await api.post(`${baseUrl}/Add`, payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.byPolicy(leavePolicyId) });
      queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.activeByPolicy(leavePolicyId) });
    },
    onError: (error) => {
      throw new Error(extractErrorMessage(error));
    },
  });

  const update = useMutation({
    mutationFn: async (payload: LeaveAppChainModDto): Promise<LeaveAppChainListDto> => {
      // PUT /Policy/Chain/Update/{id}
      const res = await api.put(`${baseUrl}/Update/${payload.id}`, payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.byPolicy(leavePolicyId) });
      queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.activeByPolicy(leavePolicyId) });
    },
    onError: (error) => {
      throw new Error(extractErrorMessage(error));
    },
  });

  const changeStatus = useMutation({
    mutationFn: async (payload: StatChangeDto): Promise<void> => {
      // PATCH /Policy/Chain/Step/Status
      await api.patch(`/hrm/leave/v1/Policy/Chain/Step/Status`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.byPolicy(leavePolicyId) });
      queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.activeByPolicy(leavePolicyId) });
    },
    onError: (error) => {
      throw new Error(extractErrorMessage(error));
    },
  });

  const remove = useMutation({
    mutationFn: async (id: UUID): Promise<void> => {
      // DELETE /Policy/Chain/Delete/{id}
      await api.delete(`${baseUrl}/Delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.byPolicy(leavePolicyId) });
      queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.activeByPolicy(leavePolicyId) });
    },
    onError: (error) => {
      throw new Error(extractErrorMessage(error));
    },
  });

  const refetchActiveChain = async () => {
    await queryClient.invalidateQueries({ queryKey: leaveAppChainKeys.activeByPolicy(leavePolicyId) });
  };

  return {
    listByPolicy,
    activeAppChain,
    create,
    update,
    changeStatus,
    remove,
    refetchActiveChain,
  };
};