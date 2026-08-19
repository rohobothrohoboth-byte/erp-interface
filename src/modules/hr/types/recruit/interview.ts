// src/types/hr/recruit/interview.ts

export interface InterviewListDto {
    id: string;
    applicantId: string;
    applicantName: string;
    jobPostingId: string;
    jobPostingNumber: string;
    position: string;
    interviewType: 'Initial' | 'Technical' | 'HR' | 'Panel' | 'Final';
    scheduledDate: string;
    scheduledDateStr: string;
    duration: number; // in minutes
    location: string;
    interviewers: string[]; // Employee IDs
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
    feedback: string | null;
    score: number | null;
    recommendation: 'Pass' | 'Fail' | 'OnHold' | null;
    createdDate: string;
    rowVersion: string;
}

export interface InterviewAddDto {
    applicantId: string;
    jobPostingId: string;
    interviewType: 'Initial' | 'Technical' | 'HR' | 'Panel' | 'Final';
    scheduledDate: string; // ISO date string
    duration: number;
    location: string;
    interviewerIds: string[];
}

export interface InterviewModDto {
    id: string;
    interviewType: 'Initial' | 'Technical' | 'HR' | 'Panel' | 'Final';
    scheduledDate: string;
    duration: number;
    location: string;
    interviewerIds: string[];
    status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
    feedback: string | null;
    score: number | null;
    recommendation: 'Pass' | 'Fail' | 'OnHold' | null;
    rowVersion: string;
}

export interface InterviewFeedbackDto {
    id: string;
    feedback: string;
    score: number;
    recommendation: 'Pass' | 'Fail' | 'OnHold';
}