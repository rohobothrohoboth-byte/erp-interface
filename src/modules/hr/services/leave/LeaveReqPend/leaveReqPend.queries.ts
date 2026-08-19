import { useQuery } from "@tanstack/react-query";
import { leaveReqPendFetcher } from "@/modules/hr/services/leave/LeaveReqPend/leaveReqPend.api";
import { leaveReqPendKeys } from "@/modules/hr/services/leave/LeaveReqPend/leaveReqPend.keys";

export const useMyPendingLeaveRequests = () =>
  useQuery({
    queryKey: leaveReqPendKeys.myPending(),
    queryFn: leaveReqPendFetcher.getMyPending,
  });

export const useDepartmentPendingLeaveRequests = () =>
  useQuery({
    queryKey: leaveReqPendKeys.departmentPending(),
    queryFn: leaveReqPendFetcher.getDepartmentPending,
  });

export const useBranchPendingLeaveRequests = () =>
  useQuery({
    queryKey: leaveReqPendKeys.branchPending(),
    queryFn: leaveReqPendFetcher.getBranchPending,
  });

export const useAllPendingLeaveRequests = () =>
  useQuery({
    queryKey: leaveReqPendKeys.allPending(),
    queryFn: leaveReqPendFetcher.getAllPending,
  });
