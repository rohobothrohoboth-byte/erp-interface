export const hrmLeaveListKeys = {
  all: ['hrmLeaveList'] as const,
  leaveTypes: () => [...hrmLeaveListKeys.all, 'leaveTypes'] as const,
} as const;
