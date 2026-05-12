import type { UUID } from '../../../types/hr/leaverequest';

export const leaveKeys = {
  all: ['leaveRequests'] as const,
  mine: () => [...leaveKeys.all, 'mine'] as const,
  details: () => [...leaveKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...leaveKeys.details(), id] as const,
} as const;
