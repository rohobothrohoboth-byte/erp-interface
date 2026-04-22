import type { BaseDto } from './BaseDto';

export type UUID = string;

export interface EvalStep {
  evalType: string;
  stepName: string;
  maxScore: number;
  minScore: number;
  isFinalStr: string;
}

export interface JpEvalFlowListDto extends BaseDto {
  postNumber: string;
  datePublished: string;
  effeDateFrom: string;
  effeDateTo: string;
  evalFlowName: string;
  postTypeStr: string;
  steps: EvalStep[];
}

export interface JpEvalFlowAddDto {
  evaluationFlowId: UUID;
  jobPostingId: UUID;
  effectiveFrom: string; // ISO date-time
}

export interface JpEvalFlowModDto {
  id: UUID;
  evaluationFlowId: UUID;
  effectiveFrom: string;
  rowVersion: string;
}
