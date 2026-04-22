import { useQuery } from '@tanstack/react-query';
import { applicantApi } from './applicant.api';
import { applicantKeys } from './applicant.key';
import type { JobAppListDto, JobAppInfoDto } from '../../../../types/hr/recruit/jopApp';

export const useAllApplicants = () =>
  useQuery<JobAppListDto[], Error>({
    queryKey: applicantKeys.lists(),
    queryFn: applicantApi.getAll,
    staleTime: 0,
    refetchOnMount: 'always',
  });

export const useApplicantsByPost = (postId: string) =>
  useQuery<JobAppListDto[], Error>({
    queryKey: applicantKeys.byPost(postId),
    queryFn: () => applicantApi.getByPost(postId),
    enabled: !!postId,
    staleTime: 0,
  });

export const useApplicantDetail = (id: string) =>
  useQuery<JobAppInfoDto, Error>({
    queryKey: applicantKeys.detail(id),
    queryFn: () => applicantApi.getById(id),
    enabled: !!id,
    staleTime: 0,
  });
