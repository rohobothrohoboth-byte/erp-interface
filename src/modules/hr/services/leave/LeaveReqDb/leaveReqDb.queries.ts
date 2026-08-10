// services/hr/leave/LeaveReqDb/leaveReqDb.queries.ts
import {
    useQuery,
    type UseQueryOptions,
} from "@tanstack/react-query";
import type { LeaveReqDbList } from "@/modules/hr/types/leave/leaverequest";
import { leaveReqDbKeys } from "@/modules/hr/services/leave/LeaveReqDb/leaveReqDb.keys";
import { leaveReqDbFetcher } from "@/modules/hr/services/leave/LeaveReqDb/leaveReqDb.api";

export const usePendLeaveRequests = (
    options?: Omit<
        UseQueryOptions<LeaveReqDbList[], Error>,
        "queryKey" | "queryFn"
    >,
) =>
    useQuery<LeaveReqDbList[], Error>({
        queryKey: leaveReqDbKeys.PendList(),
        queryFn: leaveReqDbFetcher.getPendLeaveRequests,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        ...options,
    });

// ✅ Add hook for on-leave employees
export const useOnLeaveEmployees = (
    options?: Omit<
        UseQueryOptions<LeaveReqDbList[], Error>,
        "queryKey" | "queryFn"
    >,
) =>
    useQuery<LeaveReqDbList[], Error>({
        queryKey: ['leave', 'on-leave'],
        queryFn: leaveReqDbFetcher.getOnLeaveEmployees,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
        ...options,
    });