import type { BaseDto } from "./BaseDto";


export type UUID =string;

export interface EvaluationTypeListDto extends BaseDto {
  name: string;
  maxScore: number;
  isActive: boolean;
  isActiveStr: string;
}

export interface EvaluationTypeAddDto {
  name: string;
  maxScore: number;
}

export interface EvaluationTypeModDto extends EvaluationTypeAddDto {
  id: UUID;
  zname: string;
  maxScore: number;
  isActive: boolean;
  rowVersion: string;
}
