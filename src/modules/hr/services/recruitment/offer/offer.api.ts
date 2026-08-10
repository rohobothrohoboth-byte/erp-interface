// src/services/hr/recruitment/offer/offer.api.ts

import { api } from '@/shared/services/api';
import type {
    OfferListDto,
    OfferAddDto,
    OfferModDto,
    OfferResponseDto
} from '@/modules/hr/types/recruit/offer';

const BASE = `${import.meta.env.VITE_HRMM_RECRUIT_URL || '/hrm/recruit/v1'}/Offer`;

const extractError = (error: any): string => {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
        return (Object.values(error.response.data.errors) as string[][]).flat().join(', ');
    }
    return error.message || 'An unexpected error occurred';
};

const normalizeArray = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && raw.id) return [raw];
    return [];
};

export const offerApi = {
    // Get all offers
    getAll: async (): Promise<OfferListDto[]> => {
        try {
            const res = await api.get(`${BASE}/All`);
            return normalizeArray(res.data?.data ?? res.data ?? []);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Get offers by applicant
    getByApplicant: async (applicantId: string): Promise<OfferListDto[]> => {
        try {
            const res = await api.get(`${BASE}/ByApplicant/${applicantId}`);
            return normalizeArray(res.data?.data ?? res.data ?? []);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Get offers by job posting
    getByJobPosting: async (jobPostingId: string): Promise<OfferListDto[]> => {
        try {
            const res = await api.get(`${BASE}/ByJobPosting/${jobPostingId}`);
            return normalizeArray(res.data?.data ?? res.data ?? []);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Get single offer
    getById: async (id: string): Promise<OfferListDto> => {
        try {
            const res = await api.get(`${BASE}/Get/${id}`);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Create offer
    create: async (data: OfferAddDto): Promise<OfferListDto> => {
        try {
            const res = await api.post(`${BASE}/Add`, data);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Update offer
    update: async (data: OfferModDto): Promise<OfferListDto> => {
        try {
            const res = await api.put(`${BASE}/Mod/${data.id}`, data);
            return res.data?.data ?? res.data;
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Send offer to candidate
    sendOffer: async (id: string): Promise<void> => {
        try {
            await api.post(`${BASE}/Send/${id}`);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Respond to offer (Accept/Reject)
    respondToOffer: async (data: OfferResponseDto): Promise<void> => {
        try {
            await api.post(`${BASE}/Respond`, data);
        } catch (e) { throw new Error(extractError(e)); }
    },

    // Delete offer
    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`${BASE}/Del/${id}`);
        } catch (e) { throw new Error(extractError(e)); }
    },
};