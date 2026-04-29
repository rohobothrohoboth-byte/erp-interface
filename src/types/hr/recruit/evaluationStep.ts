import type { BaseDto } from './BaseDto';
import type { UUID } from 'crypto';

export type { UUID };

export interface EvaluationStepListDto extends BaseDto {
  stepName: string;
  stepOrder: number;
  maxScore: number;
  minScore: number;
  isFinal: boolean;
  isFinalStr: string;
  evalType: string;   
  evaluationFlow: string;  
}

export interface EvaluationStepAddDto {
  stepName: string;
  stepOrder: number;
  maxScore: number;
  minScore: number;
  isFinal: boolean;
  evalTypeId: string;
  evaluationFlowId: string;
}

export interface EvaluationStepModDto{
  id: UUID;
   stepName: string;
  stepOrder: number;
  maxScore: number;
  minScore: number;
  isFinal: boolean;
  evalTypeId: string;
  evaluationFlowId: string;
  rowVersion: string;
}
