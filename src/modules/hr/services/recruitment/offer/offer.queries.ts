// src/services/hr/recruitment/offer/offer.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerApi } from '@/modules/hr/services/recruitment/offer/offer.api';
import { offerKeys } from '@/modules/hr/services/recruitment/offer/offer.key';
import type {
    OfferListDto,
    OfferAddDto,
    OfferModDto,
    OfferResponseDto
} from '@/modules/hr/types/recruit/offer';

// ============= QUERIES =============

export const useOffers = (filters?: { applicantId?: string; jobPostingId?: string }) => {
    return useQuery<OfferListDto[], Error>({
        queryKey: offerKeys.list(filters),
        queryFn: () => {
            if (filters?.applicantId) {
                return offerApi.getByApplicant(filters.applicantId);
            }
            if (filters?.jobPostingId) {
                return offerApi.getByJobPosting(filters.jobPostingId);
            }
            return offerApi.getAll();
        },
        staleTime: 0,
        refetchOnMount: 'always',
    });
};

export const useOffer = (id: string | undefined) => {
    return useQuery<OfferListDto, Error>({
        queryKey: offerKeys.detail(id!),
        queryFn: () => offerApi.getById(id!),
        enabled: !!id,
    });
};

// ============= MUTATIONS =============

export const useCreateOffer = (options?: {
    onSuccess?: (data: OfferListDto) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<OfferListDto, Error, OfferAddDto>({
        mutationFn: offerApi.create,
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            options?.onSuccess?.(newItem);
        },
        onError: options?.onError,
    });
};

export const useUpdateOffer = (options?: {
    onSuccess?: (data: OfferListDto) => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<OfferListDto, Error, OfferModDto>({
        mutationFn: offerApi.update,
        onSuccess: (updatedItem) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(updatedItem.id) });
            options?.onSuccess?.(updatedItem);
        },
        onError: options?.onError,
    });
};

export const useSendOffer = (options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: offerApi.sendOffer,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};

export const useRespondToOffer = (options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, OfferResponseDto>({
        mutationFn: offerApi.respondToOffer,
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(data.id) });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};

export const useDeleteOffer = (options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}) => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: offerApi.delete,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) });
            options?.onSuccess?.();
        },
        onError: options?.onError,
    });
};