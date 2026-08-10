// src/types/hr/recruit/offer.ts

export interface OfferListDto {
    id: string;
    applicantId: string;
    applicantName: string;
    applicantEmail: string;
    jobPostingId: string;
    jobPostingNumber: string;
    position: string;
    department: string;
    offerDate: string;
    offerDateStr: string;
    salary: number;
    currency: string;
    benefits: string;
    startDate: string;
    startDateStr: string;
    expiryDate: string;
    expiryDateStr: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
    notes: string | null;
    createdDate: string;
    rowVersion: string;
}

export interface OfferAddDto {
    applicantId: string;
    jobPostingId: string;
    salary: number;
    currency: string;
    benefits: string;
    startDate: string;
    expiryDate: string;
    notes: string | null;
}

export interface OfferModDto {
    id: string;
    salary: number;
    benefits: string;
    startDate: string;
    expiryDate: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
    notes: string | null;
    rowVersion: string;
}

export interface OfferResponseDto {
    id: string;
    status: 'Accepted' | 'Rejected';
    comment: string | null;
}