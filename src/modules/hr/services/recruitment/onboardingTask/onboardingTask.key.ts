// src/services/hr/recruit/onboardingTask/onboardingTask.key.ts

export const onboardingTaskKeys = {
    all: ['onboardingTasks'] as const,
    lists: () => [...onboardingTaskKeys.all, 'list'] as const,
    list: (planId?: string) => [...onboardingTaskKeys.lists(), { planId }] as const,
    details: () => [...onboardingTaskKeys.all, 'detail'] as const,
    detail: (id: string) => [...onboardingTaskKeys.details(), id] as const,
} as const;