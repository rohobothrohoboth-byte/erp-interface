import type { UUID } from '@/modules/hr/types/employee/empAddDto';

export const usermgmtKeys = {
  all: ['usermgmt'] as const,
  employees: () => [...usermgmtKeys.all, 'employees'] as const,
  employeeStep2: (id: UUID) => [...usermgmtKeys.all, 'step2', id] as const,
  accountData: (id: UUID) => [...usermgmtKeys.all, 'account', id] as const,
} as const;
