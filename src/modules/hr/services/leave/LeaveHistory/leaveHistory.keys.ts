export const leaveHistoryKeys = {
  all: ["leave-history"] as const,

  my: () => [...leaveHistoryKeys.all, "my"] as const,

  department: () => [...leaveHistoryKeys.all, "department"] as const,

  branch: () => [...leaveHistoryKeys.all, "branch"] as const,

  company: () => [...leaveHistoryKeys.all, "company"] as const,
};
