// services/profile/Experiance/experiance.queries.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { experienceApi } from "./experiance.api";
import { experienceKeys } from "./experiance.keys";
import { dashboardKeys } from "../../hr/dashboard/dashboard.key";
import type {
  EmpExpListDto,
  EmpExpAddDto,
  EmpExpModDto,
} from "../../../types/profile/EmpExp.types";
import type { EmpRevDto } from "../../../types/hr/employee/empAddDto";

const STALE = 5 * 60 * 1000;

export const useExperiences = () =>
    useQuery<EmpExpListDto[], Error>({
      queryKey: experienceKeys.lists(),
      queryFn: experienceApi.getAll,
      staleTime: STALE,
    });

export const useExperience = (id: string) =>
    useQuery<EmpExpListDto, Error>({
      queryKey: experienceKeys.detail(id),
      queryFn: () => experienceApi.getById(id),
      staleTime: STALE,
    });

export const useCreateExperience = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<string, Error, EmpExpAddDto>({
    mutationFn: experienceApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: experienceKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useUpdateExperience = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<string, Error, EmpExpModDto>({
    mutationFn: experienceApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: experienceKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

// ✅ Add update status mutation
export const useUpdateExperienceStatus = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<string, Error, { id: string; status: string; rowVersion?: string }>({
    mutationFn: ({ id, status, rowVersion }) =>
        experienceApi.updateStatus(id, status, rowVersion),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: experienceKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useDeleteExperience = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: experienceApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: experienceKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useReviewExperience = () => {
  const qc = useQueryClient();
  return useMutation<string, Error, EmpRevDto>({
    mutationFn: experienceApi.review,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: experienceKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useReviewExperienceAll = () => {
  const qc = useQueryClient();
  return useMutation<string, Error, EmpRevDto>({
    mutationFn: experienceApi.reviewAll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: experienceKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};