import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import type { LeaveAppStepAddDto, LeaveAppStepListDto } from "../../../../types/core/Settings/leaveAppStep";

const baseUrl = "/hrm/leave/v1/Policy/Chain/Step";

export const useCreateLeaveAppStep = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: LeaveAppStepAddDto): Promise<LeaveAppStepListDto> => {
            console.log("API Call - Payload:", JSON.stringify(payload, null, 2));
            const response = await api.post(`${baseUrl}/Add`, payload);
            console.log("API Call - Response:", response.data);
            return response.data?.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["leave-app-step"] });
            if (variables.LeaveAppChainId) {
                queryClient.invalidateQueries({ queryKey: ["leave-app-step", "chain", variables.LeaveAppChainId] });
            }
        },
    });
};