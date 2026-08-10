// src/services/hr/recruitment/vacancy/vacancy.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vacancyApi } from '@/modules/hr/services/recruitment/vacancy/vacancy.api';
import type { CreateApplicationRequest } from '@/modules/hr/services/recruitment/vacancy/vacancy.api';

export const vacancyKeys = {
  all: ['vacancies'] as const,
  lists: () => [...vacancyKeys.all, 'list'] as const,
  list: (filter: string) => [...vacancyKeys.lists(), { filter }] as const,
  details: () => [...vacancyKeys.all, 'detail'] as const,
  detail: (id: string) => [...vacancyKeys.details(), id] as const,
  published: () => [...vacancyKeys.all, 'published'] as const,
  internal: () => [...vacancyKeys.all, 'internal'] as const,
  external: () => [...vacancyKeys.all, 'external'] as const,
  applications: (vacancyId: string) => [...vacancyKeys.detail(vacancyId), 'applications'] as const,
  hasApplied: (vacancyId: string) => [...vacancyKeys.detail(vacancyId), 'hasApplied'] as const,
};

// Query: Get all published vacancies
export function useVacancies() {
  return useQuery({
    queryKey: vacancyKeys.published(),
    queryFn: () => vacancyApi.getPublishedVacancies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Query: Get internal vacancies
export function useInternalVacancies() {
  return useQuery({
    queryKey: vacancyKeys.internal(),
    queryFn: () => vacancyApi.getInternalVacancies(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Query: Get external vacancies
export function useExternalVacancies() {
  return useQuery({
    queryKey: vacancyKeys.external(),
    queryFn: () => vacancyApi.getExternalVacancies(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Query: Get vacancy detail
export function useVacancyDetail(id: string | undefined) {
  return useQuery({
    queryKey: vacancyKeys.detail(id || ''),
    queryFn: () => vacancyApi.getVacancyDetail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Query: Check if user has applied
export function useHasApplied(vacancyId: string) {
  return useQuery({
    queryKey: vacancyKeys.hasApplied(vacancyId),
    queryFn: () => vacancyApi.hasApplied(vacancyId),
    enabled: !!vacancyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutation: Apply for vacancy
export function useCreateJobApplication(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationRequest) =>
        vacancyApi.applyForVacancy(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: vacancyKeys.hasApplied(variables.jobPostingId),
      });
      queryClient.invalidateQueries({
        queryKey: vacancyKeys.detail(variables.jobPostingId),
      });
      queryClient.invalidateQueries({
        queryKey: vacancyKeys.published(),
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}