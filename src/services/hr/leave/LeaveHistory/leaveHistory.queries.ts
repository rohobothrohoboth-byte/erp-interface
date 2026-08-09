import { useQuery } from "@tanstack/react-query";
import { leaveReqHistoryFetcher } from "./leaveHistory.api";
import { leaveHistoryKeys } from "./leaveHistory.keys";

export const useMyLeaveHistory = () => {
  return useQuery({
    queryKey: leaveHistoryKeys.my(),
    queryFn: leaveReqHistoryFetcher.getMyHistory,
  });
};

export const useDepartmentLeaveHistory = () => {
  return useQuery({
    queryKey: leaveHistoryKeys.department(),
    queryFn: leaveReqHistoryFetcher.getDepartmentHistory,
  });
};

export const useBranchLeaveHistory = () => {
  return useQuery({
    queryKey: leaveHistoryKeys.branch(),
    queryFn: leaveReqHistoryFetcher.getBranchHistory,
  });
};

export const useAllLeaveHistory = () => {
  return useQuery({
    queryKey: leaveHistoryKeys.company(),
    queryFn: leaveReqHistoryFetcher.getAllHistory,
  });
};
