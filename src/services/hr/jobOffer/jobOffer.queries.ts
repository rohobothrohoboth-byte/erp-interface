import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobOfferApi } from './jobOffer.api';
import { jobOfferKeys } from './jobOffer.keys';
import type { JobOfferAddDto, JobOfferHireDto } from '../../../types/hr/jobOffer';

export const useJobOffers = () =>
  useQuery({ queryKey: jobOfferKeys.all, queryFn: jobOfferApi.getAll, staleTime: 0, refetchOnMount: 'always' });

export const useCreateJobOffer = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: JobOfferAddDto) => jobOfferApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: jobOfferKeys.all }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useJobOfferAction = (
  action: 'submit' | 'approve' | 'accept' | 'hire',
  opts?: { onSuccess?: () => void; onError?: (e: Error) => void },
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      if (action === 'submit') return jobOfferApi.submit(payload.id);
      if (action === 'approve') return jobOfferApi.approve(payload);
      if (action === 'accept') return jobOfferApi.accept(payload);
      return jobOfferApi.hire(payload as JobOfferHireDto);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: jobOfferKeys.all }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};
