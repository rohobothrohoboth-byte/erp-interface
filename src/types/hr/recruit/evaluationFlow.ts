import type { BaseDto } from '../BaseDto';

export type UUID = string;

export interface EvaluationFlowListDto extends BaseDto {
  name: string;
  isGlobal: boolean;
  isActive: boolean;
  isGlobalStr:string;
  isActiveStr:string;
}

export interface EvaluationFlowAddDto {
  name: string;
  isGlobal: boolean;
}

export interface EvaluationFlowModDto {
  id: UUID;
  name: string;
    isGlobal: boolean;
    isActive:boolean
  rowVersion: string;
}

export interface JobEvalFlowListDto{
evaluationFlowId:UUID;
jobPostingId:UUID;
flowName:string;
jobPostNum:string;
}

export interface JobEvalFlowAddDto{
evaluationFlowId:UUID;
jobPostingId:UUID;
}