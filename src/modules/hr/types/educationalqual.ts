import type { UUID } from 'crypto';
import type { BaseDto } from '@/modules/hr/types/BaseDto';

export type { UUID };

export interface EducationQualListDto extends BaseDto {
  name: string;
}

export interface EducationQualAddDto {
  name: string;
}

export interface EducationQualModDto {
  id: UUID;
  name: string;
  rowVersion: string;
}