export const leaveReqPendKeys = {
  all: ["leaveReqPend"] as const,

  myPending: () => [...leaveReqPendKeys.all, "myPending"] as const,

  departmentPending: () =>
    [...leaveReqPendKeys.all, "departmentPending"] as const,

  branchPending: () => [...leaveReqPendKeys.all, "branchPending"] as const,

  allPending: () => [...leaveReqPendKeys.all, "allPending"] as const,
};
