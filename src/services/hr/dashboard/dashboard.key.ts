// services/hr/dashboard/dashboard.key.ts

export const dashboardKeys = {
  // ✅ Main dashboard
  all: ['hr-dashboard'] as const,

  // ✅ Statistics
  statistics: () => [...dashboardKeys.all, 'statistics'] as const,

  // ✅ Pending items
  pending: () => [...dashboardKeys.all, 'pending'] as const,
  pendingEdu: () => [...dashboardKeys.all, 'pending-edu'] as const,
  pendingLeave: () => [...dashboardKeys.all, 'pending-leave'] as const,

  // ✅ Activities & Events
  activities: () => [...dashboardKeys.all, 'activities'] as const,
  events: () => [...dashboardKeys.all, 'events'] as const,

  // ✅ Leave
  onLeave: () => [...dashboardKeys.all, 'on-leave'] as const,

  // ✅ Legacy (for backward compatibility)
  empDbRepo: () => [...dashboardKeys.all, 'emp-db-repo'] as const,
  pendEmpList: () => [...dashboardKeys.all, 'pend-emp-list'] as const,
  pendEmpEduExpList: () => [...dashboardKeys.all, 'pend-emp-edu-exp-list'] as const,
};

export type UUID = string;