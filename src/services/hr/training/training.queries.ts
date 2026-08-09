import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trainingApi } from './training.api';
import { trainingKeys } from './training.keys';
import type { TrainingEnrollmentCreateDto, TrainingProgramCreateDto } from '../../../types/hr/training';

export const useTrainingPrograms = () =>
  useQuery({ queryKey: trainingKeys.programs, queryFn: () => trainingApi.getPrograms(), staleTime: 0, refetchOnMount: 'always' });

export const useTrainingSessions = () =>
  useQuery({ queryKey: trainingKeys.sessions, queryFn: trainingApi.getSessions, staleTime: 0, refetchOnMount: 'always' });

export const useTrainingEnrollments = () =>
  useQuery({ queryKey: trainingKeys.enrollments, queryFn: trainingApi.getEnrollments, staleTime: 0, refetchOnMount: 'always' });

export const useTrainingEvaluations = () =>
  useQuery({ queryKey: trainingKeys.evaluations, queryFn: trainingApi.getEvaluations, staleTime: 0, refetchOnMount: 'always' });

export const useTrainingCertificates = () =>
  useQuery({ queryKey: trainingKeys.certificates, queryFn: trainingApi.getCertificates, staleTime: 0, refetchOnMount: 'always' });

export const useCreateTrainingProgram = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: TrainingProgramCreateDto) => trainingApi.createProgram(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: trainingKeys.programs }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const usePublishTrainingProgram = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => trainingApi.publishProgram(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: trainingKeys.programs }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useEnrollTraining = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: TrainingEnrollmentCreateDto) => trainingApi.enroll(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: trainingKeys.enrollments }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useIssueCertificate = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => trainingApi.issueCertificate(enrollmentId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: trainingKeys.certificates }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};
