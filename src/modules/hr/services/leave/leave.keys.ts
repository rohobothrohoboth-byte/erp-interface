import type { UUID } from '@/modules/hr/types/leaverequest';

export const leaveKeys = {
  all: ['leaveRequests'] as const,
  mine: () => [...leaveKeys.all, 'mine'] as const,
  details: () => [...leaveKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...leaveKeys.details(), id] as const,
} as const;
