// services/hr/leave/LeaveReqDb/leaveReqDb.keys.ts
export const leaveReqDbKeys = {
  all: ["leaveRequests"] as const,
  PendList: () => [...leaveReqDbKeys.all, "PendList"] as const,
  OnLeaveList: () => [...leaveReqDbKeys.all, "OnLeaveList"] as const,
} as const;