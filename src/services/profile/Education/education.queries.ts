// services/profile/Education/education.queries.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { educationApi } from "./education.api";
import { educationKeys } from "./education.keys";
import { dashboardKeys } from "../../hr/dashboard/dashboard.key";
import type {
  EmpEduListDto,
  EmpEduAddDto,
  EmpEduModDto,
} from "../../../types/profile/EmpEdu.types";
import type { EmpRevDto } from "../../../types/hr/employee/empAddDto";

const STALE = 5 * 60 * 1000;

export const useEducations = () =>
    useQuery<EmpEduListDto[], Error>({
      queryKey: educationKeys.lists(),
      queryFn: educationApi.getAll,
      staleTime: STALE,
    });

export const useEducation = (id: string) =>
    useQuery<EmpEduListDto, Error>({
      queryKey: educationKeys.detail(id),
      queryFn: () => educationApi.getById(id),
      staleTime: STALE,
    });

export const useCreateEducation = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<string, Error, EmpEduAddDto>({
    mutationFn: educationApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: educationKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useUpdateEducation = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<string, Error, EmpEduModDto>({
    mutationFn: educationApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: educationKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

// ✅ Add update status mutation
export const useUpdateEducationStatus = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<string, Error, { id: string; status: string; rowVersion?: string }>({
    mutationFn: ({ id, status, rowVersion }) =>
        educationApi.updateStatus(id, status, rowVersion),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: educationKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useDeleteEducation = (options?: {
  onSuccess?: () => void;
  onError?: (e: Error) => void;
}) => {
  const qc = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: educationApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: educationKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useReviewEducation = () => {
  const qc = useQueryClient();
  return useMutation<string, Error, EmpRevDto>({
    mutationFn: educationApi.review,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: educationKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};

export const useReviewEducationAll = () => {
  const qc = useQueryClient();
  return useMutation<string, Error, EmpRevDto>({
    mutationFn: educationApi.reviewAll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: educationKeys.lists() });
      qc.invalidateQueries({ queryKey: dashboardKeys.pendingEdu() });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};