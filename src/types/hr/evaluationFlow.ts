import type { BaseDto } from './BaseDto';

export interface EvaluationFlowListDto extends BaseDto {
  name: string;
  isGlobal: boolean;
  isActive: boolean;
}

export interface EvaluationFlowAddDto {
  name: string;
  isGlobal: boolean;
  isActive: boolean;
}

export interface EvaluationFlowModDto extends EvaluationFlowAddDto {
  id: string;
  rowVersion: string;
}
