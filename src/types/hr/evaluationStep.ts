import type { BaseDto } from './BaseDto';
import type { UUID } from 'crypto';

export interface EvaluationStepListDto extends BaseDto {
  stepName: string;
  stepOrder: number;
  isFinal: boolean;
  evalTypeId: UUID;
  evalTypeName: string;
  evaluationFlowId: UUID;
}

export interface EvaluationStepAddDto {
  stepName: string;
  stepOrder: number;
  isFinal: boolean;
  evalTypeId: string;
  evaluationFlowId: string;
}

export interface EvaluationStepModDto extends EvaluationStepAddDto {
  id: string;
  rowVersion: string;
}
