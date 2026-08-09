import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractApi, promotionApi, transferApi } from './career.api';
import { careerKeys } from './career.keys';
import type {
  EmpContractAddDto,
  EmpContractTerminateDto,
  EmpDecisionDto,
  EmpPromotionAddDto,
  EmpTransferAddDto,
} from '../../../types/hr/career';

export const useContracts = () =>
  useQuery({ queryKey: careerKeys.contracts, queryFn: contractApi.getAll, staleTime: 0, refetchOnMount: 'always' });

export const useCreateContract = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: EmpContractAddDto) => contractApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: careerKeys.contracts }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useTerminateContract = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: EmpContractTerminateDto) => contractApi.terminate(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: careerKeys.contracts }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useDeleteContract = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contractApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: careerKeys.contracts }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const usePromotions = () =>
  useQuery({ queryKey: careerKeys.promotions, queryFn: promotionApi.getAll, staleTime: 0, refetchOnMount: 'always' });

export const useCreatePromotion = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: EmpPromotionAddDto) => promotionApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: careerKeys.promotions }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const usePromotionDecision = (action: 'approve' | 'reject' | 'apply', opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  const fn = action === 'approve' ? promotionApi.approve : action === 'reject' ? promotionApi.reject : promotionApi.apply;
  return useMutation({
    mutationFn: (d: EmpDecisionDto) => fn(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: careerKeys.promotions }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useTransfers = () =>
  useQuery({ queryKey: careerKeys.transfers, queryFn: transferApi.getAll, staleTime: 0, refetchOnMount: 'always' });

export const useCreateTransfer = (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: EmpTransferAddDto) => transferApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: careerKeys.transfers }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};

export const useTransferDecision = (action: 'approve' | 'reject' | 'apply', opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
  const qc = useQueryClient();
  const fn = action === 'approve' ? transferApi.approve : action === 'reject' ? transferApi.reject : transferApi.apply;
  return useMutation({
    mutationFn: (d: EmpDecisionDto) => fn(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: careerKeys.transfers }); opts?.onSuccess?.(); },
    onError: opts?.onError,
  });
};
