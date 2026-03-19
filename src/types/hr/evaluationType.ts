import type { BaseDto } from './BaseDto';

export interface EvaluationTypeListDto extends BaseDto {
  name: string;
  maxScore: number;
  isActive: boolean;
}

export interface EvaluationTypeAddDto {
  name: string;
  maxScore: number;
  isActive: boolean;
}

export interface EvaluationTypeModDto extends EvaluationTypeAddDto {
  id: string;
  rowVersion: string;
}
