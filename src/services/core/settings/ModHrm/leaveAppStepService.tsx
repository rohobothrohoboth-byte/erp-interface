import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import type {
  LeaveAppStepListDto,
  LeaveAppStepAddDto,
  LeaveAppStepModDto,
  UUID,
} from "../../../../types/core/Settings/leaveAppStep";

// Make sure the base URL is correct
const baseUrl = "/hrm/leave/v1/Policy/Chain/Step";

const extractErrorMessage = (error: any): string => {
  console.error("Full error object:", error);

  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(", ");
  }
  if (error.response?.data?.title) return error.response.data.title;
  if (error.message) return error.message;
  return "An unexpected error occurred";
};

export const leaveAppStepKeys = {
  all: ["leave-app-step"] as const,
  byChain: (chainId: UUID) =>
      [...leaveAppStepKeys.all, "chain", chainId] as const,
  byId: (id: UUID) => [...leaveAppStepKeys.all, id] as const,
};

export const leaveAppStepServices = (chainId?: UUID) => {
  const queryClient = useQueryClient();

  const listByChain = useQuery({
    queryKey: chainId ? leaveAppStepKeys.byChain(chainId) : [],
    queryFn: async (): Promise<LeaveAppStepListDto[]> => {
      if (!chainId) {
        return [];
      }
      console.log("📞 Fetching steps for Chain ID:", chainId);
      console.log("📞 Endpoint:", `${baseUrl}/All/${chainId}`);

      try {
        const res = await api.get(`${baseUrl}/All/${chainId}`);
        console.log("✅ Steps response:", res.data);
        return res.data?.data || [];
      } catch (error: any) {
        console.error("❌ Error fetching steps:", error);
        if (error.response?.status === 404) {
          return [];
        }
        return [];
      }
    },
    enabled: !!chainId,
  });

  const create = useMutation({
    mutationFn: async (
        payload: LeaveAppStepAddDto,
    ): Promise<LeaveAppStepListDto> => {
      console.log("📤 Sending create step payload:", JSON.stringify(payload, null, 2));
      console.log("📤 Full URL:", `${baseUrl}/Add`);
      console.log("📤 API base URL:", api.defaults.baseURL);

      try {
        const res = await api.post(`${baseUrl}/Add`, payload);
        console.log("✅ Create step response:", res.data);
        return res.data?.data;
      } catch (error: any) {
        console.error("❌ API call failed:");
        console.error("Status:", error.response?.status);
        console.error("Status Text:", error.response?.statusText);
        console.error("Response Data:", error.response?.data);
        console.error("Error message:", error.message);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      if (variables.LeaveAppChainId) {
        queryClient.invalidateQueries({
          queryKey: leaveAppStepKeys.byChain(variables.LeaveAppChainId as UUID),
        });
      }
      queryClient.invalidateQueries({
        queryKey: leaveAppStepKeys.all,
      });
    },
    onError: (error) => {
      const message = extractErrorMessage(error);
      console.error("❌ Mutation error:", message);
      throw new Error(message);
    },
  });

  const update = useMutation({
    mutationFn: async (
        payload: LeaveAppStepModDto,
    ): Promise<LeaveAppStepListDto> => {
      const res = await api.put(`${baseUrl}/Update/${payload.id}`, payload);
      return res.data?.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: leaveAppStepKeys.byId(variables.id),
      });
      if (chainId) {
        queryClient.invalidateQueries({
          queryKey: leaveAppStepKeys.byChain(chainId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: leaveAppStepKeys.all,
      });
    },
    onError: (error) => {
      throw new Error(extractErrorMessage(error));
    },
  });

  const remove = useMutation({
    mutationFn: async (stepId: UUID): Promise<void> => {
      await api.delete(`${baseUrl}/Delete/${stepId}`);
    },
    onSuccess: () => {
      if (chainId) {
        queryClient.invalidateQueries({
          queryKey: leaveAppStepKeys.byChain(chainId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: leaveAppStepKeys.all,
      });
    },
    onError: (error) => {
      throw new Error(extractErrorMessage(error));
    },
  });

  const getById = (stepId: UUID) =>
      useQuery({
        queryKey: leaveAppStepKeys.byId(stepId),
        queryFn: async (): Promise<LeaveAppStepListDto | null> => {
          try {
            const res = await api.get(`${baseUrl}/${stepId}`);
            return res.data?.data || null;
          } catch (error: any) {
            if (error.response?.status === 404) {
              return null;
            }
            throw error;
          }
        },
        enabled: !!stepId,
      });

  const refetch = () => {
    if (chainId) {
      queryClient.invalidateQueries({
        queryKey: leaveAppStepKeys.byChain(chainId),
      });
    }
  };

  return {
    listByChain,
    create,
    update,
    remove,
    getById,
    refetch,
  };
};