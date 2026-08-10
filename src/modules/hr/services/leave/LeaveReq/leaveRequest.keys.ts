import type { UUID } from "@/modules/hr/types/leaverequest";

export const leaveReqKeys = {
  all: ["leaveRequests"] as const,
  details: () => [...leaveReqKeys.all, "detail"] as const,
  detail: (id: UUID) => [...leaveReqKeys.details(), id] as const,
} as const;
