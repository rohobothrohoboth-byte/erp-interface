// types/hr/jobgrade/JgStep.ts
import type { BaseDto } from '@/modules/hr/types/BaseDto';

export type UUID = string;
export interface JgStepListDto extends BaseDto {
  jobGradeId: UUID;
  name: string;
  salary: number;
  jobGrade: string; // Job grade name for display
}

export interface JgStepAddDto {
  name: string;
  salary: number;
  jobGradeId: UUID;
}

export interface JgStepModDto {
  id: UUID;
  name: string;
  salary: number;
  jobGradeId: UUID;
  rowVersion: string;
}