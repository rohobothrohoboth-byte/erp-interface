import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/hr/types/BaseDto';

export type { UUID };
export interface JobGradeListDto extends BaseDto {
  name: string;
  startSalary: number;
  maxSalary: number;
}

export interface JobGradeAddDto {
  name: string;
  startSalary: number;
  maxSalary: number;
}

export interface JobGradeModDto {
  id: UUID;
  name: string;
  startSalary: number;
  maxSalary: number;
  rowVersion: string;
}