import type { BaseDto } from "./BaseDto";
import type { UUID } from 'crypto';

export type { UUID };

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

export interface JobEvalFlowListDto extends BaseDto{
evaluationFlowId:UUID;
jobPostingId:UUID;
flowName:string;
jobPostNum:string;
}

export interface JobEvalFlowAddDto{
evaluationFlowId:UUID;
jobPostingId:UUID;
}