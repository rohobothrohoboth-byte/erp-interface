// src/services/hr/recruitment/onboardingAssignment/onboardingAssignment.key.ts

export const onboardingAssignmentKeys = {
    all: ['onboardingAssignments'] as const,
    lists: () => [...onboardingAssignmentKeys.all, 'list'] as const,
    list: (filter?: { employeeId?: string; taskId?: string }) =>
        [...onboardingAssignmentKeys.lists(), { filter }] as const,
    details: () => [...onboardingAssignmentKeys.all, 'detail'] as const,
    detail: (id: string) => [...onboardingAssignmentKeys.details(), id] as const,
    byEmployee: (employeeId: string) => [...onboardingAssignmentKeys.all, 'employee', employeeId] as const,
    byTask: (taskId: string) => [...onboardingAssignmentKeys.all, 'task', taskId] as const,
} as const;